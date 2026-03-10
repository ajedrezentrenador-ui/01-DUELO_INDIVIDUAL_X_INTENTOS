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
// BASE DE DATOS DE PROBLEMAS
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
    },
    {
        id: 4,
        fen: "r4r2/pp2npkp/4p1p1/1N1pNb2/2qP4/8/PPP2PPP/R2Q1RK1 w - - 0 1",
        solucion: ["Nxc4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 05"
    },
    {
        id: 5,
        fen: "8/8/8/8/2nb2B1/3k4/3B4/4K3 w - - 0 1",
        solucion: ["Bf5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 06"
    },
    {
        id: 6,
        fen: "r2q1rk1/2p1bppp/p3p3/1pPp4/1n1PnB2/P3PN2/1P2BPPP/R2QK2R b KQ - 0 1",
        solucion: ["Nc6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 08"
    },
    {
        id: 7,
        fen: "3rr3/2p1k2p/ppb2R2/2p1P2p/8/8/PPP4P/2K3R1 w - - 0 1",
        solucion: ["Rg7#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 09"
    },
    {
        id: 8,
        fen: "8/8/6k1/6P1/1p6/8/pK6/8 b - - 0 1",
        solucion: ["b3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 10"
    },
    {
        id: 9,
        fen: "1R4k1/4rpp1/5n1p/8/8/pN6/P1B2PPb/5K2 b - - 0 1",
        solucion: ["Bxb8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 11"
    },
    {
        id: 10,
        fen: "rn1q1k2/p1ppp1br/5nQ1/1B4B1/3Pb2P/2P1N3/PP3P2/R3K1R1 w Q - 0 1",
        solucion: ["Nf5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix A vs 12"
    }
    // AQUÍ VAN TUS 265 PROBLEMAS RESTANTES
    // ... (mantén tu lista completa)
];

// ============================================
// SERVIDOR HTTP PARA ARCHIVOS ESTÁTICOS
// ============================================
const server = http.createServer((req, res) => {
    console.log(`📁 Solicitud: ${req.url}`);
    
    // Construir ruta del archivo
    let filePath;
    if (req.url === '/') {
        filePath = path.join(__dirname, '../cliente/index.html');
    } else {
        filePath = path.join(__dirname, '../cliente', req.url);
    }
    
    // Determinar Content-Type
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain'
    };
    
    if (mimeTypes[ext]) {
        contentType = mimeTypes[ext];
    }
    
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
// SERVIDOR WEBSOCKET
// ============================================
const wss = new WebSocket.Server({ server });
let jugadores = {};

console.log("====================================");
console.log("🖥️  SERVIDOR DE DUELO DE PROBLEMAS");
console.log("====================================");
console.log(`📚 Problemas: ${problemas.length}`);
console.log(`🎯 Fallos máximos: ${CONFIG.fallosMaximos}`);
console.log(`🎯 Intentos por problema: ${CONFIG.intentosPorProblema}`);
console.log("====================================");

// ============================================
// MANEJADORES WEBSOCKET
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
                        primerIntento: 0,
                        segundoIntento: 0,
                        tercerIntento: 0,
                        fallados: 0,
                        total: 0,
                        puntuacionTotal: 0
                    };
                    j.problemasDisponibles = problemas.map(p => p.id);
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
    const jugador = jugadores[idJugador];
    if (!jugador || !jugador.entrenamientoActivo) return;

    // Verificar si llegó al límite de fallos
    if (jugador.fallos >= CONFIG.fallosMaximos) {
        finalizarPractica(idJugador, 'limite_fallos');
        return;
    }

    // Verificar si quedan problemas disponibles
    if (jugador.problemasDisponibles.length === 0) {
        console.log(`🏁 Jugador ${idJugador} completó TODOS los problemas`);
        finalizarPractica(idJugador, 'completados');
        return;
    }

    // Seleccionar problema aleatorio de los disponibles
    const indiceAleatorio = Math.floor(Math.random() * jugador.problemasDisponibles.length);
    const idProblema = jugador.problemasDisponibles[indiceAleatorio];
    const problemaOriginal = problemas.find(p => p.id === idProblema);
    
    if (!problemaOriginal) {
        console.error(`❌ Problema ${idProblema} no encontrado`);
        return;
    }
    
    const problema = JSON.parse(JSON.stringify(problemaOriginal));
    
    jugador.problemaActual = problema;
    jugador.indiceMovimiento = 0;
    jugador.intentosActuales = 1;

    console.log(`📤 Enviando problema ${problema.id} a ${idJugador}`);
    console.log(`   Problemas restantes: ${jugador.problemasDisponibles.length}`);
    console.log(`   Fallos: ${jugador.fallos}/${CONFIG.fallosMaximos}`);

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
        intento: 1
    }));
    
    enviarPuntuacion(idJugador);
}

function manejarMovimiento(idJugador, datos) {
    const jugador = jugadores[idJugador];
    if (!jugador || !jugador.problemaActual) return;

    const problema = jugador.problemaActual;
    const indice = jugador.indiceMovimiento;
    const movimientoEsperado = problema.solucion[indice];
    
    console.log(`   Movimiento: ${datos.movimiento} (esperado: ${movimientoEsperado})`);

    if (datos.movimiento === movimientoEsperado) {
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
                correcto: movimientoEsperado,
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
                correcto: movimientoEsperado,
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

function finalizarPractica(idJugador, razon) {
    const jugador = jugadores[idJugador];
    if (!jugador) return;
    
    jugador.entrenamientoActivo = false;
    
    let mensajeRazon = '';
    if (razon === 'limite_fallos') {
        mensajeRazon = '❌ Llegaste al límite de fallos';
    } else if (razon === 'completados') {
        mensajeRazon = '🏁 ¡Completaste TODOS los problemas!';
    } else {
        mensajeRazon = '🏁 Práctica finalizada';
    }
    
    const porcentajePromedio = jugador.stats.total > 0 
        ? Math.round((jugador.stats.primerIntento * 100 + jugador.stats.segundoIntento * 66 + jugador.stats.tercerIntento * 33) / jugador.stats.total) 
        : 0;
    
    console.log(`🏁 Práctica finalizada para ${idJugador}: ${mensajeRazon}`);
    
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
            razon: razon,
            mensaje: mensajeRazon
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
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor HTTP y WebSocket en puerto ${PORT}`);
    console.log(`🌐 Abre http://localhost:${PORT} en tu navegador`);
    console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../cliente')}`);
});