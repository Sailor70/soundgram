package com.soundgram.web.rest;

import com.soundgram.SoundgramApp;
import com.soundgram.domain.FollowedUser;
import com.soundgram.repository.FollowedUserRepository;
import com.soundgram.repository.search.FollowedUserSearchRepository;
import com.soundgram.web.rest.errors.ExceptionTranslator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.List;

import static com.soundgram.web.rest.TestUtil.createFormattingConversionService;
import static org.assertj.core.api.Assertions.assertThat;
import static org.elasticsearch.index.query.QueryBuilders.queryStringQuery;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the {@link FollowedUserResource} REST controller.
 */
@SpringBootTest(classes = SoundgramApp.class)
public class FollowedUserResourceIT {

    private static final Long DEFAULT_FOLLOWED_USER_ID = 1L;
    private static final Long UPDATED_FOLLOWED_USER_ID = 2L;

    private static final Instant DEFAULT_DATE_FOLLOWED = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_DATE_FOLLOWED = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    @Autowired
    private FollowedUserRepository followedUserRepository;

    /**
     * This repository is mocked in the com.soundgram.repository.search test package.
     *
     * @see com.soundgram.repository.search.FollowedUserSearchRepositoryMockConfiguration
     */
    @Autowired
    private FollowedUserSearchRepository mockFollowedUserSearchRepository;

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    @Autowired
    private EntityManager em;

    @Autowired
    private Validator validator;

    private MockMvc restFollowedUserMockMvc;

