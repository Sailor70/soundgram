package com.soundgram.repository.search;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Configuration;

/**
 * Configure a Mock version of {@link AudioFileSearchRepository} to test the
 * application without starting Elasticsearch.
 */
@Configuration
public class AudioFileSearchRepositoryMockConfiguration {

    @MockBean
    private AudioFileSearchRepository mockAudioFileSearchRepository;

}
