// === ELEMENTOS PRINCIPALES ===
const startBtn = document.getElementById("start-btn");
const modeSelect = document.getElementById("mode-select");
const home = document.getElementById("home");
const autosScreen = document.getElementById("autos-screen");
const detalleAuto = document.getElementById("detalle-auto");
const pistasScreen = document.getElementById("pistas-screen");
const detallePista = document.getElementById("detalle-pista");

// detalle auto elements
const autoImg = document.getElementById("auto-img");
const pilotoImg = document.getElementById("piloto-img");
const autoNombre = document.getElementById("auto-nombre");
const autoTitle = document.getElementById("auto-title");
const autoDescripcion = document.getElementById("auto-descripcion");
const autoStats = document.getElementById("auto-stats");
const statVel = document.getElementById("stat-vel");
const statAcel = document.getElementById("stat-acel");
const statControl = document.getElementById("stat-control");
const statDif = document.getElementById("stat-dif");
const pilotoNombre = document.getElementById("piloto-nombre");
const pilotoDescripcion = document.getElementById("piloto-descripcion");

// pistas elements
const pistaImg = document.getElementById("pista-img");
const pistaNombre = document.getElementById("pista-nombre");
const pistaDescripcion = document.getElementById("pista-descripcion");
const pistaAuto = document.getElementById("pista-auto");
const pistaBg = document.getElementById("pista-bg");

// botones
const backHome = document.getElementById("back-home");
const btnUnJugador = document.getElementById("btn-un-jugador");
const volverAutos = document.getElementById("volver-autos");
const toPistas = document.getElementById("to-pistas");
const backDetalleAuto = document.getElementById("back-detalle-auto");
const volverPistas = document.getElementById("volver-pistas");
const iniciarCarrera = document.getElementById("iniciar-carrera");

// === DATOS DE AUTOS ===
const dataAutos = {
  chrono: {
    nombre: "Chrono Drifter",
    img: "chro.png",
    pilotoImg: "copilotoch.png",
    piloto: "Copiloto Chrono",
    descripcion: "Auto de tecnología temporal avanzada, diseñado para dominar circuitos urbanos cambiantes.",
    stats: "★★★★★  (Elite)",
    vel: "350 km/h",
    acel: "9.6s (0-100)",
    control: "★★★★☆",
    dif: "Alta"
  },
  dune: {
    nombre: "Dune Racer",
    img: "dune.png",
    pilotoImg: "copilotodune.png",
    piloto: "Copiloto Dune",
    descripcion: "Vehículo de alto rendimiento ideal para terrenos de arena y pistas extremas.",
    stats: "★★★★☆  (Especialista Desierto)",
    vel: "320 km/h",
    acel: "10.2s (0-100)",
    control: "★★★★★",
    dif: "Media-Alta"
  },
  inferno: {
    nombre: "Inferno",
    img: "inferno.png",
    pilotoImg: "copilotoinf.png",
    piloto: "Copiloto Inferno",
    descripcion: "Motor de plasma y carrocería de titanio ardiente. Creado para los más temerarios.",
    stats: "★★★★★  (Pura Furia)",
    vel: "380 km/h",
    acel: "8.8s (0-100)",
    control: "★★★☆☆",
    dif: "Muy Alta"
  },
  sky: {
    nombre: "Skyline",
    img: "sky.png",
    pilotoImg: "copilotosky.png",
    piloto: "Copiloto Sky",
    descripcion: "Auto aéreo de nueva generación, diseñado para pistas flotantes y maniobras imposibles.",
    stats: "★★★★☆  (Aéreo)",
    vel: "340 km/h",
    acel: "9.1s (0-100)",
    control: "★★★★☆",
    dif: "Avanzada"
  }
};

