package com.soundgram.domain;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;

import org.springframework.data.elasticsearch.annotations.FieldType;
import java.io.Serializable;
import java.time.Instant;

/**
 * A FollowedUser.
 */
@Entity
@Table(name = "followed_user")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@org.springframework.data.elasticsearch.annotations.Document(indexName = "followeduser")
public class FollowedUser implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @org.springframework.data.elasticsearch.annotations.Field(type = FieldType.Keyword)
    private Long id;

    @NotNull
    @Column(name = "followed_user_id", nullable = false)
    private Long followedUserId;

    @Column(name = "date_followed")
    private Instant dateFollowed;

    @ManyToOne
    @JsonIgnoreProperties("followedUsers")
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFollowedUserId() {
        return followedUserId;
    }

    public FollowedUser followedUserId(Long followedUserId) {
        this.followedUserId = followedUserId;
        return this;
    }

    public void setFollowedUserId(Long followedUserId) {
        this.followedUserId = followedUserId;
    }

    public Instant getDateFollowed() {
        return dateFollowed;
    }

    public FollowedUser dateFollowed(Instant dateFollowed) {
        this.dateFollowed = dateFollowed;
        return this;
    }

    public void setDateFollowed(Instant dateFollowed) {
        this.dateFollowed = dateFollowed;
    }

    public User getUser() {
        return user;
    }

    public FollowedUser user(User user) {
        this.user = user;
        return this;
    }

    public void setUser(User user) {
        this.user = user;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FollowedUser)) {
            return false;
        }
        return id != null && id.equals(((FollowedUser) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "FollowedUser{" +
            "id=" + getId() +
            ", followedUserId=" + getFollowedUserId() +
            ", dateFollowed='" + getDateFollowed() + "'" +
            "}";
    }
}
