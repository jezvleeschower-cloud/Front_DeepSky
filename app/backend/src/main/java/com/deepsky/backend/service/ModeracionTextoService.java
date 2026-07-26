package com.deepsky.backend.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.HashSet;
import java.util.Set;
import java.util.logging.Logger;
import java.util.regex.Pattern;

import com.deepsky.backend.exception.ContenidoInapropiadoException;

/**
 * Filtro de lenguaje altisonante para todo texto generado por el usuario
 * (títulos y contenido de hilos, comentarios, retos, etc.) antes de
 * persistirlo en la base de datos.
 *
 * Estrategia:
 *  1. Normaliza el texto: minúsculas, sin acentos, sustituye "leetspeak"
 *     habitual (0->o, 1->i, 3->e, 4->a, 5->s, @->a, $->s) y colapsa letras
 *     repetidas (p.ej. "puuuuto" -> "puto").
 *  2. Compara contra una lista de palabras prohibidas cargada desde
 *     resources/moderacion/palabras-prohibidas.txt (una palabra por línea,
 *     líneas que empiezan con # se ignoran). Editar ese archivo NO requiere
 *     tocar código Java.
 *  3. Además de la coincidencia por palabra completa, revisa una versión
 *     "colapsada" (sin espacios ni signos) para detectar evasión del tipo
 *     "p u t o" o "p.u.t.o".
 */
public class ModeracionTextoService {

    private static final Logger LOGGER = Logger.getLogger(ModeracionTextoService.class.getName());
    private static final String RUTA_LISTA_PALABRAS = "moderacion/palabras-prohibidas.txt";
    private static final int LONGITUD_MINIMA_PARA_COLAPSADO = 4; // evita falsos positivos con palabras muy cortas

    private final Set<String> palabrasProhibidas;

    public ModeracionTextoService() {
        this.palabrasProhibidas = cargarPalabras();
        if (palabrasProhibidas.isEmpty()) {
            LOGGER.warning("La lista de palabras prohibidas está vacía. La moderación de texto no bloqueará nada.");
        }
    }

    /**
     * Valida un texto. Si contiene lenguaje altisonante lanza
     * ContenidoInapropiadoException (IllegalArgumentException), que ya es
     * manejada por los controladores existentes.
     */
    public void validar(String texto) {
        if (texto == null || texto.isBlank() || palabrasProhibidas.isEmpty()) {
            return;
        }

        String normalizado = normalizar(texto);
        String colapsado = normalizado.replaceAll("[^a-z0-9]", "");

        for (String palabra : palabrasProhibidas) {
            if (contienePalabraCompleta(normalizado, palabra)) {
                throw rechazar();
            }
            if (palabra.length() >= LONGITUD_MINIMA_PARA_COLAPSADO && colapsado.contains(palabra)) {
                throw rechazar();
            }
        }
    }

    /** Variante que no lanza excepción, útil para validaciones opcionales. */
    public boolean esApropiado(String texto) {
        try {
            validar(texto);
            return true;
        } catch (ContenidoInapropiadoException e) {
            return false;
        }
    }

    private ContenidoInapropiadoException rechazar() {
        return new ContenidoInapropiadoException(
                "El texto contiene lenguaje inapropiado y no puede publicarse.");
    }

    private boolean contienePalabraCompleta(String textoNormalizado, String palabra) {
        Pattern patron = Pattern.compile("\\b" + Pattern.quote(palabra) + "\\b");
        return patron.matcher(textoNormalizado).find();
    }

    private String normalizar(String texto) {
        String sinAcentos = Normalizer.normalize(texto.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        StringBuilder sb = new StringBuilder(sinAcentos.length());
        for (char c : sinAcentos.toCharArray()) {
            switch (c) {
                case '0': sb.append('o'); break;
                case '1': case '!': case '|': sb.append('i'); break;
                case '3': sb.append('e'); break;
                case '4': case '@': sb.append('a'); break;
                case '5': case '$': sb.append('s'); break;
                case '7': sb.append('t'); break;
                default: sb.append(c);
            }
        }

        // Colapsa 3 o más repeticiones consecutivas de la misma letra
        // (evita falsos positivos con dobles legítimas como "correo", "carro").
        return sb.toString().replaceAll("(.)\\1{2,}", "$1");
    }

    private Set<String> cargarPalabras() {
        Set<String> resultado = new HashSet<>();
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(RUTA_LISTA_PALABRAS)) {
            if (is == null) {
                LOGGER.warning("No se encontró el archivo de palabras prohibidas: " + RUTA_LISTA_PALABRAS);
                return resultado;
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                String linea;
                while ((linea = reader.readLine()) != null) {
                    String limpia = linea.trim().toLowerCase();
                    if (!limpia.isEmpty() && !limpia.startsWith("#")) {
                        resultado.add(limpia);
                    }
                }
            }
        } catch (IOException e) {
            LOGGER.warning("Error al cargar la lista de palabras prohibidas: " + e.getMessage());
        }
        return resultado;
    }
}
