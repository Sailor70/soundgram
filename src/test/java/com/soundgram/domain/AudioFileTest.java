package com.soundgram.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import com.soundgram.web.rest.TestUtil;

public class AudioFileTest {

    @Test
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AudioFile.class);
        AudioFile audioFile1 = new AudioFile();
        audioFile1.setId(1L);
        AudioFile audioFile2 = new AudioFile();
        audioFile2.setId(audioFile1.getId());
        assertThat(audioFile1).isEqualTo(audioFile2);
        audioFile2.setId(2L);
        assertThat(audioFile1).isNotEqualTo(audioFile2);
        audioFile1.setId(null);
        assertThat(audioFile1).isNotEqualTo(audioFile2);
    }
}
