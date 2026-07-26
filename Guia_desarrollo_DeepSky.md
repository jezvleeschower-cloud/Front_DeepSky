# DeepSky — Guía de arquitectura, organización y desarrollo escalonado
**Stack objetivo:** Java + Javalin + React.js + HTML + CSS  
**Propósito de este documento:** describir **cómo funciona DeepSky**, **cómo debe organizarse** y **cómo desarrollarlo paso a paso** aplicando **programación escalonada** y una forma de pensar correcta tanto de **backend** como de **frontend**.

---

# 1. Visión general del proyecto

## 1.1 ¿Qué es DeepSky?
DeepSky es una plataforma web de divulgación astronómica. Su objetivo es centralizar contenido e interacción relacionada con el espacio en una sola aplicación web. El sistema combina:

- **Contenido astronómico externo** obtenido desde APIs de la NASA.
- **Datos internos** persistidos en base de datos, como usuarios, favoritos, publicaciones, comentarios y eventos fijados.
- **Experiencias interactivas** para explorar imágenes, revisar asteroides, participar en foros, consultar la foto del día, navegar por un calendario astronómico y participar en retos de astrofotografía.

## 1.2 Módulos principales del sistema
El proyecto gira alrededor de estos módulos:

1. **Autenticación y usuarios**
   - Registro
   - Inicio de sesión
   - Roles de usuario
   - Perfil básico

2. **Buscador de imágenes y favoritos**
   - Buscar imágenes astronómicas
   - Ver detalles
   - Guardar favoritos
   - Eliminar favoritos

3. **Foro comunitario**
   - Crear temas
   - Ver temas
   - Comentar
   - Moderar o eliminar contenido según permisos

4. **Sistema de rastreo de asteroides**
   - Consultar objetos cercanos a la Tierra
   - Ver detalles
   - Mostrar estadísticas

5. **Calendario de eventos astronómicos**
   - Ver eventos
   - Navegar por fechas
   - Fijar eventos para el usuario

6. **Foto del día**
   - Mostrar la foto astronómica destacada
   - Ver explicación
   - Comentar

7. **Reto de astrofotografía**
   - Ver retos activos
   - Participar
   - Registrar participaciones

8. **Modelo / información del sistema solar**
   - Mostrar contenido informativo e interactivo del sistema solar

---

# 2. Principio central: programación escalonada

La programación escalonada significa **no intentar construir todo el sistema de una sola vez**. En lugar de eso, el proyecto se implementa por capas, por módulos y por incrementos pequeños que siempre terminan en algo **probado, funcional y entendible**.

## 2.1 Regla base
Cada módulo debe construirse siguiendo esta secuencia:

1. **Definir el objetivo del módulo**
2. **Definir entradas y salidas**
3. **Diseñar la estructura de datos**
4. **Construir primero el backend mínimo funcional**
5. **Probar el backend de forma aislada**
6. **Construir el frontend mínimo funcional**
7. **Probar el flujo completo frontend ↔ backend**
8. **Refinar validaciones, errores, estilos y seguridad**
9. **Pasar al siguiente incremento**

## 2.2 Qué se evita con esta táctica
Con programación escalonada se evita:

- Mezclar 5 módulos sin terminar ninguno
- Hacer primero toda la UI sin tener API real
- Crear lógica de negocio dentro de componentes React
- Duplicar reglas entre frontend y backend sin control
- Romper el sistema por cambios grandes sin pruebas intermedias

## 2.3 Regla de oro
**No avanzar al siguiente escalón si el escalón actual no funciona y no está probado.**

---

# 3. Cómo debe pensar un desarrollador backend en este proyecto

El backend no existe para “responder rápido con cualquier cosa”, sino para **proteger la lógica del negocio, validar los datos, controlar la seguridad y servir contratos claros al frontend**.

## 3.1 Mentalidad backend correcta
El backend debe pensar así:

### A. El backend es la fuente de verdad
- La base de datos y la lógica del negocio viven aquí.
- El frontend **no decide** si algo es válido; puede ayudar con validaciones visuales, pero la validación real está en backend.

