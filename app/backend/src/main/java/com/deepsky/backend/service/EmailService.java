package com.deepsky.backend.service;

import java.util.Properties;

import com.deepsky.backend.config.AppConfig;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

/**
 * Servicio de envío real de correos vía SMTP (Jakarta Mail), pensado para Gmail
 * con una "contraseña de aplicación" (mismo esquema que ya usa el despliegue en EC2).
 *
 * Variables de entorno que lee (definidas en el .service de systemd):
 *  - EMAIL_USER          -> el correo de Gmail que envía (ej. desarrollo.deepsky@gmail.com)
 *  - EMAIL_APP_PASSWORD  -> la contraseña de aplicación generada en la cuenta de Google
 *
 * El envío real se activa automáticamente cuando ambas variables están presentes;
 * si faltan (por ejemplo en desarrollo local), el código solo se imprime en consola,
 * así el login/registro/recuperación siguen funcionando sin configurar nada.
 *
 * Opcionalmente, si en algún momento dejas de usar Gmail, puedes sobreescribir:
 *  - EMAIL_SMTP_HOST (por defecto smtp.gmail.com)
 *  - EMAIL_SMTP_PORT (por defecto 587)
 */
public class EmailService {

    private final boolean habilitado;
    private final String host;
    private final String puerto;
    private final String usuario;
    private final String appPassword;
    private final String nombreRemitente;

    public EmailService() {
        this.usuario = AppConfig.get("email.user");
        this.appPassword = AppConfig.get("email.app.password");
        this.host = AppConfig.get("email.smtp.host", "smtp.gmail.com");
        this.puerto = AppConfig.get("email.smtp.port", "587");
        this.nombreRemitente = AppConfig.get("email.from.name", "DeepSky");

        this.habilitado = usuario != null && !usuario.isBlank()
                && appPassword != null && !appPassword.isBlank();
    }

    public boolean isHabilitado() {
        return habilitado;
    }

    /** Envía un correo con un código de verificación de 6 dígitos (registro, login o recuperación). */
    public void enviarCodigoVerificacion(String destinatario, String codigo, String motivo) {
        String asunto = "Tu código de verificación de DeepSky";
        String cuerpoHtml = construirCuerpoCodigo(codigo, motivo);
        enviar(destinatario, asunto, cuerpoHtml);
    }

    /** Envía un correo recordatorio de que un evento fijado por el usuario ocurre mañana. */
    public void enviarRecordatorioEventoManana(String destinatario, String tituloEvento, String horaEvento) {
        String asunto = "Recordatorio: " + tituloEvento + " es mañana";
        String cuerpoHtml = construirCuerpoRecordatorio(tituloEvento, horaEvento);
        enviar(destinatario, asunto, cuerpoHtml);
    }

    private String construirCuerpoRecordatorio(String tituloEvento, String horaEvento) {
        String horaHtml = (horaEvento != null && !horaEvento.isBlank())
                ? "<p style=\"color:#333;font-size:14px;\">Hora: " + horaEvento + "</p>"
                : "";
        return "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;\">"
                + "<h2 style=\"color:#4f46e5;margin-bottom:4px;\">DeepSky</h2>"
                + "<p style=\"color:#333;font-size:16px;\">El evento fijado <strong>" + tituloEvento + "</strong> es mañana.</p>"
                + horaHtml
                + "<p style=\"color:#777;font-size:12px;\">Recibes este correo porque fijaste este evento como favorito en DeepSky.</p>"
                + "</div>";
    }

    private String construirCuerpoCodigo(String codigo, String motivo) {
        return "<div style=\"font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;\">"
                + "<h2 style=\"color:#4f46e5;margin-bottom:4px;\">DeepSky</h2>"
                + "<p style=\"color:#333;font-size:14px;\">" + motivo + "</p>"
                + "<p style=\"font-size:30px;font-weight:bold;letter-spacing:8px;color:#111;margin:20px 0;\">" + codigo + "</p>"
                + "<p style=\"color:#777;font-size:12px;\">Este código expira en unos minutos. Si tú no solicitaste esta acción, puedes ignorar este correo.</p>"
                + "</div>";
    }

    private void enviar(String destinatario, String asunto, String cuerpoHtml) {
        if (!habilitado) {
            System.out.println("==================================================");
            System.out.println("✉️  [EMAIL] Envío real deshabilitado (faltan EMAIL_USER / EMAIL_APP_PASSWORD).");
            System.out.println("Para: " + destinatario + " | Asunto: " + asunto);
            System.out.println("==================================================");
            return;
        }

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.port", puerto);

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(usuario, appPassword);
            }
        });

        try {
            MimeMessage mensaje = new MimeMessage(session);
            mensaje.setFrom(new InternetAddress(usuario, nombreRemitente));
            mensaje.setRecipients(Message.RecipientType.TO, InternetAddress.parse(destinatario));
            mensaje.setSubject(asunto, "UTF-8");
            mensaje.setContent(cuerpoHtml, "text/html; charset=UTF-8");

            Transport.send(mensaje);
            System.out.println("✅ [EMAIL] Correo enviado correctamente a " + destinatario);
        } catch (Exception e) {
            // No se propaga la excepción: un fallo de correo no debe tumbar el login/registro.
            System.err.println("❌ [EMAIL] No fue posible enviar el correo a " + destinatario + ": " + e.getMessage());
        }
    }
}
