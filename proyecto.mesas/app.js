// =====================
// Keys localStorage
// =====================
const LS_KEYS = {
  MESAS: "mesas",
  RESERVAS: "reservas"
};

// =====================
// Utilidades
// =====================
function getLS(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    return [];
  }
}
function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function genId(prefix = "id") {
  return prefix + Math.floor(Math.random() * 100000);
}
function nowISODate() {
  return new Date().toISOString().split("T")[0];
}

// ✅ función para mostrar mensajes en pantalla (Bootstrap alerts)
function showAlert(msg, type = "info", containerId = "alertContainer") {
  const area =
    document.getElementById(containerId) ||
    document.getElementById("alertArea") ||
    document.querySelector(".alert-area") ||
    null;
  if (!area) {
    console.log(`[${type}] ${msg}`);
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.className = `alert alert-${type} fade show`;
  wrapper.style.marginTop = "8px";
  wrapper.innerHTML = msg;
  area.appendChild(wrapper);
  setTimeout(() => wrapper.remove(), 3500);
}


// parse ISO-ish date/time strings safely
function parseDateTime(dateStr, timeStr) {
  // dateStr = "YYYY-MM-DD", timeStr = "HH:MM"
  return new Date(`${dateStr}T${timeStr}:00`);
}
function formatISO(dt) {
  return dt.toISOString();
}
function pad(n) { return n < 10 ? "0"+n : n; }

// =====================
// Mapeos / Constantes
// =====================
const OCASION_EMOJIS = {
  "cumpleaños": "🎂",
  "aniversario": "💖",
  "reunión de negocios": "💼",
  "graduación": "🎓",
  "compromiso": "💍",
  "amigos": "👯‍♂️",
  "cena romántica": "🌹",
  "familia": "👨‍👩‍👧‍👦",
  "despedida": "🥂",
  "otro": "✨"
};
const ESTADO_COLORES = {
  "Pendiente": "primary",
  "Confirmada": "success",
  "Finalizada": "secondary",
  "Cancelada": "dark",
  "No Show": "secondary"
};

// =====================
// Seed demo (mesas + reservas) - solo si no existen
// =====================
function randomHora(min=8, max=20) {
  const h = Math.floor(Math.random() * (max - min + 1)) + min;
  return (h < 10 ? "0" : "") + h + ":00";
}
function randomFechaSemana() {
  const hoy = new Date();
  const offset = Math.floor(Math.random() * 7);
  const f = new Date(hoy);
  f.setDate(hoy.getDate() + offset);
  return f.toISOString().split("T")[0];
}
function seedData() {
  if (!localStorage.getItem(LS_KEYS.MESAS)) {
    const demoMesas = [
      { id: "M1", capacidad: 4, ubicacion: "Terraza", estado: "disponible" },
      { id: "M2", capacidad: 2, ubicacion: "Interior", estado: "disponible" },
      { id: "M3", capacidad: 6, ubicacion: "VIP", estado: "deshabilitada" },
      { id: "M4", capacidad: 8, ubicacion: "Salón Principal", estado: "disponible" }
    ];
    setLS(LS_KEYS.MESAS, demoMesas);
  }
  if (!localStorage.getItem(LS_KEYS.RESERVAS)) {
    // ejemplo con duracion y horaFin
    const demoReservas = [
      {
        idReserva: "R1001",
        nombreCliente: "Ana López",
        numeroPersonas: 4,
        fechaReserva: randomFechaSemana(),
        horaReserva: randomHora(),
        duracionHoras: 2,
        horaFin: null, // la calculamos abajo
        idMesaAsignada: "M1",
        estado: "Confirmada",
        ocasionEspecial: "Cumpleaños",
        notasAdicionales: "Traer pastel sorpresa"
      },
      {
        idReserva: "R1002",
        nombreCliente: "Carlos Ruiz",
        numeroPersonas: 2,
        fechaReserva: randomFechaSemana(),
        horaReserva: randomHora(),
        duracionHoras: 1,
        horaFin: null,
        idMesaAsignada: "M2",
        estado: "Pendiente",
        ocasionEspecial: "Reunión de Negocios",
        notasAdicionales: ""
      }
    ];
    // calcular horaFin para demo
    demoReservas.forEach(r => {
      const inicio = parseDateTime(r.fechaReserva, r.horaReserva);
      r.horaFin = formatISO(new Date(inicio.getTime() + (r.duracionHoras || 2) * 3600000));
    });
    setLS(LS_KEYS.RESERVAS, demoReservas);
    // marcar mesas ocupadas si Confirmada
    demoReservas.forEach(r => {
      if (r.estado === "Confirmada") {
        const mesas = getLS(LS_KEYS.MESAS);
        const idx = mesas.findIndex(m => m.id === r.idMesaAsignada);
        if (idx >= 0) { mesas[idx].estado = "ocupada"; setLS(LS_KEYS.MESAS, mesas); }
      }
    });
  }
}

// =====================
// Helpers overlap
// =====================
function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// =====================
// Render Mesas
// =====================
function renderMesas() {
  const cont = document.getElementById("gridMesas");
  if (!cont) return;
  cont.innerHTML = "";
  const mesas = getLS(LS_KEYS.MESAS);

  mesas.forEach(m => {
    const col = document.createElement("div");
    col.className = "col-md-3 col-sm-6 mb-3";
    col.innerHTML = `
      <div class="card state-${m.estado}">
        <div class="card-body text-center">
          <h5 class="card-title text-light">Mesa ${m.id}</h5>
          <p class="text-light-weak mb-1">Capacidad: ${m.capacidad}</p>
          <p class="text-light-weak mb-2">Ubicación: ${m.ubicacion}</p>
          <div class="d-grid gap-2 d-md-flex justify-content-center">
            <button class="btn btn-sm btn-outline-light" data-action="edit" data-id="${m.id}">Editar</button>
            <button class="btn btn-sm btn-primary" data-action="reserve" data-id="${m.id}">Reservar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${m.id}">Eliminar</button>
          </div>
        </div>
      </div>`;
    cont.appendChild(col);
  });
}

// =====================
// Render resumen de reservas (contadores por estado)
// =====================
function renderResumenReservas() {
  const cont = document.getElementById("resumenReservas");
  if (!cont) return;
  const reservas = getLS(LS_KEYS.RESERVAS);
  const estados = ["Pendiente", "Confirmada", "Finalizada", "Cancelada", "No Show"];
  let resumenHTML = `<div class="row g-2">`;
  estados.forEach(estado => {
    const count = reservas.filter(r => r.estado === estado).length;
    if (count > 0) {
      const color = ESTADO_COLORES[estado] || "secondary";
      resumenHTML += `
        <div class="col-auto">
          <div class="card shadow-sm">
            <div class="card-body text-center p-2">
              <div class="small">${estado}</div>
              <div><span class="badge bg-${color}">${count}</span></div>
            </div>
          </div>
        </div>`;
    }
  });
  resumenHTML += `</div>`;
  cont.innerHTML = resumenHTML;
}

// =====================
// Render Reservas (tabla)
// =====================
let countdownInterval = null;
function renderReservas() {
  const cont = document.getElementById("gridReservas");
  if (!cont) return;

  const reservas = getLS(LS_KEYS.RESERVAS);

  // filtros
  const filtroFecha = document.getElementById("filtroFecha")?.value || "";
  const filtroEstado = document.getElementById("filtroEstado")?.value || "";

  const reservasFiltradas = reservas.filter(r => {
    if (filtroFecha && r.fechaReserva !== filtroFecha) return false;
    if (filtroEstado && r.estado !== filtroEstado) return false;
    return true;
  });

  if (reservasFiltradas.length === 0) {
    cont.innerHTML = `<div class="alert alert-light">No hay reservas que coincidan con los filtros.</div>`;
    renderResumenReservas();
    clearCountdownUpdater();
    return;
  }

  // construir tabla
  let html = `
    <div class="table-responsive">
      <table class="table table-hover table-striped align-middle">
        <thead class="table-light">
          <tr>
            <th>Cliente</th>
            <th>Personas</th>
            <th>Fecha</th>
            <th>Hora inicio</th>
            <th>Duración</th>
            <th>Hora fin</th>
            <th>Mesa</th>
            <th>Ocasión</th>
            <th>Estado</th>
            <th>Tiempo restante</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  reservasFiltradas.forEach(r => {
    const mesa = getLS(LS_KEYS.MESAS).find(m => m.id === r.idMesaAsignada);
    const emoji = r.ocasionEspecial ? (OCASION_EMOJIS[r.ocasionEspecial.toLowerCase()] || "") : "";
    const color = ESTADO_COLORES[r.estado] || "secondary";
    const horaFinDisplay = r.horaFin ? new Date(r.horaFin).toLocaleString().split(' ')[1] || r.horaFin : "-";

    html += `
      <tr>
        <td>${r.nombreCliente}</td>
        <td>${r.numeroPersonas}</td>
        <td>${r.fechaReserva}</td>
        <td>${r.horaReserva}</td>
        <td>${r.duracionHoras || "-"}h</td>
        <td>${r.horaFin ? new Date(r.horaFin).toLocaleString().replace(',', '') : "-"}</td>
        <td>${mesa ? `Mesa ${mesa.id} (${mesa.ubicacion})` : r.idMesaAsignada}</td>
        <td>${r.ocasionEspecial ? `${emoji} ${r.ocasionEspecial}` : "-"}</td>
        <td><span class="badge bg-${color}">${r.estado}</span></td>
        <td><span class="reservation-countdown" data-id="${r.idReserva}">-</span></td>
        <td>
          <div class="d-grid gap-1 d-md-flex">
            <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${r.idReserva}">Editar</button>
            <button class="btn btn-sm btn-success" data-action="pay" data-id="${r.idReserva}">Pagar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${r.idReserva}">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  cont.innerHTML = html;
  renderResumenReservas();
  // iniciar/actualizar updater de countdowns
  startCountdownUpdater();
}

function clearCountdownUpdater() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}
function startCountdownUpdater() {
  clearCountdownUpdater();
  countdownInterval = setInterval(() => {
    const now = new Date();
    // update each countdown span
    document.querySelectorAll('.reservation-countdown').forEach(el => {
      const id = el.dataset.id;
      const reservas = getLS(LS_KEYS.RESERVAS);
      const r = reservas.find(x => x.idReserva === id);
      if (!r || !r.horaFin) {
        el.textContent = "-";
        return;
      }
      if (r.estado !== "Confirmada") {
        // si no está confirmada, mostramos estado actual
        if (r.estado === "Finalizada") el.textContent = "Finalizada";
        else el.textContent = "-";
        return;
      }
      const fin = new Date(r.horaFin);
      const diff = fin - now;
      if (diff > 0) {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.textContent = `${h}h ${pad(m)}m ${pad(s)}s`;
      } else {
        // tiempo terminado -> finalizamos (vía función central para consistencia)
        checkReservasExpiradas();
      }
    });
  }, 1000);
}

