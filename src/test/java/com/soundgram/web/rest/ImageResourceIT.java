package com.soundgram.web.rest;

import com.soundgram.SoundgramApp;
import com.soundgram.domain.Image;
import com.soundgram.repository.ImageRepository;
import com.soundgram.repository.search.ImageSearchRepository;
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
 * Integration tests for the {@link ImageResource} REST controller.
 */
@SpringBootTest(classes = SoundgramApp.class)
public class ImageResourceIT {

    private static final String DEFAULT_PATH = "AAAAAAAAAA";
    private static final String UPDATED_PATH = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    @Autowired
    private ImageRepository imageRepository;

    /**
     * This repository is mocked in the com.soundgram.repository.search test package.
     *
     * @see com.soundgram.repository.search.ImageSearchRepositoryMockConfiguration
     */
    @Autowired
    private ImageSearchRepository mockImageSearchRepository;

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

    private MockMvc restImageMockMvc;

    private Image image;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.initMocks(this);
        final ImageResource imageResource = new ImageResource(imageRepository, mockImageSearchRepository);
        this.restImageMockMvc = MockMvcBuilders.standaloneSetup(imageResource)
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
    public static Image createEntity(EntityManager em) {
        Image image = new Image()
            .path(DEFAULT_PATH)
            .name(DEFAULT_NAME);
        return image;
    }
    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Image createUpdatedEntity(EntityManager em) {
        Image image = new Image()
            .path(UPDATED_PATH)
            .name(UPDATED_NAME);
        return image;
    }

    @BeforeEach
    public void initTest() {
        image = createEntity(em);
    }

    @Test
    @Transactional
    public void createImage() throws Exception {
        int databaseSizeBeforeCreate = imageRepository.findAll().size();

        // Create the Image
        restImageMockMvc.perform(post("/api/images")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(image)))
            .andExpect(status().isCreated());

        // Validate the Image in the database
        List<Image> imageList = imageRepository.findAll();
        assertThat(imageList).hasSize(databaseSizeBeforeCreate + 1);
        Image testImage = imageList.get(imageList.size() - 1);
        assertThat(testImage.getPath()).isEqualTo(DEFAULT_PATH);
        assertThat(testImage.getName()).isEqualTo(DEFAULT_NAME);

        // Validate the Image in Elasticsearch
        verify(mockImageSearchRepository, times(1)).save(testImage);
    }

    @Test
    @Transactional
    public void createImageWithExistingId() throws Exception {
        int databaseSizeBeforeCreate = imageRepository.findAll().size();

        // Create the Image with an existing ID
        image.setId(1L);

        // An entity with an existing ID cannot be created, so this API call must fail
        restImageMockMvc.perform(post("/api/images")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(image)))
            .andExpect(status().isBadRequest());

        // Validate the Image in the database
        List<Image> imageList = imageRepository.findAll();
        assertThat(imageList).hasSize(databaseSizeBeforeCreate);

        // Validate the Image in Elasticsearch
        verify(mockImageSearchRepository, times(0)).save(image);
    }


    @Test
    @Transactional
    public void checkPathIsRequired() throws Exception {
        int databaseSizeBeforeTest = imageRepository.findAll().size();
        // set the field null
        image.setPath(null);

        // Create the Image, which fails.

        restImageMockMvc.perform(post("/api/images")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(image)))
            .andExpect(status().isBadRequest());

        List<Image> imageList = imageRepository.findAll();
        assertThat(imageList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    public void getAllImages() throws Exception {
        // Initialize the database
        imageRepository.saveAndFlush(image);

        // Get all the imageList
        restImageMockMvc.perform(get("/api/images?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(image.getId().intValue())))
            .andExpect(jsonPath("$.[*].path").value(hasItem(DEFAULT_PATH)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }
    
    @Test
    @Transactional
    public void getImage() throws Exception {
        // Initialize the database
        imageRepository.saveAndFlush(image);

        // Get the image
        restImageMockMvc.perform(get("/api/images/{id}", image.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.id").value(image.getId().intValue()))
            .andExpect(jsonPath("$.path").value(DEFAULT_PATH))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    public void getNonExistingImage() throws Exception {
        // Get the image
        restImageMockMvc.perform(get("/api/images/{id}", Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateImage() throws Exception {
        // Initialize the database
        imageRepository.saveAndFlush(image);

        int databaseSizeBeforeUpdate = imageRepository.findAll().size();

        // Update the image
        Image updatedImage = imageRepository.findById(image.getId()).get();
        // Disconnect from session so that the updates on updatedImage are not directly saved in db
        em.detach(updatedImage);
        updatedImage
            .path(UPDATED_PATH)
            .name(UPDATED_NAME);

        restImageMockMvc.perform(put("/api/images")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(updatedImage)))
            .andExpect(status().isOk());

        // Validate the Image in the database
        List<Image> imageList = imageRepository.findAll();
        assertThat(imageList).hasSize(databaseSizeBeforeUpdate);
        Image testImage = imageList.get(imageList.size() - 1);
        assertThat(testImage.getPath()).isEqualTo(UPDATED_PATH);
        assertThat(testImage.getName()).isEqualTo(UPDATED_NAME);

        // Validate the Image in Elasticsearch
        verify(mockImageSearchRepository, times(1)).save(testImage);
    }

    @Test
    @Transactional
    public void updateNonExistingImage() throws Exception {
        int databaseSizeBeforeUpdate = imageRepository.findAll().size();

        // Create the Image

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restImageMockMvc.perform(put("/api/images")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(image)))
            .andExpect(status().isBadRequest());

        // Validate the Image in the database
        List<Image> imageList = imageRepository.findAll();
        assertThat(imageList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Image in Elasticsearch
        verify(mockImageSearchRepository, times(0)).save(image);
    }

    @Test
    @Transactional
    public void deleteImage() throws Exception {
        // Initialize the database
        imageRepository.saveAndFlush(image);

        int databaseSizeBeforeDelete = imageRepository.findAll().size();

        // Delete the image
        restImageMockMvc.perform(delete("/api/images/{id}", image.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Image> imageList = imageRepository.findAll();
        assertThat(imageList).hasSize(databaseSizeBeforeDelete - 1);

        // Validate the Image in Elasticsearch
        verify(mockImageSearchRepository, times(1)).deleteById(image.getId());
    }

    @Test
    @Transactional
    public void searchImage() throws Exception {
        // Initialize the database
        imageRepository.saveAndFlush(image);
        when(mockImageSearchRepository.search(queryStringQuery("id:" + image.getId())))
            .thenReturn(Collections.singletonList(image));
        // Search the image
        restImageMockMvc.perform(get("/api/_search/images?query=id:" + image.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(image.getId().intValue())))
            .andExpect(jsonPath("$.[*].path").value(hasItem(DEFAULT_PATH)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }
}
