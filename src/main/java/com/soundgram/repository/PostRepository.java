package com.soundgram.repository;
import com.soundgram.domain.Post;
import com.soundgram.domain.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data  repository for the Post entity.
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query(value = "select post.id from Post post",
            countQuery = "select count(distinct post) from Post post")
    Page<Long> findAllPosts(Pageable pageable);

    @Query(value = "select post.id from Post post where post.user.login =:login",
        countQuery = "select count(distinct post) from Post post")
    Page<Long> findPostByUserLogin(Pageable pageable, @Param("login") String login);

    @Query(value = "select post.id from Post post where post.user.id in(:followedUsersIds)",
        countQuery = "select count(distinct post) from Post post")
    Page<Long> findAllPostsOfFollowedUser(Pageable pageable, @Param("followedUsersIds") List<Long> followedUsersIds);

    @Query("select distinct post from Post post left join fetch post.tags where post.id in(:postIds) order by post.date desc")
    List<Post> getPostWithEagerRelationshipsById(@Param("postIds") List<Long> postIds);



    @Query("select post from Post post left join fetch post.tags where post.id =:id")
    Optional<Post> findOneWithEagerRelationships(@Param("id") Long id);

    Optional<Post> findPostById(Long id); // for audioFile and Image

    @Query(value = "select distinct post from Post post left join fetch post.tags",
        countQuery = "select count(distinct post) from Post post")
    Page<Post> findAllWithEagerRelationships(Pageable pageable);

/*
    @Query("select distinct post from Post post left join fetch post.tags")
    List<Post> findAllWithEagerRelationships();

    @Query("select post from Post post where post.user.login = ?#{principal.username}")
    List<Post> findByUserIsCurrentUser();

    @Query(value = "select post from Post post left join fetch post.tags where post.user.login =:login",
        countQuery = "select count(distinct post) from Post post")
    Page<Post> findPostWithEagerRelationshipsByUserLogin(Pageable pageable, @Param("login") String login);

    @Query(value = "select distinct post from Post post left join fetch post.tags", // where ( select tag from post.tags ) in(:tags) // any ? intersect ?
        countQuery = "select count(distinct post) from Post post")
    Page<Post> findAllWithEagerRelationshipsAndTagsContaining(Pageable pageable, @Param("tags") List<Long> tags);

    @Query(value = "select distinct post from Post post left join fetch post.tags where post.user.id in(:followedUsersIds)",
        countQuery = "select count(distinct post) from Post post")
    Page<Post> findAllWithEagerRelationshipsAndFollowedUser(Pageable pageable, @Param("followedUsersIds") List<Long> followedUsersIds);
    */

}
