package com.soundgram.web.rest;

import com.soundgram.domain.Image;
import com.soundgram.repository.ImageRepository;
import com.soundgram.repository.search.ImageSearchRepository;
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
 * REST controller for managing {@link com.soundgram.domain.Image}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class ImageResource {

    private final Logger log = LoggerFactory.getLogger(ImageResource.class);

    private static final String ENTITY_NAME = "image";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final ImageRepository imageRepository;

    private final ImageSearchRepository imageSearchRepository;

    public ImageResource(ImageRepository imageRepository, ImageSearchRepository imageSearchRepository) {
        this.imageRepository = imageRepository;
        this.imageSearchRepository = imageSearchRepository;
    }

    /**
     * {@code POST  /images} : Create a new image.
     *
     * @param image the image to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new image, or with status {@code 400 (Bad Request)} if the image has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/images")
    public ResponseEntity<Image> createImage(@Valid @RequestBody Image image) throws URISyntaxException {
        log.debug("REST request to save Image : {}", image);
        if (image.getId() != null) {
            throw new BadRequestAlertException("A new image cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Image result = imageRepository.save(image);
        imageSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/images/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /images} : Updates an existing image.
     *
     * @param image the image to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated image,
     * or with status {@code 400 (Bad Request)} if the image is not valid,
     * or with status {@code 500 (Internal Server Error)} if the image couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/images")
    public ResponseEntity<Image> updateImage(@Valid @RequestBody Image image) throws URISyntaxException {
        log.debug("REST request to update Image : {}", image);
        if (image.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        Image result = imageRepository.save(image);
        imageSearchRepository.save(result);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, image.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /images} : get all the images.
     *

     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of images in body.
     */
    @GetMapping("/images")
    public List<Image> getAllImages() {
        log.debug("REST request to get all Images");
        return imageRepository.findAll();
    }

    /**
     * {@code GET  /images/:id} : get the "id" image.
     *
     * @param id the id of the image to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the image, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/images/{id}")
    public ResponseEntity<Image> getImage(@PathVariable Long id) {
        log.debug("REST request to get Image : {}", id);
        Optional<Image> image = imageRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(image);
    }

    /**
     * {@code DELETE  /images/:id} : delete the "id" image.
     *
     * @param id the id of the image to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/images/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        log.debug("REST request to delete Image : {}", id);
        imageRepository.deleteById(id);
        imageSearchRepository.deleteById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString())).build();
    }

    /**
     * {@code SEARCH  /_search/images?query=:query} : search for the image corresponding
     * to the query.
     *
     * @param query the query of the image search.
     * @return the result of the search.
     */
    @GetMapping("/_search/images")
    public List<Image> searchImages(@RequestParam String query) {
        log.debug("REST request to search Images for query {}", query);
        return StreamSupport
            .stream(imageSearchRepository.search(queryStringQuery(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