### B. Cada endpoint debe tener una responsabilidad clara
Ejemplo:
- `POST /api/auth/login` → iniciar sesión
- `GET /api/imagenes/search` → buscar imágenes
- `POST /api/favoritos` → guardar favorito
- `DELETE /api/favoritos/{id}` → eliminar favorito

No se deben crear endpoints “todoterreno” con comportamientos ambiguos.

### C. La lógica no va en las rutas
Las rutas sólo reciben la petición y la envían al controlador o servicio.  
La lógica real va en:
- **service** para reglas de negocio
- **repository** para acceso a datos
- **client** para consumo de APIs externas

### D. Toda entrada externa es sospechosa hasta validarse
Se valida:
- campos obligatorios
- formatos
- longitudes
- permisos
- consistencia del estado
- autenticación

### E. Los errores deben ser controlados
El backend no debe lanzar errores crudos al frontend.  
Debe responder con una estructura uniforme, por ejemplo:

```json
{
  "message": "El recurso no existe",
  "code": "NOT_FOUND"
}
```

### F. La seguridad se diseña desde el principio
- Contraseñas hasheadas
- JWT o sistema de sesión
- autorización por roles
- CORS bien definido
- endpoints protegidos

---

# 4. Cómo debe pensar un desarrollador frontend en este proyecto

El frontend no es sólo “hacer pantallas bonitas”. Su responsabilidad es **traducir el estado del sistema en una interfaz clara, usable y mantenible**.

## 4.1 Mentalidad frontend correcta
### A. La UI es una representación del estado
Cada pantalla debe responder a estados claros:
- cargando
- error
- vacío
- éxito
- usuario autenticado / no autenticado

### B. Un componente no debe hacer de todo
Separar:
- componentes de presentación
- páginas
- hooks
- servicios de API
- utilidades

### C. React no reemplaza la arquitectura
No se debe meter:
- llamadas HTTP mezcladas con mucho JSX
- validación compleja dentro de componentes gigantes
- transformación de datos repetida en muchas páginas

### D. El frontend debe consumir contratos, no “adivinar”
Si el backend devuelve una estructura JSON, el frontend debe adaptarse a ese contrato y centralizarlo en su capa de servicios.

### E. El CSS debe organizarse, no improvisarse
No llenar todo de estilos inline.  
Definir una convención:
- estilos globales
- estilos por componente o página
- variables de color, espaciado y tipografía

---

# 5. Arquitectura general recomendada

DeepSky debe funcionar como una **arquitectura cliente-servidor**:

## 5.1 Flujo general
1. El usuario interactúa con React.
2. React llama al backend Java + Javalin mediante HTTP/JSON.
3. El backend:
   - valida
   - consulta base de datos
   - consume APIs externas de NASA si corresponde
   - aplica reglas de negocio
4. El backend responde JSON.
5. React actualiza el estado y renderiza la interfaz.

## 5.2 Separación de responsabilidades
- **Frontend (React + HTML + CSS)**  
  Presentación, navegación, formularios, interacción, estado visual, consumo de API.

- **Backend (Java + Javalin)**  
  Rutas, controladores, servicios, seguridad, validación, persistencia, integración con APIs externas.

- **Base de datos**  
  Persistencia de usuarios, favoritos, publicaciones, comentarios, eventos fijados, retos y demás entidades internas.

- **APIs externas**  
  Fuente de imágenes, foto del día, asteroides y otros datos astronómicos.

---

# 6. Estructura general del proyecto

Lo ideal es trabajar con **dos proyectos separados** dentro de un mismo repositorio raíz o en repositorios independientes coordinados:

```text
deepsky/
├─ deepsky-backend/
└─ deepsky-frontend/
```

---

# 7. Estructura recomendada del backend (Java + Javalin)

La estructura del backend debe ser por capas y por responsabilidad.

