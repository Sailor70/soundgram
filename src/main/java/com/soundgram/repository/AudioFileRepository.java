package com.soundgram.repository;
import com.soundgram.domain.AudioFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the AudioFile entity.
 */
@Repository
public interface AudioFileRepository extends JpaRepository<AudioFile, Long> {

    @Query(value = "select distinct audioFile from AudioFile audioFile left join fetch audioFile.users",
        countQuery = "select count(distinct audioFile) from AudioFile audioFile")
    Page<AudioFile> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct audioFile from AudioFile audioFile left join fetch audioFile.users")
    List<AudioFile> findAllWithEagerRelationships();

    @Query("select audioFile from AudioFile audioFile left join fetch audioFile.users where audioFile.id =:id")
    Optional<AudioFile> findOneWithEagerRelationships(@Param("id") Long id);

}
