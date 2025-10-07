// ---------- Datos: VEHÍCULOS ----------
const vehiculos = [
  {
    nombre: "CHRONO DRIFTER",
    clase: "S",
    imagen: "chro.png",
    velocidad: 9.5,
    aceleracion: 9.4,
    manejo: 9.3
  },
  {
    nombre: "Dune SERPENT",
    clase: "A",
    imagen: "dune.png",
    velocidad: 8.7,
    aceleracion: 8.8,
    manejo: 8.9
  },
  {
    nombre: "Inferno X1",
    clase: "S+",
    imagen: "inferno.png",
    velocidad: 9.9,
    aceleracion: 9.7,
    manejo: 9.5
  },
  {
    nombre: "Sky GLIDER",
    clase: "B",
    imagen: "sky.png",
    velocidad: 8.9,
    aceleracion: 9.0,
    manejo: 9.1
  }
];

// ---------- Datos: CIRCUITOS ----------
const circuitos = [
  {
    nombre: "Circuito CHRONO DRIFTER",
    descripcion: "Ruta urbana técnica y veloz para el vehículo Chro.",
    dificultad: "Alta",
    imagen: "chropis.png"
  },
  {
    nombre: "Circuito Dune SERPENT",
    descripcion: "Desierto eléctrico con obstáculos desafiantes.",
    dificultad: "Media",
    imagen: "dunepis.png"
  },
  {
    nombre: "Circuito Inferno X1",
    descripcion: "Ruta infernal llena de curvas y desafíos extremos.",
    dificultad: "Extrema",
    imagen: "infernpis.png"
  },
  {
    nombre: "Circuito Sky GLIDER",
    descripcion: "Trazado aéreo con vistas y caminos abiertos.",
    dificultad: "Baja",
    imagen: "skypis.png"
  }
];

// ---------- Helper ----------
function elt(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

// ---------- Render funciones ----------
function renderVehiculos(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  vehiculos.forEach(v => {
    const card = elt('article','card fade-up');
    card.innerHTML = `
      <div class="glow" aria-hidden="true"></div>
      <img src="${v.imagen}" alt="${v.nombre}">
      <div class="info">
        <h3>${v.nombre}</h3>
        <div class="stats">🚀 Vel: ${v.velocidad} &nbsp;⚡ Acel: ${v.aceleracion} &nbsp;🎯 Man: ${v.manejo}</div>
      </div>
    `;
    card.addEventListener('mouseenter', ()=> card.classList.add('active'));
    card.addEventListener('mouseleave', ()=> card.classList.remove('active'));
    target.appendChild(card);
  });
}

function renderCircuitos(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  circuitos.forEach(c => {
    const div = elt('div','circuit fade-up');
    div.innerHTML = `
      <img src="${c.imagen}" alt="${c.nombre}">
      <div class="meta">
        <h3>${c.nombre}</h3>
        <p style="color:#9fb7d9;margin:6px 0">${c.descripcion}</p>
        <div class="difficulty" style="background:linear-gradient(90deg,#00f7ff,#9b59ff)">${c.dificultad}</div>
      </div>
    `;
    div.addEventListener('mouseenter', ()=>div.classList.add('active'));
    div.addEventListener('mouseleave', ()=>div.classList.remove('active'));
    target.appendChild(div);
  });
}

// ---------- IntersectionObserver ----------
function setupObserver() {
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
}

// ---------- Audio ----------
const ambientSrc = 'assets/ambient.mp3';  // Ajusta ruta si necesitas
const audioEl = document.getElementById('ambient-audio');
const btnPlay = document.getElementById('btn-play');
const audioToggle = document.getElementById('audio-toggle');
const audioVol = document.getElementById('audio-volume');

if (audioEl) {
  audioEl.src = ambientSrc;
  audioEl.volume = audioVol ? parseFloat(audioVol.value) : 0.18;
}

if (btnPlay) {
  btnPlay.addEventListener('click', (e) => {
    if (audioEl && audioEl.paused) {
      audioEl.currentTime = 0;
      audioEl.play().catch(()=>{});
      if (audioToggle) audioToggle.setAttribute('aria-pressed','true');
    }
  });
}

if (audioToggle) {
  audioToggle.addEventListener('click', () => {
    if (!audioEl) return;
    if (audioEl.paused) {
      audioEl.play().catch(()=>{});
      audioToggle.setAttribute('aria-pressed','true');
    } else {
      audioEl.pause();
      audioToggle.setAttribute('aria-pressed','false');
    }
  });
}

if (audioVol) {
  audioVol.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    if (audioEl) audioEl.volume = v;
  });
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', ()=>{
  renderVehiculos('vehiculos-grid');
  renderCircuitos('circuitos-list');
  renderVehiculos('vehiculos-grid-page');
  renderCircuitos('circuitos-list-page');
  setTimeout(setupObserver, 120);
});
