let socket = null;
let chess = new Chess();
let miId = null;
let miNombre = '';
let puedeMover = false;
let piezaSeleccionada = null;
let arrastrando = false;
let clone = null;
let colorJugador = 'w';
let fallosMaximos = 3;
let fallosActuales = 0;
let aciertos = 0;

const estadoSpan = document.getElementById('estado');
const btnConectar = document.getElementById('btnConectar');
const btnDesconectar = document.getElementById('btnDesconectar');
const tableroDiv = document.getElementById('tablero');
const miIdSpan = document.getElementById('miId');
const miNombreSpan = document.getElementById('miNombre');
const puntuacionSpan = document.getElementById('puntuacion');
const aciertosSpan = document.getElementById('aciertos');
const fallosSpan = document.getElementById('fallos');
const fallosMaximosSpan = document.getElementById('fallosMaximos');
const turnoDisplay = document.getElementById('turnoDisplay');
const problemaDescSpan = document.getElementById('problemaDesc');
const mensajesDiv = document.getElementById('mensajes');
const barraFallos = document.getElementById('barraFallos');
const fallosDisplay = document.getElementById('fallosDisplay');
const btnRegistrar = document.getElementById('btnRegistrar');
const btnIniciarPractica = document.getElementById('btnIniciarPractica');
const btnFinalizar = document.getElementById('btnFinalizar');
const registroDiv = document.getElementById('registro');
const juegoPanelDiv = document.getElementById('juegoPanel');
const practicaPanelDiv = document.getElementById('practicaPanel');
const rankingDiv = document.getElementById('ranking');
const listaJugadoresDiv = document.getElementById('listaJugadores');
const nombreInput = document.getElementById('nombreInput');

function obtenerURLPieza(pieza) {
    const prefijo = pieza.color === 'w' ? 'w' : 'b';
    let tipo = pieza.type.toLowerCase();
    return `imagenes/${prefijo}${tipo}.svg`;
}

function dibujarTablero() {
    const tablero = chess.board();
    tableroDiv.innerHTML = '';
    
    const rotado = (colorJugador === 'b');
    
    for (let i = 0; i < 8; i++) {
        const fila = rotado ? 7 - i : i;
        
        for (let j = 0; j < 8; j++) {
            const columna = rotado ? 7 - j : j;
            
            const pieza = tablero[fila][columna];
            const casilla = document.createElement('div');
            casilla.className = `casilla ${(fila + columna) % 2 === 0 ? 'blanca' : 'negra'}`;
            casilla.dataset.fila = fila;
            casilla.dataset.columna = columna;
            casilla.dataset.coordenada = `${String.fromCharCode(97 + columna)}${8 - fila}`;
            
            if (pieza) {
                const img = document.createElement('img');
                img.src = obtenerURLPieza(pieza);
                img.dataset.fila = fila;
                img.dataset.columna = columna;
                img.dataset.pieza = pieza.type;
                img.dataset.color = pieza.color;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.padding = '5px';
                img.style.cursor = 'grab';
                img.style.userSelect = 'none';
                img.style.pointerEvents = 'auto';
                
                img.addEventListener('mousedown', iniciarArrastre);
                img.addEventListener('dragstart', (e) => e.preventDefault());
                
                casilla.appendChild(img);
            }
            
            casilla.addEventListener('dragover', (e) => e.preventDefault());
            casilla.addEventListener('drop', manejarSoltar);
            casilla.addEventListener('click', manejarClick);
            
            tableroDiv.appendChild(casilla);
        }
    }
    
    // Actualizar indicador de turno
    actualizarTurno();
}

function actualizarTurno() {
    const turno = chess.turn();
    if (turno === 'w') {
        turnoDisplay.innerHTML = '⚪ Juegan blancas';
        turnoDisplay.style.background = '#f39c12';
    } else {
        turnoDisplay.innerHTML = '⚫ Juegan negras';
        turnoDisplay.style.background = '#34495e';
    }
}

