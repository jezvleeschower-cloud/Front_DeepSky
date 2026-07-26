# DeepSky Backend

## Variables de entorno para producción

En desarrollo, la configuración vive en `src/main/resources/application.properties`.
En producción, **cualquier clave de ese archivo puede sobreescribirse con una variable
de entorno** (tiene prioridad automática). La conversión es: mayúsculas y "." -> "_".

Ejemplo: `db.password` en el archivo → `DB_PASSWORD` como variable de entorno.

Esto ya coincide con las variables que definiste en `/etc/systemd/system/deepsky.service`:
`DB_URL`, `DB_USER`, `DB_PASSWORD`, `NASA_API_KEY`, `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `JWT_SECRET`.

### Puerto

El puerto respeta primero la variable `PORT` (la que ya usas en tu systemd, ej. `PORT=8080`).
Si no existe, cae a `SERVER_PORT` o al valor de `server.port` en `application.properties`.

### Correo (recuperación de contraseña / códigos de verificación)

Usa Gmail con una "contraseña de aplicación", igual que ya tienes configurado:

| Variable de entorno   | Ejemplo                          | Descripción                              |
|------------------------|-----------------------------------|-------------------------------------------|
| `EMAIL_USER`           | `desarrollo.deepsky@gmail.com`   | Cuenta de Gmail que envía los correos     |
| `EMAIL_APP_PASSWORD`   | `xxxxxxxxxxxxxxxx`               | Contraseña de aplicación (no la normal)   |
| `EMAIL_SMTP_HOST`      | `smtp.gmail.com` (default)       | Opcional, solo si dejas de usar Gmail     |
| `EMAIL_SMTP_PORT`      | `587` (default)                  | Opcional, solo si dejas de usar Gmail     |
| `EMAIL_FROM_NAME`      | `DeepSky` (default)              | Nombre visible del remitente              |

El envío real se activa automáticamente cuando `EMAIL_USER` y `EMAIL_APP_PASSWORD`
están presentes. Si faltan (por ejemplo en tu máquina local), el código de
verificación solo se imprime en la consola del backend y todo sigue funcionando
igual, sin necesidad de configurar nada extra para desarrollar localmente.

**Nota sobre Gmail:** la contraseña de aplicación se genera desde la configuración
de seguridad de la cuenta de Google (con verificación en 2 pasos activada); Gmail
bloquea el login SMTP directo con la contraseña normal de la cuenta.

### Seguridad

`JWT_SECRET`, `CLOUDINARY_API_SECRET`, `NASA_API_KEY` y `EMAIL_APP_PASSWORD` son
secretos reales: nunca deben escribirse en `application.properties` dentro del
repositorio ni compartirse en capturas de pantalla. Si alguno quedó expuesto
accidentalmente (por ejemplo en una captura o commit), rótalo cuanto antes.
