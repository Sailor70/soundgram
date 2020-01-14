package com.soundgram.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

    void init();

    Path store(MultipartFile file, Long id);

    Stream<Path> loadAll();

    Path load(String filename, Long id);

    Resource loadAsResource(String filename, Long id);

    void deleteAll();

    void deleteOne(String filename, Long id);

}