```text
deepsky-backend/
├─ pom.xml
├─ README.md
└─ src/
   ├─ main/
   │  ├─ java/com/deepsky/backend/
   │  │  ├─ Main.java
   │  │  ├─ config/
   │  │  ├─ router/
   │  │  ├─ controller/
   │  │  ├─ service/
   │  │  ├─ repository/
   │  │  ├─ client/
   │  │  ├─ model/
   │  │  ├─ dto/
   │  │  ├─ security/
   │  │  ├─ exception/
   │  │  ├─ util/
   │  │  └─ db/
   │  └─ resources/
   │     ├─ application.properties
   │     └─ db/migration/
   └─ test/
```

## 7.1 Qué hace cada carpeta del backend

## `config/`
Configuraciones globales del sistema:
- configuración de Javalin
- CORS
- conexión a base de datos
- lectura de properties
- inicialización general

## `router/`
Define las rutas HTTP del sistema.  
Ejemplo:
- `AuthRoutes`
- `UsuarioRoutes`
- `ImagenRoutes`
- `ForoRoutes`

Su función es **mapear endpoints** hacia controladores.

## `controller/`
Recibe la petición HTTP y construye la respuesta HTTP.  
Responsabilidades:
- leer parámetros
- leer body
- invocar servicios
- devolver JSON y códigos HTTP

No debe contener lógica pesada del negocio.

## `service/`
Es la capa más importante de negocio.  
Aquí viven:
- validaciones de reglas de negocio
- coordinación entre repositorios y APIs externas
- decisiones del dominio

Ejemplo:
- si un usuario puede fijar un evento
- si puede comentar
- cómo se transforma la respuesta de NASA al formato interno

## `repository/`
Acceso a base de datos.
Responsabilidades:
- insertar
- consultar
- actualizar
- eliminar

No debe contener reglas de negocio; sólo persistencia.

## `client/`
Clientes para servicios externos.  
Aquí irán clases como:
- cliente de NASA APOD
- cliente de NASA Image Library
- cliente de NEOs

## `model/`
Entidades del dominio o del almacenamiento:
- Usuario
- Favorito
- TemaForo
- ComentarioForo
- EventoCalendario
- RetoAstrofotografia

## `dto/`
Objetos de transferencia de datos.  
Se separan en:
- `request/` → lo que entra
- `response/` → lo que sale

Esto evita exponer directamente entidades internas.

## `security/`
Todo lo relacionado con:
- JWT
- hash de contraseñas
- middleware de autorización
- validación de token
- roles

## `exception/`
Excepciones personalizadas y manejo global de errores.

## `util/`
Utilidades compartidas:
- fechas
- constantes
- serialización
- helpers puntuales

## `db/`
Conexión y utilidades de acceso a base de datos.

## `resources/db/migration/`
Scripts SQL versionados para crear y evolucionar el esquema de la base de datos.

---

# 8. Estructura recomendada del frontend (React + HTML + CSS)

```text
deepsky-frontend/
├─ package.json
├─ public/
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ app/
   │  ├─ router/
   │  ├─ providers/
   │  └─ store/              (si en el futuro usan estado global)
   ├─ pages/
   │  ├─ Home/
   │  ├─ Login/
   │  ├─ Registro/
   │  ├─ Imagenes/
   │  ├─ Favoritos/
   │  ├─ Foro/
   │  ├─ Asteroides/
   │  ├─ Calendario/
   │  ├─ FotoDelDia/
   │  ├─ Retos/
   │  └─ SistemaSolar/
   ├─ components/
   │  ├─ common/
   │  ├─ layout/
   │  ├─ forms/
   │  └─ ui/
   ├─ features/
   │  ├─ auth/
   │  ├─ imagenes/
   │  ├─ favoritos/
   │  ├─ foro/
   │  ├─ asteroides/
   │  ├─ calendario/
   │  ├─ foto-del-dia/
   │  ├─ retos/
   │  └─ sistema-solar/
   ├─ services/
   │  ├─ apiClient.js
   │  ├─ authService.js
   │  ├─ imagenService.js
   │  └─ ...
   ├─ hooks/
   ├─ utils/
   ├─ styles/
   │  ├─ globals.css
   │  ├─ variables.css
   │  └─ reset.css
   └─ assets/
```

