const startBtn = document.getElementById('start-btn');
const modeSelect = document.getElementById('mode-select');
const home = document.getElementById('home');
const btnUnJugador = document.getElementById('btn-un-jugador');
const vehiculosSection = document.getElementById('vehiculos-section');
const circuitosSection = document.getElementById('circuitos-section');
const volverMenu = document.getElementById('volver-menu');
const volverMenu2 = document.getElementById('volver-menu2');

// Botón "JUGAR AHORA"
startBtn.addEventListener('click', () => {
  home.style.display = 'none';
  modeSelect.style.display = 'flex';
});

// Modo un jugador
btnUnJugador.addEventListener('click', () => {
  modeSelect.style.display = 'none';
  vehiculosSection.style.display = 'block';
});

// Volver desde carros
volverMenu.addEventListener('click', () => {
  vehiculosSection.style.display = 'none';
  circuitosSection.style.display = 'block';
});

// Volver desde pistas
volverMenu2.addEventListener('click', () => {
  circuitosSection.style.display = 'none';
  modeSelect.style.display = 'flex';
});

// Control de audio
const audio = document.getElementById('ambient-audio');
const audioToggle = document.getElementById('audio-toggle');
const volumeSlider = document.getElementById('audio-volume');

audioToggle.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    audioToggle.textContent = '🔈';
  } else {
    audio.pause();
    audioToggle.textContent = '🔊';
  }
});

volumeSlider.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});




