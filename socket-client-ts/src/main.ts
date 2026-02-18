import { io } from 'socket.io-client';

// --- 1. REFERENCIAS AL DOM (HTML) ---
// Estado y Conexión
const lblOn = document.querySelector('#lblOn') as HTMLElement;
const lblOff = document.querySelector('#lblOff') as HTMLElement;
const clientIdSpan = document.querySelector('#clientId') as HTMLElement;

// Configuración (Setup)
const divSetup = document.querySelector('#divSetup') as HTMLDivElement;
const txtUserId = document.querySelector('#txtUserId') as HTMLInputElement;
const txtHeroId = document.querySelector('#txtHeroId') as HTMLInputElement;
const btnIniciar = document.querySelector('#btnIniciar') as HTMLButtonElement;
const setupMessage = document.querySelector('#setupMessage') as HTMLSpanElement;

// Arena de Batalla
const divArena = document.querySelector('#divArena') as HTMLDivElement;
const lblPlayerName = document.querySelector('#lblPlayerName') as HTMLElement;
const lblPlayerHp = document.querySelector('#lblPlayerHp') as HTMLElement;
const lblPlayerAtk = document.querySelector('#lblPlayerAtk') as HTMLElement;

const lblRivalName = document.querySelector('#lblRivalName') as HTMLElement;
const lblRivalHp = document.querySelector('#lblRivalHp') as HTMLElement;
const lblRivalAtk = document.querySelector('#lblRivalAtk') as HTMLElement;

const btnAtacar = document.querySelector('#btnAtacar') as HTMLButtonElement;

// Logs
const ulMessages = document.querySelector('#messages') as HTMLUListElement;

// --- 2. VARIABLES GLOBALES ---
let currentUserId = 0; // Guardaremos aquí el ID del usuario para saber quién ataca

// --- 3. CONEXIÓN AL SOCKET ---
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Conectado al servidor');
  lblOn.style.display = 'inline';
  lblOff.style.display = 'none';
  clientIdSpan.textContent = socket.id || '';
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
  lblOn.style.display = 'none';
  lblOff.style.display = 'inline';
  clientIdSpan.textContent = 'Desconectado';
});

// --- 4. LÓGICA: INICIAR PARTIDA (HTTP) ---
btnIniciar.addEventListener('click', async () => {
  const userId = txtUserId.value;
  const heroId = txtHeroId.value;

  if (!userId || !heroId) {
    alert('Por favor, introduce ID de usuario y personaje.');
    return;
  }

  currentUserId = Number(userId);
  setupMessage.textContent = 'Creando partida...';
  btnIniciar.disabled = true;

  try {
    // Hacemos la petición POST al backend para crear la partida en memoria
    const resp = await fetch('http://localhost:3000/juego/iniciar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personajeJugadorId: Number(heroId),
        tipoOponente: 'CPU', // Por defecto contra la CPU
        personajeOponenteId: 2 // Por defecto el rival es ID 2 (cámbialo si quieres)
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json();
      throw new Error(errorData.message || 'Error al iniciar');
    }

    const dataPartida = await resp.json();
    
    // Si todo va bien: Ocultamos Setup, Mostramos Arena
    divSetup.style.display = 'none';
    divArena.style.display = 'block';
    
    logMessage(`🚀 Partida iniciada: ${dataPartida.nombreJugador} vs ${dataPartida.nombreRival}`);
    actualizarInterfaz(dataPartida);

  } catch (error: any) {
    setupMessage.textContent = 'Error: ' + error.message;
    setupMessage.style.color = 'red';
    btnIniciar.disabled = false;
  }
});

// --- 5. LÓGICA: ATACAR (SOCKET) ---
btnAtacar.addEventListener('click', () => {
  if (!currentUserId) return;

  // Emitimos el evento que creamos en el Gateway
  socket.emit('realizar-ataque', { usuarioId: currentUserId });
  logMessage('⚔️ Intentando atacar...');
});

// --- 6. EVENTOS DEL SOCKET (RESPUESTAS DEL SERVIDOR) ---

// A) Actualización de vida (Turno)
socket.on('estado-batalla', (data: any) => {
  logMessage(`🔄 Turno resuelto. Vida Rival: ${Math.floor(data.vidaActualRival)}`);
  actualizarInterfaz(data);
});

// B) Fin de la partida
socket.on('final-batalla', (data: any) => {
  logMessage(`🏆 FIN: Ganador ID ${data.ganador}`);
  
  if (Number(data.ganador) === currentUserId) {
    lblPlayerName.textContent += ' (GANADOR 👑)';
    alert('¡VICTORIA! Has ganado experiencia.');
    divArena.style.backgroundColor = '#e8f5e9'; // Fondo verde clarito
  } else {
    lblRivalName.textContent += ' (GANADOR 👑)';
    alert('DERROTA... Has perdido.');
    divArena.style.backgroundColor = '#ffebee'; // Fondo rojo clarito
  }

  // Deshabilitar botón para no seguir atacando
  btnAtacar.disabled = true;
  btnAtacar.textContent = 'FIN DE PARTIDA';
});

// C) Errores
socket.on('error-ataque', (data: any) => {
  logMessage(`⚠️ Error: ${data.mensaje}`);
  alert(data.mensaje);
});

// --- 7. FUNCIONES AUXILIARES ---

function actualizarInterfaz(data: any) {
  // Datos del Jugador
  lblPlayerName.textContent = data.nombreJugador;
  lblPlayerAtk.textContent = data.ataqueJugador;
  lblPlayerHp.textContent = Math.floor(data.vidaActualJugador) + ' / ' + data.vidaMaxJugador;

  // Datos del Rival
  lblRivalName.textContent = data.nombreRival;
  lblRivalAtk.textContent = data.ataqueRival;
  lblRivalHp.textContent = Math.floor(data.vidaActualRival) + ' / ' + data.vidaMaxRival;

  // Colores según vida (Visual simple)
  lblPlayerHp.style.color = data.vidaActualJugador < 30 ? 'red' : 'green';
  lblRivalHp.style.color = data.vidaActualRival < 30 ? 'red' : 'green';
}

function logMessage(msg: string) {
  const li = document.createElement('li');
  li.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  ulMessages.prepend(li); // Añadir al principio
}