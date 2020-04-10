package com.soundgram.web.rest;

import com.soundgram.domain.FollowedUser;
import com.soundgram.domain.User;
import com.soundgram.repository.FollowedUserRepository;
import com.soundgram.repository.UserRepository;
import com.soundgram.repository.search.FollowedUserSearchRepository;
import com.soundgram.security.SecurityUtils;
import com.soundgram.web.rest.errors.BadRequestAlertException;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing {@link com.soundgram.domain.FollowedUser}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class FollowedUserResource {

    private final Logger log = LoggerFactory.getLogger(FollowedUserResource.class);

    private static final String ENTITY_NAME = "followedUser";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final FollowedUserRepository followedUserRepository;

    private final FollowedUserSearchRepository followedUserSearchRepository;

    private final UserRepository userRepository;

    public FollowedUserResource(FollowedUserRepository followedUserRepository, FollowedUserSearchRepository followedUserSearchRepository, UserRepository userRepository) {
        this.followedUserRepository = followedUserRepository;
        this.followedUserSearchRepository = followedUserSearchRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/followed-users_id") // /{id}
    public ResponseEntity<FollowedUser> createFollowedUserId(@RequestBody Long followed_id) throws URISyntaxException {
        FollowedUser followedUser = new FollowedUser();
        log.debug("REST request to save FollowedUser : {}", followedUser);
        if (followedUser.getId() != null) {
            throw new BadRequestAlertException("A new followedUser cannot already have an ID", ENTITY_NAME, "idexists");
        }

        // Jeśli już followujemy tego usera to nie dodawaj do followedUserRepository
        if(!(followedUserRepository.findFollowedUserByFollowedUserIdAndUser(followed_id,
            userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null)).isPresent())) {
            // dodanie aktualnie zalogowanego usera do pola User w followed user
            followedUser.setUser(userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null));

            followedUser.setDateFollowed(LocalDate.now().atTime(LocalTime.now(ZoneOffset.UTC)).toInstant(ZoneOffset.UTC));

            followedUser.setFollowedUserId(followed_id);

            FollowedUser result = followedUserRepository.save(followedUser);

            return ResponseEntity.created(new URI("/api/followed-users/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                .body(result);
        }
        else {
            //throw new BadRequestAlertException("You have allready followed that user!", ENTITY_NAME, "idexists");
            log.debug("You have allready followed that user with id : {}", followed_id);
            return null;
        }
    }

    /**
     * {@code POST  /followed-users} : Create a new followedUser.
     *
     * @param followedUser the followedUser to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new followedUser, or with status {@code 400 (Bad Request)} if the followedUser has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/followed-users")
    public ResponseEntity<FollowedUser> createFollowedUser(@Valid @RequestBody FollowedUser followedUser) throws URISyntaxException {
        log.debug("REST request to save FollowedUser : {}", followedUser);
        if (followedUser.getId() != null) {
            throw new BadRequestAlertException("A new followedUser cannot already have an ID", ENTITY_NAME, "idexists");
        }
        FollowedUser result = followedUserRepository.save(followedUser);
        followedUserSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/followed-users/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /followed-users} : Updates an existing followedUser.
     *
     * @param followedUser the followedUser to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated followedUser,
     * or with status {@code 400 (Bad Request)} if the followedUser is not valid,
     * or with status {@code 500 (Internal Server Error)} if the followedUser couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/followed-users")
    public ResponseEntity<FollowedUser> updateFollowedUser(@Valid @RequestBody FollowedUser followedUser) throws URISyntaxException {
        log.debug("REST request to update FollowedUser : {}", followedUser);
        if (followedUser.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        FollowedUser result = followedUserRepository.save(followedUser);
        followedUserSearchRepository.save(result);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, followedUser.getId().toString()))
            .body(result);
    }

    @GetMapping("/followed-users_get")
    public List<FollowedUser> getFollowedUsers() {
        log.debug("REST request to get current users FollowedUsers");
        return followedUserRepository.findByUserIsCurrentUser();
    }

    /**
     * {@code GET  /followed-users} : get all the followedUsers.
     *

     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of followedUsers in body.
     */
    @GetMapping("/followed-users")
    public List<FollowedUser> getAllFollowedUsers() {
        log.debug("REST request to get all FollowedUsers");
        return followedUserRepository.findAll();
    }

    /**
     * {@code GET  /followed-users/:id} : get the "id" followedUser.
     *
     * @param id the id of the followedUser to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the followedUser, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/followed-users/{id}")
    public ResponseEntity<FollowedUser> getFollowedUser(@PathVariable Long id) {
        log.debug("REST request to get FollowedUser : {}", id);
        Optional<FollowedUser> followedUser = followedUserRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(followedUser);
    }

    //receives followedUserId
    @DeleteMapping("/followed-users_id/{id}")
    public ResponseEntity<Void> deleteFollowedUserId(@PathVariable Long id) {
        log.debug("REST request to delete FollowedUser with followedUserId : {}", id);
        User user = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null);
        if(followedUserRepository.findFollowedUserByFollowedUserIdAndUser(id, user).isPresent()) {
            log.debug("deleting followed user of id " + id + "and user " + user.getLogin());
            FollowedUser followedUser = followedUserRepository.findFollowedUserByFollowedUserIdAndUser(id, user).get();
            followedUserRepository.deleteFollowedUserByFollowedUserIdAndUser(id, user);
            followedUserSearchRepository.deleteById(followedUser.getId());
        }
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString())).build();
    }

    // when user account is deleted this endpoint deletes all appearances of this user id in followed users table
    @DeleteMapping("/followed-users-delete-user/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.debug("REST request to delete user (from followedUsers) : {}", id);
        Optional<User> user = userRepository.findOneById(id);
        if(user.isPresent()) {
            followedUserRepository.deleteFollowedUserByUser(user.get());
            followedUserRepository.deleteFollowedUserByFollowedUserId(id);
            followedUserSearchRepository.deleteFollowedUserByUser(user.get());
            followedUserSearchRepository.deleteFollowedUserByFollowedUserId(id);
        }
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString())).build();
    }

    /**
     * {@code DELETE  /followed-users/:id} : delete the "id" followedUser.
     *
     * @param id the id of the followedUser to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/followed-users/{id}")
    public ResponseEntity<Void> deleteFollowedUser(@PathVariable Long id) {
        log.debug("REST request to delete FollowedUser : {}", id);
        followedUserRepository.deleteById(id);
        followedUserSearchRepository.deleteById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString())).build();
    }

    /**
     * {@code SEARCH  /_search/followed-users?query=:query} : search for the followedUser corresponding
     * to the query.
     *
     * @param query the query of the followedUser search.
     * @return the result of the search.
     */
    @GetMapping("/_search/followed-users")
    public List<FollowedUser> searchFollowedUsers(@RequestParam String query) {
        log.debug("REST request to search FollowedUsers for query {}", query);
        return StreamSupport
            .stream(followedUserSearchRepository.search(queryStringQuery(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
