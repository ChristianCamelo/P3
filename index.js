// Prueba
 // JSON de prueba
// let pruebaJSON = [
//      {"name":"Juan", "points":"10"},
//      {"name":"Cristian", "points":"14"},
//      {"name":"Javier", "points":"23"},
//      {"name":"Mattia", "points":"19"},
//      {"name":"Adriana", "points":"19"},
//      {"name":"Giulia", "points":"21"},
//      {"name":"Hector", "points":"25"},
//      {"name":"Jorge", "points":"15"},
//      {"name":"Giovanni", "points":"90"},
//      {"name":"Josefina", "points":"34"},
//      {"name":"Eloy", "points":"19"},
// ];


//sessionStorage.setItem('clasificacion', JSON.stringify(pruebaJSON)); // PRUEBA

// Comprobando si hay nombre de los jugadores para saber si hay partida en juego
const clasificacion = sessionStorage.getItem('clasificacion');
const player1 = sessionStorage.getItem('player1');
const player2 = sessionStorage.getItem('player2');

 // Constantes
const MAXSCORES = 10;

let clasificacionPruebaJSON = JSON.parse(clasificacion); //SIGUENDO CON LA PRUEBA

if (player1 != null && player2 != null) {
    // Hay partida en juego
    window.location.href = "juego.html";
} else {
    // No hay pertida
    let table = document.getElementById('top-scores-table');
    let scores = table.rows.length -1; // porque no quiero que me cuente la cabecera de la tabla
    // Elimino el div de si no hay puntuaciones
    let noPunt = document.getElementById('noPunt');
    noPunt.remove();


    // si no hay puntuaciones
    // let tr = document.createElement('tr');

    // ordenaJugadores(clasificacionPruebaJSON);

    //if (tablePos <= MAXSCORES) {
        for (let i = 0; i < clasificacionPruebaJSON.length && i<10; i++) {
            let jugador = clasificacionPruebaJSON[i];
            let nombre = jugador.name;
            let puntuacion = jugador.points;

            let fila = table.insertRow();

            let userPos = fila.insertCell();
            userPos.textContent = i+1;

            let userName = fila.insertCell();
            userName.textContent = nombre;

            let userScore = fila.insertCell();
            userScore.textContent = puntuacion;
        }
    // }
}

function ordenaJugadores(jsonelem) {
    jsonelem.sort((a,b) => {
        let punt1 = parseInt(Object.values(a)[1]);
        let punt2 = parseInt(Object.values(b)[1]);

        if (punt1 < punt2) {
            return 1;
        } else if (punt1 > punt2) {
            return -1;
        } else {
            return 0;
        }
    });
}

function startGame() {
    let player1 = document.getElementById("namePlayer1");
    let player2 = document.getElementById("namePlayer2");
    sessionStorage.setItem('Jugador 1', player1.value);
    sessionStorage.setItem('Jugador 2', player2.value);

    window.location.href = "juego.html";
}