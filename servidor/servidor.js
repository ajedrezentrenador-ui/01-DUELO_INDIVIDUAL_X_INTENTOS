const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURACIÓN DEL ENTRENADOR
// ============================================
const CONFIG = {
    modoJuego: 'practica',
    fallosMaximos: 3,
    intentosPorProblema: 3,
    maxJugadores: 10
};

// ============================================
// BASE DE DATOS DE PROBLEMAS (TUS 268 PROBLEMAS)
// ============================================
const problemas = [
    {
        id: 1,
        fen: "r1b2r1k/ppp1b1pp/2n1q3/8/2B5/5N2/PP2QPPP/R4RK1 w - - 0 1",
        solucion: ["Bxe6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 02"
    },
    {
        id: 2,
        fen: "n7/2r3k1/p4p1p/1p6/4B3/1P4P1/P3R1KP/8 w - - 0 1",
        solucion: ["Bxa8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 03"
    },
    {
        id: 3,
        fen: "kn6/8/K7/8/8/8/3q3B/1Q6 w - - 0 1",
        solucion: ["Qxb8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 01"
    }
    // AQUÍ VAN TUS 265 PROBLEMAS RESTANTES
    // ... (mantén tu lista completa)
];

// ============================================
// SERVIDOR HTTP PARA ARCHIVOS ESTÁTICOS
// ============================================
const server = http.createServer((req, res) => {
    console.log(`📁 Solicitud: ${req.url}`);
    
    // Construir la ruta del archivo
    let filePath;
    if (req.url === '/') {
        filePath = path.join(__dirname, '../cliente/index.html');
    } else {
        filePath = path.join(__dirname, '../cliente', req.url);
    }
    
    // Obtener extensión
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    const mimeTypes = {
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain',
        '.html': 'text/html'
    };
    
    if (mimeTypes[extname]) {
        contentType = mimeTypes[extname];
    }
    
    // Leer el archivo
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`❌ No encontrado: ${filePath}`);
                // Intentar servir index.html para rutas SPA
                fs.readFile(path.join(__dirname, '../cliente/index.html'), (err2, content2) => {
                    if (err2) {
                        res.writeHead(404);
                        res.end('Archivo no encontrado');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content2, 'utf-8');
                    }
                });
            } else {
                console.log(`❌ Error: ${err.code}`);
                res.writeHead(500);
                res.end(`Error del servidor: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// ============================================
// SERVIDOR WEBSOCKET
// ============================================
const wss = new WebSocket.Server({ server });
let jugadores = {};

console.log("====================================");
console.log("🖥️  SERVIDOR DE DUELO DE PROBLEMAS");
console.log("========== MODO PRÁCTICA ===========");
console.log(`📚 Problemas disponibles: ${problemas.length}`);
console.log(`🎯 Fallos máximos: ${CONFIG.fallosMaximos}`);
console.log(`🎯 Intentos por problema: ${CONFIG.intentosPorProblema}`);
console.log("====================================");

// ============================================
// WEBSOCKET CONNECTION HANDLER
// ============================================
wss.on('connection', (ws) => {
    if (Object.keys(jugadores).length >= CONFIG.maxJugadores) {
        ws.send(JSON.stringify({ tipo: 'error', mensaje: 'Servidor lleno' }));
        ws.close();
        return;
    }

    const idJugador = Math.random().toString(36).substring(2, 8);
    
    jugadores[idJugador] = {
        id: idJugador,
        conexion: ws,
        nombre: '',
        puntuacion: 0,
        fallos: 0,
        aciertos: 0,
        stats: {
            primerIntento: 0,
            segundoIntento: 0,
            tercerIntento: 0,
            fallados: 0,
            total: 0,
            puntuacionTotal: 0
        },
        problemasResueltos: [],
        problemasFallados: [],
        problemaActual: null,
        indiceMovimiento: 0,
        intentosActuales: 0,
        problemasDisponibles: [],
        entrenamientoActivo: false
    };

    console.log(`🎮 Jugador ${idJugador} conectado`);
    
    ws.send(JSON.stringify({ 
        tipo: 'bienvenida', 
        id: idJugador,
        modo: CONFIG.modoJuego,
        fallosMaximos: CONFIG.fallosMaximos,
        intentosPorProblema: CONFIG.intentosPorProblema
    }));

    ws.on('message', (mensaje) => {
        try {
            const datos = JSON.parse(mensaje.toString());
            console.log(`📨 ${idJugador}: ${datos.tipo}`);
            
            switch(datos.tipo) {
                case 'registro':
                    manejarRegistro(idJugador, datos);
                    break;
                case 'iniciar_practica':
                    manejarIniciarPractica(idJugador);
                    break;
                case 'movimiento':
                    manejarMovimiento(idJugador, datos);
                    break;
                case 'finalizar':
                    finalizarPractica(idJugador);
                    break;
            }
        } catch (e) {
            console.error('Error:', e);
        }
    });

    ws.on('close', () => {
        console.log(`🚪 Jugador ${idJugador} desconectado`);
        delete jugadores[idJugador];
        enviarListaJugadores();
    });
});

// ============================================
// FUNCIONES DEL JUEGO
// ============================================

function manejarRegistro(idJugador, datos) {
    const jugador = jugadores[idJugador];
    jugador.nombre = datos.nombre;
    
    jugador.conexion.send(JSON.stringify({ 
        tipo: 'registro_ok',
        modo: CONFIG.modoJuego,
        fallosMaximos: CONFIG.fallosMaximos
    }));
    
    enviarListaJugadores();
}

function manejarIniciarPractica(idJugador) {
    const jugador = jugadores[idJugador];
    
    jugador.puntuacion = 0;
    jugador.fallos = 0;
    jugador.aciertos = 0;
    jugador.stats = {
        primerIntento: 0,
        segundoIntento: 0,
        tercerIntento: 0,
        fallados: 0,
        total: 0,
        puntuacionTotal: 0
    };
    jugador.problemasResueltos = [];
    jugador.problemasFallados = [];
    jugador.problemasDisponibles = problemas.map(p => p.id);
    jugador.entrenamientoActivo = true;
    
    console.log(`🎯 ${idJugador} inicia práctica`);
    
    jugador.conexion.send(JSON.stringify({
        tipo: 'practica_iniciada',
        fallosMaximos: CONFIG.fallosMaximos
    }));
    
    enviarSiguienteProblema(idJugador);
}

function enviarSiguienteProblema(idJugador) {
    const jugador = jugadores[idJugador];
    if (!jugador || !jugador.entrenamientoActivo) return;

    if (jugador.fallos >= CONFIG.fallosMaximos) {
        finalizarPractica(idJugador, 'limite_fallos');
        return;
    }

    if (jugador.problemasDisponibles.length === 0) {
        jugador.problemasDisponibles = problemas.map(p => p.id);
    }

    const indiceAleatorio = Math.floor(Math.random() * jugador.problemasDisponibles.length);
    const idProblema = jugador.problemasDisponibles[indiceAleatorio];
    const problemaOriginal = problemas.find(p => p.id === idProblema);
    const problema = JSON.parse(JSON.stringify(problemaOriginal));
    
    jugador.problemaActual = problema;
    jugador.indiceMovimiento = 0;
    jugador.intentosActuales = 1;

    const colorJugador = problema.fen.includes(' w ') ? 'w' : 'b';

    jugador.conexion.send(JSON.stringify({
        tipo: 'problema',
        fen: problema.fen,
        colorJugador: colorJugador,
        descripcion: problema.descripcion,
        objetivo: problema.objetivo,
        fallosActuales: jugador.fallos,
        fallosMaximos: CONFIG.fallosMaximos,
        aciertos: jugador.aciertos,
        intento: jugador.intentosActuales
    }));
    
    enviarPuntuacion(idJugador);
}

function manejarMovimiento(idJugador, datos) {
    const jugador = jugadores[idJugador];
    if (!jugador || !jugador.problemaActual || !jugador.entrenamientoActivo) return;

    const problema = jugador.problemaActual;
    const indice = jugador.indiceMovimiento;
    
    console.log(`   Movimiento: ${datos.movimiento} (esperado: ${problema.solucion[indice]})`);

    if (datos.movimiento === problema.solucion[indice]) {
        jugador.indiceMovimiento++;
        
        if (jugador.indiceMovimiento >= problema.solucion.length) {
            // Problema completado
            jugador.aciertos++;
            jugador.stats.total++;
            jugador.stats.puntuacionTotal += 10;
            
            switch(jugador.intentosActuales) {
                case 1: jugador.stats.primerIntento++; break;
                case 2: jugador.stats.segundoIntento++; break;
                case 3: jugador.stats.tercerIntento++; break;
            }
            
            jugador.problemasResueltos.push(problema.id);
            jugador.problemasDisponibles = jugador.problemasDisponibles.filter(id => id !== problema.id);
            
            jugador.conexion.send(JSON.stringify({
                tipo: 'movimiento_correcto',
                mensaje: '¡Problema completado!'
            }));
            
            setTimeout(() => enviarSiguienteProblema(idJugador), 1500);
        } else {
            jugador.conexion.send(JSON.stringify({
                tipo: 'movimiento_correcto',
                mensaje: '¡Correcto!'
            }));
        }
    } else {
        if (jugador.intentosActuales >= CONFIG.intentosPorProblema) {
            jugador.fallos++;
            jugador.stats.fallados++;
            jugador.stats.total++;
            
            jugador.problemasFallados.push(problema.id);
            jugador.problemasDisponibles = jugador.problemasDisponibles.filter(id => id !== problema.id);
            
            jugador.conexion.send(JSON.stringify({
                tipo: 'movimiento_incorrecto',
                correcto: problema.solucion[indice],
                fallosActuales: jugador.fallos,
                fallosMaximos: CONFIG.fallosMaximos,
                definitivo: true
            }));
            
            if (jugador.fallos >= CONFIG.fallosMaximos) {
                setTimeout(() => finalizarPractica(idJugador, 'limite_fallos'), 2000);
            } else {
                setTimeout(() => enviarSiguienteProblema(idJugador), 2000);
            }
        } else {
            jugador.intentosActuales++;
            
            jugador.conexion.send(JSON.stringify({
                tipo: 'movimiento_incorrecto',
                correcto: problema.solucion[indice],
                intentosRestantes: CONFIG.intentosPorProblema - jugador.intentosActuales + 1,
                definitivo: false
            }));
            
            setTimeout(() => {
                jugador.indiceMovimiento = 0;
                jugador.conexion.send(JSON.stringify({
                    tipo: 'problema',
                    fen: problema.fen,
                    colorJugador: problema.fen.includes(' w ') ? 'w' : 'b',
                    descripcion: problema.descripcion,
                    objetivo: problema.objetivo,
                    fallosActuales: jugador.fallos,
                    fallosMaximos: CONFIG.fallosMaximos,
                    aciertos: jugador.aciertos,
                    intento: jugador.intentosActuales,
                    reintento: true
                }));
            }, 1500);
        }
    }
    
    enviarPuntuacion(idJugador);
    enviarListaJugadores();
}

function finalizarPractica(idJugador, razon = 'voluntario') {
    const jugador = jugadores[idJugador];
    if (!jugador) return;
    
    jugador.entrenamientoActivo = false;
    
    const porcentajePromedio = jugador.stats.total > 0 
        ? Math.round((jugador.stats.primerIntento * 100 + jugador.stats.segundoIntento * 66 + jugador.stats.tercerIntento * 33) / jugador.stats.total) 
        : 0;
    
    jugador.conexion.send(JSON.stringify({
        tipo: 'fin_practica',
        estadisticas: {
            puntuacion: jugador.stats.puntuacionTotal,
            primerIntento: jugador.stats.primerIntento,
            segundoIntento: jugador.stats.segundoIntento,
            tercerIntento: jugador.stats.tercerIntento,
            fallados: jugador.stats.fallados,
            total: jugador.stats.total,
            porcentajePromedio: porcentajePromedio,
            razon: razon
        }
    }));
    
    enviarListaJugadores();
}

function enviarPuntuacion(idJugador) {
    const jugador = jugadores[idJugador];
    if (!jugador) return;
    
    jugador.conexion.send(JSON.stringify({
        tipo: 'puntuacion',
        puntuacion: jugador.stats.puntuacionTotal,
        fallos: jugador.fallos,
        aciertos: jugador.aciertos
    }));
}

function enviarListaJugadores() {
    const lista = Object.values(jugadores).map(j => ({
        nombre: j.nombre || 'Anónimo',
        puntuacion: j.stats?.puntuacionTotal || 0,
        activo: j.entrenamientoActivo || false
    }));
    
    const mensaje = JSON.stringify({
        tipo: 'ranking',
        jugadores: lista
    });
    
    Object.values(jugadores).forEach(j => {
        if (j.conexion.readyState === WebSocket.OPEN) {
            j.conexion.send(mensaje);
        }
    });
}

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`🌍 Accede a: https://zero1-duelo-individual-x-intentos.onrender.com`);
    console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../cliente')}`);
});
