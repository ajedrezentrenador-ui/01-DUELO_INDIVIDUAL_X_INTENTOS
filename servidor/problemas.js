// ============================================
// BASE DE DATOS DE PROBLEMAS DE AJEDREZ
// VERSIÓN MANUAL (100% FUNCIONAL)
// ============================================

const problemas = [
    // Problema 1
    {
        id: 1,
        fen: "1kb3r1/ppb2pq1/2p5/P3pP2/4P3/2P1NP2/1P1B1Q2/R6K b - - 0 1",
        solucion: ["Rh8+", "Qh2", "Rxh2+", "Kxh2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 07"
    },
    // Problema 2
    {
        id: 2,
        fen: "r2r4/4qpkp/5n1p/1p2p2P/p3b3/2P2N2/PPQ1BPP1/2KR3R w - - 0 1",
        solucion: ["Bd3", "Bxd3", "Rxd3", "Rxd3", "Qxd3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 11"
    },
    // Problema 3
    {
        id: 3,
        fen: "8/6Q1/2b5/1np1p3/2p1Pk2/q4P2/P5PP/K7 w - - 0 1",
        solucion: ["Qh6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 08"
    },
    // Problema 4
    {
        id: 4,
        fen: "r1bqk2r/pp3p1p/2pb2p1/3p1pn1/3P4/3BBQ1P/PPP1NPP1/1K1R3R w kq - 0 1",
        solucion: ["Bxg5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 05"
    },
    // Problema 5
    {
        id: 5,
        fen: "5r2/1b2npkp/pN1p2p1/1p6/1PrNq3/P3Q2P/5PP1/2R2RK1 w - - 0 1",
        solucion: ["Qxe4", "Bxe4", "Nxc4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 07"
    },
    // Problema 6
    {
        id: 6,
        fen: "1k6/8/6rp/3p1p2/1R3P2/2R2KP1/7r/8 b - - 0 1",
        solucion: ["Ka7", "Ra3+", "Ra6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 10"
    }
];

// ============================================
// VARIABLES DE CONFIGURACIÓN DEL ENTRENADOR
// ============================================
const ordenProblemas = 'aleatorio';  // 'aleatorio' o 'secuencial'
const intentosPorProblema = 1;       // 1, 2 o 3
const tiempoLimite = 180;             // 3 minutos = 180 segundos
const limitePorFallosActivo = false;  // true o false
const maxFallosPermitidos = 3;        // si se activa
const maxJugadores = 10;              // máximo 10 jugadores

// ============================================
// FUNCIÓN PARA OBTENER UN PROBLEMA ALEATORIO
// ============================================
function obtenerProblemaAleatorio() {
    const indice = Math.floor(Math.random() * problemas.length);
    return { ...problemas[indice] };
}

// ============================================
// FUNCIÓN PARA OBTENER UN PROBLEMA POR SU ID
// ============================================
function obtenerProblemaPorId(id) {
    return problemas.find(p => p.id === id);
}

// ============================================
// FUNCIÓN PARA OBTENER PROBLEMAS EN ORDEN
// ============================================
let indiceSecuencial = 0;
function obtenerProblemaSecuencial() {
    if (indiceSecuencial >= problemas.length) {
        indiceSecuencial = 0;
    }
    const problema = { ...problemas[indiceSecuencial] };
    indiceSecuencial++;
    return problema;
}

// ============================================
// FUNCIÓN PRINCIPAL PARA OBTENER EL SIGUIENTE PROBLEMA
// ============================================
function obtenerSiguienteProblema() {
    if (ordenProblemas === 'aleatorio') {
        return obtenerProblemaAleatorio();
    } else {
        return obtenerProblemaSecuencial();
    }
}

// ============================================
// EXPORTAR PARA USAR EN EL SERVIDOR
// ============================================
module.exports = {
    problemas,
    obtenerSiguienteProblema,
    obtenerProblemaPorId,
    ordenProblemas,
    intentosPorProblema,
    tiempoLimite,
    limitePorFallosActivo,
    maxFallosPermitidos,
    maxJugadores
};