// === DATOS DE PISTAS ===
const dataPistas = {
  "chrono-city": {
    nombre: "Chrono City",
    img: "chropis.png",
    descripcion: "Una metrópolis temporal donde las luces cambian al ritmo del tiempo. Obstáculos dinámicos y curvas que alteran su patrón."
  },
  "dune-arena": {
    nombre: "Dune Arena",
    img: "dunepis.png",
    descripcion: "Arena eléctrica con tormentas. La visibilidad cambia y la tracción es clave."
  },
  "infernal-circuit": {
    nombre: "Infernal Circuit",
    img: "infernpis.png",
    descripcion: "Líneas de lava y puentes de acero. Un circuito para los que buscan adrenalina pura."
  },
  "sky-loop": {
    nombre: "Sky Loop",
    img: "skypis.png",
    descripcion: "Pistas suspendidas en el cielo entre rascacielos y auroras tecnoneon."
  }
};

// === ESTADO ACTUAL ===
let seleccionActual = { carKey: null, trackKey: null };

// === FLUJO DE PANTALLAS ===

// Inicio -> Modo de juego
startBtn.onclick = () => {
  home.classList.add("hidden");
  modeSelect.classList.remove("hidden");
};

// Modo un jugador -> Selección de autos
btnUnJugador.onclick = () => {
  modeSelect.classList.add("hidden");
  autosScreen.classList.remove("hidden");
};

// Volver desde autos al modo
backHome.onclick = () => {
  autosScreen.classList.add("hidden");
  modeSelect.classList.remove("hidden");
};

// Selección de auto
document.querySelectorAll("#autos-screen .card").forEach(card => {
  card.onclick = () => {
    const key = card.dataset.car;
    const info = dataAutos[key];
    if (!info) return;

    seleccionActual.carKey = key;

    autoImg.src = info.img;
    autoTitle.textContent = info.nombre;
    autoNombre.textContent = info.nombre;
    autoDescripcion.textContent = info.descripcion;
    autoStats.textContent = info.stats;

    statVel.textContent = info.vel;
    statAcel.textContent = info.acel;
    statControl.textContent = info.control;
    statDif.textContent = info.dif;

    pilotoImg.src = info.pilotoImg;
    pilotoNombre.textContent = info.piloto;
    pilotoDescripcion.textContent = info.descripcion;

    autosScreen.classList.add("hidden");
    detalleAuto.classList.remove("hidden");
  };
});

// Volver desde detalle de auto
volverAutos.onclick = () => {
  detalleAuto.classList.add("hidden");
  autosScreen.classList.remove("hidden");
};

// Ir a selección de pistas
toPistas.onclick = () => {
  detalleAuto.classList.add("hidden");
  pistasScreen.classList.remove("hidden");
};

// Volver desde pistas al detalle del auto
backDetalleAuto.onclick = () => {
  pistasScreen.classList.add("hidden");
  detalleAuto.classList.remove("hidden");
};

// Selección de pista -> Detalle de pista
document.querySelectorAll("#pistas-screen .card").forEach(card => {
  card.onclick = () => {
    const key = card.dataset.track;
    const pinfo = dataPistas[key];
    if (!pinfo) return;

    seleccionActual.trackKey = key;

    pistaImg.src = pinfo.img;
    pistaNombre.textContent = pinfo.nombre;
    pistaDescripcion.textContent = pinfo.descripcion;

    pistaBg.style.backgroundImage = `url('${pinfo.img}')`;
    pistaBg.style.backgroundSize = 'cover';
    pistaBg.style.backgroundPosition = 'center';

    // 🚫 Auto animado eliminado: ya no cruza la pantalla
    pistaAuto.classList.add('hidden');

    pistasScreen.classList.add("hidden");
    detallePista.classList.remove("hidden");
  };
});

// Volver desde detalle de pista
volverPistas.onclick = () => {
  detallePista.classList.add("hidden");
  pistasScreen.classList.remove("hidden");
};

// Iniciar carrera
iniciarCarrera.onclick = () => {
  alert(`¡Comenzando carrera en ${pistaNombre.textContent} con ${autoNombre.textContent}!`);
};