function iniciarArrastre(e) {
    if (!puedeMover) {
        agregarMensaje('⏳ No es tu turno', 'sistema');
        e.preventDefault();
        return;
    }
    
    const img = e.target;
    const fila = parseInt(img.dataset.fila);
    const columna = parseInt(img.dataset.columna);
    const color = img.dataset.color;
    
    if (color !== chess.turn()) {
        agregarMensaje('⏳ No es tu turno', 'sistema');
        e.preventDefault();
        return;
    }
    
    e.preventDefault();
    arrastrando = true;
    piezaSeleccionada = { fila, columna };
    
    img.style.opacity = '0.3';
    
    clone = img.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.width = '60px';
    clone.style.height = '60px';
    clone.style.left = (e.clientX - 30) + 'px';
    clone.style.top = (e.clientY - 30) + 'px';
    clone.style.opacity = '0.9';
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '9999';
    clone.style.filter = 'drop-shadow(0 0 5px gold)';
    clone.style.transform = 'scale(1.1)';
    clone.style.cursor = 'grabbing';
    
    document.body.appendChild(clone);
    
    function moverClone(e) {
        if (!arrastrando || !clone) return;
        clone.style.left = (e.clientX - 30) + 'px';
        clone.style.top = (e.clientY - 30) + 'px';
    }
    
    function terminarArrastre(e) {
        if (!arrastrando) return;
        
        arrastrando = false;
        img.style.opacity = '1';
        
        if (clone && clone.parentNode) {
            document.body.removeChild(clone);
            clone = null;
        }
        
        const elementos = document.elementsFromPoint(e.clientX, e.clientY);
        for (let el of elementos) {
            if (el.classList && el.classList.contains('casilla')) {
                const filaDestino = parseInt(el.dataset.fila);
                const columnaDestino = parseInt(el.dataset.columna);
                realizarMovimiento(fila, columna, filaDestino, columnaDestino);
                break;
            }
        }
        
        piezaSeleccionada = null;
        document.removeEventListener('mousemove', moverClone);
        document.removeEventListener('mouseup', terminarArrastre);
    }
    
    document.addEventListener('mousemove', moverClone);
    document.addEventListener('mouseup', terminarArrastre);
}

function manejarSoltar(e) {
    e.preventDefault();
}

function manejarClick(e) {
    if (arrastrando) return;
    
    const casilla = e.currentTarget;
    const fila = parseInt(casilla.dataset.fila);
    const columna = parseInt(casilla.dataset.columna);
    const pieza = chess.board()[fila][columna];
    
    if (!puedeMover) {
        agregarMensaje('⏳ No es tu turno', 'sistema');
        return;
    }
    
    if (!piezaSeleccionada && pieza && pieza.color === chess.turn()) {
        piezaSeleccionada = { fila, columna };
        resaltarCasilla(fila, columna);
        agregarMensaje(`🟡 Pieza seleccionada en ${casilla.dataset.coordenada}`, 'sistema');
        return;
    }
    
    if (piezaSeleccionada) {
        realizarMovimiento(piezaSeleccionada.fila, piezaSeleccionada.columna, fila, columna);
        piezaSeleccionada = null;
        quitarResaltado();
    }
}

function realizarMovimiento(filaOrigen, columnaOrigen, filaDestino, columnaDestino) {
    const desdeNotacion = `${String.fromCharCode(97 + columnaOrigen)}${8 - filaOrigen}`;
    const hastaNotacion = `${String.fromCharCode(97 + columnaDestino)}${8 - filaDestino}`;
    
    const movimiento = {
        from: desdeNotacion,
        to: hastaNotacion,
        promotion: 'q'
    };
    
    const movimientoLegal = chess.move(movimiento);
    
    if (movimientoLegal) {
        const notacionCompleta = movimientoLegal.san;
        dibujarTablero();
        
        socket.send(JSON.stringify({
            tipo: 'movimiento',
            movimiento: notacionCompleta
        }));
        
        puedeMover = false;
        actualizarTurno();
    } else {
        agregarMensaje(`❌ Movimiento ilegal`, 'sistema');
    }
}

function resaltarCasilla(fila, columna) {
    quitarResaltado();
    const casillas = document.querySelectorAll('.casilla');
    const indice = fila * 8 + columna;
    if (casillas[indice]) {
        casillas[indice].style.outline = '3px solid #f1c40f';
        casillas[indice].style.zIndex = '10';
    }
}

function quitarResaltado() {
    document.querySelectorAll('.casilla').forEach(c => {
        c.style.outline = '';
        c.style.zIndex = '';
    });
}

