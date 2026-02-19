# Batalla Friki

Batalla Friki es una aplicacion web multijugador que permite a los usuarios registrarse, progresar de nivel y enfrentarse en combates por turnos en tiempo real. 

El proyecto consta de una arquitectura cliente-servidor, utilizando una API REST para la gestion de datos y persistencia, y WebSockets para la sincronizacion de las batallas en vivo.

---

## Caracteristicas Principales

### 1. Sistema de Usuarios y Roles
- **Roles**: Soporte para usuarios `ADMIN` y `USER`.
- **Progresion**: Los jugadores ganan experiencia (XP) tras cada victoria (+10 XP). Al alcanzar 100 XP, el jugador sube de nivel automaticamente.
- **Estadisticas**: Registro persistente de batallas ganadas y perdidas.
- **Seguridad**: Rutas del backend protegidas mediante JWT y validacion de roles (Guards de NestJS).

### 2. Gestion de Personajes
- **Atributos**: Cada personaje cuenta con puntos de vida (HP), ataque y nivel.
- **Restriccion por nivel**: Los jugadores solo pueden seleccionar personajes cuyo `nivelMinimoObtencion` sea menor o igual al nivel actual del jugador.
- **Panel de Administracion**: El rol `ADMIN` dispone de un CRUD completo para crear, editar y eliminar tanto usuarios como personajes de la base de datos.

### 3. Sistema de Combate en Tiempo Real
- **Modos de Juego**: 
  - **Jugador vs CPU**: Combates contra enemigos aleatorios controlados por el servidor.
  - **Jugador vs Jugador (PvP)**: Sistema de emparejamiento (Matchmaking) en tiempo real.
- **Sincronizacion**: Uso de WebSockets para emitir el estado de la batalla (barras de vida, turnos y notificaciones de victoria/derrota) a todos los clientes involucrados sin necesidad de recargar la pagina.

### 4. Extras Implementados
- **Ranking Global**: Tabla de clasificacion en tiempo real que muestra el Top 5 de jugadores con mas victorias.
- **Multi-dispositivo**: Configuracion de red dinamica que permite jugar desde distintos dispositivos (ordenadores, telefonos moviles) conectados a la misma red local.

---

## Stack Tecnologico

- **Backend**: NestJS, TypeScript, Socket.io.
- **Frontend**: Vanilla JavaScript, HTML5, CSS3, Vite.
- **Base de Datos**: PostgreSQL.
- **ORM**: Prisma.
- **Infraestructura**: Docker y Docker Compose.

---

## Requisitos Previos

Para ejecutar este proyecto en tu maquina local, es necesario tener instalado:

- **Docker** y **Docker Compose**.
- (Opcional) Node.js v18+ si se desea ejecutar el entorno de desarrollo fuera de los contenedores.

---

## Instalacion y Ejecucion Paso a Paso

### Paso 1: Preparacion del entorno
Descomprime el proyecto (o clona el repositorio) y abre una terminal en la carpeta raiz del proyecto.

### Paso 2: Despliegue con Docker
El proyecto esta configurado para levantar la base de datos, el backend y el frontend simultaneamente y ejecutar los seeders iniciales (creando el usuario administrador y los personajes por defecto).

Ejecuta el siguiente comando en la terminal:

```bash
docker compose up --build -d
```

*Nota: La etiqueta `--build` asegura que las imagenes se compilen con el codigo mas reciente, y `-d` ejecuta los contenedores en segundo plano.*

### Paso 3: Acceso a la Aplicacion
Una vez que los contenedores esten funcionando, abre tu navegador web y accede a:

```text
http://localhost:5173
```

Para probar el **Panel de Administrador**, puedes utilizar las credenciales generadas por el seeder inicial (revisar el archivo de seeders en el backend para obtener el email y la contrasena por defecto).

### Paso 4: Pruebas Multi-dispositivo (Opcional)
Si deseas acceder al juego desde un telefono movil u otro ordenador en tu casa:
1. Asegurate de que el dispositivo este conectado a la misma red Wi-Fi.
2. Averigua la direccion IP local del ordenador donde se ejecuta Docker (ejemplo: `192.168.1.50`).
3. En el navegador del dispositivo movil, introduce: `http://192.168.1.50:5173`.
4. El frontend detectara automaticamente la IP y se conectara al backend correspondiente.

---

## Detencion del Proyecto

Para detener los servidores y apagar los contenedores, ejecuta el siguiente comando en la raiz del proyecto:

```bash
docker compose down
```

---

## Arquitectura de Eventos (WebSockets)

El flujo de una batalla en tiempo real sigue estos eventos principales:

- `unirse-espera`: El cliente solicita entrar a la cola de PvP.
- `estado-batalla`: El servidor emite la vida maxima, vida actual, ataque y a quien le corresponde el turno.
- `realizar-ataque`: El cliente emite la accion de ataque en su turno.
- `final-batalla`: El servidor notifica el fin del combate, declara al ganador y actualiza la experiencia y estadisticas en la base de datos PostgreSQL.