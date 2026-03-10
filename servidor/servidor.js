const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// ============================================
// CONFIGURACIÓN
// ============================================
const CONFIG = {
    modoJuego: 'practica',
    fallosMaximos: 3,
    intentosPorProblema: 3,
    maxJugadores: 10
};

// ============================================
// PROBLEMAS (mantén tu lista completa)
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
    // ... AQUÍ VAN TODOS TUS PROBLEMAS (268)
];

// ============================================
// SERVIDOR HTTP (para archivos estáticos)
// ============================================
const server = http.createServer((req, res) => {
    console.log(`📁 Solicitud HTTP: ${req.url}`);
    
    // Construir ruta del archivo
    let filePath;
    if (req.url === '/') {
        filePath = path.join(__dirname, '../cliente/index.html');
    } else {
        filePath = path.join(__dirname, '../cliente', req.url);
    }
    
    // Determinar Content-Type
    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };
    const contentType = mimeTypes[ext] || 'text/plain';
    
    // Leer archivo
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Archivo no encontrado');
            } else {
                res.writeHead(500);
                res.end('Error del servidor');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

// ============================================
// SERVIDOR WEBSOCKET (sobre el mismo puerto)
// ============================================
const wss = new WebSocket.Server({ server });
let jugadores = {};

console.log("====================================");
console.log("🖥️  SERVIDOR DE DUELO DE PROBLEMAS");
console.log("====================================");
console.log(`📚 Problemas: ${problemas.length}`);

// ============================================
// MANEJADORES WEBSOCKET (los mismos que tenías)
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
        problemasDisponibles: problemas.map(p => p.id),
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
                    jugadores[idJugador].nombre = datos.nombre;
                    ws.send(JSON.stringify({ tipo: 'registro_ok' }));
                    enviarListaJugadores();
                    break;
                    
                case 'iniciar_practica':
                    const j = jugadores[idJugador];
                    j.entrenamientoActivo = true;
                    j.fallos = 0;
                    j.aciertos = 0;
                    j.stats = {
                        primerIntento: 0, segundoIntento: 0, tercerIntento: 0,
                        fallados: 0, total: 0, puntuacionTotal: 0
                    };
                    ws.send(JSON.stringify({ tipo: 'practica_iniciada' }));
                    enviarSiguienteProblema(idJugador);
                    break;
                    
                case 'movimiento':
                    manejarMovimiento(idJugador, datos);
                    break;
                    
                case 'finalizar':
                    finalizarPractica(idJugador, 'voluntario');
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

function enviarSiguienteProblema(idJugador) {
    const j = jugadores[idJugador];
    if (!j || !j.entrenamientoActivo) return;

    if (j.fallos >= CONFIG.fallosMaximos) {
        finalizarPractica(idJugador, 'limite_fallos');
        return;
    }

    if (j.problemasDisponibles.length === 0) {
        j.problemasDisponibles = problemas.map(p => p.id);
    }

    const idProblema = j.problemasDisponibles[Math.floor(Math.random() * j.problemasDisponibles.length)];
    const problema = JSON.parse(JSON.stringify(problemas.find(p => p.id === idProblema)));
    
    j.problemaActual = problema;
    j.indiceMovimiento = 0;
    j.intentosActuales = 1;

    j.conexion.send(JSON.stringify({
        tipo: 'problema',
        fen: problema.fen,
        colorJugador: problema.fen.includes(' w ') ? 'w' : 'b',
        descripcion: problema.descripcion,
        objetivo: problema.objetivo,
        fallosActuales: j.fallos,
        fallosMaximos: CONFIG.fallosMaximos,
        aciertos: j.aciertos,
        intento: 1
    }));
    
    enviarPuntuacion(idJugador);
}

function manejarMovimiento(idJugador, datos) {
    const j = jugadores[idJugador];
    if (!j || !j.problemaActual) return;

    const esperado = j.problemaActual.solucion[j.indiceMovimiento];
    console.log(`   Movimiento: ${datos.movimiento} (esperado: ${esperado})`);

    if (datos.movimiento === esperado) {
        j.indiceMovimiento++;
        
        if (j.indiceMovimiento >= j.problemaActual.solucion.length) {
            j.aciertos++;
            j.stats.total++;
            j.stats.puntuacionTotal += 10;
            
            switch(j.intentosActuales) {
                case 1: j.stats.primerIntento++; break;
                case 2: j.stats.segundoIntento++; break;
                case 3: j.stats.tercerIntento++; break;
            }
            
            j.problemasResueltos.push(j.problemaActual.id);
            j.problemasDisponibles = j.problemasDisponibles.filter(id => id !== j.problemaActual.id);
            
            j.conexion.send(JSON.stringify({ tipo: 'movimiento_correcto', mensaje: '¡Problema completado!' }));
            setTimeout(() => enviarSiguienteProblema(idJugador), 1500);
        } else {
            j.conexion.send(JSON.stringify({ tipo: 'movimiento_correcto', mensaje: '¡Correcto!' }));
        }
    } else {
        if (j.intentosActuales >= CONFIG.intentosPorProblema) {
            j.fallos++;
            j.stats.fallados++;
            j.stats.total++;
            j.problemasFallados.push(j.problemaActual.id);
            j.problemasDisponibles = j.problemasDisponibles.filter(id => id !== j.problemaActual.id);
            
            j.conexion.send(JSON.stringify({
                tipo: 'movimiento_incorrecto',
                correcto: esperado,
                fallosActuales: j.fallos,
                fallosMaximos: CONFIG.fallosMaximos,
                definitivo: true
            }));
            
            setTimeout(() => {
                if (j.fallos >= CONFIG.fallosMaximos) {
                    finalizarPractica(idJugador, 'limite_fallos');
                } else {
                    enviarSiguienteProblema(idJugador);
                }
            }, 2000);
        } else {
            j.intentosActuales++;
            j.conexion.send(JSON.stringify({
                tipo: 'movimiento_incorrecto',
                correcto: esperado,
                intentosRestantes: CONFIG.intentosPorProblema - j.intentosActuales + 1,
                definitivo: false
            }));
            
            setTimeout(() => {
                j.indiceMovimiento = 0;
                j.conexion.send(JSON.stringify({
                    tipo: 'problema',
                    fen: j.problemaActual.fen,
                    colorJugador: j.problemaActual.fen.includes(' w ') ? 'w' : 'b',
                    descripcion: j.problemaActual.descripcion,
                    objetivo: j.problemaActual.objetivo,
                    fallosActuales: j.fallos,
                    fallosMaximos: CONFIG.fallosMaximos,
                    aciertos: j.aciertos,
                    intento: j.intentosActuales,
                    reintento: true
                }));
            }, 1500);
        }
    }
    enviarPuntuacion(idJugador);
    enviarListaJugadores();
}

function finalizarPractica(idJugador, razon) {
    const j = jugadores[idJugador];
    if (!j) return;
    
    j.entrenamientoActivo = false;
    
    const porcentaje = j.stats.total > 0 
        ? Math.round((j.stats.primerIntento * 100 + j.stats.segundoIntento * 66 + j.stats.tercerIntento * 33) / j.stats.total) 
        : 0;
    
    j.conexion.send(JSON.stringify({
        tipo: 'fin_practica',
        estadisticas: {
            puntuacion: j.stats.puntuacionTotal,
            primerIntento: j.stats.primerIntento,
            segundoIntento: j.stats.segundoIntento,
            tercerIntento: j.stats.tercerIntento,
            fallados: j.stats.fallados,
            total: j.stats.total,
            porcentajePromedio: porcentaje,
            razon: razon
        }
    }));
    
    enviarListaJugadores();
}

function enviarPuntuacion(idJugador) {
    const j = jugadores[idJugador];
    if (!j) return;
    
    j.conexion.send(JSON.stringify({
        tipo: 'puntuacion',
        puntuacion: j.stats.puntuacionTotal,
        fallos: j.fallos,
        aciertos: j.aciertos
    }));
}

function enviarListaJugadores() {
    const lista = Object.values(jugadores).map(j => ({
        nombre: j.nombre || 'Anónimo',
        puntuacion: j.stats?.puntuacionTotal || 0,
        activo: j.entrenamientoActivo || false
    }));
    
    const mensaje = JSON.stringify({ tipo: 'ranking', jugadores: lista });
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
server.listen(PORT, () => {
    console.log(`✅ Servidor HTTP y WebSocket en puerto ${PORT}`);
    console.log(`🌐 Abre http://localhost:${PORT} en tu navegador`);
});