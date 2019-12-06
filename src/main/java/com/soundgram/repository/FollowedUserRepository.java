package com.soundgram.repository;
import com.soundgram.domain.FollowedUser;
import com.soundgram.domain.User;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the FollowedUser entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FollowedUserRepository extends JpaRepository<FollowedUser, Long> {

    @Query("select followedUser from FollowedUser followedUser where followedUser.user.login = ?#{principal.username}")
    List<FollowedUser> findByUserIsCurrentUser();

    // @Query("select followedUser from FollowedUser followedUser where followedUser.followedUserId = ?#{principal.username}")
    Optional<FollowedUser> findFollowedUserByFollowedUserIdAndUser(Long followedUserId, User user); //FindOne
}
