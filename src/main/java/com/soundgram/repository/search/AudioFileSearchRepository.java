package com.soundgram.repository.search;
import com.soundgram.domain.AudioFile;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link AudioFile} entity.
 */
public interface AudioFileSearchRepository extends ElasticsearchRepository<AudioFile, Long> {
}
