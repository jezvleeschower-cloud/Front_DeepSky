package com.deepsky.backend.config;

// Clients
import com.deepsky.backend.client.nasa.NasaApodClient;
import com.deepsky.backend.client.nasa.NasaImageSearchClient;
import com.deepsky.backend.client.nasa.NasaNeoWsClient;
import com.deepsky.backend.client.nasa.cloudinary.CloudinaryUploader;
import com.deepsky.backend.client.nasa.traslate.MyMemoryTranslationClient;
import com.deepsky.backend.controller.AsteroideController;
import com.deepsky.backend.controller.AuthController;
import com.deepsky.backend.controller.CalendarioController;
import com.deepsky.backend.controller.ComentarioFotoDiaController;
import com.deepsky.backend.controller.FavoritoController;
import com.deepsky.backend.controller.ForoController;
import com.deepsky.backend.controller.FotoDelDiaController;
import com.deepsky.backend.controller.ImagenController;
import com.deepsky.backend.controller.RetoAstrofotografiaController;
import com.deepsky.backend.controller.SistemaSolarController;
import com.deepsky.backend.repository.CategoriaRepository;
import com.deepsky.backend.repository.ComentarioForoRepository;
import com.deepsky.backend.repository.ComentarioFotoDelDiaRepository;
import com.deepsky.backend.repository.DatoCuriosoPlanetaRepository;
import com.deepsky.backend.repository.FavoritoRepository;
import com.deepsky.backend.repository.ForoRepository;
import com.deepsky.backend.repository.FotoDelDiaRepository;
import com.deepsky.backend.repository.ParticipacionRetoRepository;
import com.deepsky.backend.repository.PlanetaRepository;
import com.deepsky.backend.repository.RetoAstrofotografiaRepository;
import com.deepsky.backend.repository.UsuarioRepository;
import com.deepsky.backend.router.AsteroideRoutes;
import com.deepsky.backend.router.AuthRoutes;
import com.deepsky.backend.router.CalendarioRoutes;
import com.deepsky.backend.router.ComentarioFotoDiaRoutes; // Corregido: ComentarioFotoDiaRoutes
import com.deepsky.backend.router.FavoritoRoutes;
import com.deepsky.backend.router.ForoRoutes;
import com.deepsky.backend.router.FotoDelDiaRoutes;
import com.deepsky.backend.router.ImagenRoutes;
import com.deepsky.backend.router.RetoAstrofotografiaRoutes;
import com.deepsky.backend.router.SistemaSolarRoutes;
import com.deepsky.backend.security.JwtService;
import com.deepsky.backend.service.AsteroideService;
import com.deepsky.backend.service.AuthService;
import com.deepsky.backend.service.ComentarioFotoDelDiaService;
import com.deepsky.backend.service.EmailService;
import com.deepsky.backend.service.FavoritoService;
import com.deepsky.backend.service.ForoService;
import com.deepsky.backend.service.FotoDelDiaService;
import com.deepsky.backend.service.ImagenService;
import com.deepsky.backend.service.ModeracionImagenService;
import com.deepsky.backend.service.ModeracionTextoService;
import com.deepsky.backend.service.RecordatorioEventoService;
import com.deepsky.backend.service.RetoAstrofotografiaService;
import com.deepsky.backend.service.SistemaSolarService;
import com.deepsky.backend.repository.EventoAstronomicoRepository;
import com.deepsky.backend.repository.FavoritoEventoRepository;
import com.deepsky.backend.service.VerificationCodeService;

import io.javalin.Javalin;

public class JavalinConfig {

