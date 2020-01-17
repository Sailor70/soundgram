package com.soundgram.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.stream.Stream;

public interface StorageService {

    void init();

    Path storeAudioFile(MultipartFile file, Long id);

    Path storeImage(MultipartFile file, Long id);

    Stream<Path> loadAll();

    Resource loadAudioAsResource(String filename, Long id);

    Resource loadImageAsResource(String filename, Long id);

    void deleteAll();

    void deleteOneAudioFile(String filename, Long id);

    void deleteOneImage(String filename, Long id);

}
