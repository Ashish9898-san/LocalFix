package com.localfix.service;

import com.localfix.dto.ImageUploadResponse;
import com.localfix.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Unit tests for FileStorageService using a JUnit 5 temporary directory.
 * Verifies file persistence, MIME validation, size limits, and path traversal defenses.
 */
class FileStorageServiceTest {

    @TempDir
    Path tempUploadDir;

    private FileStorageService fileStorageService;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(tempUploadDir.toString());
        fileStorageService.init();
    }

    @Test
    @DisplayName("init creates the upload directory if it does not exist")
    void init_createsDirectory() {
        assertThat(Files.exists(tempUploadDir)).isTrue();
        assertThat(Files.isDirectory(tempUploadDir)).isTrue();
    }

    @Test
    @DisplayName("storeImage successfully stores JPEG file and returns valid response")
    void storeImage_jpeg_success() throws IOException {
        byte[] content = "fake-jpeg-binary-stream".getBytes();
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "pothole.jpg",
                "image/jpeg",
                content
        );

        ImageUploadResponse response = fileStorageService.storeImage(file);

        assertThat(response).isNotNull();
        assertThat(response.fileName()).endsWith(".jpg");
        assertThat(response.imageUrl()).isEqualTo("/api/reports/images/" + response.fileName());
        assertThat(response.fileSize()).isEqualTo(content.length);
        assertThat(response.contentType()).isEqualTo("image/jpeg");

        Path savedFile = tempUploadDir.resolve(response.fileName());
        assertThat(Files.exists(savedFile)).isTrue();
        assertThat(Files.readAllBytes(savedFile)).isEqualTo(content);
    }

    @Test
    @DisplayName("storeImage successfully stores PNG file")
    void storeImage_png_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "streetlight.png",
                "image/png",
                "fake-png-content".getBytes()
        );

        ImageUploadResponse response = fileStorageService.storeImage(file);

        assertThat(response.fileName()).endsWith(".png");
        assertThat(response.imageUrl()).startsWith("/api/reports/images/");
        assertThat(Files.exists(tempUploadDir.resolve(response.fileName()))).isTrue();
    }

    @Test
    @DisplayName("storeImage successfully stores WebP file")
    void storeImage_webp_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "damage.webp",
                "image/webp",
                "fake-webp-content".getBytes()
        );

        ImageUploadResponse response = fileStorageService.storeImage(file);

        assertThat(response.fileName()).endsWith(".webp");
        assertThat(Files.exists(tempUploadDir.resolve(response.fileName()))).isTrue();
    }

    @Test
    @DisplayName("storeImage rejects null or empty file")
    void storeImage_emptyFile_throwsIllegalArgument() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        IllegalArgumentException ex1 = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeImage(emptyFile)
        );
        assertThat(ex1.getMessage()).containsIgnoringCase("empty or missing");

        IllegalArgumentException ex2 = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeImage(null)
        );
        assertThat(ex2.getMessage()).containsIgnoringCase("empty or missing");
    }

    @Test
    @DisplayName("storeImage rejects files exceeding 5MB limit")
    void storeImage_oversizedFile_throwsIllegalArgument() {
        byte[] oversizedData = new byte[(int) (FileStorageService.MAX_FILE_SIZE_BYTES + 1024)];
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "huge.jpg",
                "image/jpeg",
                oversizedData
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeImage(largeFile)
        );
        assertThat(ex.getMessage()).contains("exceeds the maximum allowed limit of 5 MB");
    }

    @Test
    @DisplayName("storeImage rejects unsupported MIME types")
    void storeImage_unsupportedMimeType_throwsIllegalArgument() {
        MockMultipartFile pdfFile = new MockMultipartFile(
                "file",
                "document.pdf",
                "application/pdf",
                "pdf-content".getBytes()
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeImage(pdfFile)
        );
        assertThat(ex.getMessage()).contains("Unsupported file type 'application/pdf'");
    }

    @Test
    @DisplayName("storeImage rejects disallowed file extensions")
    void storeImage_disallowedExtension_throwsIllegalArgument() {
        MockMultipartFile exeFile = new MockMultipartFile(
                "file",
                "script.exe",
                "image/jpeg", // Spoofed MIME type
                "binary".getBytes()
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.storeImage(exeFile)
        );
        assertThat(ex.getMessage()).contains("Unsupported file extension: .exe");
    }

    @Test
    @DisplayName("loadImageAsResource returns valid readable Resource for stored image")
    void loadImageAsResource_success() throws IOException {
        String fileName = "sample-photo.jpg";
        Path targetPath = tempUploadDir.resolve(fileName);
        Files.write(targetPath, "image-content".getBytes());

        Resource resource = fileStorageService.loadImageAsResource(fileName);

        assertThat(resource).isNotNull();
        assertThat(resource.exists()).isTrue();
        assertThat(resource.isReadable()).isTrue();
        assertThat(resource.contentLength()).isEqualTo("image-content".length());
    }

    @Test
    @DisplayName("loadImageAsResource throws ResourceNotFoundException for nonexistent file")
    void loadImageAsResource_notFound() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> fileStorageService.loadImageAsResource("nonexistent.jpg")
        );
    }

    @Test
    @DisplayName("loadImageAsResource rejects path traversal attempts")
    void loadImageAsResource_pathTraversal_throwsIllegalArgument() {
        IllegalArgumentException ex1 = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.loadImageAsResource("../../../etc/passwd")
        );
        assertThat(ex1.getMessage()).contains("Invalid filename format or path traversal attempt detected.");

        IllegalArgumentException ex2 = assertThrows(
                IllegalArgumentException.class,
                () -> fileStorageService.loadImageAsResource("..\\secret.png")
        );
        assertThat(ex2.getMessage()).contains("Invalid filename format or path traversal attempt detected.");
    }

    @Test
    @DisplayName("probeContentType returns correct MIME type for known extensions")
    void probeContentType_knownExtensions() {
        assertThat(fileStorageService.probeContentType("photo.jpg")).isEqualTo("image/jpeg");
        assertThat(fileStorageService.probeContentType("photo.jpeg")).isEqualTo("image/jpeg");
        assertThat(fileStorageService.probeContentType("photo.png")).isEqualTo("image/png");
        assertThat(fileStorageService.probeContentType("photo.webp")).isEqualTo("image/webp");
        assertThat(fileStorageService.probeContentType("photo.gif")).isEqualTo("image/gif");
        assertThat(fileStorageService.probeContentType("unknown.bin")).isEqualTo("application/octet-stream");
        assertThat(fileStorageService.probeContentType(null)).isEqualTo("application/octet-stream");
    }
}
