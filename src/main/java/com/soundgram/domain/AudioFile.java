package com.soundgram.domain;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;

import org.springframework.data.elasticsearch.annotations.FieldType;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A AudioFile.
 */
@Entity
@Table(name = "audio_file")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
@org.springframework.data.elasticsearch.annotations.Document(indexName = "audiofile")
public class AudioFile implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @org.springframework.data.elasticsearch.annotations.Field(type = FieldType.Keyword)
    private Long id;

    @NotNull
    @Column(name = "audio_path", nullable = false)
    private String audioPath;

    @Column(name = "title")
    private String title;

    @Column(name = "icon_path")
    private String iconPath;

    @ManyToOne
    private Post post;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    @JoinTable(name = "audio_file_user",
               joinColumns = @JoinColumn(name = "audio_file_id", referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "user_id", referencedColumnName = "id"))
    private Set<User> users = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAudioPath() {
        return audioPath;
    }

    public AudioFile audioPath(String audioPath) {
        this.audioPath = audioPath;
        return this;
    }

    public void setAudioPath(String audioPath) {
        this.audioPath = audioPath;
    }

    public String getTitle() {
        return title;
    }

    public AudioFile title(String title) {
        this.title = title;
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIconPath() {
        return iconPath;
    }

    public AudioFile iconPath(String iconPath) {
        this.iconPath = iconPath;
        return this;
    }

    public void setIconPath(String iconPath) {
        this.iconPath = iconPath;
    }

    public Post getPost() {
        return post;
    }

    public AudioFile post(Post post) {
        this.post = post;
        return this;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Set<User> getUsers() {
        return users;
    }

    public AudioFile users(Set<User> users) {
        this.users = users;
        return this;
    }

    public AudioFile addUser(User user) {
        this.users.add(user);
        return this;
    }

    public AudioFile removeUser(User user) {
        this.users.remove(user);
        return this;
    }

    public void setUsers(Set<User> users) {
        this.users = users;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here, do not remove

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AudioFile)) {
            return false;
        }
        return id != null && id.equals(((AudioFile) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    @Override
    public String toString() {
        return "AudioFile{" +
            "id=" + getId() +
            ", audioPath='" + getAudioPath() + "'" +
            ", title='" + getTitle() + "'" +
            ", iconPath='" + getIconPath() + "'" +
            "}";
    }
}
