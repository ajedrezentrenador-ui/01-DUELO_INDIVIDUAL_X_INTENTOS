const WebSocket = require('ws');

// ============================================
// CONFIGURACIÓN DEL ENTRENADOR (MODIFICABLE)
// ============================================
const CONFIG = {
    modoJuego: 'practica',
    fallosMaximos: 3,
    intentosPorProblema: 3,  // <-- AHORA 3 INTENTOS MÁXIMO POR PROBLEMA
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
    },
    {
        id: 11,
        fen: "2KB1k2/8/6P1/8/8/8/8/8 w - - 0 1",
        solucion: ["Bf6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 01"
    },
    {
        id: 12,
        fen: "1r4k1/p1p2pp1/3n4/2N2Pp1/4b1P1/PnB3KP/1P6/4RB2 w - - 0 1",
        solucion: ["Nxe4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 03"
    },
    {
        id: 13,
        fen: "2r2k1r/1b2qp2/p1n1p2p/2ppP3/R5p1/5N2/1PPQBPPP/4R1K1 w - - 0 1",
        solucion: ["Rxg4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 04"
    },
    {
        id: 14,
        fen: "2q5/5R2/3p2pk/3Pp3/4Pb2/8/5Q2/5K2 w - - 0 1",
        solucion: ["Qh4#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 05"
    },
    {
        id: 15,
        fen: "8/1r4kp/n7/4p1n1/1p2N1P1/1P6/P3RBK1/8 w - - 0 1",
        solucion: ["Nxg5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 06"
    },
    {
        id: 16,
        fen: "7k/6p1/p3p1P1/1p2Q3/2pP1R2/2P3qp/PP2R1b1/5K2 w - - 0 1",
        solucion: ["Rxg2", "Qxg2+"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 07"
    },
    {
        id: 17,
        fen: "8/5p2/4p3/1p2P3/n1p1KPk1/P7/2n1N3/1N6 b - - 0 1",
        solucion: ["Nc5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 08"
    },
    {
        id: 18,
        fen: "rnbqk2r/2p2ppp/p2p1n2/1pb1pP2/2B1P3/2NP1N2/PPP3PP/R1BQK2R b KQkq - 0 1",
        solucion: ["bxc4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 09"
    },
    {
        id: 19,
        fen: "5bk1/5p1p/p7/5p2/2N5/1Pr5/P1NK2PP/8 b - - 0 1",
        solucion: ["Bg7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 10"
    },
    {
        id: 20,
        fen: "4r3/1R3pkp/6p1/1P6/6Pb/5P2/5KB1/8 w - - 0 1",
        solucion: ["Kg1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 11"
    },
    {
        id: 21,
        fen: "8/5p1p/6kp/4Q3/5P1P/1q6/8/7K w - - 0 1",
        solucion: ["h5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix B vs 12"
    },
    {
        id: 22,
        fen: "3r1n1k/3P3p/pp2Bq2/2p1p3/P1P5/3r2R1/1P5P/6K1 w - - 0 1",
        solucion: ["Rg8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix C vs 01"
    },
    {
        id: 23,
        fen: "2r1k2r/pp3ppp/2p1p3/2Pp4/3P4/1P2P3/Pn1N1PPP/1R2K2R b Kk - 0 1",
        solucion: ["Nd3+"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix C vs 02"
    },
    {
        id: 24,
        fen: "8/8/8/3Pk3/8/7p/1K6/3B4 w - - 0 1",
        solucion: ["Bf3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix C vs 03"
    },
    {
        id: 25,
        fen: "7k/6rp/8/8/2Q1N1pK/1B6/5P2/6q1 b - - 0 1",
        solucion: ["Qh2#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix C vs 06"
    },
    {
        id: 26,
        fen: "7k/3nNp1p/8/6Q1/4q3/8/6PK/8 w - - 0 1",
        solucion: ["Qg8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix C vs 08"
    },
    {
        id: 27,
        fen: "3q1rk1/1pbn1pbp/r4np1/p3p3/4P1b1/P1N1BN2/1PPQBPPP/1R3RK1 w - - 0 1",
        solucion: ["Bxa6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix C vs 09"
    },
    {
        id: 28,
        fen: "5q1k/6p1/1Q6/6p1/8/1P1B3P/1KP5/6r1 w - - 0 1",
        solucion: ["Qxg1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix C vs 11"
    },
    {
        id: 29,
        fen: "r3r1k1/1p5p/pN4q1/8/1P6/8/P4B1P/2Q2RK1 w - - 0 1",
        solucion: ["Kh1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix C vs 12"
    },
    {
        id: 30,
        fen: "5r1k/1p5p/2p3p1/6P1/7P/1Pn1N3/PK1R4/8 w - - 0 1",
        solucion: ["Kxc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 01"
    },
    {
        id: 31,
        fen: "1k6/4b3/2P5/8/6B1/p6K/3r4/2R5 w - - 0 1",
        solucion: ["c7+"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 02"
    },
    {
        id: 32,
        fen: "2kr4/p2n4/p1pB4/8/2B5/1P3P2/5K2/8 w - - 0 1",
        solucion: ["Bxa6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 03"
    },
    {
        id: 33,
        fen: "8/1kp5/R1b5/K1P5/P7/8/8/8 w - - 0 1",
        solucion: ["Rxc6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 04"
    },
    {
        id: 34,
        fen: "1r1qr1k1/2pbppbp/3p1np1/3Pn2P/1p1NP1P1/2N1BP2/PP1QB3/2KR3R b - - 0 1",
        solucion: ["bxc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 05"
    },
    {
        id: 35,
        fen: "5k2/8/6KP/8/8/8/8/8 b - - 0 1",
        solucion: ["Kg8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 06"
    },
    {
        id: 36,
        fen: "r5k1/pp3ppp/2np1q2/1Bb1p3/4P1QN/3P2P1/PPP2P1P/R4K2 b - - 0 1",
        solucion: ["Qxf2#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 07"
    },
    {
        id: 37,
        fen: "R7/5bk1/3p2p1/3P3n/2PQpP1K/5q1P/8/8 b - - 0 1",
        solucion: ["Nf6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 08"
    },
    {
        id: 38,
        fen: "r1bq1rk1/1pp1ppbp/2n3p1/1Q6/p2P4/2N1BNP1/Pn2PPBP/R4RK1 b - - 0 1",
        solucion: ["a3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 10"
    },
    {
        id: 39,
        fen: "r2q1rk1/pp3p2/3p3Q/3ppB2/4P3/3PP3/PPP5/2K4R w - - 0 1",
        solucion: ["Qh8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 11"
    },
    {
        id: 40,
        fen: "1q3rk1/3b2bp/1n1p1pp1/1p6/p2Q4/P1N1B1PP/1P3PB1/R5K1 w - - 0 1",
        solucion: ["Qxb6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix D vs 12"
    },
    {
        id: 41,
        fen: "5r2/p7/2nk4/1p1p2p1/4p3/2P1KP2/PP1RNP2/3R4 b - - 0 1",
        solucion: ["Rxf3#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 01"
    },
    {
        id: 42,
        fen: "5r1k/p5p1/1pRn3q/4Qp1p/7P/1B4P1/PP6/K7 w - - 0 1",
        solucion: ["Qxd6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 02"
    },
    {
        id: 43,
        fen: "7k/1p6/8/pK6/8/8/8/8 b - - 0 1",
        solucion: ["b6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 03"
    },
    {
        id: 44,
        fen: "2r2r2/3b3k/p4pRp/q2p1p2/8/2N5/P1PQ2PP/7K w - - 0 1",
        solucion: ["Qxh6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 04"
    },
    {
        id: 45,
        fen: "r3kbnr/p1q4p/1pn1pP2/3p4/2pP4/2P2pB1/PPQ1NPPP/R3R1K1 w kq - 0 1",
        solucion: ["Bxc7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 05"
    },
    {
        id: 46,
        fen: "r4rk1/npq3pp/2p1p1n1/5b2/2PP1p2/2NQ1N2/P2RBPPP/5RK1 w - - 0 1",
        solucion: ["Ne4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 06"
    },
    {
        id: 47,
        fen: "Q7/1R6/8/N1p5/3bk3/1P6/8/1K4r1 w - - 0 1",
        solucion: ["Kc2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 07"
    },
    {
        id: 48,
        fen: "r4rk1/pp1nppbp/2p2np1/7q/3P3N/7Q/PPPBBPPP/R3K3 b Q - 0 1",
        solucion: ["Qd5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 10"
    },
    {
        id: 49,
        fen: "3b4/6k1/p3p1pp/1pr5/3P2P1/1P2N2P/3K2B1/8 w - - 0 1",
        solucion: ["dxc5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 11"
    },
    {
        id: 50,
        fen: "8/8/8/8/6k1/3P4/K7/2q2q2 b - - 0 1",
        solucion: ["Qf7#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix E vs 12"
    },
    {
        id: 51,
        fen: "2r5/p4r2/1p2n1p1/2ppBk2/1R5P/2P2pP1/P1K2P2/4R3 w - - 0 1",
        solucion: ["g4#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix F vs 04"
    },
    {
        id: 52,
        fen: "8/1p6/p5K1/P6p/7k/P7/8/8 b - - 0 1",
        solucion: ["Kg4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix F vs 05"
    },
    {
        id: 53,
        fen: "2kr3r/1ppr1pp1/p3pn2/2b4q/2N1P2p/1NP1BP2/P3Q1PP/R2R2K1 w - - 0 1",
        solucion: ["Nxc5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix F vs 06"
    },
    {
        id: 54,
        fen: "r1bq1rk1/1pp2ppp/p1np4/2bnp1B1/2B1P3/3P1N2/PPP2PPP/R2Q1RK1 w - - 0 1",
        solucion: ["Bxd8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix F vs 07"
    },
    {
        id: 55,
        fen: "8/2p2Q1p/3qB1b1/3P4/6Pk/8/6K1/8 w - - 0 1",
        solucion: ["Qf6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix F vs 08"
    },
    {
        id: 56,
        fen: "2R5/p3k1pp/4p3/4p3/2n5/P1n1P3/1r3PPP/3K2NR w - - 0 1",
        solucion: ["Kc1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix F vs 09"
    },
    {
        id: 57,
        fen: "5rk1/1p2pp1p/3p2p1/1B6/nP2P3/p1r2P2/P1R3PP/R5K1 w - - 0 1",
        solucion: ["Bxa4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix F vs 10"
    },
    {
        id: 58,
        fen: "Q1b1kb1r/1pp2ppp/1nn3q1/1p6/4p3/P3B1P1/1P2NP1P/RN2K2R w KQk - 0 1",
        solucion: ["Bxb6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix F vs 11"
    },
    {
        id: 59,
        fen: "3Q4/1p1b1k2/3p2p1/1N1Pp3/P2qP2P/1P6/3pB3/5K2 b - - 0 1",
        solucion: ["Bh3#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix F vs 12"
    },
    {
        id: 60,
        fen: "1r2rk2/2p4p/p1Pp2pq/8/2B1P1P1/Pp3P2/1Q6/1K1R4 w - - 0 1",
        solucion: ["Qf6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 01"
    },
    {
        id: 61,
        fen: "r4rk1/1pbn1p1p/p1bqpbp1/8/2NPP3/2P1B1P1/P4PBP/R2QR1K1 b - - 0 1",
        solucion: ["Qe7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 02"
    },
    {
        id: 62,
        fen: "2q1r1k1/2r2ppp/1p2p3/3nP1b1/2BP4/1Q4P1/PB3P1P/3R1RK1 b - - 0 1",
        solucion: ["Rxc4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 04"
    },
    {
        id: 63,
        fen: "5Q2/3B3p/2Pq2p1/4b3/6Pk/8/6K1/8 w - - 0 1",
        solucion: ["Qh6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 05"
    },
    {
        id: 64,
        fen: "5rk1/4q2p/3p2p1/1p6/3nP3/3BQ3/P5P1/2R3K1 w - - 0 1",
        solucion: ["Qxd4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 06"
    },
    {
        id: 65,
        fen: "8/2Pk4/1K6/8/8/6p1/8/8 b - - 0 1",
        solucion: ["Kc8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 07"
    },
    {
        id: 66,
        fen: "r1b2rk1/pp2ppbp/6p1/8/1n1PP3/q3BN1P/P1R1BPP1/3Q1RK1 b - - 0 1",
        solucion: ["Nxc2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 09"
    },
    {
        id: 67,
        fen: "r1qr2k1/p2bbppn/1p4p1/n1p1p3/4P3/2P1BPPN/PP3QBP/R2R1NK1 w - - 0 1",
        solucion: ["g4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 10"
    },
    {
        id: 68,
        fen: "3R4/5p2/2p1b1p1/6r1/2r1PkP1/p5R1/P1PKN3/8 b - - 0 1",
        solucion: ["Ke5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 11"
    },
    {
        id: 69,
        fen: "8/8/8/8/7Q/8/1b1pk1K1/3q4 w - - 0 1",
        solucion: ["Qe4#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix G vs 12"
    },
    {
        id: 70,
        fen: "1r6/pp5P/5p1k/2p5/3pP3/3P4/PPP5/2K3R1 w - - 0 1",
        solucion: ["Rg8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 01"
    },
    {
        id: 71,
        fen: "r1r3k1/1p1bppbp/p2p1np1/3N4/Pqn1P3/1N3P2/1PP1BBPP/1R1Q1RK1 b - - 0 1",
        solucion: ["Nxd5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 02"
    },
    {
        id: 72,
        fen: "8/K1Pk4/8/8/8/8/7p/8 w - - 0 1",
        solucion: ["Kb8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 04"
    },
    {
        id: 73,
        fen: "8/p3p1k1/5pb1/3r4/8/1P3NKP/6P1/4R3 w - - 0 1",
        solucion: ["Rxe7+"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 05"
    },
    {
        id: 74,
        fen: "8/8/8/8/8/Bq2Q3/2k1K3/8 w - - 0 1",
        solucion: ["Qc1#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 06"
    },
    {
        id: 75,
        fen: "2b4k/1p1q2bp/p2p2p1/3Pp3/4P3/P1QBBr2/1P1K1P2/2R5 b - - 0 1",
        solucion: ["Rf8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 07"
    },
    {
        id: 76,
        fen: "r3k2r/ppp1qppp/1bn1b3/3np1N1/8/2NP2P1/PP2PPBP/R1BQ1RK1 w kq - 0 1",
        solucion: ["Nxd5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 08"
    },
    {
        id: 77,
        fen: "8/5N2/4K1kp/2q5/5P1Q/1pb3P1/8/8 w - - 0 1",
        solucion: ["Qxh6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 09"
    },
    {
        id: 78,
        fen: "r6k/3b1Np1/1p2p2B/2bp4/1p6/1P6/1PP5/2K3R1 b - - 0 1",
        solucion: ["Kg8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 10"
    },
    {
        id: 79,
        fen: "r4rk1/1bp3pp/1p3p2/np1q1p2/1B1P4/2PB1P2/P2Q2PP/R3R1K1 w - - 0 1",
        solucion: ["Bxf8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 11"
    },
    {
        id: 80,
        fen: "4n1k1/4r3/3p3P/p2PNQp1/8/Pp6/6q1/1KB1R3 b - - 0 1",
        solucion: ["Qa2#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix H vs 12"
    },
    {
        id: 81,
        fen: "2r1kb1r/1p2nppp/pq2p3/1N1p4/Q1P1P3/8/PP3PPP/R1B2RK1 b k - 0 1",
        solucion: ["axb5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 01"
    },
    {
        id: 82,
        fen: "5rk1/2qb2bp/p2p2p1/2rPp3/1p2P3/2N1N2P/PP2Q1P1/K2R3R w - - 0 1",
        solucion: ["Nb1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 02"
    },
    {
        id: 83,
        fen: "4R3/2p2rkp/1p1p2p1/3Pn1PP/1PP5/6K1/4B3/8 w - - 0 1",
        solucion: ["h6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 03"
    },
    {
        id: 84,
        fen: "6k1/1R3p2/1p6/4p1p1/P2b2Pp/5PqP/P3Q1K1/4R3 w - - 0 1",
        solucion: ["Kh1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 04"
    },
    {
        id: 85,
        fen: "8/8/8/3kP1p1/3p2P1/3K4/8/8 w - - 0 1",
        solucion: ["e6", "Kxe6", "Kxd4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 06"
    },
    {
        id: 86,
        fen: "8/4B3/7k/3b1Bn1/3n2PK/8/8/8 w - - 0 1",
        solucion: ["Bf8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 07"
    },
    {
        id: 87,
        fen: "8/1Q6/5pk1/pp2q1p1/8/1P3nP1/P1P5/1KB5 w - - 0 1",
        solucion: ["Qxf3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 08"
    },
    {
        id: 88,
        fen: "r4rk1/p3ppbp/b1n3p1/q1P1P3/5P2/1BQ5/P3N1PP/R1BR2K1 b - - 0 1",
        solucion: ["Bxe2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 09"
    },
    {
        id: 89,
        fen: "r1bq1rk1/p2nbpp1/1p2p2p/2p5/3P3B/3BPN2/PP2QPPP/R4RK1 b - - 0 1",
        solucion: ["Bxh4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 10"
    },
    {
        id: 90,
        fen: "6R1/7r/7k/5Pp1/6K1/8/8/8 w - - 0 1",
        solucion: ["Rg6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 11"
    },
    {
        id: 91,
        fen: "r3r1k1/pp1n1pp1/2b2n1p/8/5NqP/2N1P1P1/PPQ1BP1R/K1R5 b - - 0 1",
        solucion: ["Bf3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix I vs 12"
    },
    {
        id: 92,
        fen: "r7/8/6p1/p3p3/k1ppB2q/P7/1PP3P1/6K1 w - - 0 1",
        solucion: ["Bc6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 01"
    },
    {
        id: 93,
        fen: "5r1k/r5Rp/2n1b3/2qpPp2/5P2/1pNB3Q/1P5P/2K3R1 b - - 0 1",
        solucion: ["Rxg7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 02"
    },
    {
        id: 94,
        fen: "6kr/7p/6PK/8/8/8/8/8 w - - 0 1",
        solucion: ["g7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 03"
    },
    {
        id: 95,
        fen: "r1b2r2/p1p3kp/1p4p1/2qpPp2/5P2/1QPn1RPN/PP1N3P/R6K b - - 0 1",
        solucion: ["Ba6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 04"
    },
    {
        id: 96,
        fen: "r4rk1/p4pbp/2Q1p1pn/2n5/4qP1P/2N3PB/PP3P2/R1B3K1 w - - 0 1",
        solucion: ["Nxe4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 05"
    },
    {
        id: 97,
        fen: "1r6/7p/2bp2n1/4pQPk/1P2P3/1q4P1/5NK1/8 w - - 0 1",
        solucion: ["Qg4#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 06"
    },
    {
        id: 98,
        fen: "8/1Q5n/3pk3/ppq1pp2/8/P4P2/1PP5/1KB5 w - - 0 1",
        solucion: ["Qxh7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 07"
    },
    {
        id: 99,
        fen: "r3kb1r/1ppq2p1/p4pnp/2p1p2Q/2N1P1b1/1P1P4/PBPN1PPP/R4RK1 w kq - 0 1",
        solucion: ["Qxg6+"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 08"
    },
    {
        id: 100,
        fen: "7k/1R6/1b4p1/3B2Np/8/7P/4p1PK/2r5 w - - 0 1",
        solucion: ["Rh7#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 09"
    },
    {
        id: 101,
        fen: "r4k2/6pQ/p2p2PB/1p1NP3/3qP1b1/P7/1PPK4/R6B w - - 0 1",
        solucion: ["Ke1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 10"
    },
    {
        id: 102,
        fen: "3rr1k1/1rq2ppp/p2Npb2/1p6/8/3B4/PPP1QPPP/1K1RR3 w - - 0 1",
        solucion: ["Nxe8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix J vs 11"
    },
    {
        id: 103,
        fen: "2kr3r/ppq2pp1/2p5/3p4/3P1P1p/P3P3/1P1QN1Pb/1KR4R b - - 0 1",
        solucion: ["Bg3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 01"
    },
    {
        id: 104,
        fen: "7k/R2Q3p/8/8/1P6/K1n5/8/1q6 b - - 0 1",
        solucion: ["Qa2#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 02"
    },
    {
        id: 105,
        fen: "6rk/p7/1p6/5p2/4B1n1/P4p1P/1P3P1P/2R4K w - - 0 1",
        solucion: ["hxg4", "fxe4", "h3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 03"
    },
    {
        id: 106,
        fen: "4r3/p7/1b4kp/6p1/PPN3P1/1K5P/5R2/8 b - - 0 1",
        solucion: ["Bxf2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 04"
    },
    {
        id: 107,
        fen: "2b2brr/1p1q4/p2p4/4p1kB/3nP3/1Q5R/1P3RP1/6K1 w - - 0 1",
        solucion: ["Qe3#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 07"
    },
    {
        id: 108,
        fen: "r4bkr/pb1R4/2p1p2p/1p2n1pQ/2p1N1q1/5NP1/PP3PP1/5RK1 b - - 0 1",
        solucion: ["Qxe4", "Nxe5", "Rh7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 08"
    },
    {
        id: 109,
        fen: "6k1/2pr1pbp/2N3p1/4n3/3BP3/5P2/2R2KPP/8 w - - 0 1",
        solucion: ["Bxe5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 09"
    },
    {
        id: 110,
        fen: "rn3rk1/p1q1ppbp/1p4p1/2pB4/3PP3/2P5/P2B1PPP/R2Q1RK1 b - - 0 1",
        solucion: ["Nc6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 10"
    },
    {
        id: 111,
        fen: "4r1k1/ppp3pb/7p/6P1/3P1Q2/P1B5/P1q2P2/K5RR b - - 0 1",
        solucion: ["Qxc3#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 11"
    },
    {
        id: 112,
        fen: "8/p1p5/PP4k1/8/7K/1P6/8/8 b - - 0 1",
        solucion: ["cxb6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix K vs 12"
    },
    {
        id: 113,
        fen: "8/4R3/1p3pk1/pb6/8/1PBr4/P4KP1/8 b - - 0 1",
        solucion: ["Rxc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 01"
    },
    {
        id: 114,
        fen: "8/6n1/p4kPQ/3P1p2/2q1pP2/P7/4NK2/8 w - - 0 1",
        solucion: ["Qg5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 02"
    },
    {
        id: 115,
        fen: "3r4/1p1r1pk1/1q2n1p1/4N2p/7P/1P1P1BP1/2P2PK1/R2Q4 w - - 0 1",
        solucion: ["Nxd7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 03"
    },
    {
        id: 116,
        fen: "1r1q2rk/pppb1pbp/3p2pn/3Pp3/4P3/2P2NNP/PP1B1PP1/R1Q1R1K1 b - - 0 1",
        solucion: ["Qf8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 05"
    },
    {
        id: 117,
        fen: "r3k2r/pp1nnppp/q1p1p3/2b1P1B1/3pN3/P4N2/1PQ2PPP/R4RK1 w kq - 0 1",
        solucion: ["Nxc5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 06"
    },
    {
        id: 118,
        fen: "3K4/1p1P2k1/p5p1/4q1P1/7p/1B1Q4/PP3rP1/8 b - - 0 1",
        solucion: ["Rf8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 07"
    },
    {
        id: 119,
        fen: "rnb1k2r/ppp2pp1/3p1qnp/2b1p1B1/2B1P3/2NP1N1P/PPPQ1PP1/R3K2R b KQkq - 0 1",
        solucion: ["hxg5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 08"
    },
    {
        id: 120,
        fen: "1k6/1p5q/pQ4r1/6p1/8/8/1K3B2/8 w - - 0 1",
        solucion: ["Qd8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 09"
    },
    {
        id: 121,
        fen: "4r1k1/5ppp/8/2q1R3/2pp4/8/1PQ2PPP/R5K1 b - - 0 1",
        solucion: ["Qxe5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 10"
    },
    {
        id: 122,
        fen: "1R6/5pk1/1p2p3/3n4/1P2r1p1/Pn4P1/2NK2NP/8 w - - 0 1",
        solucion: ["Kd3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 11"
    },
    {
        id: 123,
        fen: "k7/1P6/2K5/8/8/8/8/8 b - - 0 1",
        solucion: ["Kb8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix L vs 12"
    },
    {
        id: 124,
        fen: "8/8/p2b1p1Q/2pPp3/2P5/P5k1/8/1q1B3K w - - 0 1",
        solucion: ["Qh2#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 01"
    },
    {
        id: 125,
        fen: "8/1b2r1kp/p2p1qp1/8/2pP1B2/2P2QP1/5K1P/1R6 w - - 0 1",
        solucion: ["Rxb7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 02"
    },
    {
        id: 126,
        fen: "r5k1/pp1bpp1p/6p1/2p5/2nbN1PP/1N3P2/P1P5/1KQR3R w - - 0 1",
        solucion: ["Nxd4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 03"
    },
    {
        id: 127,
        fen: "r2r2k1/pb3pp1/nq5p/3pN3/2p5/2QBP3/PP3PPP/2RR2K1 b - - 0 1",
        solucion: ["cxd3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 04"
    },
    {
        id: 128,
        fen: "8/2p3p1/P1k5/3P4/8/8/6K1/8 b - - 0 1",
        solucion: ["Kb6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 05"
    },
    {
        id: 129,
        fen: "3K2k1/6pN/3p3q/8/2bPB3/6P1/8/5R2 w - - 0 1",
        solucion: ["Rf8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 06"
    },
    {
        id: 130,
        fen: "6k1/1p5p/p5b1/P3q3/1P6/2N5/K1P2Q2/8 b - - 0 1",
        solucion: ["Qxc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 07"
    },
    {
        id: 131,
        fen: "3Q4/p7/1p1p2pk/3P1p2/3Bn3/8/3q2P1/6K1 w - - 0 1",
        solucion: ["Qh4#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 08"
    },
    {
        id: 132,
        fen: "r2q1bk1/pp3p2/2p1b1pp/2Q5/2BP4/1P2PN2/P4PPP/5RK1 w - - 0 1",
        solucion: ["Qe5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 09"
    },
    {
        id: 133,
        fen: "r1b1r3/1p1n1pkp/p1p3p1/8/4N3/5N1P/PP2BPP1/2RqR1K1 w - - 0 1",
        solucion: ["Bxd1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 11"
    },
    {
        id: 134,
        fen: "rnbqkb1r/p4ppp/4pn2/1p6/2pP4/2N1PQ2/1P3PPP/R1B1KBNR b KQkq - 0 1",
        solucion: ["Nd5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix M vs 12"
    },
    {
        id: 135,
        fen: "r1b2rk1/bpp2pp1/2np3p/4p1q1/2B1P1n1/2NP1N2/PPPQ1PPP/R4RK1 w - - 0 1",
        solucion: ["Nxg5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 01"
    },
    {
        id: 136,
        fen: "6q1/8/1p3Q1b/1Pk1p2P/2PpPp2/3P4/4K3/8 w - - 0 1",
        solucion: ["Qe7#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 03"
    },
    {
        id: 137,
        fen: "r7/6p1/2p1bpk1/ppNp4/5P1P/P1P3P1/1P3K2/3R4 w - - 0 1",
        solucion: ["Nxe6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 04"
    },
    {
        id: 138,
        fen: "r1bq2kr/pp2n1pp/2p5/b2p2N1/3P4/BQP5/P4PPP/R3R1K1 w - - 0 1",
        solucion: ["Rxe7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 05"
    },
    {
        id: 139,
        fen: "r3k2r/pppnbppp/1qb1pn2/8/N1B5/1P3P2/P1PBN1PP/R2Q1R1K b kq - 0 1",
        solucion: ["Bxa4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 06"
    },
    {
        id: 140,
        fen: "1k1Rr3/ppb2qpp/8/5p2/8/PP4P1/2Q2B1P/2R3K1 b - - 0 1",
        solucion: ["Rxd8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 07"
    },
    {
        id: 141,
        fen: "2b2rnk/5rRp/p4P2/1p1Pp2R/1P3p2/2N2P2/P7/4K3 w - - 0 1",
        solucion: ["Rhxh7#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 08"
    },
    {
        id: 142,
        fen: "r2q1r1k/1bpp1ppp/pbn5/1p1BP3/1P1Pn3/P4N2/5PPP/RNBQ1RK1 b - - 0 1",
        solucion: ["f5", "exf6", "Nxf6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 09"
    },
    {
        id: 143,
        fen: "7k/2pq3p/1r1b1np1/3Pp3/Qn2B3/3N1P2/6PP/R5K1 w - - 0 1",
        solucion: ["Nxb4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 10"
    },
    {
        id: 144,
        fen: "7k/p1pR3p/5bp1/8/2P2PK1/4r3/P5BP/7R b - - 0 1",
        solucion: ["h5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 11"
    },
    {
        id: 145,
        fen: "8/8/pk2BR2/4pP2/1nPrK1p1/1P6/7P/8 w - - 0 1",
        solucion: ["Ke3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix N vs 12"
    },
    {
        id: 146,
        fen: "1rrb1nk1/7q/b2p1p1Q/p2Pp3/6R1/1P2N1PP/2P2PB1/R5K1 b - - 0 1",
        solucion: ["Kf7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 01"
    },
    {
        id: 147,
        fen: "2rrb1k1/1p3pqp/p3pp2/8/3n2Q1/P1N5/BP3PPP/3RR1K1 w - - 0 1",
        solucion: ["Rxd4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 03"
    },
    {
        id: 148,
        fen: "8/pk3np1/b1p1p2p/7P/1r5B/1P3P1N/PK4P1/2R5 b - - 0 1",
        solucion: ["Rxh4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 04"
    },
    {
        id: 149,
        fen: "1rb2k2/5p2/p2p1Q2/2qP3p/4P3/P1p5/2B5/2KN2R1 w - - 0 1",
        solucion: ["Qd8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 06"
    },
    {
        id: 150,
        fen: "1kb3r1/ppb2pq1/2p5/P3pP2/4P3/2P1NP2/1P1B1Q2/R6K b - - 0 1",
        solucion: ["Rh8+", "Qh2", "Rxh2+", "Kxh2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 07"
    },
    {
        id: 151,
        fen: "1r4k1/p2nppbp/2p3p1/2P5/2pP1B2/4PN2/P4PPP/2R3K1 w - - 0 1",
        solucion: ["Bxb8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 08"
    },
    {
        id: 152,
        fen: "r1r3k1/1p1nbpp1/1q2pn1p/1P1p4/3P2P1/PQ2PN1P/1BbN1P2/R3RBK1 w - - 0 1",
        solucion: ["Qa2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 09"
    },
    {
        id: 153,
        fen: "5k2/4R2Q/2np2p1/3q1pPn/3b4/7P/r5P1/4R2K w - - 0 1",
        solucion: ["Re8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 10"
    },
    {
        id: 154,
        fen: "r2r4/4qpkp/5n1p/1p2p2P/p3b3/2P2N2/PPQ1BPP1/2KR3R w - - 0 1",
        solucion: ["Bd3", "Bxd3", "Rxd3", "Rxd3", "Qxd3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 11"
    },
    {
        id: 155,
        fen: "r1q1k2r/pb2bpp1/Bpnpp2p/2p5/P2P2PP/2P1PN2/1P1NQP2/R3K2R b KQkq - 0 1",
        solucion: ["Bxa6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix O vs 12"
    },
    {
        id: 156,
        fen: "2b3k1/p5bB/1q1P4/1p6/2p1n2Q/8/PP2rPP1/1K6 b - - 0 1",
        solucion: ["Kh8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 01"
    },
    {
        id: 157,
        fen: "8/2pb3k/1b4p1/3P4/6q1/1P6/1BPN2QP/5K2 b - - 0 1",
        solucion: ["Qd1#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 02"
    },
    {
        id: 158,
        fen: "1r6/3n1pk1/2bp2pp/p3p3/1p2P1N1/1P3P1P/P5P1/2R1BK2 w - - 0 1",
        solucion: ["Rxc6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 04"
    },
    {
        id: 159,
        fen: "r1b1r2k/ppp1qQ1p/1n1b1ppB/8/2BP4/5N2/PPP3PP/R5K1 w - - 0 1",
        solucion: ["Bg7#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 05"
    },
    {
        id: 160,
        fen: "3rrnk1/ppq2pbp/2p1b1p1/4p1B1/2B1P1P1/2N2P2/PPP1Q1PR/2KR4 w - - 0 1",
        solucion: ["Bxd8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 06"
    },
    {
        id: 161,
        fen: "r4rk1/ppp1b1pp/2qp2b1/4p2n/2P5/2NP1NPP/PP1QBP2/R3K2R b KQ - 0 1",
        solucion: ["Rxf3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 07"
    },
    {
        id: 162,
        fen: "5k2/pb1r2p1/1p5p/6q1/4Q3/1P6/6PP/4R1K1 w - - 0 1",
        solucion: ["Qe8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 09"
    },
    {
        id: 163,
        fen: "1r6/2pk2p1/p4p2/r1b4p/P4PP1/7P/R1KB4/5R2 b - - 0 1",
        solucion: ["Bb4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 10"
    },
    {
        id: 164,
        fen: "6bk/2R4p/p5p1/1p6/1Pr2P2/6P1/3B1K2/8 w - - 0 1",
        solucion: ["Bc3+", "Rxc3", "Rxc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 11"
    },
    {
        id: 165,
        fen: "1r4k1/p1p2ppp/1pn2b2/8/1P4P1/P1PN1B1P/2K1R3/8 b - - 0 1",
        solucion: ["Ne7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix P vs 12"
    },
    {
        id: 166,
        fen: "8/p2k1p2/1p1bpqp1/8/6P1/1PQ2B1P/PK4P1/8 w - - 0 1",
        solucion: ["Qxf6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 01"
    },
    {
        id: 167,
        fen: "r1bqk2r/ppp2pQ1/2n4p/4b3/2P3n1/5N2/PP2PPPP/RNB1KB1R w KQkq - 0 1",
        solucion: ["Nxe5", "Qf6", "Qxf6", "Nxf6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 02"
    },
    {
        id: 168,
        fen: "r3kb1r/pp1n1pp1/2p3p1/8/2P1B1Pq/1P5P/PB2PP2/R2QKR2 b Qkq - 0 1",
        solucion: ["Bb4+", "Qd2", "Bxd2+"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 03"
    },
    {
        id: 169,
        fen: "6k1/1p6/3N4/3Pp2q/6p1/6N1/1P3QK1/r7 b - - 0 1",
        solucion: ["Qh3#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 04"
    },
    {
        id: 170,
        fen: "rn3rk1/pp3ppp/2p1bq2/2b5/2P1p3/2N2NP1/PPQ1PPBP/R4RK1 b - - 0 1",
        solucion: ["exf3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 05"
    },
    {
        id: 171,
        fen: "3r2k1/2P1qppp/4p3/4P3/8/6PP/5PK1/2R5 w - - 0 1",
        solucion: ["c8=Q"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 07"
    },
    {
        id: 172,
        fen: "8/6Q1/2b5/1np1p3/2p1Pk2/q4P2/P5PP/K7 w - - 0 1",
        solucion: ["Qh6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 08"
    },
    {
        id: 173,
        fen: "r2q1rk1/pp1bppbp/2p3p1/4P3/6n1/2N3P1/PPPQB2P/2KRR1B1 w - - 0 1",
        solucion: ["Qxd7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 09"
    },
    {
        id: 174,
        fen: "r5k1/1b5p/3qpnp1/p1p1R3/2Pp2Pb/1P6/P1Q1B2P/2B2RK1 w - - 0 1",
        solucion: ["Bf4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 10"
    },
    {
        id: 175,
        fen: "1Q4k1/p1q2ppp/8/2p5/2P5/P7/3r1PPP/1R4K1 b - - 0 1",
        solucion: ["Qd8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 11"
    },
    {
        id: 176,
        fen: "rnb4r/ppkn2bp/2p2pp1/4p1N1/4P3/2N1B2P/PPP1BPP1/2KR3R w - - 0 1",
        solucion: ["Ne6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Q vs 12"
    },
    {
        id: 177,
        fen: "8/2r2pk1/p3p3/Pn1p4/3P4/4PK2/2B2P2/7R b - - 0 1",
        solucion: ["Rxc2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 02"
    },
    {
        id: 178,
        fen: "8/8/2p5/2K5/2P5/3k4/8/8 b - - 0 1",
        solucion: ["Kc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 03"
    },
    {
        id: 179,
        fen: "1R6/6k1/3p2Bp/3Pp3/PP2Pn1b/4N2r/6p1/2R3K1 b - - 0 1",
        solucion: ["Rh1#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 04"
    },
    {
        id: 180,
        fen: "r1bqk2r/pp3p1p/2pb2p1/3p1pn1/3P4/3BBQ1P/PPP1NPP1/1K1R3R w kq - 0 1",
        solucion: ["Bxg5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 05"
    },
    {
        id: 181,
        fen: "r4rk1/3nppbp/3p1np1/2pP4/Pq2P2P/5N2/1PQB1PP1/R2NK2R w KQ - 0 1",
        solucion: ["Bxb4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 06"
    },
    {
        id: 182,
        fen: "6k1/1Q6/5q2/8/1P6/KP6/8/8 b - - 0 1",
        solucion: ["Qa1#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 07"
    },
    {
        id: 183,
        fen: "1k2r3/pb3p2/1p3n1p/8/1R1R2r1/P1N3P1/2P2K1P/5B2 w - - 0 1",
        solucion: ["Rxg4", "Nxg4+", "Rxg4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 08"
    },
    {
        id: 184,
        fen: "r3k2r/4bpp1/2p1p2p/p2p4/P2P4/1Bn2P2/1BP2KPP/R4R2 b kq - 0 1",
        solucion: ["Bb4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 09"
    },
    {
        id: 185,
        fen: "r6k/ppQ3p1/2p3rp/2P2p2/8/4BP1q/PPB2P1P/R3R1K1 w - - 0 1",
        solucion: ["Qg3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix R vs 12"
    },
    {
        id: 186,
        fen: "7k/6pp/4Q3/K2B4/8/3b4/1n3R1P/2q5 b - - 0 1",
        solucion: ["Qc5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 01"
    },
    {
        id: 187,
        fen: "6n1/1pr5/p4kpp/3B1p2/5P2/1P4PP/P2RK3/8 w - - 0 1",
        solucion: ["Bxg8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 02"
    },
    {
        id: 188,
        fen: "2k5/1b2bp2/p5p1/1p1n3p/2pP4/P1N1NPB1/1P3KPP/8 w - - 0 1",
        solucion: ["Nexd5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 03"
    },
    {
        id: 189,
        fen: "2b2rk1/pp4p1/2pbr3/5Pp1/3P4/1Q2n1N1/PP4PP/R5K1 b - - 0 1",
        solucion: ["Nxf5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 04"
    },
    {
        id: 190,
        fen: "1r6/2p1rp1k/3p1pp1/p2P3p/4PP1P/P3Q1P1/2R2K2/q3R3 b - - 0 1",
        solucion: ["Rb1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 05"
    },
    {
        id: 191,
        fen: "2kr3r/p2n1ppp/1p1Bpn2/8/b7/2PB1N2/PP3PPP/R4RK1 w - - 0 1",
        solucion: ["Ba6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 06"
    },
    {
        id: 192,
        fen: "2r5/4kpbp/4p3/8/p6P/P3P1P1/2p1KP2/1RBQ4 b - - 0 1",
        solucion: ["cxb1=Q"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 07"
    },
    {
        id: 193,
        fen: "1rb1k2r/3nppb1/p1pp1np1/q5Bp/1pPPP2P/2N2P1N/PPQ1B1P1/1K1R3R w k - 0 1",
        solucion: ["Na4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 09"
    },
    {
        id: 194,
        fen: "2k3r1/ppp2p2/2np3p/2b1p1r1/2B1Pp2/2PP1P1K/PP1Q1P2/5RR1 b - - 0 1",
        solucion: ["Rh5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 10"
    },
    {
        id: 195,
        fen: "r1bnkb1r/ppq2ppp/8/3pP3/2pPnB2/1BP2N2/PP4PP/RN1Q1RK1 b kq - 0 1",
        solucion: ["cxb3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 11"
    },
    {
        id: 196,
        fen: "7k/p6p/1p1p4/4b3/P4qB1/2P2K1P/1P1R1P2/3Q1R2 w - - 0 1",
        solucion: ["Kg2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix S vs 12"
    },
    {
        id: 197,
        fen: "7r/p1pk2pp/1p1n1p2/8/1Pb2P2/P1K1B1P1/1P2B2P/4R3 w - - 0 1",
        solucion: ["Bxc4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 01"
    },
    {
        id: 198,
        fen: "2r5/4ppk1/3pbnpp/pp6/q2NP1PN/PP3P2/5Q1P/R6K b - - 0 1",
        solucion: ["Bxb3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 02"
    },
    {
        id: 199,
        fen: "6k1/8/p4Q2/P1p5/Kp6/3q4/8/R7 b - - 0 1",
        solucion: ["Qc2#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 03"
    },
    {
        id: 200,
        fen: "2b1nrk1/4ppbp/p1np2p1/8/3PPP2/NrPBB2P/3N2P1/R3K2R w KQ - 0 1",
        solucion: ["Nxb3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 04"
    },
    {
        id: 201,
        fen: "5K2/5P2/7k/8/8/8/4p3/8 w - - 0 1",
        solucion: ["Kg8"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 05"
    },
    {
        id: 202,
        fen: "r3r3/7p/p1p1RQp1/1pq5/2Pk4/6P1/1P5P/7K b - - 0 1",
        solucion: ["Kxc4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 06"
    },
    {
        id: 203,
        fen: "r3Nbkr/pp5p/6n1/6Q1/8/8/PPP3PP/6K1 w - - 0 1",
        solucion: ["Qd5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 07"
    },
    {
        id: 204,
        fen: "r5k1/p2bn1qp/1pn1prp1/2pp2B1/3P4/P1PB4/2PQNPPP/R4RK1 w - - 0 1",
        solucion: ["Bxf6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 08"
    },
    {
        id: 205,
        fen: "r4rk1/pbq1pp1p/6p1/2p5/5P2/b1QP1NP1/P5BP/R4RK1 b - - 0 1",
        solucion: ["Bb4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 09"
    },
    {
        id: 206,
        fen: "Q7/3n1pbk/p4Np1/1p5p/1P2q3/P5PP/2P2B2/6K1 b - - 0 1",
        solucion: ["Nxf6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 10"
    },
    {
        id: 207,
        fen: "5r2/p1n5/3q1Prk/1pp5/4Q3/8/1P4PP/6K1 w - - 0 1",
        solucion: ["Qh4#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix T vs 11"
    },
    {
        id: 208,
        fen: "r4rk1/1p2qppp/p1b1p3/8/2P5/2QB2P1/PP1R1P1P/2K4R b - - 0 1",
        solucion: ["Bxh1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix U vs 01"
    },
    {
        id: 209,
        fen: "4r3/2p5/1p1p1R2/pP1P2kp/2P3b1/6P1/P3r2P/5RK1 w - - 0 1",
        solucion: ["h4#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix U vs 02"
    },
    {
        id: 210,
        fen: "4rrk1/4bppp/p2p1B2/2q2P2/1p6/6Q1/PPP3PP/3R1RK1 w - - 0 1",
        solucion: ["Bd4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix U vs 03"
    },
    {
        id: 211,
        fen: "3r1k2/pp2r1p1/4Bpb1/2Pp3p/3PnP2/1P2B1PP/1P4K1/2R2R2 w - - 0 1",
        solucion: ["f5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix U vs 04"
    },
    {
        id: 212,
        fen: "7Q/6pp/4pk2/4Np2/3Pp3/3nP3/1q6/3K4 w - - 0 1",
        solucion: ["Qd8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix U vs 05"
    },
    {
        id: 213,
        fen: "r1b2b1r/pp2pk1p/3p1pp1/3P1q2/6B1/1R5P/P2B1PP1/3QR1K1 b - - 0 1",
        solucion: ["Qxd5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix U vs 07"
    },
    {
        id: 214,
        fen: "r3r1k1/1pq2ppp/2p2pb1/p7/1bPP2PP/1B6/PP1Q1P2/1NKR3R w - - 0 1",
        solucion: ["Nc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix U vs 08"
    },
    {
        id: 215,
        fen: "3r4/5R2/1p5k/p1p3bp/P5P1/2P5/1PBq4/6K1 w - - 0 1",
        solucion: ["Rh7#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix U vs 09"
    },
    {
        id: 216,
        fen: "1k3r2/pp1b1qb1/2n1p2p/5p1P/5P2/1NP1PB2/PP1N2Q1/6RK w - - 0 1",
        solucion: ["Qxg7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix U vs 11"
    },
    {
        id: 217,
        fen: "4r3/2p5/1p1p1R2/pP1P2kp/2P3p1/6P1/P3r2P/5RK1 w - - 0 1",
        solucion: ["R1f5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 01"
    },
    {
        id: 218,
        fen: "r4rk1/pp3pbp/q2p2p1/4p3/3NP3/PQ3P2/1PP3PP/2KR3R w - - 0 1",
        solucion: ["Nb5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 02"
    },
    {
        id: 219,
        fen: "1r3rk1/1b1nppbp/p2p2p1/q1pP3n/2B1P3/NP3N1P/P1Q2PPB/3RR1K1 b - - 0 1",
        solucion: ["Qxa3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 05"
    },
    {
        id: 220,
        fen: "8/p2Q4/kp1N4/8/7b/7P/7K/4q3 w - - 0 1",
        solucion: ["Qb5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 06"
    },
    {
        id: 221,
        fen: "5r2/1b2npkp/pN1p2p1/1p6/1PrNq3/P3Q2P/5PP1/2R2RK1 w - - 0 1",
        solucion: ["Qxe4", "Bxe4", "Nxc4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 07"
    },
    {
        id: 222,
        fen: "r1r1k2r/pp2bppp/2n1pn2/3q4/3P4/2N2N2/PP2BPPP/R1BQK2R w KQkq - 0 1",
        solucion: ["Nxd5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 08"
    },
    {
        id: 223,
        fen: "8/p1r2bkp/1p1n1bp1/5p2/8/1PN2B1P/P1PB1PP1/4R1K1 b - - 0 1",
        solucion: ["Bxc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 09"
    },
    {
        id: 224,
        fen: "rnbbk2r/ppp2pp1/2nBp2p/1B6/PqNPp3/2N5/1PP2PPP/R2QK2R b KQkq - 0 1",
        solucion: ["cxd6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 10"
    },
    {
        id: 225,
        fen: "1q2rr2/3n1Nkp/2p5/1p3p2/p1BP4/4Q3/PPP4P/2K5 w - - 0 1",
        solucion: ["Qg5#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 11"
    },
    {
        id: 226,
        fen: "8/1R3p2/2p1k1R1/3p4/qp1P4/3QP3/rP3P1P/1K6 b - - 0 1",
        solucion: ["f6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix V vs 12"
    },
    {
        id: 227,
        fen: "r3k2r/pp1n1p2/3p2qp/2pP1bp1/1b6/2NBPNP1/PPQ2PP1/2R1K2R b Kkq - 0 1",
        solucion: ["Bxd3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 02"
    },
    {
        id: 228,
        fen: "r1bq1rk1/ppp2ppp/2np1b2/8/2P5/1P2PB2/P3QPPP/RNB2RK1 w - - 0 1",
        solucion: ["Bb2"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 03"
    },
    {
        id: 229,
        fen: "6k1/5p2/4b3/6P1/2P5/6q1/3QK3/3R1B2 b - - 0 1",
        solucion: ["Bg4#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 04"
    },
    {
        id: 230,
        fen: "2Q5/p4pkp/2n3p1/b7/3B1P2/6P1/7P/2q2BK1 b - - 0 1",
        solucion: ["f6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 05"
    },
    {
        id: 231,
        fen: "5rk1/1p1bppbp/p2p1np1/2r3B1/4P3/1BN2P2/PPP3PP/3RR1K1 b - - 0 1",
        solucion: ["Rxg5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 06"
    },
    {
        id: 232,
        fen: "r2q1r2/pp2bk2/2p4Q/4p3/3P2R1/2P5/PP4PP/6K1 w - - 0 1",
        solucion: ["Qg6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 07"
    },
    {
        id: 233,
        fen: "r3k3/pRp3p1/2p2pb1/4p3/P1P1P1P1/4BP2/3K4/8 b q - 0 1",
        solucion: ["O-O-O+"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 08"
    },
    {
        id: 234,
        fen: "r1b1kb1r/2q2ppp/p1nppn2/8/1p2PP2/2NBBN2/PPP3PP/R3QRK1 b kq - 0 1",
        solucion: ["bxc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 09"
    },
    {
        id: 235,
        fen: "5rk1/pb3ppp/3p4/1P2p3/1P2n3/n3PN2/1B2BPPP/2r2RK1 w - - 0 1",
        solucion: ["Rxc1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 10"
    },
    {
        id: 236,
        fen: "r4rk1/2p2pp1/pb1p1q1p/Pp2p2b/1P2P3/2PP1N1P/4BPP1/R2Q1RK1 b - - 0 1",
        solucion: ["Ba7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 11"
    },
    {
        id: 237,
        fen: "4r3/pp3k2/2p1p2P/4Q1p1/8/q1pB4/P1P5/1K6 w - - 0 1",
        solucion: ["Qg7#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix W vs 12"
    },
    {
        id: 238,
        fen: "2Nr1rk1/pp3Nnp/1b2p3/8/8/4p3/PPP3PP/5R1K w - - 0 1",
        solucion: ["Ne7#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix X vs 01"
    },
    {
        id: 239,
        fen: "r1b1kb1r/5pp1/p3p2p/3pP3/1q5B/3B4/PPP3PP/1R1Q1K1R b kq - 0 1",
        solucion: ["Qxh4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix X vs 03"
    },
    {
        id: 240,
        fen: "rn1qk2r/p1pnbppp/bp2p3/3pP3/Q2P4/2P4N/PP1N1PPP/R1B1KB2 w Qkq - 0 1",
        solucion: ["Bxa6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix X vs 05"
    },
    {
        id: 241,
        fen: "r2q1kbQ/p3b3/1p1n2B1/2pp4/8/1PP1P2P/P5P1/R1B3K1 w - - 0 1",
        solucion: ["Qh6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix X vs 07"
    },
    {
        id: 242,
        fen: "rn2k2r/p1q1bp2/Q1p1pp2/1p5p/3P4/PNP2N2/1KP2PPP/3R3R w kq - 0 1",
        solucion: ["Qa5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix X vs 08"
    },
    {
        id: 243,
        fen: "2b2n1k/r6p/1qn2Bp1/2p5/ppP3N1/P2B3P/3N1PP1/R5K1 b - - 0 1",
        solucion: ["Rg7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix X vs 09"
    },
    {
        id: 244,
        fen: "8/5r1k/8/2p5/R3PB1p/8/7P/5K2 w - - 0 1",
        solucion: ["e5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix X vs 10"
    },
    {
        id: 245,
        fen: "b3n1k1/5pp1/1p5p/4Q3/1p2P2q/1P6/PB4PP/3N2K1 b - - 0 1",
        solucion: ["Qe1#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix X vs 11"
    },
    {
        id: 246,
        fen: "r2r2k1/pp2bp2/4p1pp/nP6/1P6/3B1N2/P4PPP/R2R2K1 b - - 0 1",
        solucion: ["Bxb4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix X vs 12"
    },
    {
        id: 247,
        fen: "1k1r3r/ppp3pp/3bR3/7q/3n4/3P1N1P/PP1BQPP1/R5K1 w - - 0 1",
        solucion: ["Nxd4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 01"
    },
    {
        id: 248,
        fen: "4k2r/4P3/5K2/2pB4/2P5/8/8/8 w k - 0 1",
        solucion: ["Bc6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 02"
    },
    {
        id: 249,
        fen: "2kr3r/ppqb1ppp/1bnBp3/3pPn2/3P4/2PB1N2/P4PPP/RN1Q1RK1 b - - 0 1",
        solucion: ["Nxd6", "exd6", "Qxd6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 03"
    },
    {
        id: 250,
        fen: "2r4r/pk4pp/1pb2p2/4p3/1P1p4/P2P2P1/1K1NPP1P/2R4R b - - 0 1",
        solucion: ["Bxh1"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 04"
    },
    {
        id: 251,
        fen: "8/5p2/5k1P/8/6K1/8/8/8 w - - 0 1",
        solucion: ["Kh5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 05"
    },
    {
        id: 252,
        fen: "6k1/R6p/4b1p1/p6q/8/1P4Q1/P4PP1/5K2 b - - 0 1",
        solucion: ["Qd1#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 06"
    },
    {
        id: 253,
        fen: "5K2/8/4k1P1/4p3/1p2P3/1P6/4b3/8 b - - 0 1",
        solucion: ["Bh5", "g7", "Bf7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 07"
    },
    {
        id: 254,
        fen: "rnbqk2r/p4ppp/1p2pn2/4p3/2P5/5Q2/PPNB1PPP/R3KB1R b KQkq - 0 1",
        solucion: ["e4"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 09"
    },
    {
        id: 255,
        fen: "1k6/8/6rp/3p1p2/1R3P2/2R2KP1/7r/8 b - - 0 1",
        solucion: ["Ka7", "Ra3+", "Ra6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 10"
    },
    {
        id: 256,
        fen: "5rkr/ppp5/3p2pQ/8/3PP1b1/8/PPP3P1/6K1 w - - 0 1",
        solucion: ["Qxg6#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 11"
    },
    {
        id: 257,
        fen: "r2rb1k1/4bppp/p3pn2/1p1pq3/3N1B2/5P2/PPPQN1PP/1K1RR3 b - - 0 1",
        solucion: ["Qh5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Y vs 12"
    },
    {
        id: 258,
        fen: "b7/k1Pn4/8/1Q6/8/8/7K/3q4 w - - 0 1",
        solucion: ["c8=N#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 01"
    },
    {
        id: 259,
        fen: "r1bqkb1r/2p4p/pp1p1pp1/1N1Pp3/8/2PP1Q2/PP3PPP/R1B1R1K1 b kq - 0 1",
        solucion: ["axb5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 02"
    },
    {
        id: 260,
        fen: "5bk1/7p/6pp/5b2/8/1B4PP/3B2K1/8 b - - 0 1",
        solucion: ["Kh8", "Bc3+", "Bg7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 03"
    },
    {
        id: 261,
        fen: "8/8/8/3Pk3/6B1/7p/1K6/8 w - - 0 1",
        solucion: ["Bf3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 04"
    },
    {
        id: 262,
        fen: "6k1/pp3p1p/b3p1p1/4P3/1P3P2/P3QBP1/5K1P/3q4 b - - 0 1",
        solucion: ["Qf1#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 06"
    },
    {
        id: 263,
        fen: "6Q1/pq3p2/4b3/8/1kppP3/R4K2/P1P5/8 w - - 0 1",
        solucion: ["Qf8+"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 07"
    },
    {
        id: 264,
        fen: "2k2rrb/pppn1p1p/3p4/3Pp1B1/4N2q/2P2Q1P/PP3PPK/R4R2 b - - 0 1",
        solucion: ["Rxg5", "Nxg5", "Qxg5"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 08"
    },
    {
        id: 265,
        fen: "2k1b2r/2p2Rpp/2Qb4/3p4/2q5/2P5/PP4PP/7K w - - 0 1",
        solucion: ["Qa8#"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 09"
    },
    {
        id: 266,
        fen: "Q7/3n2pk/1KP5/3p4/3P4/4P3/8/q7 w - - 0 1",
        solucion: ["Kb7"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 10"
    },
    {
        id: 267,
        fen: "2kr3r/p5pp/1p2npb1/2p2P2/8/1PP2PB1/P1KN3P/3R3R w - - 0 1",
        solucion: ["fxg6"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 11"
    },
    {
        id: 268,
        fen: "2kr3r/1b3pp1/p2ppb1p/1p6/4PP2/1NNQ4/qPP3PP/2KRR3 b - - 0 1",
        solucion: ["Bxc3"],
        objetivo: "Ejercicio mixto",
        descripcion: "Mix Z vs 12"
    }
];

const servidor = new WebSocket.Server({ port: 8080 });
let jugadores = {};

console.log("====================================");
console.log("🖥️  SERVIDOR DE DUELO DE PROBLEMAS");
console.log("========== MODO PRÁCTICA ===========");
console.log(`📡 Escuchando en: ws://localhost:8080`);
console.log(`📚 Problemas disponibles: ${problemas.length}`);
console.log(`🎯 Modo: PRÁCTICA - 3 fallos y termina`);
console.log(`🎯 Intentos por problema: ${CONFIG.intentosPorProblema}`);
console.log("====================================");

servidor.on('connection', (ws) => {
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
        // Estadísticas detalladas
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
// MANEJADORES
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
    
    // Reiniciar estadísticas
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
    
    console.log(`🎯 ${idJugador} inicia práctica. Fallos máximos: ${CONFIG.fallosMaximos}`);
    
    jugador.conexion.send(JSON.stringify({
        tipo: 'practica_iniciada',
        fallosMaximos: CONFIG.fallosMaximos
    }));
    
    enviarSiguienteProblema(idJugador);
}

function enviarSiguienteProblema(idJugador) {
    const jugador = jugadores[idJugador];
    if (!jugador || !jugador.entrenamientoActivo) return;

    // Verificar si ya llegó al límite de fallos
    if (jugador.fallos >= CONFIG.fallosMaximos) {
        finalizarPractica(idJugador, 'limite_fallos');
        return;
    }

    // Verificar si hay problemas disponibles
    if (jugador.problemasDisponibles.length === 0) {
        jugador.problemasDisponibles = problemas.map(p => p.id);
    }

    const indiceAleatorio = Math.floor(Math.random() * jugador.problemasDisponibles.length);
    const idProblema = jugador.problemasDisponibles[indiceAleatorio];
    const problemaOriginal = problemas.find(p => p.id === idProblema);
    const problema = JSON.parse(JSON.stringify(problemaOriginal));
    
    jugador.problemaActual = problema;
    jugador.indiceMovimiento = 0;
    jugador.intentosActuales = 1; // Comienza en el primer intento

    console.log(`📤 Enviando problema ${problema.id} a ${idJugador}`);
    console.log(`   Fallos actuales: ${jugador.fallos}/${CONFIG.fallosMaximos}`);

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
    
    console.log(`   Recibido: ${datos.movimiento}, esperado: ${problema.solucion[indice]}`);
    console.log(`   Intento: ${jugador.intentosActuales}/${CONFIG.intentosPorProblema}`);

    if (datos.movimiento === problema.solucion[indice]) {
        // Movimiento correcto
        jugador.indiceMovimiento++;
        
        if (jugador.indiceMovimiento >= problema.solucion.length) {
            // PROBLEMA COMPLETADO - Registrar según el intento
            jugador.stats.total++;
            jugador.stats.puntuacionTotal += 10;
            jugador.puntuacion += 10;
            jugador.aciertos++;
            
            // Registrar en qué intento se resolvió
            switch(jugador.intentosActuales) {
                case 1:
                    jugador.stats.primerIntento++;
                    break;
                case 2:
                    jugador.stats.segundoIntento++;
                    break;
                case 3:
                    jugador.stats.tercerIntento++;
                    break;
            }
            
            jugador.problemasResueltos.push({
                id: problema.id,
                intentos: jugador.intentosActuales
            });
            
            // Quitar de disponibles
            jugador.problemasDisponibles = jugador.problemasDisponibles.filter(id => id !== problema.id);
            
            console.log(`   ✅ Problema ${problema.id} completado en ${jugador.intentosActuales} intento(s)`);
            
            jugador.conexion.send(JSON.stringify({
                tipo: 'movimiento_correcto',
                mensaje: '¡Problema completado!'
            }));
            
            setTimeout(() => {
                enviarSiguienteProblema(idJugador);
            }, 1500);
            
        } else {
            // Movimiento correcto pero falta completar
            jugador.conexion.send(JSON.stringify({
                tipo: 'movimiento_correcto',
                mensaje: '¡Correcto!'
            }));
            
            setTimeout(() => {
                if (!jugador.entrenamientoActivo) return;
                
                const movimientoPrograma = problema.solucion[jugador.indiceMovimiento];
                jugador.indiceMovimiento++;
                
                jugador.conexion.send(JSON.stringify({
                    tipo: 'movimiento_programa',
                    movimiento: movimientoPrograma
                }));
                
                console.log(`   Programa responde: ${movimientoPrograma}`);
                
                if (jugador.indiceMovimiento >= problema.solucion.length) {
                    // PROBLEMA COMPLETADO TRAS PROGRAMA
                    jugador.stats.total++;
                    jugador.stats.puntuacionTotal += 10;
                    jugador.puntuacion += 10;
                    jugador.aciertos++;
                    
                    switch(jugador.intentosActuales) {
                        case 1:
                            jugador.stats.primerIntento++;
                            break;
                        case 2:
                            jugador.stats.segundoIntento++;
                            break;
                        case 3:
                            jugador.stats.tercerIntento++;
                            break;
                    }
                    
                    jugador.problemasResueltos.push({
                        id: problema.id,
                        intentos: jugador.intentosActuales
                    });
                    
                    jugador.problemasDisponibles = jugador.problemasDisponibles.filter(id => id !== problema.id);
                    
                    console.log(`   ✅ Problema ${problema.id} completado en ${jugador.intentosActuales} intento(s)`);
                    
                    setTimeout(() => {
                        enviarSiguienteProblema(idJugador);
                    }, 1500);
                }
            }, 1000);
        }
    } else {
        // Movimiento INCORRECTO
        if (jugador.intentosActuales >= CONFIG.intentosPorProblema) {
            // Se acabaron los intentos - FALLO
            jugador.fallos++;
            jugador.stats.fallados++;
            jugador.stats.total++;
            
            jugador.problemasFallados.push({
                id: problema.id,
                intentos: jugador.intentosActuales
            });
            
            // Quitar problema de disponibles
            jugador.problemasDisponibles = jugador.problemasDisponibles.filter(id => id !== problema.id);
            
            console.log(`   ❌ Fallo definitivo. Fallos totales: ${jugador.fallos}/${CONFIG.fallosMaximos}`);
            
            jugador.conexion.send(JSON.stringify({
                tipo: 'movimiento_incorrecto',
                correcto: problema.solucion[indice],
                fallosActuales: jugador.fallos,
                fallosMaximos: CONFIG.fallosMaximos,
                definitivo: true
            }));
            
            if (jugador.fallos >= CONFIG.fallosMaximos) {
                setTimeout(() => {
                    finalizarPractica(idJugador, 'limite_fallos');
                }, 2000);
            } else {
                setTimeout(() => {
                    enviarSiguienteProblema(idJugador);
                }, 2000);
            }
        } else {
            // Aún quedan intentos
            jugador.intentosActuales++;
            
            console.log(`   ⚠️ Intento ${jugador.intentosActuales-1} fallido. Quedan ${CONFIG.intentosPorProblema - jugador.intentosActuales + 1} intentos`);
            
            jugador.conexion.send(JSON.stringify({
                tipo: 'movimiento_incorrecto',
                correcto: problema.solucion[indice],
                fallosActuales: jugador.fallos,
                fallosMaximos: CONFIG.fallosMaximos,
                intentosRestantes: CONFIG.intentosPorProblema - jugador.intentosActuales + 1,
                definitivo: false
            }));
            
            // Reiniciar el problema para nuevo intento
            setTimeout(() => {
                if (!jugador.entrenamientoActivo) return;
                
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
    
    // Calcular porcentaje promedio
    const porcentajePromedio = jugador.stats.total > 0 
        ? Math.round((jugador.stats.primerIntento * 100 + jugador.stats.segundoIntento * 66 + jugador.stats.tercerIntento * 33) / jugador.stats.total) 
        : 0;
    
    console.log(`🏁 Práctica finalizada para ${idJugador}`);
    console.log(`   Primer intento: ${jugador.stats.primerIntento}`);
    console.log(`   Segundo intento: ${jugador.stats.segundoIntento}`);
    console.log(`   Tercer intento: ${jugador.stats.tercerIntento}`);
    console.log(`   Fallados: ${jugador.stats.fallados}`);
    console.log(`   Total: ${jugador.stats.total}`);
    console.log(`   Porcentaje promedio: ${porcentajePromedio}%`);
    
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
        j.conexion.send(mensaje);
    });
}