package com.deepsky.backend.client.nasa.cloudinary;

/**
 * Resultado de subir una imagen a Cloudinary: lo único que persistimos
 * en la base de datos es la URL segura y el public_id (nunca el archivo).
 */
public class CloudinaryUploadResult {
    private final String url;
    private final String publicId;

    public CloudinaryUploadResult(String url, String publicId) {
        this.url = url;
        this.publicId = publicId;
    }

    public String getUrl() {
        return url;
    }

    public String getPublicId() {
        return publicId;
    }
}