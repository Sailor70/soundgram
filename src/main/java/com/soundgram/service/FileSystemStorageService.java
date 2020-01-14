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

    private final Logger log = LoggerFactory.getLogger(FileSystemStorageService.class);

    @Autowired
    public FileSystemStorageService(StorageProperties properties) {
        this.rootLocation = Paths.get(properties.getLocation());
    }

    @Override
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage location", e);
        }
    }

    @Override
    public Path store(MultipartFile file, Long id) {
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        Path userFilesLocation = Paths.get(rootLocation.toString() + "/" + id.toString());
        log.debug("userFilesLocation: {}", userFilesLocation.toString());

        // jeśli user nie ma jeszcze swojego folderu w file system
        if(!Files.exists(userFilesLocation)) {
            try {
                Files.createDirectories(userFilesLocation);
                log.debug("Utworzono lokalizacje: {}", userFilesLocation.toString());
            } catch (IOException e) {
                throw new StorageException("Could not initialize storage location", e);
            }
        }

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
                Files.copy(inputStream, userFilesLocation.resolve(filename),
                    StandardCopyOption.REPLACE_EXISTING);
            }
        }
        catch (IOException e) {
            throw new StorageException("Failed to store file " + filename, e);
        }

        return userFilesLocation.resolve(filename);
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
    public Path load(String filename, Long id) {
        // return rootLocation.resolve(filename);
        return Paths.get(rootLocation.toString() + "/" + id.toString()).resolve(filename);
    }

    @Override
    public Resource loadAsResource(String filename, Long id) {
        try {
            Path file = load(filename, id);
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
    public void deleteOne(String filename, Long id) {
        Path filePath = Paths.get(rootLocation.toString() + "/" + id.toString()).resolve(filename);
        FileSystemUtils.deleteRecursively(filePath.toFile());
    }

}
