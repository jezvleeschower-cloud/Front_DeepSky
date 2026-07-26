package com.deepsky.backend.service;

import com.deepsky.backend.model.EventoAstronomico;
import com.deepsky.backend.model.FavoritoEvento;
import com.deepsky.backend.model.Usuario;
import com.deepsky.backend.repository.EventoAstronomicoRepository;
import com.deepsky.backend.repository.FavoritoEventoRepository;
import com.deepsky.backend.repository.UsuarioRepository;

import java.sql.SQLException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Revisa los eventos astronómicos que ocurren "mañana" y envía un correo de
 * recordatorio a cada usuario que haya fijado (marcado como favorito) ese evento.
 *
 * Se ejecuta una vez al día mediante un scheduler simple; no requiere
 * dependencias extra ni infraestructura de colas.
 */
public class RecordatorioEventoService {

    private static final DateTimeFormatter HORA_FORMATO = DateTimeFormatter.ofPattern("HH:mm");

    private final EventoAstronomicoRepository eventoRepository;
    private final FavoritoEventoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;

    private ScheduledExecutorService scheduler;

    public RecordatorioEventoService(EventoAstronomicoRepository eventoRepository,
                                      FavoritoEventoRepository favoritoRepository,
                                      UsuarioRepository usuarioRepository,
                                      EmailService emailService) {
        this.eventoRepository = eventoRepository;
        this.favoritoRepository = favoritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }

    /**
     * Revisa los eventos de mañana y envía los correos correspondientes.
     * Público para poder llamarlo manualmente (pruebas) además de vía scheduler.
     */
    public void enviarRecordatoriosDeManana() {
        LocalDate manana = LocalDate.now().plusDays(1);
        try {
            List<EventoAstronomico> eventosDeManana = eventoRepository.findByFecha(manana);
            for (EventoAstronomico evento : eventosDeManana) {
                notificarFavoritosDelEvento(evento);
            }
        } catch (SQLException e) {
            System.err.println("❌ [RECORDATORIOS] Error obteniendo eventos de mañana: " + e.getMessage());
        }
    }

    private void notificarFavoritosDelEvento(EventoAstronomico evento) {
        try {
            List<FavoritoEvento> favoritos = favoritoRepository.findByEventoId(evento.getIdEvento());
            String hora = evento.getFechaHora() != null ? evento.getFechaHora().format(HORA_FORMATO) : null;

            for (FavoritoEvento favorito : favoritos) {
                Optional<Usuario> usuario = usuarioRepository.findById(favorito.getUsuarioId());
                usuario.ifPresent(u -> {
                    if (u.getEmail() != null && !u.getEmail().isBlank()) {
                        emailService.enviarRecordatorioEventoManana(u.getEmail(), evento.getTitulo(), hora);
                    }
                });
            }
        } catch (SQLException e) {
            System.err.println("❌ [RECORDATORIOS] Error notificando favoritos del evento "
                    + evento.getIdEvento() + ": " + e.getMessage());
        }
    }

    /**
     * Inicia la ejecución periódica (una vez al día). Calcula el retraso hasta
     * la próxima hora objetivo y luego repite cada 24 horas.
     */
    public void iniciarProgramacionDiaria(int horaDelDia) {
        if (scheduler != null && !scheduler.isShutdown()) {
            return; // ya iniciado
        }
        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "recordatorio-eventos-favoritos");
            t.setDaemon(true);
            return t;
        });

        long delayInicialSegundos = segundosHastaProximaHora(horaDelDia);
        long unDiaEnSegundos = TimeUnit.DAYS.toSeconds(1);

        scheduler.scheduleAtFixedRate(
                this::enviarRecordatoriosDeManana,
                delayInicialSegundos,
                unDiaEnSegundos,
                TimeUnit.SECONDS
        );

        System.out.println("📅 [RECORDATORIOS] Programados: próxima revisión en " + delayInicialSegundos
                + "s, luego cada 24h.");
    }

    public void detener() {
        if (scheduler != null) {
            scheduler.shutdownNow();
        }
    }

    private long segundosHastaProximaHora(int horaDelDia) {
        java.time.LocalDateTime ahora = java.time.LocalDateTime.now();
        java.time.LocalDateTime proximaEjecucion = ahora
                .withHour(horaDelDia).withMinute(0).withSecond(0).withNano(0);
        if (!proximaEjecucion.isAfter(ahora)) {
            proximaEjecucion = proximaEjecucion.plusDays(1);
        }
        return java.time.Duration.between(ahora, proximaEjecucion).getSeconds();
    }
}
