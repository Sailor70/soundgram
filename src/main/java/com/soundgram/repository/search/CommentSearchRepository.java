package com.soundgram.repository.search;
import com.soundgram.domain.Comment;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data Elasticsearch repository for the {@link Comment} entity.
 */
public interface CommentSearchRepository extends ElasticsearchRepository<Comment, Long> {

    @Transactional
    @Modifying
    void deleteCommentsByPostId(Long postId);

}
