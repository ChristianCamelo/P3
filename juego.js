const celdaSize = 50;
let tableroEspacios;
let puntos = [0, 0];
let jugadorEnJuego;
let turno = 0;
let numPicked;
let numbersRand = [];
let buttonPicked;
let datos;

function drawCv() {

    let cv = document.querySelector('canvas');
    let ctx = cv.getContext('2d')

    cv.width = celdaSize * 4
    cv.height = celdaSize * 4

    drawGrid(cv);

    cv.addEventListener('click', function (e) {

        //POSICION DEL MOUSE
        let x = e.offsetX,
            y = e.offsetY,
            fila, columna;

        // tengo la posicion pero quiero la fila y la columna
        fila = Math.floor(y / celdaSize);
        columna = Math.floor(x / celdaSize);

        //SI ESTA DISPONIBLE
        if (tableroEspacios[fila][columna] === 0 && numPicked) {

            //Si el espacio esta vacio y hay numero escogido
            //se guarda el numero en el tablero
            tableroEspacios[fila][columna] = parseInt(numPicked);

            let data = new FormData();
            data.append('tablero', JSON.stringify(tableroEspacios))

            fetch('api/comprobar', {
                method: 'POST',
                body: data
            }).then((response) => {
                if (response.ok) {
                    return response.json()
                }
            }).then((data) => {
                //console.log(data)

                //Si puntuo y el fetch devuelve pareja
                if (data.CELDAS_SUMA.length > 0) {
                    let puntosTmp = 0;
                    data.CELDAS_SUMA.forEach(casilla => {
                        let casillaData = JSON.parse(casilla)
                        puntosTmp += tableroEspacios[casillaData.fila][casillaData.col];
                        tableroEspacios[casillaData.fila][casillaData.col] = 0;
                    })
                    puntos[jugadorEnJuego] += puntosTmp;
                    GUI();
                }

                //SI NO PUNTUO
                else {
                    //PASA AL SIGUIENTE JUGADOR
                    switch (jugadorEnJuego) {
                        case 0: jugadorEnJuego = 1; break;
                        case 1: jugadorEnJuego = 0; break;
                    }
                    showPlayer();
                }

                //SE ACABA EL JUEGO SI NO HAY CASILLAS
                if (data.JUGABLES == 0) {
                    document.querySelector('#win-div').style.display = "block";
                    document.querySelector('#win-div strong').innerHTML = `<strong>${(jugadorEnJuego + 1)}</strong>`;
                    console.log("JUEGO TERMINADO")
                }

                //ACTUALIZAR PARTIDA ACTUAL
                sessionStorage.removeItem("partidaEnCurso"); //u1,p1,u2,p2,tablero,jug
                sessionStorage.setItem("partidaEnCurso", JSON.stringify([
                    puntos,
                    tableroEspacios,
                    jugadorEnJuego,
                ]));
            })

            //Eliminar numero escogido de los posibles
            let index = numbersRand.indexOf(parseInt(numPicked));

            //En caso de haberse agotado la baraja de valores disponibles
            if (index > -1)
                numbersRand.splice(index, 1);
            if (numbersRand.length === 0) {
                console.log("Sin numeros")
            }

            //Escribir numero en tablero
            ctx.fillStyle = "#000"
            ctx.font = "20px Sigmar"
            ctx.fillText(numPicked, columna * celdaSize + (celdaSize / 2), fila * celdaSize + (celdaSize / 2), 20)
            //console.log("El tablero va: "+ tableroEspacios)
            numPicked = 0

            //Cambiar visualizacion del boton
            if (buttonPicked) {
                buttonPicked.setAttribute('class', 'notClickable')
                buttonPicked.removeAttribute('onclick')
                buttonPicked.innerHTML = "<h2></h2>"
                numPicked = null
                buttonPicked = null
            }

            //si no hay mas numeros disponibles regenera numeros
            if (numbersRand.length === length) {
                console.log("REGENERANDO NUMEROS");
                setRandomNum();
            }
        }
    });
}

function useCv() {

    let cv = document.querySelector('canvas');
    let ctx = cv.getContext('2d')

    if (numPicked > 0) {
        cv.style.cursor = "pointer"
    } else {
        cv.style.cursor = "not-allowed"
    }

    cv.addEventListener('mousemove', (e) => {
        let x = e.offsetX,
            y = e.offsetY,
            fila, columna;
        // tengo la posicion pero quiero la fila y la columna
        fila = Math.floor(y / celdaSize); // floor es el entero inmediatemnte inferior
        columna = Math.floor(x / celdaSize);

        //reinicia el tablero
        drawGrid(cv);

        try {//Si hay un valor diferente que 0 no puede poner numero
            if (tableroEspacios[fila][columna] !== 0) {
                cv.style.cursor = "not-allowed";
            }
            //si el valor es 0 pinta la casilla
            else {
                if (numPicked > 0) {
                    cv.style.cursor = "pointer";
                    ctx.fillStyle = "#0000ff"
                    ctx.fillRect(columna * celdaSize, fila * celdaSize, celdaSize, celdaSize);
                }
            }
        } catch (e) {
            // console.log("Fuera de limites");
        }

    })

}

