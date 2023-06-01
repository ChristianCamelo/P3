const player1 = sessionStorage.getItem('player1');
const player2 = sessionStorage.getItem('player2');

sessionStorage.clear();

if (player1 != null && player2 != null) {
    // si hay partida
    let navbarOption = document.getElementById('noInGame');
    navbarOption.style.display = 'none';
} else {
    // si no hay partida
    let navbarOption1 = document.getElementById('inGame');
    navbarOption1.style.display = 'none';
}