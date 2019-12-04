package com.soundgram.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import com.soundgram.web.rest.TestUtil;

public class FollowedUserTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FollowedUser.class);
        FollowedUser followedUser1 = new FollowedUser();
        followedUser1.setId(1L);
        FollowedUser followedUser2 = new FollowedUser();
        followedUser2.setId(followedUser1.getId());
        assertThat(followedUser1).isEqualTo(followedUser2);
        followedUser2.setId(2L);
        assertThat(followedUser1).isNotEqualTo(followedUser2);
        followedUser1.setId(null);
        assertThat(followedUser1).isNotEqualTo(followedUser2);
    }
}