// =====================
// Cargar mesas disponibles en el select (considera duración y solapamientos)
// Si 'mesaActual' se pasa (modo edición), aseguramos incluirla aunque esté ocupada por otra reserva.
// =====================
function cargarMesasDisponibles(mesaActual = null) {
  const select = document.getElementById("idMesaAsignada");
  const msg = document.getElementById("msgMesasDisponibles");
  if (!select || !msg) return;

  select.innerHTML = "";
  const mesas = getLS(LS_KEYS.MESAS);
  const reservas = getLS(LS_KEYS.RESERVAS);

  const fechaInput = document.getElementById("fechaReserva")?.value || "";
  const horaInput = document.getElementById("horaReserva")?.value || "";
  const duracionVal = parseInt(document.getElementById("duracionHoras")?.value || "2");
  const idReservaActual = document.getElementById("resEditId")?.value || null;

  // si no hay fecha/hora seleccionada, mostrarmos mesas que estén 'disponible' por defecto
  let mesasDisponibles = mesas.filter(m => (m.estado === "disponible" || m.id === mesaActual));

  if (fechaInput && horaInput) {
    const inicioReq = parseDateTime(fechaInput, horaInput);
    const finReq = new Date(inicioReq.getTime() + duracionVal * 3600000);

    mesasDisponibles = mesas.filter(m => {
      // permitir la mesa actual aunque no esté 'disponible' para que pueda verse en edición
      if (m.estado !== "disponible" && m.id !== mesaActual) return false;

      // verificar si hay una reserva distinta (no cancelada/no finalizada) que solape
      const ocupada = reservas.some(r => {
        if (r.idReserva === idReservaActual) return false; // si editamos, ignorar misma reserva
        if (r.estado === "Cancelada" || r.estado === "Finalizada") return false;
        if (r.idMesaAsignada !== m.id) return false;
        // si no tenemos horaFin guardada (muy raro) calculamos con duracion
        const startR = parseDateTime(r.fechaReserva, r.horaReserva);
        const endR = r.horaFin ? new Date(r.horaFin) : new Date(startR.getTime() + (r.duracionHoras||2)*3600000);
        return intervalsOverlap(inicioReq, finReq, startR, endR);
      });
      return (!ocupada) || m.id === mesaActual;
    });
  }

  // Llenar select con mesasDisponibles
  mesasDisponibles.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `Mesa ${m.id} - Capacidad: ${m.capacidad} - ${m.ubicacion}`;
    select.appendChild(opt);
  });

  if (mesasDisponibles.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No hay mesas disponibles en este horario";
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);
    msg.textContent = " No hay mesas disponibles en este horario";
    msg.className = "form-text text-danger";
  } else {
    msg.textContent = ` Mesas disponibles: ${mesasDisponibles.length}`;
    msg.className = "form-text text-success";
  }
}

