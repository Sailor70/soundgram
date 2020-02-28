package com.soundgram.repository.search;
import com.soundgram.domain.FollowedUser;
import com.soundgram.domain.User;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

/**
 * Spring Data Elasticsearch repository for the {@link FollowedUser} entity.
 */
public interface FollowedUserSearchRepository extends ElasticsearchRepository<FollowedUser, Long> {

    @Transactional
    @Modifying
    void deleteFollowedUserByUser(User user);

    @Transactional
    @Modifying
    void deleteFollowedUserByFollowedUserId(Long followedUserId);
}