    public static Javalin create() {
        // Configuración de Javalin 5.x para CORS
        Javalin app = Javalin.create(config -> {
            config.plugins.enableCors(cors -> {
                cors.add(it -> {
                    it.anyHost();
                });
            });
        });

        // Instancias Compartidas
        JwtService jwtService = new JwtService();
        // Password encoder shared
        com.deepsky.backend.security.PasswordEncoder passwordEncoder = new com.deepsky.backend.security.PasswordEncoder();
        CloudinaryUploader cloudinaryUploader = new CloudinaryUploader();

        // Moderación de contenido (texto e imágenes) generado por el usuario.
        // Se comparte una sola instancia entre todos los módulos que reciben
        // texto/imágenes de los usuarios (foro, comentarios, retos).
        ModeracionTextoService moderacionTextoService = new ModeracionTextoService();
        ModeracionImagenService moderacionImagenService = new ModeracionImagenService();

        // 1. MÓDULO: FOTO DEL DÍA (APOD)
        FotoDelDiaRepository fotoDelDiaRepo = new FotoDelDiaRepository();
        MyMemoryTranslationClient myMemoryClient = new MyMemoryTranslationClient();
        FotoDelDiaService fotoDelDiaService = new FotoDelDiaService(new NasaApodClient(), myMemoryClient, fotoDelDiaRepo);
        FotoDelDiaController fotoDelDiaController = new FotoDelDiaController(fotoDelDiaService);
        new FotoDelDiaRoutes(fotoDelDiaController).register(app);

        // 2. MÓDULO: COMENTARIOS DE FOTO DEL DÍA
        ComentarioFotoDelDiaRepository comentarioFotoRepo = new ComentarioFotoDelDiaRepository();
        ComentarioFotoDelDiaService comentarioFotoService = new ComentarioFotoDelDiaService(comentarioFotoRepo, fotoDelDiaRepo, moderacionTextoService);
        ComentarioFotoDiaController comentarioFotoController = new ComentarioFotoDiaController(comentarioFotoService, jwtService);
        new ComentarioFotoDiaRoutes(comentarioFotoController).register(app); // Corregido: ComentarioFotoDiaRoutes

        // 3. MÓDULO: AUTENTICACIÓN
        EmailService emailService = new EmailService();
        AuthService authService = new AuthService(new UsuarioRepository(), new VerificationCodeService(emailService), jwtService, passwordEncoder);
        AuthController authController = new AuthController(authService, jwtService);
        new AuthRoutes(authController).register(app);

        // 4. MÓDULO: ASTEROIDES (NEOs)
        AsteroideService asteroideService = new AsteroideService(new NasaNeoWsClient());
        AsteroideController asteroideController = new AsteroideController(asteroideService);
        new AsteroideRoutes(asteroideController).register(app);

        // 5. MÓDULO: CALENDARIO
        CalendarioController calendarioController = new CalendarioController(jwtService);
        new CalendarioRoutes(calendarioController).register(app);

        // 6. MÓDULO: SISTEMA SOLAR
        PlanetaRepository planetaRepo = new PlanetaRepository();
        DatoCuriosoPlanetaRepository datoCuriosoPlanetaRepo = new DatoCuriosoPlanetaRepository();
        SistemaSolarService sistemaSolarService = new SistemaSolarService(planetaRepo, datoCuriosoPlanetaRepo);
        SistemaSolarController sistemaSolarController = new SistemaSolarController(sistemaSolarService, jwtService);
        new SistemaSolarRoutes(sistemaSolarController).register(app);

        // 7. MÓDULO: FORO
        ForoRepository foroRepo = new ForoRepository();
        CategoriaRepository categoriaRepo = new CategoriaRepository();
        ComentarioForoRepository comentarioForoRepo = new ComentarioForoRepository();
        ForoService foroService = new ForoService(foroRepo, categoriaRepo, comentarioForoRepo, moderacionTextoService);
        ForoController foroController = new ForoController(foroService, jwtService, cloudinaryUploader, moderacionImagenService);
        new ForoRoutes(foroController).register(app);

        // 8. MÓDULO: BUSCADOR DE IMÁGENES (se traduce solo el detalle abierto, no el grid completo)
        ImagenService imagenService = new ImagenService(new NasaImageSearchClient(), myMemoryClient);
        ImagenController imagenController = new ImagenController(imagenService);
        new ImagenRoutes(imagenController).register(app);

        // 9. MÓDULO: FAVORITOS
        FavoritoService favoritoService = new FavoritoService(new FavoritoRepository());
        FavoritoController favoritoController = new FavoritoController(favoritoService);
        new FavoritoRoutes(favoritoController).register(app);

        // 10. MÓDULO: RETOS DE ASTROFOTOGRAFÍA
        RetoAstrofotografiaService retoAstrofotografiaService = new RetoAstrofotografiaService(
                new RetoAstrofotografiaRepository(),
                new ParticipacionRetoRepository(),
                cloudinaryUploader,
                moderacionTextoService,
                moderacionImagenService
        );
        RetoAstrofotografiaController retoAstrofotografiaController = new RetoAstrofotografiaController(retoAstrofotografiaService, jwtService);
        new RetoAstrofotografiaRoutes(retoAstrofotografiaController).register(app);

        // 11. RECORDATORIOS POR CORREO: eventos fijados (favoritos) que ocurren mañana
        RecordatorioEventoService recordatorioEventoService = new RecordatorioEventoService(
                new EventoAstronomicoRepository(),
                new FavoritoEventoRepository(),
                new UsuarioRepository(),
                emailService
        );
        recordatorioEventoService.iniciarProgramacionDiaria(8); // revisa todos los días a las 08:00

        return app;
    }

    // Alias para compatibilidad con Main.java
    public static Javalin createApp() {
        return create();
    }
}