    private FollowedUser followedUser;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final FollowedUserResource followedUserResource = new FollowedUserResource(followedUserRepository, mockFollowedUserSearchRepository);
        this.restFollowedUserMockMvc = MockMvcBuilders.standaloneSetup(followedUserResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter)
            .setValidator(validator).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FollowedUser createEntity(EntityManager em) {
        FollowedUser followedUser = new FollowedUser()
            .followedUserId(DEFAULT_FOLLOWED_USER_ID)
            .dateFollowed(DEFAULT_DATE_FOLLOWED);
        return followedUser;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FollowedUser createUpdatedEntity(EntityManager em) {
        FollowedUser followedUser = new FollowedUser()
            .followedUserId(UPDATED_FOLLOWED_USER_ID)
            .dateFollowed(UPDATED_DATE_FOLLOWED);
        return followedUser;
    }

    @BeforeEach
    public void initTest() {
        followedUser = createEntity(em);
    }

    @Test
    @Transactional
    public void createFollowedUser() throws Exception {
        int databaseSizeBeforeCreate = followedUserRepository.findAll().size();

        // Create the FollowedUser
        restFollowedUserMockMvc.perform(post("/api/followed-users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(followedUser)))
            .andExpect(status().isCreated());

        // Validate the FollowedUser in the database
        List<FollowedUser> followedUserList = followedUserRepository.findAll();
        assertThat(followedUserList).hasSize(databaseSizeBeforeCreate + 1);
        FollowedUser testFollowedUser = followedUserList.get(followedUserList.size() - 1);
        assertThat(testFollowedUser.getFollowedUserId()).isEqualTo(DEFAULT_FOLLOWED_USER_ID);
        assertThat(testFollowedUser.getDateFollowed()).isEqualTo(DEFAULT_DATE_FOLLOWED);

        // Validate the FollowedUser in Elasticsearch
        verify(mockFollowedUserSearchRepository, times(1)).save(testFollowedUser);
    }

    @Test
    @Transactional
    public void createFollowedUserWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = followedUserRepository.findAll().size();

        // Create the FollowedUser with an existing ID
        followedUser.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restFollowedUserMockMvc.perform(post("/api/followed-users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(followedUser)))
            .andExpect(status().isBadRequest());

        // Validate the FollowedUser in the database
        List<FollowedUser> followedUserList = followedUserRepository.findAll();
        assertThat(followedUserList).hasSize(databaseSizeBeforeCreate);

        // Validate the FollowedUser in Elasticsearch
        verify(mockFollowedUserSearchRepository, times(0)).save(followedUser);
    }


    @Test
    @Transactional
    public void checkFollowedUserIdIsRequired() throws Exception {
        int databaseSizeBeforeTest = followedUserRepository.findAll().size();
        // set the field null
        followedUser.setFollowedUserId(null);

        // Create the FollowedUser, which fails.

        restFollowedUserMockMvc.perform(post("/api/followed-users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(followedUser)))
            .andExpect(status().isBadRequest());

        List<FollowedUser> followedUserList = followedUserRepository.findAll();
        assertThat(followedUserList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllFollowedUsers() throws Exception {
        // Initialize the database
        followedUserRepository.saveAndFlush(followedUser);

        // Get all the followedUserList
        restFollowedUserMockMvc.perform(get("/api/followed-users?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(followedUser.getId().intValue())))
            .andExpect(jsonPath("$.[*].followedUserId").value(hasItem(DEFAULT_FOLLOWED_USER_ID.intValue())))
            .andExpect(jsonPath("$.[*].dateFollowed").value(hasItem(DEFAULT_DATE_FOLLOWED.toString())));
    }
    
    @Test
    @Transactional
    public void getFollowedUser() throws Exception {
        // Initialize the database
        followedUserRepository.saveAndFlush(followedUser);

        // Get the followedUser
        restFollowedUserMockMvc.perform(get("/api/followed-users/{id}", followedUser.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(followedUser.getId().intValue()))
            .andExpect(jsonPath("$.followedUserId").value(DEFAULT_FOLLOWED_USER_ID.intValue()))
            .andExpect(jsonPath("$.dateFollowed").value(DEFAULT_DATE_FOLLOWED.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingFollowedUser() throws Exception {
        // Get the followedUser
        restFollowedUserMockMvc.perform(get("/api/followed-users/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateFollowedUser() throws Exception {
        // Initialize the database
        followedUserRepository.saveAndFlush(followedUser);

        int databaseSizeBeforeUpdate = followedUserRepository.findAll().size();

        // Update the followedUser
        FollowedUser updatedFollowedUser = followedUserRepository.findById(followedUser.getId()).get();
        // Disconnect from session so that the updates on updatedFollowedUser are not directly saved in db
        em.detach(updatedFollowedUser);
        updatedFollowedUser
            .followedUserId(UPDATED_FOLLOWED_USER_ID)
            .dateFollowed(UPDATED_DATE_FOLLOWED);

        restFollowedUserMockMvc.perform(put("/api/followed-users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedFollowedUser)))
            .andExpect(status().isOk());

        // Validate the FollowedUser in the database
        List<FollowedUser> followedUserList = followedUserRepository.findAll();
        assertThat(followedUserList).hasSize(databaseSizeBeforeUpdate);
        FollowedUser testFollowedUser = followedUserList.get(followedUserList.size() - 1);
        assertThat(testFollowedUser.getFollowedUserId()).isEqualTo(UPDATED_FOLLOWED_USER_ID);
        assertThat(testFollowedUser.getDateFollowed()).isEqualTo(UPDATED_DATE_FOLLOWED);

        // Validate the FollowedUser in Elasticsearch
        verify(mockFollowedUserSearchRepository, times(1)).save(testFollowedUser);
    }

    @Test
    @Transactional
    public void updateNonExistingFollowedUser() throws Exception {
        int databaseSizeBeforeUpdate = followedUserRepository.findAll().size();

        // Create the FollowedUser

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFollowedUserMockMvc.perform(put("/api/followed-users")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(followedUser)))
            .andExpect(status().isBadRequest());

        // Validate the FollowedUser in the database
        List<FollowedUser> followedUserList = followedUserRepository.findAll();
        assertThat(followedUserList).hasSize(databaseSizeBeforeUpdate);

        // Validate the FollowedUser in Elasticsearch
        verify(mockFollowedUserSearchRepository, times(0)).save(followedUser);
    }

    @Test
    @Transactional
    public void deleteFollowedUser() throws Exception {
        // Initialize the database
        followedUserRepository.saveAndFlush(followedUser);

        int databaseSizeBeforeDelete = followedUserRepository.findAll().size();

        // Delete the followedUser
        restFollowedUserMockMvc.perform(delete("/api/followed-users/{id}", followedUser.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<FollowedUser> followedUserList = followedUserRepository.findAll();
        assertThat(followedUserList).hasSize(databaseSizeBeforeDelete - 1);

        // Validate the FollowedUser in Elasticsearch
        verify(mockFollowedUserSearchRepository, times(1)).deleteById(followedUser.getId());
    }

    @Test
    @Transactional
    public void searchFollowedUser() throws Exception {
        // Initialize the database
        followedUserRepository.saveAndFlush(followedUser);
        when(mockFollowedUserSearchRepository.search(queryStringQuery("id:" + followedUser.getId())))
            .thenReturn(Collections.singletonList(followedUser));
        // Search the followedUser
        restFollowedUserMockMvc.perform(get("/api/_search/followed-users?query=id:" + followedUser.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(followedUser.getId().intValue())))
            .andExpect(jsonPath("$.[*].followedUserId").value(hasItem(DEFAULT_FOLLOWED_USER_ID.intValue())))
            .andExpect(jsonPath("$.[*].dateFollowed").value(hasItem(DEFAULT_DATE_FOLLOWED.toString())));
    }
}
