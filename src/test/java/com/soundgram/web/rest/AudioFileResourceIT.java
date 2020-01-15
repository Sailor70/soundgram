package com.soundgram.web.rest;

import com.soundgram.SoundgramApp;
import com.soundgram.domain.AudioFile;
import com.soundgram.repository.AudioFileRepository;
import com.soundgram.repository.PostRepository;
import com.soundgram.repository.UserRepository;
import com.soundgram.repository.search.AudioFileSearchRepository;
import com.soundgram.service.StorageService;
import com.soundgram.web.rest.errors.ExceptionTranslator;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.Validator;

import javax.persistence.EntityManager;
import java.util.ArrayList;
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
 * Integration tests for the {@link AudioFileResource} REST controller.
 */
@SpringBootTest(classes = SoundgramApp.class)
public class AudioFileResourceIT {

    private static final String DEFAULT_AUDIO_PATH = "AAAAAAAAAA";
    private static final String UPDATED_AUDIO_PATH = "BBBBBBBBBB";

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_ICON_PATH = "AAAAAAAAAA";
    private static final String UPDATED_ICON_PATH = "BBBBBBBBBB";

    @Autowired
    private AudioFileRepository audioFileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private PostRepository postRepository;

    @Mock
    private AudioFileRepository audioFileRepositoryMock;

    /**
     * This repository is mocked in the com.soundgram.repository.search test package.
     *
     * @see com.soundgram.repository.search.AudioFileSearchRepositoryMockConfiguration
     */
    @Autowired
    private AudioFileSearchRepository mockAudioFileSearchRepository;

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

    private MockMvc restAudioFileMockMvc;

