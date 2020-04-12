package com.soundgram.service;

import com.soundgram.config.StorageProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.stream.Stream;

@Service
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation;

    private final Path audioLocation;

    private final Path imagesLocation;

    private final Path avatarsLocation;

    private final Logger log = LoggerFactory.getLogger(FileSystemStorageService.class);

    @Autowired
    public FileSystemStorageService(StorageProperties properties) {
        this.rootLocation = Paths.get(properties.getLocation());
        this.audioLocation = Paths.get(properties.getLocation() + "/audioFiles");
        this.imagesLocation = Paths.get(properties.getLocation() + "/images");
        this.avatarsLocation = Paths.get(properties.getLocation() + "/avatars");
    }

    @Override
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(audioLocation);
            Files.createDirectories(imagesLocation);
            Files.createDirectories(avatarsLocation);
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage location", e);
        }
    }

    @Override
    public Path storeAudioFile(MultipartFile file, Long id) {
        String filename = StringUtils.cleanPath((file.getOriginalFilename() != null) ? file.getOriginalFilename() : "plik.mp3"); // plik.mp3
        Path userAudioFilesLocation = Paths.get(audioLocation.toString() + "/" + id.toString());
        log.debug("userAudioFilesLocation: {}", userAudioFilesLocation.toString());

        if(!Files.exists(userAudioFilesLocation)) {
            try {
                Files.createDirectories(userAudioFilesLocation);
                log.debug("Utworzono lokalizacje: {}", userAudioFilesLocation.toString());
            } catch (IOException e) {
                throw new StorageException("Could not initialize storage location", e);
            }
        }
//        store(file, filename);
        return getPathAndStoreFile(file, filename, userAudioFilesLocation);
    }

    @Override
    public Path storeImage(MultipartFile file, Long id) {
        String filename = StringUtils.cleanPath(id.toString().concat((file.getOriginalFilename() != null) ? file.getOriginalFilename() : "plik.mp3")); // 5467plik.mp3 : idPostaNazwaPlku.mp3
        //store(file, filename);
        return getPathAndStoreFile(file, filename, imagesLocation);
    }

    @Override // czy usuwać stare avatary?
    public String storeAvatar(MultipartFile file, Long id) {
        String filename = StringUtils.cleanPath(id.toString().concat((file.getOriginalFilename() != null) ? file.getOriginalFilename() : "plik.mp3")); // 5467plik.mp3 : idUseraNazwaPlku.mp3
        //store(file, filename);
        Path path = getPathAndStoreFile(file, filename, avatarsLocation);
        log.debug("Zapisano nowy avatar w: {}", path.toString());
        return filename;
    }

    private Path getPathAndStoreFile(MultipartFile file, String filename, Path filesLocation) {
        try {
            if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file " + filename);
            }
            if (filename.contains("..")) {
                // This is a security check
                throw new StorageException(
                    "Cannot store file with relative path outside current directory "
                        + filename);
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, filesLocation.resolve(filename),
                    StandardCopyOption.REPLACE_EXISTING);
            }
        }
        catch (IOException e) {
            throw new StorageException("Failed to store file " + filename, e);
        }
        return  filesLocation.resolve(filename);
    }

    @Override
    public Stream<Path> loadAll() {
        try {
            return Files.walk(this.rootLocation, 1)
                .filter(path -> !path.equals(this.rootLocation))
                .map(this.rootLocation::relativize);
        }
        catch (IOException e) {
            throw new StorageException("Failed to read stored files", e);
        }
    }

    @Override
    public Resource loadAudioAsResource(String filename, Long id) {
        try {
            log.debug("Files user id: " + id);
            Path file = Paths.get(audioLocation.toString() + "/" + id.toString()).resolve(filename);
            log.debug("File path: " + file.toString());
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            }
            else {
                throw new FileNotFoundException(
                    "Could not read file: " + filename);
            }
        }
        catch (MalformedURLException e) {
            throw new FileNotFoundException("Could not read file: " + filename, e);
        }
    }

    @Override
    public Resource loadImageAsResource(String filename, Long postId) {
        try {
            Path file = imagesLocation.resolve(postId.toString().concat(filename));
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            }
            else {
                throw new FileNotFoundException(
                    "Could not read file: " + filename);
            }
        }
        catch (MalformedURLException e) {
            throw new FileNotFoundException("Could not read file: " + filename, e);
        }
    }

    @Override
    public Resource loadAvatarAsResource(String filename) {
        log.debug("Loading filen: " + filename);
        try {
            Path file = avatarsLocation.resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            }
            else {
                throw new FileNotFoundException(
                    "Could not read file: " + filename);
            }
        }
        catch (MalformedURLException e) {
            throw new FileNotFoundException("Could not read file: " + filename, e);
        }
    }

    @Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(rootLocation.toFile());
    }

    @Override
    public void deleteOneAudioFile(String filename, Long id) {
        Path filePath = Paths.get(audioLocation.toString() + "/" + id.toString()).resolve(filename);
        FileSystemUtils.deleteRecursively(filePath.toFile());
    }

    @Override
    public void deleteOneImage(String filename, Long postId) {
        Path filePath = Paths.get(imagesLocation.toString()).resolve(postId.toString().concat(filename));
        FileSystemUtils.deleteRecursively(filePath.toFile());
    }

    @Override
    public void deleteOneAvatar(String filename, Long userId) {
        Path filePath = Paths.get(avatarsLocation.toString()).resolve(userId.toString().concat(filename));
        FileSystemUtils.deleteRecursively(filePath.toFile());
    }

}
