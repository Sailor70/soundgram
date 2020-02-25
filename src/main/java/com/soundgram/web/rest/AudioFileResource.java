package com.soundgram.web.rest;

import com.soundgram.domain.AudioFile;
import com.soundgram.domain.Image;
import com.soundgram.domain.Post;
import com.soundgram.domain.User;
import com.soundgram.repository.AudioFileRepository;
import com.soundgram.repository.PostRepository;
import com.soundgram.repository.UserRepository;
import com.soundgram.repository.search.AudioFileSearchRepository;
import com.soundgram.security.SecurityUtils;
import com.soundgram.service.StorageService;
import com.soundgram.web.rest.errors.BadRequestAlertException;

import io.github.jhipster.web.util.HeaderUtil;
import io.github.jhipster.web.util.ResponseUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Blob;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import java.util.zip.ZipOutputStream;

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

    private final AudioFileRepository audioFileRepository;

    private final AudioFileSearchRepository audioFileSearchRepository;

    private StorageService storageService;

    private final UserRepository userRepository;

    private final PostRepository postRepository;

    public AudioFileResource(AudioFileRepository audioFileRepository, AudioFileSearchRepository audioFileSearchRepository, UserRepository userRepository, PostRepository postRepository, StorageService storageService) {
        this.audioFileRepository = audioFileRepository;
        this.audioFileSearchRepository = audioFileSearchRepository;
        this.storageService = storageService;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    /**
     * {@code POST  /audio-files} : Create a new audioFile.
     *
     * @param file the audioFile to create.
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
    public ResponseEntity<AudioFile> createAudioFile(@RequestParam("file") MultipartFile file, @RequestParam("id") String id) throws URISyntaxException {

        Long postId = Long.parseLong(id);
        Optional<Post> postOpt = postRepository.findPostById(postId);
        Post post;
        if (postOpt.isPresent()) {
            post = postOpt.get();
            User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null);
            Path audioPath = storageService.storeAudioFile(file, currentUser.getId());
            String uri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/download/")
                .path(file.getName())
                .toUriString();

            AudioFile audioFile = new AudioFile();
            // audioFile.addUser(currentUser); // nie dodajemy do polubionych od razu
            audioFile.setAudioPath(audioPath.toString()); // to jest niepotrzebne właściwie
            audioFile.setPost(post); //
            audioFile.setTitle(file.getOriginalFilename()); // audioPath.getFileName().toString()
            audioFile.setIconPath(currentUser.getId().toString()); // przechowuje id ownera pliku

            AudioFile result = audioFileRepository.save(audioFile);
            audioFileSearchRepository.save(result);
            return ResponseEntity.created(new URI("/api/audio-files/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                .body(result);
        }
        return ResponseEntity.created(new URI("/api/audio-files/" + null))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, null))
            .body(null); // te nule pozmieniać
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

    // Give a like to audio file ( Audio_File_User ) - add current logged user to audio file
    @PutMapping("/audio-files-user")
    public ResponseEntity<AudioFile> addUserToAudioFile(@Valid @RequestBody AudioFile audioFile) throws URISyntaxException {
        log.debug("REST request to add user to AudioFile : {}", audioFile);
        if (audioFile.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null);
        log.debug("Audio File: {}", audioFile.getId());
        log.debug("Current user: {}", currentUser.getLogin());
        log.debug("AudioFile users: {}", audioFile.getUsers());
        audioFile.addUser(currentUser);
        AudioFile result = audioFileRepository.save(audioFile);
        audioFileSearchRepository.save(result);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, audioFile.getId().toString()))
            .body(result);
    }

    @PutMapping("/audio-files-remove-user")
    public ResponseEntity<AudioFile> removeUserFromAudioFile(@Valid @RequestBody AudioFile audioFile) throws URISyntaxException {
        log.debug("REST request to remove user from AudioFile : {}", audioFile);
        if (audioFile.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null);
        log.debug("Audio File: {}", audioFile.getId());
        log.debug("Current user: {}", currentUser.getLogin());
        log.debug("AudioFile users: {}", audioFile.getUsers());

//        Set<User> users = audioFile.getUsers();
//        Set<User> newUsers = new HashSet<>();
//        for (User user : users) {
//            if (!(user.getId().equals(currentUser.getId()))) { // && !usersIt.next().getId().equals(Long.parseLong(af.getIconPath()))
//                newUsers.add(user);
//            }
//        }
        audioFile.removeUser(currentUser);
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

    @GetMapping("/audio-files-by-post/{id}")
    public ResponseEntity<AudioFile> getAudioFileByPost(@PathVariable Long id) {
        log.debug("REST request to get AudioFile that belongs to post of id : {}", id);
        Optional<AudioFile> audioFile = audioFileRepository.findAudioFileByPostId(id);
        if (audioFile.isPresent()) {
            log.debug("AudioFile users : {}", audioFile.get().getUsers()); // trzeba użyć get() bo inaczej nie zwraca listy userów
        }
/*        if(audioFile.isPresent()){
            AudioFile af = audioFile.get();
            log.debug("AudioFile users : {}", af.getUsers());
        }*/
        return ResponseUtil.wrapOrNotFound(audioFile);
    }

    @GetMapping("/audio-files-liked")
    public List<AudioFile> getLikedAudioFiles() {
        User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null);
        Long currentUserId = currentUser.getId();
        log.debug("REST request to get Audiofiles liked by the user of login : {}", currentUserId);
        List<AudioFile> allAF = audioFileRepository.findAllWithEagerRelationships();
        List<AudioFile> likedAFs = new ArrayList<>();
        for (AudioFile af : allAF) {
            Set<User> users = af.getUsers();
            for (User user : users) {
                if (user.getId().equals(currentUserId)) { // && !usersIt.next().getId().equals(Long.parseLong(af.getIconPath()))
                    likedAFs.add(af);
                }
            }
        }
        return likedAFs;
    }

    @GetMapping("/audio-files-users/{userId}")
    public List<AudioFile> getUserAudioFiles(@PathVariable Long userId) {
        // User currentUser = userRepository.findOneByLogin(SecurityUtils.getCurrentUserLogin().orElse(null)).orElse(null);
        // Long currentUserId = currentUser.getId();
        log.debug("REST request to get Audiofiles that are owned by the user of id : {}", userId);
        List<AudioFile> allAF = audioFileRepository.findAllWithEagerRelationships();
        List<AudioFile> usersAFs = new ArrayList<AudioFile>();
        for (AudioFile af : allAF) {
            Long ownerId = Long.parseLong(af.getIconPath());
            if (ownerId.equals(userId)) {
                usersAFs.add(af);
            }
        }
        return usersAFs;
    }

