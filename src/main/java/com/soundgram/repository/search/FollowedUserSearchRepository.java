package com.soundgram.repository.search;
import com.soundgram.domain.FollowedUser;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

/**
 * Spring Data Elasticsearch repository for the {@link FollowedUser} entity.
 */
public interface FollowedUserSearchRepository extends ElasticsearchRepository<FollowedUser, Long> {

}