function setInitial() {

    //LEE LOS DATOS ANTERIORES

    //HAY ALMACENADA PARTIDA
    if (checkPlayer() === true) {
        console.log("LEYENDO ESTADO ANTERIOR")
        tableroEspacios = datos[1];
        puntos = datos[0];
        jugadorEnJuego = datos[2];

        //INICIAR EL CANVAS
        drawCv();
    }

    //NO HAY ALMACENADA PARTIDA
    else {
        randomTurno();
        fetch('api/tablero')
            .then((response) => {
                if (response.ok) {
                    return response.json()
                }
            })
            .then((data) => {
                tableroEspacios = data.TABLERO;
                drawCv();
                //console.log(tableroEspacios)
            })
    }

    console.log("TABLERO LEIDO :" + tableroEspacios)
}

function checkPlayer() {

    //VERIFICAR DATOS ACTUALES EN SESSION
    let jugador1 = sessionStorage.getItem("Jugador 1");
    let jugador2 = sessionStorage.getItem("Jugador 2");

    //ACTUALIZAR NOMBRES EN EL GUI
    document.querySelector('#user1').innerHTML = jugador1;
    document.querySelector('#user2').innerHTML = jugador2;

    if (sessionStorage.getItem("partidaEnCurso") !== null) {
        datos = JSON.parse(sessionStorage.getItem("partidaEnCurso")); //p1,p2,tablero,jug

        //MOSTRAR DATOS LEIDOS
        showPlayer();
        GUI();
        console.log("hay partida almacenada")
        return true;
    }
    else {

        //INICIAR BOTON MODAL
        console.log(" NO hay partida almacenada")
        abrirModal();
        if (jugador1 === null) {
            window.location.href = "index.html"
        }
        return false;
    }
}

function showPlayer() {
    //PARA MOVER EL INDICADOR DE JUGADOR EN JUEGO
    switch (jugadorEnJuego) {
        case 0:
            document.querySelector('#GUIp0 .selector').innerHTML = `<div class="verde"></div>`;
            document.querySelector('#GUIp1 .selector').innerHTML = "";
            break;
        case 1:
            document.querySelector('#GUIp0 .selector').innerHTML = "";
            document.querySelector('#GUIp1 .selector').innerHTML = `<div class="verde"></div>`;
            break;
    }
}

function setRandomNum() {

    let buttonsToPick = document.querySelectorAll('#numbers-form > button');
    let numbersForm = document.querySelector('#numbers-form');

    changePointer();
    //Agregamos la funcion a cada boton pasando por parametro a si mismo y el valor
    buttonsToPick.forEach((item) => {
        item.setAttribute('class', 'Clickable')
        item.setAttribute('onclick', 'pickedNum(this,value)');
    })

    for (let i = 0; i < 3; i++) {
        let num;
        do {
            num = Math.floor((Math.random() * 9) + 1)
        } while (num == 5)
        numbersRand.push(num)
    }

    for (let i = 0; i < numbersRand.length; i++) {
        numbersForm.querySelector('#value' + (i + 1)).setAttribute('value', numbersRand[i]);
        numbersForm.querySelector('#value' + (i + 1)).innerHTML = "<h2>" + numbersRand[i] + "</h2>";
    }
}

function randomTurno() {
    jugadorEnJuego = Math.floor(Math.random() * 2); // devuelve entre 0 y 1
    document.getElementById('turno-div').innerHTML =
        `<span>Turno del jugador: <strong>${jugadorEnJuego + 1}</strong></span>
        <input type="button" onclick="cerrarModal()" value="Continuar">`;
    showPlayer();
}

function abrirModal() {
    document.querySelector('#turno-div').style.display = "block"
    document.querySelector('canvas').style.display = "none"
}

function cerrarModal() {
    document.querySelector('#turno-div').style.display = "none"
    document.querySelector('canvas').style.display = "block"
}

function openHelp() {
    document.getElementById('help-div').style.display = "block";
}

function closeHelp() {
    document.getElementById('help-div').style.display = "none";
}

function finishMatch() {
    sessionStorage.removeItem('Jugador 1');
    sessionStorage.removeItem('Jugador 2');
    sessionStorage.removeItem('partidaEnCurso');
    window.location.href = "index.html"
}

