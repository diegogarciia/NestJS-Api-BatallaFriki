import './style.css';
import { io, Socket } from 'socket.io-client';

const currentHostname = window.location.hostname;
const API_URL = `http://${currentHostname}:3000`;
let token: string | null = localStorage.getItem('token');
let socket: Socket | null = null;
let currentUser: any = null;
let editingUserId: number | null = null;
let editingCharId: number | null = null;

const authSection = document.getElementById('auth-section')!;
const adminSection = document.getElementById('admin-section')!;
const gameSection = document.getElementById('game-section')!;
const setupPanel = document.getElementById('setup-panel')!;
const arenaPanel = document.getElementById('arena-panel')!;
const waitingMsg = document.getElementById('waiting-msg')!;
const btnAttack = document.getElementById('btnAttack') as HTMLButtonElement;
const btnStart = document.getElementById('btnStartGame') as HTMLButtonElement;

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
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error('Credenciales incorrectas');
        const data = await res.json();
        token = data.access_token; currentUser = data.user;
        localStorage.setItem('token', token!);
        authSection.classList.add('hidden');
        checkRole(currentUser);
    } catch (e: any) { (document.getElementById('loginStatus') as HTMLElement).innerText = e.message; }
});

document.querySelectorAll('.btn-logout').forEach(btn => btn.addEventListener('click', () => { localStorage.clear(); location.reload(); }));

function checkRole(user: any) {
    const roles = user.roles || (user.rol ? [user.rol] : []);
    if (roles.includes('ADMIN')) {
        adminSection.classList.remove('hidden');
        loadAdmin();
    } else {
        gameSection.classList.remove('hidden');
        document.getElementById('playerName')!.innerText = `${user.nick} | Nivel ${user.nivel} | Victorias: ${user.victorias} | Derrotas: ${user.derrotas}`;
        loadGameSetup();
        loadRanking();
        connectSocket();
    }
}

async function refreshUserProfile() {
    try {
        const res = await fetch(`${API_URL}/users/${currentUser.id}`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) {
            currentUser = await res.json();
            checkRole(currentUser); 
            loadRanking();
        }
    } catch (e) {
        console.error("Error al refrescar perfil", e);
    }
}

function connectSocket() {
    socket = io(API_URL, { extraHeaders: { authentication: token! } });

    socket.on('estado-batalla', (data: any) => {
        if (!setupPanel.classList.contains('hidden')) {
            setupPanel.classList.add('hidden');
            waitingMsg.classList.add('hidden');
            arenaPanel.classList.remove('hidden');
        }
        updateArena(data);
    });

    socket.on('final-batalla', (data: any) => {
        setTimeout(async () => {
            const soyGanador = Number(data.ganador) === Number(currentUser.id);
            alert(soyGanador ? '¡VICTORIA!' : 'DERROTA');
            await refreshUserProfile();
            arenaPanel.classList.add('hidden');
            setupPanel.classList.remove('hidden');
            btnStart.disabled = false;
        }, 500);
    });
    
    socket.on('error-ataque', (d: any) => alert(d.mensaje));
}

btnStart.addEventListener('click', async () => {
    const heroId = (document.getElementById('select-hero') as HTMLSelectElement).value;
    const mode = (document.getElementById('select-mode') as HTMLSelectElement).value;

    if (!heroId) return alert("Selecciona un personaje");

    if (mode === 'PVP') {
        waitingMsg.classList.remove('hidden');
        btnStart.disabled = true;
        socket?.emit('unirse-espera', { usuarioId: currentUser.id, personajeId: Number(heroId), nombre: currentUser.nick });
    } else {
        const randomEnemy = Math.floor(Math.random() * 3) + 1; 
        try {
            const res = await fetch(`${API_URL}/juego/iniciar`, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ personajeJugadorId: Number(heroId), tipoOponente: 'CPU', personajeOponenteId: randomEnemy })
            });
            
            if(!res.ok) throw new Error("Error iniciando partida CPU");
            const data = await res.json();
            
            setupPanel.classList.add('hidden');
            arenaPanel.classList.remove('hidden');
            data.nombreJugador = data.nombreJugador || currentUser.nick;
            data.nombreRival = data.nombreRival || "CPU Enemigo";
            
            updateArena(data);

        } catch(e: any) { alert(e.message); }
    }
});