## 8.1 Qué hace cada carpeta del frontend

## `pages/`
Representan pantallas completas.  
Ejemplo:
- `LoginPage`
- `ForoPage`
- `AsteroidesPage`

## `components/`
Piezas reutilizables de UI:
- botones
- cards
- navbar
- modales
- inputs
- loaders

## `features/`
Agrupan lógica por módulo del negocio.  
Por ejemplo, `features/foro/` puede contener:
- componentes del foro
- hooks del foro
- adaptadores del foro
- lógica específica del módulo

## `services/`
Centraliza las llamadas HTTP al backend.
Aquí no debe haber JSX, sólo funciones como:
- `login(data)`
- `buscarImagenes(query)`
- `obtenerFotoDelDia()`

## `hooks/`
Hooks reutilizables:
- `useAuth`
- `useDebounce`
- `useFetchState`

## `styles/`
CSS global, variables de diseño y estilos compartidos.

---

# 9. Cómo se conectan backend y frontend

## 9.1 Contrato base
El frontend debe consumir endpoints del backend bajo un prefijo común, por ejemplo:

```text
/api/auth
/api/usuarios
/api/imagenes
/api/favoritos
/api/foro
/api/asteroides
/api/calendario
/api/foto-del-dia
/api/retos
/api/sistema-solar
```

## 9.2 Respuestas recomendadas
Todas las respuestas deben ser consistentes.

### Respuesta exitosa simple
```json
{
  "data": {},
  "message": "Operación exitosa"
}
```

### Respuesta de error
```json
{
  "message": "No autorizado",
  "code": "UNAUTHORIZED"
}
```

## 9.3 Convención sugerida de endpoints

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Imágenes
- `GET /api/imagenes/search?q=nebula`
- `GET /api/imagenes/{id}`

## Favoritos
- `GET /api/favoritos`
- `POST /api/favoritos`
- `DELETE /api/favoritos/{id}`

## Foro
- `GET /api/foro/temas`
- `POST /api/foro/temas`
- `GET /api/foro/temas/{id}`
- `POST /api/foro/temas/{id}/comentarios`

## Asteroides
- `GET /api/asteroides`
- `GET /api/asteroides/{id}`
- `GET /api/asteroides/estadisticas`

## Calendario
- `GET /api/calendario?month=2026-07`
- `POST /api/calendario/fijados`
- `DELETE /api/calendario/fijados/{id}`

## Foto del día
- `GET /api/foto-del-dia`
- `GET /api/foto-del-dia/{fecha}`
- `POST /api/foto-del-dia/{fecha}/comentarios`

## Retos
- `GET /api/retos`
- `POST /api/retos`
- `POST /api/retos/{id}/participaciones`

---

# 10. Flujo interno de un módulo backend

Todo módulo backend debe seguir esta secuencia:

## 10.1 Ruta
Recibe la petición y la dirige al controlador.

## 10.2 Controlador
- lee request
- parsea parámetros
- invoca servicio
- construye respuesta HTTP

## 10.3 Servicio
- valida reglas de negocio
- decide qué repositorios o clientes externos usar
- transforma resultados

## 10.4 Repository o Client
- repository: habla con la base de datos
- client: habla con APIs externas

## 10.5 DTO de salida
El servicio o controlador devuelve una estructura limpia al frontend.

---

# 11. Flujo interno de un módulo frontend

## 11.1 La página se monta
La ruta React renderiza una página.

## 11.2 La página usa hooks / servicios
Se llama a un servicio de API.

## 11.3 Se administra el estado visual
- loading
- error
- success
- empty

## 11.4 Se renderizan componentes
La página entrega datos a componentes más pequeños.

---

# 12. Orden correcto de desarrollo escalonado del proyecto