// =====================
// Helpers: actualizar estado de mesas según reservas confirmadas
// =====================
function marcarMesaOcupada(idMesa) {
  const mesas = getLS(LS_KEYS.MESAS);
  const idx = mesas.findIndex(m => m.id === idMesa);
  if (idx >= 0) {
    mesas[idx].estado = "ocupada";
    setLS(LS_KEYS.MESAS, mesas);
  }
}
function liberarMesaSiCorresponde(idMesa) {
  const reservas = getLS(LS_KEYS.RESERVAS);
  // si existe alguna reserva Confirmada que solape ahora para esa mesa, la dejamos ocupada
  const ahora = new Date();
  const tieneConfirmada = reservas.some(r => {
    if (r.idMesaAsignada !== idMesa) return false;
    if (r.estado !== "Confirmada") return false;
    const startR = parseDateTime(r.fechaReserva, r.horaReserva);
    const endR = r.horaFin ? new Date(r.horaFin) : new Date(startR.getTime() + (r.duracionHoras||2)*3600000);
    return startR <= ahora && ahora < endR;
  });
  const mesas = getLS(LS_KEYS.MESAS);
  const idx = mesas.findIndex(m => m.id === idMesa);
  if (idx >= 0) {
    mesas[idx].estado = tieneConfirmada ? "ocupada" : "disponible";
    setLS(LS_KEYS.MESAS, mesas);
  }
}

