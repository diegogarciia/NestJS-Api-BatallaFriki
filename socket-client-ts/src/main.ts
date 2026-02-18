import './style.css';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:3000';
let token: string | null = localStorage.getItem('token');
let socket: Socket | null = null;
let currentUser: any = null;

const authSection = document.getElementById('auth-section') as HTMLDivElement;
const adminSection = document.getElementById('admin-section') as HTMLDivElement;
const gameSection = document.getElementById('game-section') as HTMLDivElement;
const setupPanel = document.getElementById('setup-panel') as HTMLDivElement;
const arenaPanel = document.getElementById('arena-panel') as HTMLDivElement;

if (token) {
    authSection.classList.add('hidden');
    localStorage.removeItem('token'); 
    authSection.classList.remove('hidden');
}

document.getElementById('btnLogin')?.addEventListener('click', async () => {
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) throw new Error('Credenciales incorrectas');

        const data = await res.json();
        token = data.access_token;
        localStorage.setItem('token', token!);
        currentUser = data.user;

        authSection.classList.add('hidden');
        checkRole(currentUser);

    } catch (e: any) {
        (document.getElementById('loginStatus') as HTMLElement).innerText = e.message;
    }
});

function checkRole(user: any) {
    const roles = user.roles || (user.rol ? [user.rol] : []);
    const isAdmin = Array.isArray(roles) ? roles.includes('ADMIN') : roles === 'ADMIN';

    if (isAdmin) {
        adminSection.classList.remove('hidden');
        loadAdmin();
    } else {
        gameSection.classList.remove('hidden');
        (document.getElementById('playerName') as HTMLElement).innerText = `${user.nick} (Nivel ${user.nivel || 1})`;
        loadGameSetup();
        connectSocket();
    }
}

document.querySelectorAll('.btn-logout').forEach(btn => {
    btn.addEventListener('click', () => {
        localStorage.clear();
        location.reload();
    });
});

async function loadAdmin() {
    await getUsers();
    await getChars();
}

async function getUsers() {
    try {
        const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
        if(res.ok) {
            const users = await res.json();
            const list = document.getElementById('users-list') as HTMLUListElement;
            list.innerHTML = users.map((u: any) => {
                const userRole = u.roles || u.rol || 'USER';
                return `
                <li>
                    <span>${u.nick} [${userRole}] - Nvl: ${u.nivel}</span>
                    <button class="btn-delete" onclick="window.delUser(${u.id})">X</button>
                </li>
            `}).join('');
        }
    } catch(e) { console.error(e); }
}

async function getChars() {
    try {
        const res = await fetch(`${API_URL}/personajes-bd`, { headers: { Authorization: `Bearer ${token}` } });
        if(res.ok) {
            const chars = await res.json();
            const list = document.getElementById('chars-list') as HTMLUListElement;
            list.innerHTML = chars.map((c: any) => `
                <li>
                    <span>${c.nombre} (Nvl:${c.nivel || c.nivelRequerido || 1})</span>
                    <button class="btn-delete" onclick="window.delChar(${c.id})">X</button>
                </li>
            `).join('');
        }
    } catch(e) { console.error(e); }
}

document.getElementById('btnCreateUser')?.addEventListener('click', async () => {
    const nick = (document.getElementById('new-nick') as HTMLInputElement).value;
    const email = (document.getElementById('new-email') as HTMLInputElement).value;
    const password = (document.getElementById('new-pass') as HTMLInputElement).value;
    const role = (document.getElementById('new-role') as HTMLSelectElement)?.value || 'USER';

    const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nick, email, password, rol: role })
    });
    
    if(!res.ok) {
        const err = await res.json();
        alert('Error: ' + JSON.stringify(err.message));
    } else {
        (document.getElementById('new-nick') as HTMLInputElement).value = '';
        (document.getElementById('new-email') as HTMLInputElement).value = '';
        (document.getElementById('new-pass') as HTMLInputElement).value = '';
        getUsers();
    }
});

