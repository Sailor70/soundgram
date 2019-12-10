package com.soundgram.web.rest;

import com.soundgram.domain.AudioFile;
import com.soundgram.repository.AudioFileRepository;
import com.soundgram.repository.UserRepository;
import com.soundgram.repository.search.AudioFileSearchRepository;
import com.soundgram.security.SecurityUtils;
import com.soundgram.web.rest.errors.BadRequestAlertException;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import static org.elasticsearch.index.query.QueryBuilders.*;

/**
 * REST controller for managing {@link com.soundgram.domain.AudioFile}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class AudioFileResource {

    private final Logger log = LoggerFactory.getLogger(AudioFileResource.class);

    private static final String ENTITY_NAME = "audioFile";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    @Autowired
    private HttpServletRequest request;

    private final AudioFileRepository audioFileRepository;

    private final AudioFileSearchRepository audioFileSearchRepository;
    private final UserRepository userRepository;

    public AudioFileResource(AudioFileRepository audioFileRepository, AudioFileSearchRepository audioFileSearchRepository, UserRepository userRepository) {
        this.audioFileRepository = audioFileRepository;
        this.audioFileSearchRepository = audioFileSearchRepository;
        this.userRepository = userRepository;
    }

    /**
     * {@code POST  /audio-files} : Create a new audioFile.
     *
     * @param audioFile the audioFile to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new audioFile, or with status {@code 400 (Bad Request)} if the audioFile has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
/*    @PostMapping("/audio-files")
    public ResponseEntity<AudioFile> createAudioFile(@Valid @RequestBody AudioFile audioFile) throws URISyntaxException {
        log.debug("REST request to save AudioFile : {}", audioFile);
        if (audioFile.getId() != null) {
            throw new BadRequestAlertException("A new audioFile cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AudioFile result = audioFileRepository.save(audioFile);
        audioFileSearchRepository.save(result);
        return ResponseEntity.created(new URI("/api/audio-files/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }*/

    @PostMapping("/audio-files")
    public ResponseEntity<AudioFile> createAudioFile(@RequestParam("file") MultipartFile file) throws URISyntaxException, IOException { // @RequestParam AudioFile audioFile, @RequestParam("file") MultipartFile file

        String uploadsDir = "/uploads/";
        String realPathtoUploads =  request.getServletContext().getRealPath(uploadsDir);
        if(! new File(realPathtoUploads).exists())
        {
            new File(realPathtoUploads).mkdir();
        }
        log.info("realPathtoUploads = {}", realPathtoUploads);

        InputStream inputStream = file.getInputStream();
        String originalName = file.getOriginalFilename();
        String name = file.getName();
        String contentType = file.getContentType();
        long size = file.getSize();
        log.info("inputStream: " + inputStream);
        log.info("originalName: " + originalName);
        log.info("name: " + name);
        log.info("contentType: " + contentType);
        log.info("size: " + size);

        String filePath = realPathtoUploads + originalName;
        File dest = new File(filePath);
        file.transferTo(dest);

        AudioFile audioFile = new AudioFile();
        audioFile.addUser(userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null));
        audioFile.setAudioPath(filePath);
        audioFile.setPost(null);

        AudioFile result = audioFileRepository.save(audioFile);
        /*        log.debug("REST request to save AudioFile : {}", audioFile);
        if (audioFile.getId() != null) {
            throw new BadRequestAlertException("A new audioFile cannot already have an ID", ENTITY_NAME, "idexists");
        }
        AudioFile result = audioFileRepository.save(audioFile);
        */
        return ResponseEntity.created(new URI("/api/audio-files/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /audio-files} : Updates an existing audioFile.
     *
     * @param audioFile the audioFile to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated audioFile,
     * or with status {@code 400 (Bad Request)} if the audioFile is not valid,
     * or with status {@code 500 (Internal Server Error)} if the audioFile couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/audio-files")
    public ResponseEntity<AudioFile> updateAudioFile(@Valid @RequestBody AudioFile audioFile) throws URISyntaxException {
        log.debug("REST request to update AudioFile : {}", audioFile);
        if (audioFile.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        AudioFile result = audioFileRepository.save(audioFile);
        audioFileSearchRepository.save(result);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, audioFile.getId().toString()))
            .body(result);
    }

    /**
     * {@code GET  /audio-files} : get all the audioFiles.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of audioFiles in body.
     */
    @GetMapping("/audio-files")
    public List<AudioFile> getAllAudioFiles(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all AudioFiles");
        return audioFileRepository.findAllWithEagerRelationships();
    }

    /**
     * {@code GET  /audio-files/:id} : get the "id" audioFile.
     *
     * @param id the id of the audioFile to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the audioFile, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/audio-files/{id}")
    public ResponseEntity<AudioFile> getAudioFile(@PathVariable Long id) {
        log.debug("REST request to get AudioFile : {}", id);
        Optional<AudioFile> audioFile = audioFileRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(audioFile);
    }

    /**
     * {@code DELETE  /audio-files/:id} : delete the "id" audioFile.
     *
     * @param id the id of the audioFile to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/audio-files/{id}")
    public ResponseEntity<Void> deleteAudioFile(@PathVariable Long id) {
        log.debug("REST request to delete AudioFile : {}", id);
        audioFileRepository.deleteById(id);
        audioFileSearchRepository.deleteById(id);
        return ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString())).build();
    }

    /**
     * {@code SEARCH  /_search/audio-files?query=:query} : search for the audioFile corresponding
     * to the query.
     *
     * @param query the query of the audioFile search.
     * @return the result of the search.
     */
    @GetMapping("/_search/audio-files")
    public List<AudioFile> searchAudioFiles(@RequestParam String query) {
        log.debug("REST request to search AudioFiles for query {}", query);
        return StreamSupport
            .stream(audioFileSearchRepository.search(queryStringQuery(query)).spliterator(), false)
            .collect(Collectors.toList());
    }
}
