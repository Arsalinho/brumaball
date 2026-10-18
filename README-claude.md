# BrumaBall

Fútbol con coches en 3D (Three.js) con multijugador por código de sala.
Servidor sin dependencias: solo Node.js.

## Archivos
| Archivo | Qué es |
|---|---|
| `index.html` | Página del juego y menú |
| `style.css` | Estilos |
| `game.js` | Todo el juego (física, bots, cámaras, multijugador) |
| `server.js` | Sirve el juego y reparte los mensajes entre jugadores de una sala |
| `package.json` | Para que Render ejecute `npm start` |

## Probar en tu ordenador / por WiFi
```
npm start
```
Abre `http://localhost:3000`. Tus amigos en la misma WiFi abren la dirección `http://TU-IP:3000` que sale en la consola.

## Subir a GitHub
1. En github.com: **New repository** (nombre `brumaball`, público o privado).
2. **uploading an existing file** → arrastra los 5 archivos (`index.html`, `style.css`, `game.js`, `server.js`, `package.json`) y `README.md` → **Commit changes**.

## Desplegar en Render
1. En render.com: **New → Web Service** → conecta tu cuenta de GitHub y elige el repositorio.
2. Runtime: **Node**. Build Command: `npm install`. Start Command: `npm start`. Plan: **Free**.
3. **Create Web Service**. Cuando termine, Render te da una dirección `https://brumaball-xxxx.onrender.com`.
4. Todos abren esa dirección → **Multijugador** → uno pulsa *Crear sala* y comparte el código; los demás *Unirse*.

Notas del plan gratis de Render: el servicio se duerme tras ~15 min sin visitas y tarda ~30–60 s en despertar; si se reinicia, las salas abiertas se pierden (se crean otras con otro código).

## Controles
W/S acelerar y frenar (en el aire, inclinar) · A/D girar · Espacio saltar (2 veces) · Shift turbo · Ctrl/B derrapar · C cámara del balón · T recuperar coche · P reiniciar partido · Esc pausa · H ocultar ayuda