A continuación se describe el **orden recomendado** para construir DeepSky sin caos.

---

# 13. Escalón 0 — Preparación del proyecto

## Objetivo
Dejar lista la base técnica antes de implementar módulos.

## Backend
1. Crear proyecto Maven con Java.
2. Agregar dependencias:
   - Javalin
   - Jackson o Gson para JSON
   - driver de base de datos
   - librería JWT
   - librería de hashing de contraseñas
   - framework de tests
3. Crear `Main.java`.
4. Configurar Javalin.
5. Configurar CORS.
6. Configurar lectura de `application.properties`.
7. Crear conexión a base de datos.
8. Preparar migraciones SQL.
9. Crear manejador global de errores.

## Frontend
1. Crear proyecto React.
2. Instalar router.
3. Crear estructura base de carpetas.
4. Configurar estilos globales.
5. Crear layout principal.
6. Crear cliente HTTP base.
7. Configurar variables de entorno (`VITE_API_URL` o equivalente).

## Qué se prueba aquí
- backend levanta en un puerto
- frontend levanta en otro puerto
- frontend puede hacer una petición de prueba al backend
- el backend responde JSON correctamente

**No avanzar si esto no funciona.**

---

# 14. Escalón 1 — Módulo de salud del sistema

Antes de auth, imágenes o foro, se hace un módulo mínimo de prueba.

## Backend
Crear endpoint:
- `GET /api/health`

Respuesta:
```json
{
  "status": "ok"
}
```

## Frontend
Crear una pantalla simple o una prueba en consola que consuma `/api/health`.

## Objetivo de este escalón
Comprobar:
- conectividad
- serialización JSON
- CORS
- estructura base de proyecto

---

# 15. Escalón 2 — Autenticación y usuarios

Este es el primer módulo real, porque el resto depende de usuarios y permisos.

## 15.1 Qué debe incluir
- registro
- login
- hash de contraseña
- emisión de JWT
- endpoint para obtener usuario autenticado
- roles básicos

## 15.2 Orden backend
1. Crear tabla `usuarios`.
2. Crear entidad `Usuario`.
3. Crear DTOs:
   - `RegistroRequest`
   - `LoginRequest`
   - `UsuarioResponse`
4. Crear `UsuarioRepository`.
5. Crear `AuthService`.
6. Crear `AuthController`.
7. Crear `AuthRoutes`.
8. Crear `PasswordEncoder`.
9. Crear `JwtProvider`.
10. Crear middleware de autenticación.

## 15.3 Qué probar en backend
- registrar usuario válido
- rechazar correo duplicado
- login correcto
- login incorrecto
- token válido
- token inválido

## 15.4 Orden frontend
1. Crear página Login.
2. Crear página Registro.
3. Crear formulario con validación visual básica.
4. Crear `authService.js`.
5. Guardar token.
6. Crear contexto o hook de autenticación.
7. Proteger rutas privadas.

## 15.5 Qué probar frontend
- login correcto
- mensaje de error
- persistencia de sesión
- logout
- acceso a ruta protegida

**Hasta que auth esté estable, no conviene pasar a favoritos, foro o eventos fijados.**

---

# 16. Escalón 3 — Buscador de imágenes

Este módulo es ideal para empezar el contenido principal porque tiene mucho valor visible.

## 16.1 Alcance mínimo del módulo
- buscar imágenes por palabra clave
- mostrar resultados
- mostrar detalle básico de cada imagen

## 16.2 Backend
1. Crear cliente de NASA Image API.
2. Crear DTOs de respuesta externa.
3. Crear `ImagenService`.
4. Crear `ImagenController`.
5. Crear `ImagenRoutes`.
6. Transformar la respuesta de NASA a un DTO interno limpio:
   - id
   - título
   - descripción
   - url de imagen
   - fecha si existe
   - autor si existe

## 16.3 Qué probar backend
- búsqueda con término válido
- búsqueda sin resultados
- error de API externa
- respuesta con formato consistente