function pickedNum(element, valor) {

    if (buttonPicked !== element) {
        changePointer();
        element.setAttribute('class', 'number-active')
        if (valor !== 0) {
            numPicked = valor;
            buttonPicked = element;
        }
    }

    //Ya estaba seleccionado
    else if (buttonPicked === element) {
        element.setAttribute('class', 'Clickable')
        numPicked = null
        buttonPicked = null
    }
    // console.log(buttonPicked)
}

function changePointer() {

    useCv();
    let buttonsToPick = document.querySelectorAll('#numbers-form > button');

    buttonsToPick.forEach((item) => {
        if (!item.getAttribute('onclick')) {
            //No esta disponible
            item.setAttribute('class', 'notClickable')
        }
        else if (item.getAttribute('onclick')) {
            //esta disponible
            item.setAttribute('class', 'Clickable')
        }
    })
}

function drawGrid(canvas) {
    let drawer = canvas.getContext('2d')
    for (let fila = 0; fila < 4; fila++) {
        for (let columna = 0; columna < 4; columna++) {
            if (tableroEspacios[fila][columna] >= 0) {
                //dibujar los espacios disponibles
                drawer.fillStyle = "#ffffff"
                drawer.fillRect(columna * celdaSize, fila * celdaSize, celdaSize, celdaSize);
                drawer.strokeRect(columna * celdaSize, fila * celdaSize, celdaSize, celdaSize);

                //si ya han sido usado dibuja el valor
                if (tableroEspacios[fila][columna] !== 0) {
                    drawer.fillStyle = "#000"
                    drawer.fillText(tableroEspacios[fila][columna], columna * celdaSize + (celdaSize / 2), fila * celdaSize + (celdaSize / 2))
                }
            }
            if (tableroEspacios[fila][columna] === -1) {
                //dibujar los espacios bloqueados
                drawer.fillStyle = "#c6c6c6"
                drawer.fillRect(columna * celdaSize, fila * celdaSize, celdaSize, celdaSize);
                drawer.strokeRect(columna * celdaSize, fila * celdaSize, celdaSize, celdaSize);
            }
        }
    }
}

function GUI() {
    document.querySelector('#score1').innerHTML = puntos[0]
    document.querySelector('#score2').innerHTML = puntos[1]
}

function setLeaderboard(callback) {

    let leaderboard = [];
    let leaderboardFinal = [];
    let listo1 = false;
    let listo2 = false;
    let contador = 0;

    const jugador1 = {
        "name": sessionStorage.getItem('Jugador 1'),
        "points": puntos[0]
    }
    const jugador2 = {
        "name": sessionStorage.getItem('Jugador 2'),
        "points": puntos[1]
    }
    let leaderboardTmp = JSON.parse(sessionStorage.getItem('clasificacion'));

    //SI HABIAN JUGADORES ANTERIORES
    if (leaderboardTmp != null) {

        for (let i = 0; i < leaderboardTmp.length; i++) {

            usuario = leaderboardTmp[i];

            if (usuario.points < puntos[0] && listo1 === false) {
                listo1 = true;
                leaderboard.push(jugador1);
                leaderboard.push(usuario);
            }

            else {
                leaderboard.push(usuario);
            }
            contador++;
        }

        if (contador < 10 && listo1 === false) {
            leaderboard.push(jugador1)
        }

        contador = 0;

        for (let i = 0; i < leaderboard.length; i++) {

            usuario = leaderboard[i];

            if (usuario.points < puntos[1] && listo2 === false) {
                listo2 = true;
                leaderboardFinal.push(jugador2);
                leaderboardFinal.push(usuario);
            }

            else {
                leaderboardFinal.push(usuario);
            }
            contador++;
        }

        if (contador < 10 && listo2 === false) {
            leaderboardFinal.push(jugador2)
        }


    }

    //SI NO HABIAN JUGADORES ANTERIORES
    else {
        if (puntos[1] > puntos[0]) {
            leaderboardFinal.push(jugador2)
            leaderboardFinal.push(jugador1)
        }
        else {
            leaderboardFinal.push(jugador1)
            leaderboardFinal.push(jugador2)
        }
    }

    //AQUI DEBE DEVOLVER EL TOP ACTUALIZADO
    sessionStorage.removeItem('clasificacion')
    sessionStorage.setItem('clasificacion', JSON.stringify(leaderboardFinal));

    callback();
}

function winClose() {
    setLeaderboard(function () {
        sessionStorage.removeItem('Jugador 1');
        sessionStorage.removeItem('Jugador 2');
        sessionStorage.removeItem('Tablero');
        window.location.href = "index.html";
    });
}

//checkPlayer();