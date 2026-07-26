package com.deepsky.backend.service;

import com.deepsky.backend.model.EventoAstronomico;
import com.deepsky.backend.model.FavoritoEvento;
import com.deepsky.backend.repository.EventoAstronomicoRepository;
import com.deepsky.backend.repository.FavoritoEventoRepository;

import java.sql.SQLException;
import java.util.List;

public class CalendarioService {

    private final EventoAstronomicoRepository eventoRepository;
    private final FavoritoEventoRepository favoritoRepository;

    public CalendarioService() {
        this.eventoRepository = new EventoAstronomicoRepository();
        this.favoritoRepository = new FavoritoEventoRepository();
    }

    // Guardar un evento validando el rol de DIVULGADOR
    public EventoAstronomico crearEventoAstronomico(EventoAstronomico evento, String usuarioRol) throws SQLException {
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: Solo los usuarios con rol DIVULGADOR pueden crear eventos astronómicos.");
        }
        if (evento.getTitulo() == null || evento.getTitulo().trim().isEmpty()) {
            throw new IllegalArgumentException("El título del evento es obligatorio.");
        }
        return eventoRepository.create(evento);
    }

    // Actualizar un evento validando el rol de DIVULGADOR y que sea el creador
    public EventoAstronomico actualizarEventoAstronomico(int idEvento, EventoAstronomico datosActualizados, int usuarioId, String usuarioRol) throws SQLException {
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: Solo los usuarios con rol DIVULGADOR pueden modificar eventos astronómicos.");
        }
        EventoAstronomico eventoExistente = eventoRepository.findById(idEvento);
        if (eventoExistente == null) {
            return null;
        }
        if (eventoExistente.getUsuarioId() == null || eventoExistente.getUsuarioId() != usuarioId) {
            throw new IllegalArgumentException("Acceso denegado: Solo el creador del evento puede modificarlo.");
        }
        if (datosActualizados.getTitulo() == null || datosActualizados.getTitulo().trim().isEmpty()) {
            throw new IllegalArgumentException("El título del evento es obligatorio.");
        }
        datosActualizados.setIdEvento(idEvento);
        boolean actualizado = eventoRepository.update(datosActualizados);
        if (!actualizado) {
            return null;
        }
        return eventoRepository.findById(idEvento);
    }

    // Eliminar un evento validando el rol de DIVULGADOR y que sea el creador
    public boolean eliminarEventoAstronomico(int idEvento, int usuarioId, String usuarioRol) throws SQLException {
        if (!"DIVULGADOR".equalsIgnoreCase(usuarioRol)) {
            throw new IllegalArgumentException("Acceso denegado: Solo los usuarios con rol DIVULGADOR pueden eliminar eventos astronómicos.");
        }
        EventoAstronomico eventoExistente = eventoRepository.findById(idEvento);
        if (eventoExistente == null) {
            return false;
        }
        if (eventoExistente.getUsuarioId() == null || eventoExistente.getUsuarioId() != usuarioId) {
            throw new IllegalArgumentException("Acceso denegado: Solo el creador del evento puede eliminarlo.");
        }
        return eventoRepository.delete(idEvento);
    }

    // Listar eventos por mes (Alcance mínimo de consulta del módulo)
    public List<EventoAstronomico> obtenerEventosPorMes(int year, int month) throws SQLException {
        return eventoRepository.findByMonth(year, month);
    }

    // Fijar un evento para el usuario autenticado (Siguiente sub-escalón)
    public FavoritoEvento fijarEventoParaUsuario(int usuarioId, int eventoId) throws SQLException {
        FavoritoEvento favorito = new FavoritoEvento(usuarioId, eventoId);
        return favoritoRepository.addFavorito(favorito);
    }

    // Quitar evento fijado
    public boolean desfijarEventoParaUsuario(int usuarioId, int eventoId) throws SQLException {
        return favoritoRepository.removeFavorito(usuarioId, eventoId);
    }
}