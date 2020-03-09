package com.soundgram.web.rest;

import com.soundgram.config.Constants;
import com.soundgram.domain.Tag;
import com.soundgram.domain.User;
import com.soundgram.repository.TagRepository;
import com.soundgram.repository.UserRepository;
import com.soundgram.repository.search.TagSearchRepository;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing {@link com.soundgram.domain.Tag}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class TagResource {

    private final Logger log = LoggerFactory.getLogger(TagResource.class);

    private static final String ENTITY_NAME = "tag";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TagRepository tagRepository;

    private final TagSearchRepository tagSearchRepository;

    private final UserRepository userRepository;

    public TagResource(TagRepository tagRepository, TagSearchRepository tagSearchRepository, UserRepository userRepository) {
        this.tagRepository = tagRepository;
        this.tagSearchRepository = tagSearchRepository;
        this.userRepository = userRepository;
    }

    /**
     * {@code POST  /tags} : Create a new tag.
     *
     * @param tag the tag to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new tag, or with status {@code 400 (Bad Request)} if the tag has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/tags")
    public ResponseEntity<Tag> createTag(@Valid @RequestBody Tag tag) throws URISyntaxException {
        log.debug("REST request to save Tag : {}", tag);
        if (tag.getId() != null) {
            throw new BadRequestAlertException("A new tag cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Tag result = tagRepository.save(tag);
        tagSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/tags/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /tags} : Updates an existing tag.
     *
     * @param tag the tag to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated tag,
     * or with status {@code 400 (Bad Request)} if the tag is not valid,
     * or with status {@code 500 (Internal Server Error)} if the tag couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/tags")
    public ResponseEntity<Tag> updateTag(@Valid @RequestBody Tag tag) throws URISyntaxException {
        log.debug("REST request to update Tag : {}", tag);
        if (tag.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Tag result = tagRepository.save(tag);
        tagSearchRepository.save(result);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tag.getId().toString()))
            .body(result);
    }

    @PutMapping("/tags-add-user")
    public ResponseEntity<Tag> addUserToTag(@Valid @RequestBody Tag tag) throws URISyntaxException {
        log.debug("REST request to update Tag : {}", tag);
        if (tag.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null);
        tag.addUser(currentUser);
        Tag result = tagRepository.save(tag);
        tagSearchRepository.save(result);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, tag.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /tags} : get all the tags.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of tags in body.
     */
    @GetMapping("/tags")
    public List<Tag> getAllTags(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all Tags");
        return tagRepository.findAllWithEagerRelationships();
    }

    @GetMapping("/tags-user/{login:" + Constants.LOGIN_REGEX + "}")
    public List<Tag> getAllUserTags(@PathVariable String login) {
        log.debug("REST request to get all Tags assigned to user of login: {}", login);
        List<Tag> allTags = tagRepository.findAllWithEagerRelationships();
        List<Tag> userTags = new ArrayList<>();;
        for(Tag tag : allTags) {
            Set<User> tagUsers = tag.getUsers();
            for(User user : tagUsers) {
                if(user.getLogin().equals(login)) {
                    userTags.add(tag);
                }
            }
        }
        return userTags;
    }

    /**
     * {@code GET  /tags/:id} : get the "id" tag.
     *
     * @param id the id of the tag to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the tag, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/tags/{id}")
    public ResponseEntity<Tag> getTag(@PathVariable Long id) {
        log.debug("REST request to get Tag : {}", id);
        Optional<Tag> tag = tagRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(tag);
    }

    /**
     * {@code DELETE  /tags/:id} : delete the "id" tag.
     *
     * @param id the id of the tag to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/tags/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        log.debug("REST request to delete Tag : {}", id);
        tagRepository.deleteById(id);
        tagSearchRepository.deleteById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString())).build();
    }

    /**
     * {@code SEARCH  /_search/tags?query=:query} : search for the tag corresponding
     * to the query.
     *
     * @param query the query of the tag search.
     * @return the result of the search.
     */
    @GetMapping("/_search/tags")
    public List<Tag> searchTags(@RequestParam String query) {
        log.debug("REST request to search Tags for query {}", query);
        return StreamSupport
            .stream(tagSearchRepository.search(queryStringQuery(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
