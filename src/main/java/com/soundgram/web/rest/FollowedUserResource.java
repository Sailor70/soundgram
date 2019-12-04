package com.soundgram.web.rest;

import com.soundgram.domain.FollowedUser;
import com.soundgram.repository.FollowedUserRepository;
import com.soundgram.repository.search.FollowedUserSearchRepository;
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

    public FollowedUserResource(FollowedUserRepository followedUserRepository, FollowedUserSearchRepository followedUserSearchRepository) {
        this.followedUserRepository = followedUserRepository;
        this.followedUserSearchRepository = followedUserSearchRepository;
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