btnConectar.onclick = () => {
    socket = new WebSocket('ws://localhost:8080');
    
    socket.onopen = () => {
        estadoSpan.textContent = 'Conectado';
        estadoSpan.className = 'conectado';
        btnConectar.disabled = true;
        btnDesconectar.disabled = false;
        registroDiv.style.display = 'block';
        agregarMensaje('✅ Conectado al servidor', 'sistema');
    };
    
    socket.onmessage = (event) => {
        const datos = JSON.parse(event.data);
        console.log('📩 Recibido:', datos.tipo);
        
        switch(datos.tipo) {
            case 'bienvenida':
                miId = datos.id;
                miIdSpan.textContent = miId;
                if (datos.modo === 'practica') {
                    document.getElementById('modoInfo').textContent = '🎯 MODO PRÁCTICA';
                    fallosMaximos = datos.fallosMaximos || 3;
                    fallosMaximosSpan.textContent = fallosMaximos;
                }
                break;
                
            case 'registro_ok':
                miNombre = nombreInput.value;
                miNombreSpan.textContent = miNombre;
                registroDiv.style.display = 'none';
                juegoPanelDiv.style.display = 'block';
                rankingDiv.style.display = 'block';
                agregarMensaje(`👋 Bienvenido ${miNombre}`, 'sistema');
                btnRegistrar.disabled = false;
                break;
                
            case 'practica_iniciada':
                btnIniciarPractica.disabled = true;
                agregarMensaje('🎯 Práctica iniciada. ¡A resolver!', 'sistema');
                break;
                
            case 'problema':
                chess.load(datos.fen);
                colorJugador = datos.colorJugador;
                dibujarTablero();
                problemaDescSpan.textContent = `${datos.descripcion} - ${datos.objetivo}`;
                fallosActuales = datos.fallosActuales || 0;
                aciertos = datos.aciertos || 0;
                fallosSpan.textContent = fallosActuales;
                aciertosSpan.textContent = aciertos;
                fallosDisplay.textContent = `${fallosActuales}/${fallosMaximos}`;
                barraFallos.style.width = `${(fallosActuales / fallosMaximos) * 100}%`;
                puedeMover = true;
                actualizarTurno();
                
                if (datos.reintento) {
                    agregarMensaje(`🔄 Reintento ${datos.intento}`, 'sistema');
                } else {
                    agregarMensaje(`🎯 Intento ${datos.intento || 1}`, 'sistema');
                }
                break;
                
            case 'movimiento_programa':
                try {
                    chess.move(datos.movimiento);
                    dibujarTablero();
                    agregarMensaje(`🤖 Programa: ${datos.movimiento}`, 'sistema');
                    puedeMover = true;
                    piezaSeleccionada = null;
                    quitarResaltado();
                    actualizarTurno();
                } catch (e) {
                    console.error('Error aplicando movimiento:', e);
                }
                break;
                
            case 'movimiento_correcto':
                agregarMensaje(`✅ ${datos.mensaje}`, 'sistema');
                break;
                
            case 'movimiento_incorrecto':
                if (datos.definitivo) {
                    fallosActuales = datos.fallosActuales;
                    fallosSpan.textContent = fallosActuales;
                    fallosDisplay.textContent = `${fallosActuales}/${fallosMaximos}`;
                    barraFallos.style.width = `${(fallosActuales / fallosMaximos) * 100}%`;
                    agregarMensaje(`❌ Incorrecto. Era ${datos.correcto}`, 'sistema');
                    agregarMensaje(`⚠️ Fallo definitivo. Fallos: ${fallosActuales}/${fallosMaximos}`, 'sistema');
                } else {
                    agregarMensaje(`❌ Incorrecto. Te quedan ${datos.intentosRestantes} intentos`, 'sistema');
                }
                chess.undo();
                dibujarTablero();
                puedeMover = true;
                piezaSeleccionada = null;
                quitarResaltado();
                actualizarTurno();
                break;
                
            case 'puntuacion':
                puntuacionSpan.textContent = datos.puntuacion;
                if (datos.aciertos !== undefined) aciertosSpan.textContent = datos.aciertos;
                if (datos.fallos !== undefined) {
                    fallosSpan.textContent = datos.fallos;
                    fallosDisplay.textContent = `${datos.fallos}/${fallosMaximos}`;
                    barraFallos.style.width = `${(datos.fallos / fallosMaximos) * 100}%`;
                }
                break;
                
            case 'fin_practica':
                mostrarEstadisticasPractica(datos.estadisticas);
                btnIniciarPractica.disabled = false;
                break;
                
            case 'ranking':
                actualizarRanking(datos.jugadores);
                break;
                
            case 'error':
                alert('❌ Error: ' + datos.mensaje);
                break;
        }
    };
    
    socket.onclose = () => {
        estadoSpan.textContent = 'Desconectado';
        estadoSpan.className = 'desconectado';
        btnConectar.disabled = false;
        btnDesconectar.disabled = true;
        registroDiv.style.display = 'none';
        juegoPanelDiv.style.display = 'none';
        rankingDiv.style.display = 'none';
        agregarMensaje('🔌 Desconectado', 'sistema');
    };
};