document.getElementById('btnCreateChar')?.addEventListener('click', async () => {
    const nombre = (document.getElementById('char-name') as HTMLInputElement).value;
    const vida = (document.getElementById('char-hp') as HTMLInputElement).value;
    const ataque = (document.getElementById('char-atk') as HTMLInputElement).value;
    const nivel = (document.getElementById('char-level') as HTMLInputElement)?.value || 1;

    const res = await fetch(`${API_URL}/personajes-bd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            nombre, 
            vida: Number(vida), 
            ataque: Number(ataque),
            nivel: Number(nivel)
        })
    });

    if(!res.ok) {
        const err = await res.json();
        alert('Error: ' + JSON.stringify(err.message));
    } else {
        (document.getElementById('char-name') as HTMLInputElement).value = '';
        (document.getElementById('char-hp') as HTMLInputElement).value = '';
        (document.getElementById('char-atk') as HTMLInputElement).value = '';
        getChars();
    }
});

(window as any).delUser = async (id: number) => {
    if(!confirm('¿Borrar usuario?')) return;
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    getUsers();
};

(window as any).delChar = async (id: number) => {
    if(!confirm('¿Borrar personaje?')) return;
    await fetch(`${API_URL}/personajes-bd/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    getChars();
};

async function loadGameSetup() {
    const res = await fetch(`${API_URL}/personajes-bd`, { headers: { Authorization: `Bearer ${token}` } });
    
    if (!res.ok) {
        (document.getElementById('gameError') as HTMLElement).innerText = "Error (403): Acceso denegado.";
        return;
    }

    const chars = await res.json();
    const select = document.getElementById('select-hero') as HTMLSelectElement;
    const btnStart = document.getElementById('btnStartGame') as HTMLButtonElement;
    
    if (Array.isArray(chars)) {
        const userLevel = currentUser.nivel || 1;

        const playableChars = chars.filter((c: any) => {
            const charLevel = c.nivel || c.nivelRequerido || 1;
            return userLevel >= charLevel;
        });

        if (playableChars.length === 0) {
            select.innerHTML = `<option value="">-- No tienes nivel suficiente para ningún personaje --</option>`;
            btnStart.disabled = true;
        } else {
            btnStart.disabled = false;
            select.innerHTML = playableChars.map((c: any) => 
                `<option value="${c.id}">${c.nombre} (Nvl: ${c.nivel || c.nivelRequerido || 1})</option>`
            ).join('');
        }
    }
}

function connectSocket() {
    socket = io(API_URL);
    socket.on('estado-batalla', (data: any) => updateArena(data));
    socket.on('final-batalla', (data: any) => endGame(data));
    socket.on('error-ataque', (data: any) => alert(data.mensaje));
}

document.getElementById('btnStartGame')?.addEventListener('click', async () => {
    const heroId = (document.getElementById('select-hero') as HTMLSelectElement).value;
    if(!heroId) return alert("Selecciona personaje válido");

    try {
        const res = await fetch(`${API_URL}/juego/iniciar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                personajeJugadorId: Number(heroId),
                tipoOponente: 'CPU',
                personajeOponenteId: 2
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }

        const data = await res.json();
        setupPanel.classList.add('hidden');
        arenaPanel.classList.remove('hidden');
        
        (document.getElementById('p1-name') as HTMLElement).innerText = data.nombreJugador;
        (document.getElementById('p2-name') as HTMLElement).innerText = data.nombreRival;
        updateArena(data);

    } catch (e: any) {
        (document.getElementById('gameError') as HTMLElement).innerText = e.message;
    }
});

document.getElementById('btnAttack')?.addEventListener('click', () => {
    if (socket && currentUser) {
        socket.emit('realizar-ataque', { usuarioId: currentUser.id });
    }
});

document.getElementById('btnRestart')?.addEventListener('click', () => {
    arenaPanel.classList.add('hidden');
    setupPanel.classList.remove('hidden');
    (document.getElementById('btnAttack') as HTMLElement).classList.remove('hidden');
    (document.getElementById('btnRestart') as HTMLElement).classList.add('hidden');
    (document.getElementById('battle-logs') as HTMLUListElement).innerHTML = '';
});

function updateArena(data: any) {
    updateBar('p1-bar', data.vidaActualJugador, data.vidaMaxJugador);
    updateBar('p2-bar', data.vidaActualRival, data.vidaMaxRival);
    
    (document.getElementById('p1-val') as HTMLElement).innerText = Math.floor(data.vidaActualJugador).toString();
    (document.getElementById('p1-atk') as HTMLElement).innerText = data.ataqueJugador;
    
    (document.getElementById('p2-val') as HTMLElement).innerText = Math.floor(data.vidaActualRival).toString();
    (document.getElementById('p2-atk') as HTMLElement).innerText = data.ataqueRival;

    log(`Turno: Rival HP ${Math.floor(data.vidaActualRival)}`);
}

function updateBar(id: string, current: number, max: number) {
    const pct = Math.max(0, (current / max) * 100);
    (document.getElementById(id) as HTMLElement).style.width = `${pct}%`;
}

function endGame(data: any) {
    const btnAttack = document.getElementById('btnAttack') as HTMLElement;
    const btnRestart = document.getElementById('btnRestart') as HTMLElement;
    btnAttack.classList.add('hidden');
    btnRestart.classList.remove('hidden');
    
    if (Number(data.ganador) === currentUser.id) {
        log('VICTORIA');
        alert('¡VICTORIA! Ganaste experiencia.');
    } else {
        log('DERROTA');
        alert('DERROTA... Inténtalo de nuevo.');
    }
}

function log(msg: string) {
    const ul = document.getElementById('battle-logs') as HTMLUListElement;
    ul.innerHTML = `<li>${msg}</li>` + ul.innerHTML;
}