//    @GetMapping("/audio-files-download/{id}")
//    public ResponseEntity<byte[]> downloadAudioFile(@PathVariable Long id) {
//        Optional<AudioFile> audioFile = audioFileRepository.findOneWithEagerRelationships(id);
//        if (audioFile.isPresent()) {
//            AudioFile af = audioFile.get();
//            String title = af.getTitle();
//            Long fileOwnerId = Long.parseLong(af.getIconPath()); // przechowuje id właściciela pliku
////            Set<User> users = af.getUsers();
////            Long firstUserId = users.iterator().next().getId(); // the owner of file
//            Resource resource = storageService.loadAudioAsResource(title, fileOwnerId);
//
//            byte[] templateContent = new byte[0];
//            try {
//                templateContent = FileCopyUtils.copyToByteArray(resource.getFile());
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//
//            HttpHeaders respHeaders = new HttpHeaders();
//            respHeaders.setContentLength(templateContent.length);
//            respHeaders.setContentType(new MediaType("audio", "mpeg"));
//            respHeaders.setCacheControl("must-revalidate, post-check=0, pre-check=0");
//            respHeaders.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + title);
//
//            return new ResponseEntity<byte[]>(templateContent, respHeaders, HttpStatus.OK);
//
//        } else {
//            log.debug("Nie ma w bazie takiego pliku o id: {}", id);
//            return new ResponseEntity<byte[]>(null, null, HttpStatus.OK);
//        }
//    }

    @GetMapping(value = "/audio-files-download/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<StreamingResponseBody> download(@PathVariable Long id, final HttpServletResponse response) throws IOException {
        Optional<AudioFile> audioFile = audioFileRepository.findOneWithEagerRelationships(id);
        // ServletOutputStream stream = null;
        if (audioFile.isPresent()) {
            AudioFile af = audioFile.get();
            String title = af.getTitle();
            Long fileOwnerId = Long.parseLong(af.getIconPath()); // przechowuje id właściciela pliku
            Resource resource = storageService.loadAudioAsResource(title, fileOwnerId);
            File mp3 = null;
            try {
                mp3 = resource.getFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
            response.setContentType("audio/mpeg");
            response.setHeader(
                "Content-Disposition",
                "attachment;filename=" + title);
            response.setContentLength((int) mp3.length());
            // FileInputStream input = new FileInputStream(mp3);
            File finalMp = mp3;
            StreamingResponseBody streamRS = out -> {
                ServletOutputStream stream = response.getOutputStream();
                FileInputStream input = new FileInputStream(finalMp);
                BufferedInputStream buf = new BufferedInputStream(input);
                int readBytes = 0;
                //read from the file; write to the ServletOutputStream
                while ((readBytes = buf.read()) != -1)
                    stream.write(readBytes);
                if (stream != null)
                    stream.close();
                if (buf != null)
                    buf.close();
                log.info("steaming response {} ", stream);
            };
            return new ResponseEntity(streamRS, HttpStatus.OK);
        }
        return new ResponseEntity(null, HttpStatus.OK);
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
        Optional<AudioFile> audioFile = audioFileRepository.findOneWithEagerRelationships(id);
        if (audioFile.isPresent()) {
            AudioFile af = audioFile.get();
//            Set<User> users = af.getUsers();
//            Long firstUserId = users.iterator().next().getId(); // the owner of file
            storageService.deleteOneAudioFile(af.getTitle(), Long.parseLong(af.getIconPath()));
            audioFileRepository.deleteById(id);
            audioFileSearchRepository.deleteById(id);
        }
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
