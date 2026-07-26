package com.deepsky.backend.client.nasa.cloudinary;

import java.io.IOException;
import java.util.Map;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.deepsky.backend.config.AppConfig;

public class CloudinaryUploader {

    private final Cloudinary cloudinary;

    public CloudinaryUploader() {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", AppConfig.get("cloudinary.cloud_name"),
                "api_key", AppConfig.get("cloudinary.api_key"),
                "api_secret", AppConfig.get("cloudinary.api_secret"),
                "secure", true
        ));
    }

    public CloudinaryUploadResult subirImagenReto(byte[] bytes, String nombreOriginal) {
        return subirImagenGenerica(bytes, nombreOriginal, "deepsky/retos");
    }

    // Portada / imagen de referencia del reto (se muestra en la tarjeta del listado)
    public CloudinaryUploadResult subirImagenPortadaReto(byte[] bytes, String nombreOriginal) {
        return subirImagenGenerica(bytes, nombreOriginal, "deepsky/retos/portadas");
    }

    // Nuevo método para el Foro
    public CloudinaryUploadResult subirImagenForo(byte[] bytes, String nombreOriginal) {
        return subirImagenGenerica(bytes, nombreOriginal, "deepsky/foro");
    }

    private CloudinaryUploadResult subirImagenGenerica(byte[] bytes, String nombreOriginal, String folder) {
        try {
            Map<?, ?> resultado = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image"
            ));

            String url = (String) resultado.get("secure_url");
            String publicId = (String) resultado.get("public_id");

            if (url == null || publicId == null) {
                throw new IllegalStateException("Cloudinary no devolvió una URL válida para " + nombreOriginal);
            }

            return new CloudinaryUploadResult(url, publicId);
        } catch (IOException exception) {
            throw new IllegalStateException("No fue posible subir la imagen a Cloudinary", exception);
        }
    }
}