function updateArena(data: any) {
    const p1Pct = Math.max(0, (data.vidaActualJugador / data.vidaMaxJugador) * 100);
    const p2Pct = Math.max(0, (data.vidaActualRival / data.vidaMaxRival) * 100);

    (document.getElementById('p1-bar')!).style.width = `${p1Pct}%`;
    (document.getElementById('p2-bar')!).style.width = `${p2Pct}%`;
    
    (document.getElementById('p1-val')!).innerText = Math.floor(data.vidaActualJugador).toString();
    (document.getElementById('p2-val')!).innerText = Math.floor(data.vidaActualRival).toString();
    (document.getElementById('p1-name')!).innerText = data.nombreJugador || 'TÚ';
    (document.getElementById('p2-name')!).innerText = data.nombreRival || 'RIVAL';

    const esMiTurno = !data.turnoId || Number(data.turnoId) === Number(currentUser.id);
    btnAttack.disabled = !esMiTurno;
    const ind = document.getElementById('turn-indicator')!;
    
    if (esMiTurno) {
        ind.innerText = "TU TURNO";
        ind.style.color = "#4caf50";
        btnAttack.style.backgroundColor = "#ffc107";
    } else {
        ind.innerText = "TURNO RIVAL";
        ind.style.color = "#f44336";
        btnAttack.style.backgroundColor = "#555";
    }
}

btnAttack.addEventListener('click', () => socket?.emit('realizar-ataque', { usuarioId: currentUser.id }));

async function loadAdmin() { await getUsers(); await getChars(); }

async function getUsers() {
    try {
        const res = await fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
        if(res.ok) {
            const users = await res.json();
            (document.getElementById('users-list')!).innerHTML = users.map((u:any) => `
                <li>
                    ${u.nick} 
                    <div>
                        <button onclick='window.prepareEditUser(${JSON.stringify(u)})'>Editar Usuario</button>
                        <button onclick="window.delUser(${u.id})">X</button>
                    </div>
                </li>`).join('');
        }
    } catch(e){}
}

async function getChars() {
    try {
        const res = await fetch(`${API_URL}/personajes-bd`, { headers: { Authorization: `Bearer ${token}` } });
        if(res.ok) {
            const chars = await res.json();
            (document.getElementById('chars-list')!).innerHTML = chars.map((c:any) => `
                <li>
                    ${c.nombre} 
                    <div>
                        <button onclick='window.prepareEditChar(${JSON.stringify(c)})'>Editar Personaje</button>
                        <button onclick="window.delChar(${c.id})">X</button>
                    </div>
                </li>`).join('');
        }
    } catch(e){}
}

document.getElementById('btnCreateUser')?.addEventListener('click', async () => { 
    const nickIn = document.getElementById('new-nick') as HTMLInputElement;
    const emailIn = document.getElementById('new-email') as HTMLInputElement;
    const passIn = document.getElementById('new-pass') as HTMLInputElement;
    const roleIn = document.getElementById('new-role') as HTMLSelectElement;

    if(!nickIn.value || !emailIn.value) return alert("Rellena los datos");

    const url = editingUserId ? `${API_URL}/users/${editingUserId}` : `${API_URL}/users`;
    const method = editingUserId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
        method: method,
        headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
        body:JSON.stringify({ nick: nickIn.value, email: emailIn.value, password: passIn.value || undefined, rol: roleIn.value })
    });

    if(res.ok) {
        alert(editingUserId ? "Usuario actualizado" : "Usuario creado");
        editingUserId = null;
        document.getElementById('btnCreateUser')!.innerText = "Crear Usuario";
        nickIn.value = ''; emailIn.value = ''; passIn.value = '';
        getUsers();
    }
});