btnDesconectar.onclick = () => {
    if (socket) socket.close();
};

btnRegistrar.onclick = () => {
    const nombre = nombreInput.value.trim();
    if (!nombre) {
        alert('Ingresa un nombre');
        return;
    }
    socket.send(JSON.stringify({ tipo: 'registro', nombre: nombre }));
    btnRegistrar.disabled = true;
};

btnIniciarPractica.onclick = () => {
    socket.send(JSON.stringify({ tipo: 'iniciar_practica' }));
};

btnFinalizar.onclick = () => {
    if (confirm('¿Finalizar la práctica?')) {
        socket.send(JSON.stringify({ tipo: 'finalizar' }));
    }
};

function mostrarEstadisticasPractica(estadisticas) {
    const mensaje = estadisticas.razon === 'limite_fallos' 
        ? '❌ Llegaste al límite de fallos' 
        : '🏁 Práctica finalizada';
    
    const html = `
        <div style="text-align: center;">
            <h3>📊 ESTADÍSTICAS DE LA PRÁCTICA</h3>
            <p>${mensaje}</p>
            <hr>
            <table style="width: 100%; margin: 15px 0; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px; background: #f0f0f0;"><strong>✅ Primer intento (100%)</strong></td>
                    <td style="padding: 8px; text-align: right;">${estadisticas.primerIntento}</td>
                </tr>
                <tr>
                    <td style="padding: 8px;"><strong>👍 Segundo intento (66%)</strong></td>
                    <td style="padding: 8px; text-align: right;">${estadisticas.segundoIntento}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; background: #f0f0f0;"><strong>👌 Tercer intento (33%)</strong></td>
                    <td style="padding: 8px; text-align: right;">${estadisticas.tercerIntento}</td>
                </tr>
                <tr>
                    <td style="padding: 8px;"><strong>❌ Fallados (0%)</strong></td>
                    <td style="padding: 8px; text-align: right;">${estadisticas.fallados}</td>
                </tr>
                <tr style="border-top: 2px solid #3498db;">
                    <td style="padding: 8px; font-weight: bold;">📊 Total problemas</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold;">${estadisticas.total}</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">🎯 Porcentaje promedio</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold; color: #27ae60;">${estadisticas.porcentajePromedio}%</td>
                </tr>
                <tr>
                    <td style="padding: 8px; font-weight: bold;">🏆 Puntuación total</td>
                    <td style="padding: 8px; text-align: right; font-weight: bold; color: #3498db;">${estadisticas.puntuacion} pts</td>
                </tr>
            </table>
            <hr>
            <button onclick="document.body.removeChild(this.parentNode.parentNode.parentNode)" 
                    style="padding: 10px 30px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin-top: 15px;">
                Cerrar
            </button>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '10000';
    
    const contenido = document.createElement('div');
    contenido.style.backgroundColor = 'white';
    contenido.style.padding = '30px';
    contenido.style.borderRadius = '15px';
    contenido.style.maxWidth = '500px';
    contenido.style.width = '90%';
    contenido.innerHTML = html;
    
    modal.appendChild(contenido);
    document.body.appendChild(modal);
}

function agregarMensaje(texto, tipo) {
    const div = document.createElement('div');
    div.className = `mensaje ${tipo}`;
    div.textContent = texto;
    mensajesDiv.appendChild(div);
    mensajesDiv.scrollTop = mensajesDiv.scrollHeight;
}

function actualizarRanking(jugadores) {
    rankingDiv.style.display = 'block';
    listaJugadoresDiv.innerHTML = '';
    jugadores.sort((a, b) => b.puntuacion - a.puntuacion);
    
    jugadores.forEach((j, i) => {
        const row = document.createElement('div');
        row.className = 'ranking-row';
        row.innerHTML = `<span>${i+1}º</span><span style="flex:1">${j.nombre} ${j.activo ? '▶️' : ''}</span><span>${j.puntuacion} pts</span>`;
        listaJugadoresDiv.appendChild(row);
    });
}

dibujarTablero();