## 16.4 Frontend
1. Crear página de búsqueda.
2. Crear barra de búsqueda.
3. Crear listado de resultados.
4. Crear card de imagen.
5. Crear vista de detalle o modal.
6. Manejar loading, empty y error.

## 16.5 Regla importante
En este escalón **todavía no hace falta favoritos**. Primero se valida que el buscador funcione bien por sí solo.

---

# 17. Escalón 4 — Favoritos

Una vez que ya se pueden consultar imágenes, se agrega persistencia de favoritos.

## Backend
1. Crear tabla `favoritos`.
2. Crear modelo `Favorito`.
3. Crear `FavoritoRepository`.
4. Crear `FavoritoService`.
5. Crear `FavoritoController`.
6. Proteger rutas con autenticación.
7. Validar que no se duplique el mismo favorito para el mismo usuario.

## Frontend
1. Agregar botón “Guardar en favoritos” en las imágenes.
2. Crear página de favoritos.
3. Mostrar lista guardada.
4. Permitir eliminar favorito.
5. Sincronizar el estado visual con el backend.

## Qué se prueba
- guardar favorito autenticado
- impedir guardar sin login
- eliminar favorito
- ver lista del usuario actual

---

# 18. Escalón 5 — Foto del día

## Alcance mínimo
- ver foto actual
- ver explicación
- consultar fecha específica si el diseño lo requiere

## Backend
1. Crear cliente NASA APOD.
2. Crear DTO externo.
3. Crear `FotoDelDiaService`.
4. Crear `FotoDelDiaController`.
5. Crear rutas.

## Frontend
1. Crear página “Foto del día”.
2. Renderizar imagen, título, fecha, explicación.
3. Agregar estados de carga y error.

## Comentarios
Los comentarios de foto del día **pueden dejarse para un escalón posterior** si se quiere mantener el módulo pequeño al inicio.

---

# 19. Escalón 6 — Foro comunitario

Este módulo ya implica persistencia, relaciones y permisos.

## Orden backend
1. Crear tablas:
   - temas
   - comentarios
2. Crear modelos:
   - `TemaForo`
   - `ComentarioForo`
3. Crear repositories.
4. Crear services.
5. Crear controllers.
6. Definir permisos:
   - quién puede crear
   - quién puede borrar
   - quién puede editar

## Orden frontend
1. Página de listado de temas.
2. Página de detalle de tema.
3. Formulario para crear tema.
4. Formulario para comentar.
5. Render de comentarios.
6. Botones de edición / eliminación si aplica.

## Qué se prueba
- crear tema
- ver temas
- comentar
- rechazar comentarios vacíos
- permisos correctos

---

# 20. Escalón 7 — Asteroides

## Alcance mínimo
- listar asteroides cercanos
- ver detalle
- mostrar datos principales

## Backend
1. Cliente NASA NEO API.
2. DTOs externos.
3. `AsteroideService`.
4. `AsteroideController`.
5. transformación de datos:
   - nombre
   - fecha
   - velocidad
   - distancia
   - tamaño estimado
   - nivel de riesgo si aplica

## Frontend
1. Página de asteroides.
2. Tabla o cards.
3. Filtros simples si son necesarios.
4. Vista de detalle.

## Escalón adicional opcional
Después de la lista base, agregar:
- estadísticas
- gráficas
- visualización adicional

No meter estadísticas complejas antes de que la lista principal funcione.

---

# 21. Escalón 8 — Calendario astronómico

## Alcance mínimo
- ver eventos por mes
- consultar descripción del evento

## Escalón siguiente
- fijar eventos al usuario autenticado

## Backend
1. definir fuente de eventos (API, carga manual o híbrida)
2. crear `EventoCalendario`
3. crear service y controller
4. si habrá fijados, crear tabla `evento_fijado`

## Frontend
1. vista mensual
2. lista de eventos por día
3. detalle del evento
4. acción de fijar si el usuario está autenticado

---

# 22. Escalón 9 — Reto de astrofotografía

## Alcance mínimo
- listar retos
- ver reto activo
- registrar participación