document.getElementById('btnCreateChar')?.addEventListener('click', async () => { 
    const nameIn = document.getElementById('char-name') as HTMLInputElement;
    const hpIn = document.getElementById('char-hp') as HTMLInputElement;
    const atkIn = document.getElementById('char-atk') as HTMLInputElement;
    const nvlIn = document.getElementById('char-level') as HTMLInputElement;

    if(!nameIn.value) return alert("Ponle nombre al personaje");

    const url = editingCharId ? `${API_URL}/personajes-bd/${editingCharId}` : `${API_URL}/personajes-bd`;
    const method = editingCharId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
        method: method,
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({
            nombre: nameIn.value, 
            vida: parseInt(hpIn.value), 
            ataque: parseInt(atkIn.value), 
            nivel: parseInt(nvlIn.value),
            nivelMinimoObtencion: parseInt(nvlIn.value)
        })
    });

    if(res.ok) {
        alert(editingCharId ? "Personaje actualizado" : "Personaje creado");
        editingCharId = null;
        document.getElementById('btnCreateChar')!.innerText = "Crear Personaje";
        nameIn.value = ''; hpIn.value = ''; atkIn.value = ''; nvlIn.value = '1';
        getChars();
    }
});

async function loadRanking() {
    try {
        const res = await fetch(`${API_URL}/users/ranking`, { 
            headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (res.ok) {
            let ranking = await res.json();
            
            ranking = ranking.sort((a: any, b: any) => (b.victorias || 0) - (a.victorias || 0)).slice(0, 5);
            
            (document.getElementById('ranking-list')!).innerHTML = ranking.map((u: any, i: number) => `
                <li style="display: flex; justify-content: space-between; background: #222; margin-bottom: 5px; padding: 8px; border-radius: 5px;">
                    <span><strong>#${i + 1} </strong>${u.nick}</span>
                    <span style="color: gold; font-weight: bold;">${u.victorias || 0} Victorias</span>
                </li>
            `).join('');
        }
    } catch (e) {
        console.error("No se pudo cargar el ranking", e);
    }
}

async function loadGameSetup() {
    const res = await fetch(`${API_URL}/personajes-bd`, { headers: { Authorization: `Bearer ${token}` } });
    if(res.ok) {
        const chars = await res.json();
        const allowed = chars.filter((c:any) => (c.nivel||1) <= (currentUser.nivel||1));
        (document.getElementById('select-hero')!).innerHTML = allowed.map((c:any) => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
}
(window as any).delUser = async (id: number) => { if(confirm('Borrar?')) await fetch(`${API_URL}/users/${id}`, {method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); getUsers(); };
(window as any).delChar = async (id: number) => { if(confirm('Borrar?')) await fetch(`${API_URL}/personajes-bd/${id}`, {method:'DELETE',headers:{Authorization:`Bearer ${token}`}}); getChars(); };
(window as any).prepareEditUser = (user: any) => {
    editingUserId = user.id;
    (document.getElementById('new-nick') as HTMLInputElement).value = user.nick;
    (document.getElementById('new-email') as HTMLInputElement).value = user.email;
    (document.getElementById('new-role') as HTMLSelectElement).value = user.rol;
    (document.getElementById('new-pass') as HTMLInputElement).placeholder = "Nueva password (opcional)";
    document.getElementById('btnCreateUser')!.innerText = "Guardar Cambios";
};

(window as any).prepareEditChar = (char: any) => {
    editingCharId = char.id;
    (document.getElementById('char-name') as HTMLInputElement).value = char.nombre;
    (document.getElementById('char-hp') as HTMLInputElement).value = char.vida;
    (document.getElementById('char-atk') as HTMLInputElement).value = char.ataque;
    (document.getElementById('char-level') as HTMLInputElement).value = char.nivel;
    document.getElementById('btnCreateChar')!.innerText = "Guardar Cambios";
};