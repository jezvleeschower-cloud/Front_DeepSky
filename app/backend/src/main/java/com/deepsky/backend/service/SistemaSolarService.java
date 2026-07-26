package com.deepsky.backend.service;

import java.util.List;

import com.deepsky.backend.exception.NotFoundException;
import com.deepsky.backend.model.DatoCuriosoPlaneta;
import com.deepsky.backend.model.Planeta;
import com.deepsky.backend.repository.DatoCuriosoPlanetaRepository;
import com.deepsky.backend.repository.PlanetaRepository;

public class SistemaSolarService {
    private final PlanetaRepository planetaRepository;
    private final DatoCuriosoPlanetaRepository datoCuriosoRepository;

    public SistemaSolarService(PlanetaRepository planetaRepository, DatoCuriosoPlanetaRepository datoCuriosoRepository) {
        this.planetaRepository = planetaRepository;
        this.datoCuriosoRepository = datoCuriosoRepository;
    }

    public List<Planeta> obtenerTodosLosPlanetas() {
        List<Planeta> planetas = planetaRepository.findAll();
        for (Planeta planeta : planetas) {
            planeta.setDatosCuriosos(datoCuriosoRepository.findByPlanetaId(planeta.getIdPlaneta()));
        }
        return planetas;
    }

    public Planeta obtenerPlanetaPorId(int id) {
        Planeta planeta = planetaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Planeta no encontrado con el ID: " + id));
        
        planeta.setDatosCuriosos(datoCuriosoRepository.findByPlanetaId(planeta.getIdPlaneta()));
        return planeta;
    }

    public List<DatoCuriosoPlaneta> obtenerCuriosidadesPorPlaneta(int planetaId) {
        // Verifica que el planeta exista
        obtenerPlanetaPorId(planetaId);
        return datoCuriosoRepository.findByPlanetaId(planetaId);
    }

    public DatoCuriosoPlaneta agregarCuriosidad(int planetaId, int usuarioId, String usuarioRol, String textoDato) {
        // Cualquier usuario autenticado (registrado) puede agregar curiosidades.
        // La autenticación en sí (token JWT válido) ya se valida en el controller.
        if (textoDato == null || textoDato.trim().isEmpty()) {
            throw new IllegalArgumentException("El contenido de la curiosidad no puede estar vacío.");
        }

        // Verificar que el planeta existe
        obtenerPlanetaPorId(planetaId);

        DatoCuriosoPlaneta nuevoDato = new DatoCuriosoPlaneta();
        nuevoDato.setPlanetaId(planetaId);
        nuevoDato.setUsuarioId(usuarioId);
        nuevoDato.setDato(textoDato.trim());

        return datoCuriosoRepository.save(nuevoDato);
    }

    /**
     * Elimina una curiosidad. Solo los usuarios con rol DIVULGADOR pueden
     * moderar (eliminar) curiosidades de cualquier usuario.
     */
    public boolean eliminarCuriosidad(int idDato, String usuarioRol) {
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: solo los usuarios con rol DIVULGADOR pueden eliminar curiosidades.");
        }
        return datoCuriosoRepository.deleteById(idDato);
    }
}