    private AudioFile audioFile;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final AudioFileResource audioFileResource = new AudioFileResource(audioFileRepository, mockAudioFileSearchRepository, userRepository, postRepository, storageService);
        this.restAudioFileMockMvc = MockMvcBuilders.standaloneSetup(audioFileResource)
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
    public static AudioFile createEntity(EntityManager em) {
        AudioFile audioFile = new AudioFile()
            .audioPath(DEFAULT_AUDIO_PATH)
            .title(DEFAULT_TITLE)
            .iconPath(DEFAULT_ICON_PATH);
        return audioFile;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AudioFile createUpdatedEntity(EntityManager em) {
        AudioFile audioFile = new AudioFile()
            .audioPath(UPDATED_AUDIO_PATH)
            .title(UPDATED_TITLE)
            .iconPath(UPDATED_ICON_PATH);
        return audioFile;
    }

    @BeforeEach
    public void initTest() {
        audioFile = createEntity(em);
    }

    @Test
    @Transactional
    public void createAudioFile() throws Exception {
        int databaseSizeBeforeCreate = audioFileRepository.findAll().size();

        // Create the AudioFile
        restAudioFileMockMvc.perform(post("/api/audio-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(audioFile)))
            .andExpect(status().isCreated());

        // Validate the AudioFile in the database
        List<AudioFile> audioFileList = audioFileRepository.findAll();
        assertThat(audioFileList).hasSize(databaseSizeBeforeCreate + 1);
        AudioFile testAudioFile = audioFileList.get(audioFileList.size() - 1);
        assertThat(testAudioFile.getAudioPath()).isEqualTo(DEFAULT_AUDIO_PATH);
        assertThat(testAudioFile.getTitle()).isEqualTo(DEFAULT_TITLE);
        assertThat(testAudioFile.getIconPath()).isEqualTo(DEFAULT_ICON_PATH);

        // Validate the AudioFile in Elasticsearch
        verify(mockAudioFileSearchRepository, times(1)).save(testAudioFile);
    }

    @Test
    @Transactional
    public void createAudioFileWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = audioFileRepository.findAll().size();

        // Create the AudioFile with an existing ID
        audioFile.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restAudioFileMockMvc.perform(post("/api/audio-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(audioFile)))
            .andExpect(status().isBadRequest());

        // Validate the AudioFile in the database
        List<AudioFile> audioFileList = audioFileRepository.findAll();
        assertThat(audioFileList).hasSize(databaseSizeBeforeCreate);

        // Validate the AudioFile in Elasticsearch
        verify(mockAudioFileSearchRepository, times(0)).save(audioFile);
    }


    @Test
    @Transactional
    public void checkAudioPathIsRequired() throws Exception {
        int databaseSizeBeforeTest = audioFileRepository.findAll().size();
        // set the field null
        audioFile.setAudioPath(null);

        // Create the AudioFile, which fails.

        restAudioFileMockMvc.perform(post("/api/audio-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(audioFile)))
            .andExpect(status().isBadRequest());

        List<AudioFile> audioFileList = audioFileRepository.findAll();
        assertThat(audioFileList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllAudioFiles() throws Exception {
        // Initialize the database
        audioFileRepository.saveAndFlush(audioFile);

        // Get all the audioFileList
        restAudioFileMockMvc.perform(get("/api/audio-files?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(audioFile.getId().intValue())))
            .andExpect(jsonPath("$.[*].audioPath").value(hasItem(DEFAULT_AUDIO_PATH)))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].iconPath").value(hasItem(DEFAULT_ICON_PATH)));
    }

    @SuppressWarnings({"unchecked"})
    public void getAllAudioFilesWithEagerRelationshipsIsEnabled() throws Exception {
        AudioFileResource audioFileResource = new AudioFileResource(audioFileRepositoryMock, mockAudioFileSearchRepository, userRepository, postRepository, storageService);
        when(audioFileRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        MockMvc restAudioFileMockMvc = MockMvcBuilders.standaloneSetup(audioFileResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter).build();

        restAudioFileMockMvc.perform(get("/api/audio-files?eagerload=true"))
            .andExpect(status().isOk());

        verify(audioFileRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({"unchecked"})
    public void getAllAudioFilesWithEagerRelationshipsIsNotEnabled() throws Exception {
        AudioFileResource audioFileResource = new AudioFileResource(audioFileRepositoryMock, mockAudioFileSearchRepository, userRepository, postRepository, storageService);
        when(audioFileRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));
        MockMvc restAudioFileMockMvc = MockMvcBuilders.standaloneSetup(audioFileResource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setConversionService(createFormattingConversionService())
            .setMessageConverters(jacksonMessageConverter).build();

        restAudioFileMockMvc.perform(get("/api/audio-files?eagerload=true"))
            .andExpect(status().isOk());

        verify(audioFileRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    public void getAudioFile() throws Exception {
        // Initialize the database
        audioFileRepository.saveAndFlush(audioFile);

        // Get the audioFile
        restAudioFileMockMvc.perform(get("/api/audio-files/{id}", audioFile.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(audioFile.getId().intValue()))
            .andExpect(jsonPath("$.audioPath").value(DEFAULT_AUDIO_PATH))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.iconPath").value(DEFAULT_ICON_PATH));
    }

    @Test
    @Transactional
    public void getNonExistingAudioFile() throws Exception {
        // Get the audioFile
        restAudioFileMockMvc.perform(get("/api/audio-files/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateAudioFile() throws Exception {
        // Initialize the database
        audioFileRepository.saveAndFlush(audioFile);

        int databaseSizeBeforeUpdate = audioFileRepository.findAll().size();

        // Update the audioFile
        AudioFile updatedAudioFile = audioFileRepository.findById(audioFile.getId()).get();
        // Disconnect from session so that the updates on updatedAudioFile are not directly saved in db
        em.detach(updatedAudioFile);
        updatedAudioFile
            .audioPath(UPDATED_AUDIO_PATH)
            .title(UPDATED_TITLE)
            .iconPath(UPDATED_ICON_PATH);

        restAudioFileMockMvc.perform(put("/api/audio-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedAudioFile)))
            .andExpect(status().isOk());

        // Validate the AudioFile in the database
        List<AudioFile> audioFileList = audioFileRepository.findAll();
        assertThat(audioFileList).hasSize(databaseSizeBeforeUpdate);
        AudioFile testAudioFile = audioFileList.get(audioFileList.size() - 1);
        assertThat(testAudioFile.getAudioPath()).isEqualTo(UPDATED_AUDIO_PATH);
        assertThat(testAudioFile.getTitle()).isEqualTo(UPDATED_TITLE);
        assertThat(testAudioFile.getIconPath()).isEqualTo(UPDATED_ICON_PATH);

        // Validate the AudioFile in Elasticsearch
        verify(mockAudioFileSearchRepository, times(1)).save(testAudioFile);
    }

    @Test
    @Transactional
    public void updateNonExistingAudioFile() throws Exception {
        int databaseSizeBeforeUpdate = audioFileRepository.findAll().size();

        // Create the AudioFile

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAudioFileMockMvc.perform(put("/api/audio-files")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(audioFile)))
            .andExpect(status().isBadRequest());

        // Validate the AudioFile in the database
        List<AudioFile> audioFileList = audioFileRepository.findAll();
        assertThat(audioFileList).hasSize(databaseSizeBeforeUpdate);

        // Validate the AudioFile in Elasticsearch
        verify(mockAudioFileSearchRepository, times(0)).save(audioFile);
    }

    @Test
    @Transactional
    public void deleteAudioFile() throws Exception {
        // Initialize the database
        audioFileRepository.saveAndFlush(audioFile);

        int databaseSizeBeforeDelete = audioFileRepository.findAll().size();

        // Delete the audioFile
        restAudioFileMockMvc.perform(delete("/api/audio-files/{id}", audioFile.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<AudioFile> audioFileList = audioFileRepository.findAll();
        assertThat(audioFileList).hasSize(databaseSizeBeforeDelete - 1);

        // Validate the AudioFile in Elasticsearch
        verify(mockAudioFileSearchRepository, times(1)).deleteById(audioFile.getId());
    }

    @Test
    @Transactional
    public void searchAudioFile() throws Exception {
        // Initialize the database
        audioFileRepository.saveAndFlush(audioFile);
        when(mockAudioFileSearchRepository.search(queryStringQuery("id:" + audioFile.getId())))
            .thenReturn(Collections.singletonList(audioFile));
        // Search the audioFile
        restAudioFileMockMvc.perform(get("/api/_search/audio-files?query=id:" + audioFile.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(audioFile.getId().intValue())))
            .andExpect(jsonPath("$.[*].audioPath").value(hasItem(DEFAULT_AUDIO_PATH)))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].iconPath").value(hasItem(DEFAULT_ICON_PATH)));
    }
}
