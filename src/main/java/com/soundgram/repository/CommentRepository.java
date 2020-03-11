package com.soundgram.repository;
import com.soundgram.domain.Comment;
import com.soundgram.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Spring Data  repository for the Comment entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query("select comment from Comment comment where comment.user.login = ?#{principal.username}")
    List<Comment> findByUserIsCurrentUser();

    List<Comment> findCommentByPostId(Long postId);

    @Transactional
    @Modifying
    void deleteCommentsByPostId(Long postId);

}