// =====================
// Cron: revisar reservas expiradas (cada 1s para precisión)
// =====================
function checkReservasExpiradas() {
  let reservas = getLS(LS_KEYS.RESERVAS);
  let mesas = getLS(LS_KEYS.MESAS);
  const ahora = new Date();
  let cambios = false;

  reservas.forEach((r, i) => {
    if (r.estado === "Confirmada" && r.horaFin) {
      const fin = new Date(r.horaFin);
      if (ahora >= fin) {
        reservas[i].estado = "Finalizada";
        // liberar mesa asociada (si corresponde)
        const idxMesa = mesas.findIndex(m => m.id === r.idMesaAsignada);
        if (idxMesa >= 0) {
          mesas[idxMesa].estado = "disponible";
        }
        cambios = true;
      }
    }
  });

  if (cambios) {
    setLS(LS_KEYS.RESERVAS, reservas);
    setLS(LS_KEYS.MESAS, mesas);
    renderMesas();
    renderReservas();
    showAlert("Reservas finalizadas automáticamente (tiempo cumplido).", "info");
  }
}

// =====================
// Iniciar Mesas: CRUD + acciones
// =====================
function initMesas() {
  renderMesas();

  const btnNuevaMesa = document.getElementById("btnNuevaMesa") || document.querySelector('[data-bs-target="#modalMesa"]');
  if (btnNuevaMesa) {
    btnNuevaMesa.addEventListener("click", () => {
      if (document.getElementById("mesaEditId")) document.getElementById("mesaEditId").value = "";
      if (document.getElementById("capacidad")) document.getElementById("capacidad").value = "";
      if (document.getElementById("ubicacion")) document.getElementById("ubicacion").value = "";
      if (document.getElementById("estadoMesa")) document.getElementById("estadoMesa").value = "disponible";
      const modalEl = document.getElementById("modalMesa");
      if (modalEl) new bootstrap.Modal(modalEl).show();
    });
  }

  // Guardar mesa
  const formMesa = document.getElementById("formMesa");
  if (formMesa) {
    formMesa.addEventListener("submit", e => {
      e.preventDefault();
      let mesas = getLS(LS_KEYS.MESAS);
      const idEdit = document.getElementById("mesaEditId")?.value || "";
      let idCampo = document.getElementById("idMesa")?.value || null;
      if (!idCampo && !idEdit) idCampo = "M" + new Date().getTime().toString().slice(-4);
      const capacidad = parseInt(document.getElementById("capacidad")?.value || "1");
      const ubicacion = document.getElementById("ubicacion")?.value || "General";
      const estado = document.getElementById("estadoMesa")?.value || "disponible";

      const nuevaMesa = { id: idCampo, capacidad: capacidad, ubicacion: ubicacion, estado: estado };

      if (idEdit) {
        const idx = mesas.findIndex(m => m.id === idEdit);
        if (idx >= 0) mesas[idx] = nuevaMesa;
        showAlert("Mesa actualizada", "success");
      } else {
        if (mesas.find(m => m.id === nuevaMesa.id)) {
          showAlert("Ya existe una mesa con ese ID", "danger");
          return;
        }
        mesas.push(nuevaMesa);
        showAlert("Mesa creada", "success");
      }

      setLS(LS_KEYS.MESAS, mesas);
      renderMesas();
      const modalEl = document.getElementById("modalMesa");
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
      }
    });
  }

  // acciones de gridMesas
  const gridMesas = document.getElementById("gridMesas");
  if (gridMesas) {
    gridMesas.addEventListener("click", e => {
      const action = e.target.dataset.action;
      const id = e.target.dataset.id;
      if (!action) return;

      if (action === "edit") {
        const mesa = getLS(LS_KEYS.MESAS).find(m => m.id === id);
        if (!mesa) return;
        if (document.getElementById("mesaEditId")) document.getElementById("mesaEditId").value = mesa.id;
        if (document.getElementById("capacidad")) document.getElementById("capacidad").value = mesa.capacidad;
        if (document.getElementById("ubicacion")) document.getElementById("ubicacion").value = mesa.ubicacion;
        if (document.getElementById("estadoMesa")) document.getElementById("estadoMesa").value = mesa.estado;
        const modalEl = document.getElementById("modalMesa");
        if (modalEl) new bootstrap.Modal(modalEl).show();
      }

      if (action === "delete") {
        let mesas = getLS(LS_KEYS.MESAS);
        mesas = mesas.filter(m => m.id !== id);
        setLS(LS_KEYS.MESAS, mesas);
        renderMesas();
        showAlert("Mesa eliminada", "success");
      }

      if (action === "reserve") {
        localStorage.setItem("mesaSeleccionada", id);
        if (document.body.dataset.page === "reservas") {
          cargarMesasDisponibles(id);
          const sel = document.getElementById("idMesaAsignada");
          if (sel) sel.value = id;
          const modalEl = document.getElementById("modalReserva");
          if (modalEl) new bootstrap.Modal(modalEl).show();
        } else {
          window.location.href = "reservas.html";
        }
      }
    });
  }
}

