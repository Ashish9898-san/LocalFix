package com.localfix.service;

import com.localfix.dto.ImageUploadResponse;
import com.localfix.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * FileStorageService
 *
 * Handles persistent filesystem storage for civic issue photograph attachments.
 *
 * Key Architectural Decisions & Safeguards:
 * 1. Configurable Storage Path: Directory is configured via 'localfix.upload.dir'
 *    (defaults to 'uploads/' outside source folders), keeping uploaded media isolated from code.
 * 2. Whitelist File Validation: Only genuine image MIME types (JPEG, PNG, WebP, GIF)
 *    and extensions are accepted; executable or arbitrary scripts are rejected.
 * 3. File Size Enforced: Server enforces a strict 5 MB limit.
 * 4. Safe Filename Generation: Original filenames are NEVER trusted. A cryptographically
 *    random UUID replaces the user's filename to prevent collisions, shell injection, and metadata leakage.
 * 5. Path Traversal Protection: Filename inputs are strictly validated against a regex pattern
 *    and verified to reside within the intended directory using Path.normalize().
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    public static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    public static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    // Whitelist allowed file extensions
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "webp", "gif");

    // Strict regex for safe filenames: alphanumeric, dashes, dots, underscores only
    private static final Pattern SAFE_FILENAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]+\\.[a-zA-Z0-9]+$");

    private final Path rootLocation;

    public FileStorageService(@Value("${localfix.upload.dir:uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.rootLocation);
            log.info("Initialized LocalFix image upload directory at: {}", this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory: " + this.rootLocation, e);
        }
    }

    /**
     * Store an uploaded image file on the local filesystem.
     *
     * @param file the multipart file uploaded by the client
     * @return metadata including the clean relative URL
     */
    public ImageUploadResponse storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty or missing file.");
        }

        // 1. Validate file size
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException(String.format(
                    "File size (%d bytes) exceeds the maximum allowed limit of 5 MB (%d bytes).",
                    file.getSize(), MAX_FILE_SIZE_BYTES));
        }

        // 2. Validate MIME Content-Type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException(String.format(
                    "Unsupported file type '%s'. Only JPEG, PNG, WebP, and GIF images are permitted.",
                    contentType));
        }

        // 3. Extract and validate file extension
        String originalFilename = file.getOriginalFilename();
        if (StringUtils.hasText(originalFilename) && originalFilename.contains(".")) {
            String rawExt = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            if (!ALLOWED_EXTENSIONS.contains(rawExt)) {
                throw new IllegalArgumentException("Unsupported file extension: ." + rawExt);
            }
        }
        String extension = getExtension(originalFilename, contentType);
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported file extension: ." + extension);
        }

        // 4. Generate safe unique filename
        String safeFileName = UUID.randomUUID() + "." + extension;

        try {
            Path destinationFile = this.rootLocation.resolve(safeFileName).normalize().toAbsolutePath();

            // Guard against path traversal
            if (!destinationFile.startsWith(this.rootLocation)) {
                throw new SecurityException("Cannot store file outside current storage directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            log.info("Successfully stored civic report photo: {} ({} bytes)", safeFileName, file.getSize());

            // Build relative URL endpoint for serving
            String imageUrl = "/api/reports/images/" + safeFileName;
            return new ImageUploadResponse(imageUrl, safeFileName, file.getSize(), contentType);

        } catch (IOException e) {
            log.error("Failed to store file: {}", safeFileName, e);
            throw new RuntimeException("Failed to persist uploaded image to disk.", e);
        }
    }

    /**
     * Load an image file as a Spring Resource for HTTP serving.
     *
     * @param fileName the filename to load
     * @return the file Resource
     */
    public Resource loadImageAsResource(String fileName) {
        if (!StringUtils.hasText(fileName) || !SAFE_FILENAME_PATTERN.matcher(fileName).matches() || fileName.contains("..")) {
            throw new IllegalArgumentException("Invalid filename format or path traversal attempt detected.");
        }

        try {
            Path filePath = this.rootLocation.resolve(fileName).normalize().toAbsolutePath();

            if (!filePath.startsWith(this.rootLocation)) {
                throw new SecurityException("Access denied: Path traversal outside upload directory.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Image", "fileName", fileName);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Image", "fileName", fileName);
        }
    }

    /**
     * Resolve MIME content type for a given filename.
     */
    public String probeContentType(String fileName) {
        if (fileName == null) return "application/octet-stream";
        String lower = fileName.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".gif")) return "image/gif";
        return "application/octet-stream";
    }

    private String getExtension(String originalFilename, String contentType) {
        if (StringUtils.hasText(originalFilename) && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            if (ALLOWED_EXTENSIONS.contains(ext)) {
                return ext.equals("jpeg") ? "jpg" : ext;
            }
        }

        // Fallback to Content-Type if originalFilename lacks valid extension
        if (contentType != null) {
            return switch (contentType.toLowerCase(Locale.ROOT)) {
                case "image/jpeg" -> "jpg";
                case "image/png" -> "png";
                case "image/webp" -> "webp";
                case "image/gif" -> "gif";
                default -> "jpg";
            };
        }

        return "jpg";
    }

    public Path getRootLocation() {
        return rootLocation;
    }
}