Si además habrá votaciones, ese debe ser un sub-escalón posterior.

## Backend
- modelo de reto
- modelo de participación
- services
- controllers
- validaciones de fechas y participación

## Frontend
- listado de retos
- detalle del reto
- formulario de participación
- estado de participación del usuario

---

# 23. Escalón 10 — Sistema solar / módulo interactivo

Este módulo probablemente tendrá una parte visual fuerte del lado frontend.

## Recomendación
Separarlo en dos capas:

### Fase 1
Mostrar datos descriptivos del sistema solar:
- lista de planetas
- fichas informativas
- distancias, datos curiosos, etc.

### Fase 2
Agregar experiencia visual interactiva:
- modelo
- animación
- interacción

No mezclar ambas fases al mismo tiempo si el equipo es pequeño.

---

# 24. Cómo documentar cada módulo antes de programarlo

Antes de tocar código, cada módulo debe tener una ficha breve como esta:

## Plantilla de ficha de módulo
### Nombre del módulo
Ejemplo: Favoritos

### Objetivo
Permitir que un usuario autenticado guarde imágenes astronómicas de su interés.

### Entradas
- id de imagen
- datos mínimos de imagen
- token del usuario

### Salidas
- favorito guardado
- lista de favoritos
- mensaje de error

### Reglas de negocio
- un usuario no puede guardar dos veces la misma imagen
- sólo usuarios autenticados pueden guardar favoritos

### Endpoints
- `GET /api/favoritos`
- `POST /api/favoritos`
- `DELETE /api/favoritos/{id}`

### Tablas implicadas
- favoritos
- usuarios

### Pantallas implicadas
- buscador de imágenes
- pantalla de favoritos

### Casos de prueba
- guardar favorito válido
- guardar duplicado
- eliminar favorito
- intentar guardar sin login

---

# 25. Convenciones de desarrollo backend

## 25.1 Convenciones de nombres
- Clases en PascalCase: `UsuarioService`
- métodos descriptivos: `buscarPorEmail`, `guardarFavorito`
- paquetes por responsabilidad, no por caos

## 25.2 Convención de responsabilidades
- **Route**: registra endpoint
- **Controller**: HTTP in/out
- **Service**: negocio
- **Repository**: SQL y persistencia
- **Client**: API externa
- **DTO**: contrato

## 25.3 Reglas técnicas
- no acceder a base de datos desde controller
- no consumir NASA directamente desde controller
- no devolver entidades crudas si exponen datos sensibles
- no meter validaciones repetidas por todas partes; centralizarlas

---

# 26. Convenciones de desarrollo frontend

## 26.1 Convenciones de componentes
Separar entre:
- componentes de página
- componentes reutilizables
- componentes de dominio

## 26.2 Regla de tamaño
Si un componente empieza a manejar:
- demasiados estados
- demasiados formularios
- demasiadas llamadas a API

entonces debe dividirse.

## 26.3 Regla de servicios
Todas las llamadas HTTP deben salir desde `services/`.

Ejemplo:
```js
export async function login(payload) {
  return apiClient.post("/api/auth/login", payload);
}
```

No repetir `fetch` o `axios` por toda la app.

## 26.4 Regla de estilos
Separar:
- layout general
- estilos globales
- estilos por módulo o componente

---

# 27. Base de datos: criterio de diseño

La base de datos debe contener sólo la información que realmente pertenece al sistema.  
No hace falta guardar todo lo que viene de la NASA si sólo se consulta en tiempo real, salvo que exista una razón clara de negocio o rendimiento.

## 27.1 Datos que sí son internos
- usuarios
- roles
- favoritos
- temas de foro
- comentarios
- eventos fijados
- retos
- participaciones
- quizá historiales o métricas propias

## 27.2 Datos que pueden ser externos
- imagen del día
- catálogo de imágenes
- NEOs y asteroides
- otros datos astronómicos

---

# 28. Manejo de errores recomendado