// =====================
// Iniciar Reservas: CRUD + filtros + botones rápidos
// =====================
function initReservas() {
  renderReservas();
  cargarMesasDisponibles();

  // botones rápidos
  document.getElementById("btnHoy")?.addEventListener("click", (e) => {
    e.preventDefault();
    const hoy = new Date();
    document.getElementById("filtroFecha").value = hoy.toISOString().split("T")[0];
    renderReservas();
  });
  document.getElementById("btnMañana")?.addEventListener("click", (e) => {
    e.preventDefault();
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    document.getElementById("filtroFecha").value = manana.toISOString().split("T")[0];
    renderReservas();
  });
  document.getElementById("btnSemana")?.addEventListener("click", (e) => {
    e.preventDefault();
    const inicio = new Date();
    const fin = new Date();
    fin.setDate(fin.getDate() + 6);
    const reservas = getLS(LS_KEYS.RESERVAS);
    const filtradas = reservas.filter(r => {
      const fr = new Date(r.fechaReserva);
      return fr >= new Date(inicio.toDateString()) && fr <= new Date(fin.toDateString());
    });
    const cont = document.getElementById("gridReservas");
    if (!cont) return;
    if (filtradas.length === 0) cont.innerHTML = `<div class="alert alert-light">No hay reservas esta semana.</div>`;
    else {
      // reusar renderizar: mostramos temporalmente los filtrados (simple: guardar LS temporal? para mantener consistencia mejor render full)
      // para simplicidad recalculamos la tabla parcial:
      let html = `
        <div class="table-responsive">
          <table class="table table-hover table-striped align-middle">
            <thead class="table-light">
              <tr>
                <th>Cliente</th><th>Personas</th><th>Fecha</th><th>Hora inicio</th><th>Duración</th><th>Hora fin</th>
                <th>Mesa</th><th>Ocasión</th><th>Estado</th><th>Tiempo restante</th><th>Operaciones</th>
              </tr>
            </thead><tbody>
      `;
      filtradas.forEach(r => {
        const mesa = getLS(LS_KEYS.MESAS).find(m => m.id === r.idMesaAsignada);
        const emoji = r.ocasionEspecial ? (OCASION_EMOJIS[r.ocasionEspecial.toLowerCase()]||"") : "";
        const color = ESTADO_COLORES[r.estado] || "secondary";
        html += `
          <tr>
            <td>${r.nombreCliente}</td>
            <td>${r.numeroPersonas}</td>
            <td>${r.fechaReserva}</td>
            <td>${r.horaReserva}</td>
            <td>${r.duracionHoras || '-'}h</td>
            <td>${r.horaFin ? new Date(r.horaFin).toLocaleString().replace(',', '') : '-'}</td>
            <td>${mesa ? `Mesa ${mesa.id} (${mesa.ubicacion})` : r.idMesaAsignada}</td>
            <td>${r.ocasionEspecial ? `${emoji} ${r.ocasionEspecial}` : '-'}</td>
            <td><span class="badge bg-${color}">${r.estado}</span></td>
            <td><span class="reservation-countdown" data-id="${r.idReserva}">-</span></td>
            <td>
              <div class="d-grid gap-1 d-md-flex">
                <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${r.idReserva}">Editar</button>
                <button class="btn btn-sm btn-success" data-action="pay" data-id="${r.idReserva}">Pagar</button>
                <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${r.idReserva}">Eliminar</button>
              </div>
            </td>
          </tr>
        `;
      });
      html += `</tbody></table></div>`;
      cont.innerHTML = html;
    }
    renderResumenReservas();
    startCountdownUpdater();
  });

  // filtros
  document.getElementById("filtroFecha")?.addEventListener("change", renderReservas);
  document.getElementById("filtroEstado")?.addEventListener("change", renderReservas);
  document.getElementById("btnLimpiarFiltros")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (document.getElementById("filtroFecha")) document.getElementById("filtroFecha").value = "";
    if (document.getElementById("filtroEstado")) document.getElementById("filtroEstado").value = "";
    renderReservas();
  });

  // Si venimos desde "Reservar" en mesas
  const mesaSeleccionada = localStorage.getItem("mesaSeleccionada");
  if (mesaSeleccionada) {
    cargarMesasDisponibles(mesaSeleccionada);
    const sel = document.getElementById("idMesaAsignada");
    if (sel) sel.value = mesaSeleccionada;
    localStorage.removeItem("mesaSeleccionada");
    const modalEl = document.getElementById("modalReserva");
    if (modalEl) new bootstrap.Modal(modalEl).show();
  }

  // abrir modal nueva reserva
  const btnNuevaReserva = document.getElementById("btnNuevaReserva") || document.querySelector('[data-bs-target="#modalReserva"]');
  if (btnNuevaReserva) {
    btnNuevaReserva.addEventListener("click", () => {
      if (document.getElementById("resEditId")) document.getElementById("resEditId").value = "";
      const form = document.getElementById("formReserva");
      if (form) form.reset();
      // set defaults
      document.getElementById("duracionHoras").value = "2";
      cargarMesasDisponibles();
      const modalEl = document.getElementById("modalReserva");
      if (modalEl) new bootstrap.Modal(modalEl).show();
    });
  }

  // actualizar select cuando cambian fecha/hora/duración (reactividad)
  document.getElementById("fechaReserva")?.addEventListener("change", () => cargarMesasDisponibles());
  document.getElementById("horaReserva")?.addEventListener("change", () => cargarMesasDisponibles());
  document.getElementById("duracionHoras")?.addEventListener("change", () => cargarMesasDisponibles());

  // submit reserva (crear/editar)
  const formReserva = document.getElementById("formReserva");
  if (formReserva) {
    formReserva.addEventListener("submit", (e) => {
      e.preventDefault();
      let reservas = getLS(LS_KEYS.RESERVAS);
      let mesas = getLS(LS_KEYS.MESAS);

      const idEdit = document.getElementById("resEditId")?.value || "";
      const nombreCliente = (document.getElementById("nombreCliente")?.value || "").trim();
      const numeroPersonas = parseInt(document.getElementById("numeroPersonas")?.value || "0");
      const fechaReservaVal = document.getElementById("fechaReserva")?.value || "";
      const horaReservaVal = document.getElementById("horaReserva")?.value || "";
      const duracionVal = parseInt(document.getElementById("duracionHoras")?.value || "2");
      const idMesaAsignadaVal = document.getElementById("idMesaAsignada")?.value || "";
      const estadoVal = document.getElementById("estadoReserva")?.value || "Pendiente";
      const ocasionVal = document.getElementById("ocasionEspecial")?.value || "";
      const notasVal = document.getElementById("notasAdicionales")?.value || "";

      // validaciones básicas
      if (!nombreCliente) { showAlert("El nombre del cliente es obligatorio", "danger"); return; }
      if (!numeroPersonas || numeroPersonas <= 0) { showAlert("El número de personas debe ser mayor a cero", "danger"); return; }
      if (!fechaReservaVal) { showAlert("La fecha es obligatoria", "danger"); return; }
      if (!horaReservaVal) { showAlert("La hora es obligatoria", "danger"); return; }

      // Validación hora inicio 08:00 - 20:00
      const [h, min] = horaReservaVal.split(":").map(Number);
      if (isNaN(h) || h < 8 || (h === 20 && min > 0) || h > 20) {
        showAlert("La hora debe estar entre 08:00 y 20:00", "danger"); return;
      }

      // Fecha/hora posterior a "ahora"
      const fechaHora = parseDateTime(fechaReservaVal, horaReservaVal);
      if (fechaHora <= new Date()) { showAlert("La fecha y hora deben ser posteriores a la actual", "danger"); return; }

      // calcular horaFin y validar que no sobrepase 20:00 del mismo día
      const fechaHoraFin = new Date(fechaHora.getTime() + duracionVal * 3600000);
      const maxFin = parseDateTime(fechaReservaVal, "20:00");
      if (fechaHoraFin > maxFin) { showAlert("La duración excede el horario permitido (debe terminar antes o a las 20:00)", "danger"); return; }

      // Validar que exista una mesa disponible seleccionada (y que no sea el mensaje "No hay mesas")
      const selectMesa = document.getElementById("idMesaAsignada");
      if (!selectMesa || selectMesa.options.length === 0 || !selectMesa.value || selectMesa.disabled) {
        showAlert("No hay mesas disponibles para la fecha y hora seleccionadas", "danger"); return;
      }

      const nuevaReserva = {
        idReserva: idEdit || genId("R"),
        nombreCliente: nombreCliente,
        numeroPersonas: numeroPersonas,
        fechaReserva: fechaReservaVal,
        horaReserva: horaReservaVal,
        duracionHoras: duracionVal,
        horaFin: formatISO(fechaHoraFin),
        idMesaAsignada: idMesaAsignadaVal,
        estado: estadoVal,
        ocasionEspecial: ocasionVal,
        notasAdicionales: notasVal
      };

      if (idEdit) {
        const idx = reservas.findIndex(r => r.idReserva === idEdit);
        if (idx >= 0) {
          const old = reservas[idx];
          reservas[idx] = nuevaReserva;

          // si cambió mesa y antigua reserva estaba Confirmada -> liberar antigua mesa
          if (old.idMesaAsignada && old.idMesaAsignada !== nuevaReserva.idMesaAsignada && old.estado === "Confirmada") {
            liberarMesaSiCorresponde(old.idMesaAsignada);
          }
          // si estado cambió a Confirmada -> ocupar mesa
          if (nuevaReserva.estado === "Confirmada") {
            marcarMesaOcupada(nuevaReserva.idMesaAsignada);
          } else {
            // si quedó no confirmada y antes estaba confirmada => intentar liberar mesa
            if (old.estado === "Confirmada" && nuevaReserva.estado !== "Confirmada") {
              liberarMesaSiCorresponde(old.idMesaAsignada);
            }
          }
          showAlert("Reserva actualizada", "success");
        }
      } else {
        // antes de insertar verificamos solapamiento real con duración
        const inicioReq = fechaHora;
        const finReq = fechaHoraFin;
        const haySolapamiento = reservas.some(r =>
          r.idMesaAsignada === nuevaReserva.idMesaAsignada &&
          r.estado !== "Cancelada" && r.estado !== "Finalizada" &&
          intervalsOverlap(inicioReq, finReq, parseDateTime(r.fechaReserva, r.horaReserva), r.horaFin ? new Date(r.horaFin) : new Date(parseDateTime(r.fechaReserva, r.horaReserva).getTime() + (r.duracionHoras||2)*3600000))
        );
        if (haySolapamiento) {
          showAlert("La mesa seleccionada ya tiene una reserva en ese horario", "danger");
          return;
        }

        reservas.push(nuevaReserva);
        showAlert("Reserva creada", "success");
      }

      setLS(LS_KEYS.RESERVAS, reservas);

      // Si la reserva quedó Confirmada, marcamos mesa ocupada
      if (nuevaReserva.estado === "Confirmada") {
        marcarMesaOcupada(nuevaReserva.idMesaAsignada);
      }

      renderReservas();
      cargarMesasDisponibles();
      const modalEl = document.getElementById("modalReserva");
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
      }
    });
  }

  // acciones en gridReservas: edit / delete / pay
  const gridReservas = document.getElementById("gridReservas");
  if (gridReservas) {
    gridReservas.addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      const id = e.target.dataset.id;
      if (!action) return;

      if (action === "edit") {
        const r = getLS(LS_KEYS.RESERVAS).find(x => x.idReserva === id);
        if (!r) return;
        // cargar datos al modal (edición)
        if (document.getElementById("resEditId")) document.getElementById("resEditId").value = r.idReserva;
        if (document.getElementById("nombreCliente")) document.getElementById("nombreCliente").value = r.nombreCliente;
        if (document.getElementById("numeroPersonas")) document.getElementById("numeroPersonas").value = r.numeroPersonas;
        if (document.getElementById("fechaReserva")) document.getElementById("fechaReserva").value = r.fechaReserva;
        if (document.getElementById("horaReserva")) document.getElementById("horaReserva").value = r.horaReserva;
        if (document.getElementById("duracionHoras")) document.getElementById("duracionHoras").value = (r.duracionHoras || "2");
        cargarMesasDisponibles(r.idMesaAsignada);
        if (document.getElementById("idMesaAsignada")) document.getElementById("idMesaAsignada").value = r.idMesaAsignada;
        if (document.getElementById("estadoReserva")) document.getElementById("estadoReserva").value = r.estado;
        if (document.getElementById("ocasionEspecial")) document.getElementById("ocasionEspecial").value = r.ocasionEspecial;
        if (document.getElementById("notasAdicionales")) document.getElementById("notasAdicionales").value = r.notasAdicionales || "";
        const modalEl = document.getElementById("modalReserva");
        if (modalEl) new bootstrap.Modal(modalEl).show();
      }

      if (action === "delete") {
        let reservas = getLS(LS_KEYS.RESERVAS);
        const toDelete = reservas.find(r => r.idReserva === id);
        reservas = reservas.filter(r => r.idReserva !== id);
        setLS(LS_KEYS.RESERVAS, reservas);
        if (toDelete && toDelete.estado === "Confirmada" && toDelete.idMesaAsignada) {
          liberarMesaSiCorresponde(toDelete.idMesaAsignada);
        }
        renderReservas();
        cargarMesasDisponibles();
        showAlert("Reserva eliminada", "success");
      }

      if (action === "pay") {
        const reservas = getLS(LS_KEYS.RESERVAS);
        const idx = reservas.findIndex(r => r.idReserva === id);
        if (idx >= 0) {
          reservas[idx].estado = "Finalizada";
          setLS(LS_KEYS.RESERVAS, reservas);

          // liberar mesa asociada
          const mesas = getLS(LS_KEYS.MESAS);
          const idxMesa = mesas.findIndex(m => m.id === reservas[idx].idMesaAsignada);
          if (idxMesa >= 0) {
            mesas[idxMesa].estado = "disponible";
            setLS(LS_KEYS.MESAS, mesas);
          }

          renderReservas();
          cargarMesasDisponibles();
          showAlert("Reserva pagada y mesa liberada", "success");
        }
      }
    });
  }
}

// =====================
// Inicialización global
// =====================
document.addEventListener("DOMContentLoaded", () => {
  seedData();

  // iniciar cron para expiración cada 1s (precisión para segundos)
  setInterval(checkReservasExpiradas, 1000);

  const page = document.body.dataset.page || "";
  if (page === "mesas" || page === "") initMesas();
  if (page === "reservas" || page === "") initReservas();
});

