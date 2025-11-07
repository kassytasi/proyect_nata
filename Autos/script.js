const startBtn = document.getElementById("start-btn");
const modeSelect = document.getElementById("mode-select");
const home = document.getElementById("home");
const autosScreen = document.getElementById("autos-screen");
const pistasScreen = document.getElementById("pistas-screen");
const infoModal = document.getElementById("info-modal");
const modalText = document.getElementById("modal-text");
const closeModal = document.getElementById("close-modal");

startBtn.addEventListener("click", () => {
  home.classList.add("hidden");
  modeSelect.classList.remove("hidden");
});

document.getElementById("btn-un-jugador").addEventListener("click", () => {
  modeSelect.classList.add("hidden");
  autosScreen.classList.remove("hidden");
});

document.getElementById("to-pistas").addEventListener("click", () => {
  autosScreen.classList.add("hidden");
  pistasScreen.classList.remove("hidden");
});

document.getElementById("back-home").addEventListener("click", () => {
  autosScreen.classList.add("hidden");
  modeSelect.classList.remove("hidden");
});

document.getElementById("back-autos").addEventListener("click", () => {
  pistasScreen.classList.add("hidden");
  autosScreen.classList.remove("hidden");
});

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    modalText.textContent = card.getAttribute("data-info");
    infoModal.classList.remove("hidden");
  });
});

closeModal.addEventListener("click", () => {
  infoModal.classList.add("hidden");
});