## Backend
Crear excepciones propias:
- `NotFoundException`
- `ValidationException`
- `UnauthorizedException`

Y un manejador global que traduzca todo a JSON uniforme.

## Frontend
Cada pantalla debe contemplar:
- loading
- error con mensaje visible
- estado vacío
- reintento si aplica

---

# 29. Seguridad mínima obligatoria

## Backend
- hash de contraseñas
- JWT firmado
- expiración del token
- middleware para rutas privadas
- validación de rol si hay acciones restringidas
- no exponer datos sensibles del usuario

## Frontend
- no guardar contraseñas
- usar token sólo para autenticación
- limpiar sesión al cerrar
- redirigir cuando el token ya no sea válido

---

# 30. Estrategia de pruebas por escalones

Cada escalón debe cerrarse con pruebas.

## 30.1 Backend
Probar como mínimo:
- caso feliz
- caso inválido
- caso de no encontrado
- caso sin autorización si aplica

## 30.2 Frontend
Probar:
- render inicial
- carga de datos
- errores de API
- formularios
- navegación básica

## 30.3 Prueba de integración mínima
Por cada módulo, validar el flujo real:
1. frontend manda petición
2. backend responde
3. UI se actualiza correctamente

---

# 31. Plan de trabajo recomendado para el equipo

## Fase 1 — Base técnica
- estructura backend
- estructura frontend
- health check
- conexión entre proyectos

## Fase 2 — Identidad del usuario
- auth
- usuarios
- protección de rutas

## Fase 3 — Consumo de contenido principal
- buscador de imágenes
- foto del día
- asteroides

## Fase 4 — Persistencia social del usuario
- favoritos
- foro
- eventos fijados

## Fase 5 — Funcionalidades de comunidad
- retos
- comentarios
- mejoras del calendario

## Fase 6 — Experiencias enriquecidas
- sistema solar interactivo
- dashboards
- optimizaciones visuales

---

# 32. Qué no se debe hacer durante el desarrollo

## No mezclar responsabilidades
- React no debe decidir permisos del sistema
- Javalin no debe contener SQL incrustado en cualquier parte
- controllers no deben hacer todo

## No programar a ciegas
Antes de hacer una pantalla o endpoint:
- definir su contrato
- definir su DTO
- definir su objetivo

## No construir módulos gigantes de una vez
Ejemplo incorrecto:
“Haré foro + calendario + retos + notificaciones esta semana”

Ejemplo correcto:
“Esta semana cierro sólo creación y listado de temas del foro con pruebas”.

---

# 33. Resumen operativo del flujo ideal de desarrollo

Para **cada módulo** de DeepSky, el orden correcto es:

## Paso 1
Definir objetivo del módulo.

## Paso 2
Definir entidades, DTOs, reglas de negocio y endpoints.

## Paso 3
Implementar backend mínimo funcional:
- model
- repository
- service
- controller
- route

## Paso 4
Probar backend con casos básicos.

## Paso 5
Implementar frontend mínimo:
- página
- componentes
- servicio HTTP
- estados de carga/error

## Paso 6
Probar flujo completo frontend ↔ backend.

## Paso 7
Refinar:
- validaciones
- seguridad
- UX
- estilos
- mensajes de error

## Paso 8
Cerrar el módulo y pasar al siguiente.

---

# 34. Conclusión

La forma correcta de construir DeepSky no es intentar terminar todos los módulos al mismo tiempo, sino avanzar con **programación escalonada**, donde cada incremento deja una pieza real, usable y comprobable.

La combinación de **Java + Javalin en backend** y **React + HTML + CSS en frontend** funciona bien para este proyecto si se respetan estas reglas:

- arquitectura por capas
- separación clara de responsabilidades
- contratos limpios entre frontend y backend
- módulos pequeños y probados antes de crecer
- seguridad y validación desde el backend
- frontend organizado por páginas, componentes, features y servicios

Si el equipo sigue esta estructura, DeepSky será mucho más fácil de construir, mantener, depurar y ampliar.
