
function getData(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; }
}
function saveData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }


const __APP_ACTIVE_ALERTS = new Set();
let __APP_AUTO_CHECK_ID = null;

/* IDs */
function generateMesaShortId() {
  const mesas = getData("mesas") || [];
  const nums = mesas.map(m => {
    const match = String(m.id).match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
  });
  const max = nums.length ? Math.max(...nums) : 0;
  return "mesa" + String(max + 1).padStart(2, "0");
}
function generateReservaId() {
  const reservas = getData("reservas") || [];
  const nums = reservas.map(r => {
    const candidate = r.idReserva || r.id || "";
    const match = String(candidate).match(/R0*([0-9]+)/i);
    return match ? Number(match[1]) : 0;
  });
  const max = nums.length ? Math.max(...nums) : 0;
  return "R" + String(max + 1).padStart(3, "0");
}

/* ---------------- ALERTAS (bootstrap) - DEDUPLICACIÓN ---------------- */

function showAlert(msg, type = "info", ms = 3500) {
  if (!msg && msg !== 0) return;
  const map = { info: "info", success: "success", danger: "danger", warning: "warning" };
  // Normalizar tipo para clases y nuestra lógica
  let tt = String(type || "info").toLowerCase();
  if (tt === "exito" || tt === "éxito" || tt === "success") tt = "success";
  if (tt === "error" || tt === "danger") tt = "danger";
  if (tt === "advertencia" || tt === "warning") tt = "warning";
  if (tt === "info") tt = "info";

  const key = `${tt}::${String(msg)}`;

  // Dedupe: si ya existe exacto, no volver a mostrar
  if (__APP_ACTIVE_ALERTS.has(key)) return;

  // Buscar contenedor existente
  let area = document.getElementById("alertContainer") || document.getElementById("alertBox");
  // Si no hay contenedor, crear uno fijo arriba-derecha
  if (!area) {
    area = document.createElement("div");
    area.id = "alertContainer";
    // estilos mínimos para posicionarlo si no tienes CSS para esto
    area.style.position = "fixed";
    area.style.top = "20px";
    area.style.right = "20px";
    area.style.zIndex = 9999;
    area.style.display = "flex";
    area.style.flexDirection = "column";
    area.style.gap = "10px";
    document.body.appendChild(area);
  }

  // Marca como activo para evitar duplicados (hasta que se elimine)
  __APP_ACTIVE_ALERTS.add(key);

  // Crear elemento alerta (Bootstrap-compatible markup)
  const el = document.createElement("div");
  const bsClass = `alert alert-${map[tt] || "info"} alert-dismissible fade show`;
  el.className = bsClass;
  el.setAttribute("role", "alert");
  // insertar contenido y botón cerrar (mantener compatibilidad)
  el.innerHTML = `${msg} <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

  // Añadir a contenedor
  area.appendChild(el);

  // Timeout para autodestruir (con limpieza)
  let closed = false;
  const cleanup = () => {
    if (closed) return;
    closed = true;
    try { el.remove(); } catch (e) {}
    __APP_ACTIVE_ALERTS.delete(key);
  };

  // Manejo botón cerrar (bootstrap o fallback)
  const btnClose = el.querySelector(".btn-close");
  if (btnClose) {
    btnClose.addEventListener("click", () => {
      // permitir que bootstrap haga su trabajo si está presente
      setTimeout(cleanup, 50);
    });
  }

  // Si bootstrap está presente y tiene API, intentar usarla para cerrar
  const autoClose = setTimeout(() => {
    try {
      // si existe instancia bootstrap para ese elemento, usar close()
      if (typeof bootstrap !== "undefined" && bootstrap.Alert && typeof bootstrap.Alert.getInstance === "function") {
        try {
          const inst = bootstrap.Alert.getOrCreateInstance(el);
          if (inst && typeof inst.close === "function") {
            inst.close();
          } else {
            cleanup();
          }
        } catch (e) {
          cleanup();
        }
      } else {
        // fallback: simplemente eliminar
        cleanup();
      }
    } catch (e) {
      cleanup();
    }
  }, (typeof ms === "number" && ms > 0) ? ms : 3500);

  // Asegurar limpieza si el elemento es removido por otra causa
  const observer = new MutationObserver(() => {
    if (!document.body.contains(el)) {
      clearTimeout(autoClose);
      __APP_ACTIVE_ALERTS.delete(key);
      try { observer.disconnect(); } catch (e) {}
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Evento DOMNodeRemoved adicional (compatibilidad con navegadores/implementaciones)
  el.addEventListener("DOMNodeRemoved", () => {
    clearTimeout(autoClose);
    __APP_ACTIVE_ALERTS.delete(key);
    try { observer.disconnect(); } catch (e) {}
  });
}

/* ---------------- VALIDACIÓN UI ---------------- */
function setInvalid(input, message) {
  if (!input) return;
  input.classList.add("is-invalid");
  let fb = input.parentElement.querySelector(".invalid-feedback");
  if (!fb) { fb = document.createElement("div"); fb.className = "invalid-feedback"; input.parentElement.appendChild(fb); }
  fb.textContent = message;
}
function clearInvalid(input) {
  if (!input) return;
  input.classList.remove("is-invalid");
  const fb = input.parentElement.querySelector(".invalid-feedback");
  if (fb) fb.textContent = "";
}
function clearAllValidation(formEl) {
  if (!formEl) return;
  formEl.querySelectorAll(".is-invalid, .is-valid").forEach(el => {
    el.classList.remove("is-invalid", "is-valid");
    const fb = el.parentElement.querySelector(".invalid-feedback");
    if (fb) fb.textContent = "";
  });
}

/* ---------------- FECHAS / TIEMPO ---------------- */
function timeToMinutes(t) {
  if (!t || typeof t !== "string") return NaN;
  const p = t.split(":").map(Number);
  if (p.length < 2) return NaN;
  return p[0] * 60 + p[1];
}
function parseYMD(ymd) {
  if (!ymd) return null;
  const p = String(ymd).split("-").map(Number);
  if (p.length < 3) return null;
  return new Date(p[0], p[1] - 1, p[2]);
}
function parseDateTime(dateYMD, timeHHMM) {
  const d = parseYMD(dateYMD);
  if (!d) return null;
  const parts = String(timeHHMM || "00:00").split(":").map(Number);
  d.setHours(parts[0] || 0, parts[1] || 0, 0, 0);
  return d;
}
function sameDate(a, b) {
  const da = parseYMD(a), db = parseYMD(b);
  if (!da || !db) return false;
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}
function msToHMS(ms) {
  if (ms < 0) ms = 0;
  const totalS = Math.floor(ms / 1000);
  const h = Math.floor(totalS / 3600);
  const m = Math.floor((totalS % 3600) / 60);
  const s = totalS % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function formatDateYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ---------------- MESAS HELPERS ---------------- */
function renumberMesas(mesas) { mesas.forEach((m,i) => { m.numero = i+1; }); }
function formatMesaNumero(n) { return String(n || 0).padStart(2, "0"); }

/* ---------------- RESET MESAS ---------------- */
function resetMesas() {
  const mesasIniciales = [
    { id: "mesa01", capacidad: 2, ubicacion: "Ventana", estado: "ocupada" },
    { id: "mesa02", capacidad: 4, ubicacion: "Interior", estado: "disponible" },
    { id: "mesa03", capacidad: 6, ubicacion: "VIP", estado: "deshabilitada" },
    { id: "mesa04", capacidad: 8, ubicacion: "Jardín", estado: "disponible" }
  ];
  mesasIniciales.forEach(m => m.capacidad = Number(m.capacidad));
  renumberMesas(mesasIniciales);
  saveData("mesas", mesasIniciales);
  saveData("reservas", getData("reservas") || []);
  showAlert("Mesas reiniciadas correctamente.", "success");
}

/* ---------------- CONFIRM DELETE MODAL ---------------- */
(function ensureConfirmModal() {
  if (!document.getElementById("confirmModal")) {
    const modalHtml = `
      <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header bg-danger text-white">
              <h5 class="modal-title">Confirmar eliminación</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="confirmModalBody">¿Estás seguro que deseas eliminar este elemento?</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" id="confirmDeleteBtn" class="btn btn-danger">Eliminar</button>
            </div>
          </div>
        </div>
      </div>`;
    const tmp = document.createElement("div"); tmp.innerHTML = modalHtml;
    document.body.appendChild(tmp.firstElementChild);
  }
})();
let _pendingDeleteAction = null;
function confirmDelete(action, message = null) {
  _pendingDeleteAction = action;
  const body = document.getElementById("confirmModalBody");
  if (body && message) body.textContent = message;
  try {
    new bootstrap.Modal(document.getElementById("confirmModal")).show();
  } catch (e) {
    // fallback: ejecutar acción si modal no disponible
    if (typeof _pendingDeleteAction === "function") { try { _pendingDeleteAction(); } catch (er) {} }
    _pendingDeleteAction = null;
  }
}
document.addEventListener("click", (ev) => {
  if (ev.target && ev.target.id === "confirmDeleteBtn") {
    if (typeof _pendingDeleteAction === "function") {
      try { _pendingDeleteAction(); } catch (e) { console.error(e); }
      _pendingDeleteAction = null;
    }
    try { bootstrap.Modal.getInstance(document.getElementById("confirmModal")).hide(); } catch (e) {}
  }
});

/* ---------------- SINCRONIZACIÓN POR TIEMPO ---------------- */
/* Actualiza estados de reservas por el tiempo actual; devuelve true si hubo cambios */
function actualizarReservasPorTiempo() {
  const reservas = getData("reservas") || [];
  const mesas = getData("mesas") || [];
  const ahora = new Date();
  let changed = false;

  reservas.forEach(r => {
    const fecha = r.fecha || r.fechaReserva;
    const hora = r.hora || r.horaReserva;
    const dur = Number(r.duracion || r.duracionReserva || 1);
    if (!fecha || !hora) return;
    const inicio = parseDateTime(fecha, hora);
    if (!inicio) return;
    const fin = new Date(inicio.getTime() + dur * 3600000);
    const mesaId = r.idMesaAsignada || r.idMesa;
    const mi = mesas.findIndex(m => m.id === mesaId);

    if (ahora > fin) {
      if (r.estado !== "Finalizada") { r.estado = "Finalizada"; changed = true; }
      if (mi >= 0 && mesas[mi].estado !== "deshabilitada" && mesas[mi].estado !== "disponible") { mesas[mi].estado = "disponible"; changed = true; }
    } else if (ahora >= inicio && ahora < fin) {
      if (r.estado !== "Confirmada") { r.estado = "Confirmada"; changed = true; }
      if (mi >= 0 && mesas[mi].estado !== "deshabilitada" && mesas[mi].estado !== "ocupada") { mesas[mi].estado = "ocupada"; changed = true; }
    }
  });

  if (changed) {
    saveData("reservas", reservas);
    saveData("mesas", mesas);
  }
  return changed;
}

/* Auto-check mejorado: NO recargar la página para evitar bucles y alertas repetidas */
(function startAutoCheckAndReload() {
  // No crear múltiples intervals
  if (__APP_AUTO_CHECK_ID) return;

  // sync immediate (si cambia, actualiza vistas en lugar de recargar)
  if (actualizarReservasPorTiempo()) {
    try { renderReservas(); renderMesas(); } catch (e) {}
  }

  __APP_AUTO_CHECK_ID = setInterval(() => {
    try {
      if (actualizarReservasPorTiempo()) {
        renderReservas();
        renderMesas();
      }
    } catch (e) {
      console.error("Error en auto-check:", e);
    }
  }, 60000);
})();

/* ---------------- RENDER MESAS (plano) ---------------- */
function renderMesas() {
  const grid = document.getElementById("gridMesas");
  if (!grid) return;
  let mesas = getData("mesas") || [];

  if (!mesas || mesas.length === 0) {
    resetMesas();
    mesas = getData("mesas") || [];
  }

  // sincroniza antes de renderizar
  actualizarReservasPorTiempo();
  mesas = getData("mesas") || [];
  mesas.forEach(m => m.capacidad = Number(m.capacidad || 0));
  renumberMesas(mesas);
  saveData("mesas", mesas);

  mesas.sort((a,b) => (a.numero||0) - (b.numero||0));
  grid.innerHTML = "";

  mesas.forEach(m => {
    const col = document.createElement("div");
    col.className = "col-md-3";

    const estado = (m.estado || "disponible").toLowerCase();
    let cardClass = "bg-secondary text-white";
    if (estado === "disponible") cardClass = "bg-success text-white";
    else if (estado === "ocupada") cardClass = "bg-primary text-white";
    else if (estado === "deshabilitada") cardClass = "bg-dark text-white";

    const num = (m.numero !== undefined) ? formatMesaNumero(m.numero) : formatMesaNumero(0);

    col.innerHTML = `
      <div class="card ${cardClass}">
        <div class="card-body text-center">
          <h5 class="card-title">Mesa ${num}</h5>
          <p class="mb-1">Capacidad: ${Number(m.capacidad)}</p>
          <p class="mb-1">Ubicación: ${m.ubicacion || "-"}</p>
          <p class="mb-2"><strong>Estado: ${m.estado}</strong></p>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-light" onclick="openEditMesa('${m.id}')">Editar</button>
            <button class="btn btn-sm btn-info" ${ (m.estado === "ocupada" || m.estado === "deshabilitada") ? "disabled" : "" } onclick="reservarDesdeMesa('${m.id}')">Reservar</button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(() => deleteMesa('${m.id}'), '¿Eliminar mesa ${num}?')">Eliminar</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

/* ---------------- ACCIONES MESAS ---------------- */
function openEditMesa(id) {
  const mesas = getData("mesas") || [];
  const mesa = mesas.find(m => m.id === id);
  if (!mesa) { showAlert("Mesa no encontrada", "danger"); return; }
  document.getElementById("mesaEditId").value = mesa.id;
  document.getElementById("capacidad").value = Number(mesa.capacidad);
  document.getElementById("ubicacion").value = mesa.ubicacion;
  document.getElementById("estadoMesa").value = mesa.estado || "disponible";
  const wrapper = document.getElementById("estadoMesaGroup");
  if (wrapper) wrapper.style.display = "block";
  try { new bootstrap.Modal(document.getElementById("modalMesa")).show(); } catch (e) {}
}

function deleteMesa(id) {
  const reservas = getData("reservas") || [];
  const tieneActivas = reservas.some(r => {
    const rMesa = r.idMesaAsignada || r.idMesa;
    if (!rMesa) return false;
    if (rMesa !== id) return false;
    if (r.estado === "Cancelada" || r.estado === "Finalizada") return false;
    return true;
  });
  if (tieneActivas) {
    showAlert("No se puede eliminar la mesa: existen reservas activas asociadas.", "danger");
    return;
  }
  let mesas = getData("mesas") || [];
  mesas = mesas.filter(m => m.id !== id);
  renumberMesas(mesas);
  saveData("mesas", mesas);
  renderMesas();
  populateMesaSelect();
  showAlert("Mesa eliminada", "success");
}

function reservarDesdeMesa(mesaId) {
  const mesas = getData("mesas") || [];
  const mesa = mesas.find(m => m.id === mesaId);
  if (!mesa) { showAlert("Mesa no encontrada", "danger"); return; }
  if (mesa.estado === "ocupada" || mesa.estado === "deshabilitada") {
    showAlert("No se puede reservar: la mesa no está disponible.", "danger");
    return;
  }
  if (document.body.dataset.page === "reservas") {
    const form = document.getElementById("formReserva");
    if (form) { form.reset(); clearAllValidation(form); }
    if (document.getElementById("resEditId")) document.getElementById("resEditId").value = "";
    populateMesaSelect(mesaId);
    setTimeout(() => { if (document.getElementById("idMesaAsignada")) document.getElementById("idMesaAsignada").value = mesaId; }, 0);
    try { new bootstrap.Modal(document.getElementById("modalReserva")).show(); } catch (e) {}
  } else {
    localStorage.setItem("mesaSeleccionada", mesaId);
    location.href = "reservas.html";
  }
}

/* ---------------- SELECT MESAS DISPONIBLES ---------------- */
function populateMesaSelect(currentMesaId = null) {
  const select = document.getElementById("idMesaAsignada");
  if (!select) return;
  select.innerHTML = "";
  const mesas = getData("mesas") || [];
  const reservas = getData("reservas") || [];

  const fecha = document.getElementById("fechaReserva")?.value || "";
  const hora = document.getElementById("horaReserva")?.value || "";
  const dur = Number(document.getElementById("duracionReserva")?.value || 1);
  const editingId = document.getElementById("resEditId")?.value || null;

  function mesaLibrePara(mesaId) {
    const m = mesas.find(x => x.id === mesaId);
    if (!m) return false;
    if (m.estado === "deshabilitada" && mesaId !== currentMesaId) return false;
    if (!fecha || !hora) return (m.estado === "disponible" || m.id === currentMesaId);

    const start = timeToMinutes(hora);
    const end = start + Math.round(dur * 60);

    return !reservas.some(r => {
      const rFecha = r.fecha || r.fechaReserva || "";
      const rHora = r.hora || r.horaReserva || "";
      const rDur = Number(r.duracion || r.duracionReserva || 1);
      const rMesaId = r.idMesaAsignada || r.idMesa;
      if (!rMesaId) return false;
      if (editingId && (r.id === editingId || r.idReserva === editingId)) return false;
      if (rMesaId !== mesaId) return false;
      if (r.estado === "Cancelada" || r.estado === "Finalizada") return false;
      if (!sameDate(rFecha, fecha)) return false;
      const rStart = timeToMinutes(rHora);
      const rEnd = rStart + Math.round(rDur * 60);
      return (start < rEnd) && (rStart < end);
    });
  }

  const available = mesas.filter(m => (mesaLibrePara(m.id) || m.id === currentMesaId || ((!fecha || !hora) && m.estado === "disponible")));
  if (available.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No hay mesas disponibles";
    opt.disabled = true; opt.selected = true;
    select.appendChild(opt);
    const msg = document.getElementById("msgMesasDisponibles");
    if (msg) { msg.textContent = "⚠️ No hay mesas disponibles en este horario"; msg.className = "form-text text-danger"; }
    return;
  }

  available.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `Mesa ${formatMesaNumero(m.numero)} - Cap: ${Number(m.capacidad)} - ${m.ubicacion}`;
    select.appendChild(opt);
  });
  const msg = document.getElementById("msgMesasDisponibles");
  if (msg) { msg.textContent = `✅ Mesas disponibles: ${available.length}`; msg.className = "form-text text-success"; }
}

/* ---------------- SOLAPAMIENTO ---------------- */
function existeSolapamiento(mesaId, fecha, hora, dur, excludeReservaId = null) {
  const reservas = getData("reservas") || [];
  if (!fecha || !hora) return false;
  const start = timeToMinutes(hora);
  const end = start + Math.round(dur * 60);
  return reservas.some(r => {
    const rFecha = r.fecha || r.fechaReserva || "";
    const rHora = r.hora || r.horaReserva || "";
    const rDur = Number(r.duracion || r.duracionReserva || 1);
    const rId = r.idReserva || r.id || null;
    const rMesa = r.idMesaAsignada || r.idMesa;
    if (!rMesa || rMesa !== mesaId) return false;
    if (excludeReservaId && rId && (rId === excludeReservaId)) return false;
    if (r.estado === "Cancelada" || r.estado === "Finalizada") return false;
    if (!sameDate(rFecha, fecha)) return false;
    const rStart = timeToMinutes(rHora);
    const rEnd = rStart + Math.round(rDur * 60);
    return (start < rEnd) && (rStart < end);
  });
}

/* ---------------- RENDER RESERVAS (tabla) ---------------- */
let reservaTimers = {};
function clearAllReservaTimers() {
  for (const k in reservaTimers) {
    try { clearInterval(reservaTimers[k]); } catch (e) {}
    try { delete reservaTimers[k]; } catch(e) {}
  }
  reservaTimers = {};
}
function detectTimerSeparateColumn() {
  try {
    const table = document.getElementById("tablaReservas")?.closest("table");
    if (!table) return false;
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim().toLowerCase());
    return headers.includes("contador") || headers.includes("contador ");
  } catch (e) { return false; }
}

function renderReservas(filterMode = null, weekRange = null) {
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) return;
  let reservas = getData("reservas") || [];
  const mesas = getData("mesas") || [];

  actualizarReservasPorTiempo();
  reservas = getData("reservas") || [];

  const filtroFecha = document.getElementById("filtroFecha")?.value || "";
  const filtroEstado = document.getElementById("filtroEstado")?.value || "";

  const filas = reservas.filter(r => {
    const rFecha = r.fecha || r.fechaReserva || "";
    if (filterMode === "week" && weekRange) {
      const dt = parseYMD(rFecha);
      if (!dt) return false;
      if (dt < weekRange.from || dt > weekRange.to) return false;
    } else {
      if (filtroFecha && rFecha !== filtroFecha) return false;
    }
    if (filtroEstado && r.estado !== filtroEstado) return false;
    return true;
  });

  tbody.innerHTML = "";
  clearAllReservaTimers();

  const separateTimerCol = detectTimerSeparateColumn();
  const colspanEmpty = separateTimerCol ? 12 : 11;

  if (filas.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="${colspanEmpty}" class="text-center text-muted">No hay reservas que coincidan con los filtros.</td>`;
    tbody.appendChild(tr);
    return;
  }

  filas.forEach(r => {
    const tr = document.createElement("tr");
    const rid = r.idReserva || r.id || "";

    const mesaObj = mesas.find(m => m.id === (r.idMesaAsignada || r.idMesa));
    const mesaDisplay = mesaObj ? `Mesa ${formatMesaNumero(mesaObj.numero)}` : (r.idMesaAsignada || r.idMesa || "-");
    const notasHTML = `${r.notasAdicionales || "-"}`;

    let durDisplay = "-";
    if ((r.duracion !== undefined && r.duracion !== null) || (r.duracionReserva !== undefined && r.duracionReserva !== null)) {
      durDisplay = (r.duracion || r.duracionReserva) + " h";
    }

    let rowHtml = `
      <td>${rid}</td>
      <td>${r.nombreCliente || "-"}</td>
      <td>${r.numeroPersonas || "-"}</td>
      <td>${(r.fecha || r.fechaReserva) || "-"}</td>
      <td>${(r.hora || r.horaReserva) || "-"}</td>
      <td>${durDisplay}</td>
      <td>${mesaDisplay}</td>
      <td id="estado-cell-${rid}">${r.estado || "-"}</td>
      <td>${r.ocasionEspecial || "-"}</td>
      <td>${notasHTML}</td>
    `;
    if (separateTimerCol) {
      rowHtml += `<td id="timer-${rid}" class="small text-muted"></td>`;
      rowHtml += `
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditReserva('${rid}')">Editar</button>
        <button class="btn btn-sm btn-success me-1" onclick="pagarReserva('${rid}')">Pagar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(() => deleteReserva('${rid}'), '¿Eliminar reserva ${rid}?')">Eliminar</button>
      </td>
      `;
    } else {
      rowHtml += `<td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditReserva('${rid}')">Editar</button>
        <button class="btn btn-sm btn-success me-1" onclick="pagarReserva('${rid}')">Pagar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="confirmDelete(() => deleteReserva('${rid}'), '¿Eliminar reserva ${rid}?')">Eliminar</button>
      </td>`;
    }

    tr.innerHTML = rowHtml;

    if (!separateTimerCol) {
      const notesTd = tr.querySelector("td:nth-child(10)");
      if (notesTd) {
        const timerDiv = document.createElement("div");
        timerDiv.id = `timer-${rid}`;
        timerDiv.className = "small text-muted mt-1";
        notesTd.appendChild(timerDiv);
      }
    }

    tbody.appendChild(tr);
    startReservaTimer(r);
  });
}

/* ---------------- TIMERS POR RESERVA ---------------- */
function startReservaTimer(reserva) {
  const rid = reserva.idReserva || reserva.id || "";
  const timerEl = document.getElementById(`timer-${rid}`);
  if (!timerEl) return;

  // Asegura no duplicar intervalos para el mismo rid
  if (reservaTimers[rid]) {
    try { clearInterval(reservaTimers[rid]); } catch (e) {}
    delete reservaTimers[rid];
  }

  if (reserva.estado === "Finalizada" || reserva.estado === "Cancelada") {
    timerEl.textContent = reserva.estado === "Finalizada" ? "Finalizada" : "";
    return;
  }

  reservaTimers[rid] = setInterval(() => {
    const now = new Date();
    const reservas = getData("reservas") || [];
    const current = reservas.find(rr => (rr.idReserva === reserva.idReserva || rr.id === reserva.idReserva || rr.idReserva === reserva.id || rr.id === reserva.id));
    if (!current) { timerEl.textContent = ""; try { clearInterval(reservaTimers[rid]); } catch(e){} delete reservaTimers[rid]; return; }
    reserva = current;

    const fecha = reserva.fecha || reserva.fechaReserva;
    const hora = reserva.hora || reserva.horaReserva;
    const dur = Number(reserva.duracion || reserva.duracionReserva || 1);
    const start = parseDateTime(fecha, hora);
    if (!start) { timerEl.textContent = ""; return; }
    const end = new Date(start.getTime() + dur * 3600000);

    if (now < start) {
      const diff = start - now;
      timerEl.textContent = `Faltan: ${msToHMS(diff)}`;
    } else if (now >= start && now < end) {
      if (reserva.estado !== "Confirmada") {
        // Actualiza estado en almacenamiento una única vez
        const all = getData("reservas") || [];
        const idx = all.findIndex(a => a.idReserva === reserva.idReserva || a.id === reserva.idReserva || a.idReserva === reserva.id);
        if (idx >= 0) {
          all[idx].estado = "Confirmada";
          saveData("reservas", all);
        }
        const mesas = getData("mesas") || [];
        const mi = mesas.findIndex(mm => mm.id === (reserva.idMesaAsignada || reserva.idMesa));
        if (mi >= 0 && mesas[mi].estado !== "deshabilitada") { mesas[mi].estado = "ocupada"; saveData("mesas", mesas); }
        const estadoCell = document.getElementById(`estado-cell-${rid}`);
        if (estadoCell) estadoCell.textContent = "Confirmada";
        // Actualiza vista de mesas sin recargar para evitar efectos colaterales
        renderMesas();
      }
      const diff = end - now;
      timerEl.textContent = `En curso — termina en ${msToHMS(diff)}`;
    } else {
      // finalizada
      const all = getData("reservas") || [];
      const idx = all.findIndex(a => a.idReserva === reserva.idReserva || a.id === reserva.idReserva || a.idReserva === reserva.id);
      if (idx >= 0) { all[idx].estado = "Finalizada"; saveData("reservas", all); }
      const mesas = getData("mesas") || [];
      const mi = mesas.findIndex(mm => mm.id === (reserva.idMesaAsignada || reserva.idMesa));
      if (mi >= 0 && mesas[mi].estado !== "deshabilitada") { mesas[mi].estado = "disponible"; saveData("mesas", mesas); }
      timerEl.textContent = "Finalizada";

      // Mostrar alerta de finalización (deduplicada por showAlert)
      // FIX: evitar "undefined" mostrando nombre seguro o mensaje genérico
      const displayName = reserva?.nombreCliente || reserva?.nombre || reserva?.idReserva || reserva?.id || "";
      const mensaje = displayName ? `Reserva ${displayName} finalizada. Mesa liberada.` : `Reserva finalizada. Mesa liberada.`;
      showAlert(mensaje, "info");

      try { clearInterval(reservaTimers[rid]); } catch (e) {}
      delete reservaTimers[rid];

      // Actualizar vistas (sin recargar)
      renderReservas();
      renderMesas();
    }
  }, 1000);
}

/* ---------------- EDITAR / BORRAR RESERVAS ---------------- */
function openEditReserva(id) {
  const reservas = getData("reservas") || [];
  const res = reservas.find(r => (r.idReserva === id || r.id === id));
  if (!res) { showAlert("Reserva no encontrada", "danger"); return; }
  const form = document.getElementById("formReserva");
  if (form) clearAllValidation(form);

  document.getElementById("resEditId").value = res.idReserva || res.id || "";
  document.getElementById("nombreCliente").value = res.nombreCliente || "";
  document.getElementById("numeroPersonas").value = res.numeroPersonas || "";
  document.getElementById("fechaReserva").value = res.fecha || res.fechaReserva || "";
  document.getElementById("horaReserva").value = res.hora || res.horaReserva || "";
  document.getElementById("duracionReserva").value = res.duracion || res.duracionReserva || 1;
  populateMesaSelect(res.idMesaAsignada || res.idMesa || null);
  if (document.getElementById("idMesaAsignada")) document.getElementById("idMesaAsignada").value = res.idMesaAsignada || res.idMesa || "";
  if (document.getElementById("estadoReserva")) document.getElementById("estadoReserva").value = res.estado || "Pendiente";
  if (document.getElementById("ocasionEspecial")) document.getElementById("ocasionEspecial").value = res.ocasionEspecial || "";
  if (document.getElementById("notasAdicionales")) document.getElementById("notasAdicionales").value = res.notasAdicionales || "";

  try { new bootstrap.Modal(document.getElementById("modalReserva")).show(); } catch (e) {}
}

function deleteReserva(id) {
  let reservas = getData("reservas") || [];
  const target = reservas.find(r => (r.idReserva === id || r.id === id));
  if (!target) { showAlert("Reserva no encontrada", "danger"); return; }

  const mesaId = target.idMesaAsignada || target.idMesa;
  reservas = reservas.filter(r => !(r.idReserva === id || r.id === id));
  saveData("reservas", reservas);

  if (mesaId) {
    const otras = reservas.some(r => {
      const rMesa = r.idMesaAsignada || r.idMesa;
      if (!rMesa || rMesa !== mesaId) return false;
      if (r.estado === "Cancelada" || r.estado === "Finalizada") return false;
      return true;
    });
    if (!otras) {
      const mesas = getData("mesas") || [];
      const mi = mesas.findIndex(m => m.id === mesaId);
      if (mi >= 0 && mesas[mi].estado !== "deshabilitada") { mesas[mi].estado = "disponible"; saveData("mesas", mesas); }
    }
  }

  showAlert("Reserva eliminada", "success");
  renderReservas();
  populateMesaSelect();
  renderMesas();
}

function pagarReserva(id) {
  let reservas = getData("reservas") || [];
  const idx = reservas.findIndex(r => (r.idReserva === id || r.id === id));
  if (idx === -1) { showAlert("Reserva no encontrada", "danger"); return; }
  reservas[idx].estado = "Finalizada";
  saveData("reservas", reservas);
  const mesaId = reservas[idx].idMesaAsignada || reservas[idx].idMesa;
  if (mesaId) {
    const mesas = getData("mesas") || [];
    const mi = mesas.findIndex(m => m.id === mesaId);
    if (mi >= 0 && mesas[mi].estado !== "deshabilitada") { mesas[mi].estado = "disponible"; saveData("mesas", mesas); }
  }
  renderReservas();
  renderMesas();
  populateMesaSelect();
  showAlert("Reserva pagada y mesa liberada (si corresponde)", "success");
}

/* ---------------- BIND FORM RESERVA ---------------- */
(function bindFormReserva() {
  const form = document.getElementById("formReserva");
  if (!form) return;
  form.setAttribute("novalidate", "true");

  function refreshAvailableMesasForForm() {
    const isEditing = Boolean(document.getElementById("resEditId")?.value);
    const current = isEditing ? (document.getElementById("idMesaAsignada")?.value || null) : null;
    populateMesaSelect(current);
  }

  ["fechaReserva", "horaReserva", "duracionReserva"].forEach(id => {
    const el = document.getElementById(id); if (el) el.addEventListener("change", refreshAvailableMesasForForm);
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page === "reservas") {
      const mesaSel = localStorage.getItem("mesaSeleccionada");
      if (mesaSel) {
        localStorage.removeItem("mesaSeleccionada");
        form.reset(); clearAllValidation(form); if (document.getElementById("resEditId")) document.getElementById("resEditId").value = "";
        populateMesaSelect(mesaSel);
        setTimeout(() => { if (document.getElementById("idMesaAsignada")) document.getElementById("idMesaAsignada").value = mesaSel; }, 0);
        try { new bootstrap.Modal(document.getElementById("modalReserva")).show(); } catch (e) {}
      }
    }
  });

  const modalRes = document.getElementById("modalReserva");
  if (modalRes) {
    modalRes.addEventListener("show.bs.modal", () => {
      if (!document.getElementById("resEditId")?.value) {
        form.reset(); clearAllValidation(form); populateMesaSelect();
      }
    });
    modalRes.addEventListener("hidden.bs.modal", () => {
      form.reset(); clearAllValidation(form);
      if (document.getElementById("resEditId")) document.getElementById("resEditId").value = "";
      populateMesaSelect();
    });
  }

  const botonNuevaReserva = document.querySelector('button[data-bs-target="#modalReserva"]');
  if (botonNuevaReserva) {
    botonNuevaReserva.addEventListener("click", () => {
      if (!document.getElementById("resEditId")?.value) {
        form.reset(); clearAllValidation(form); if (document.getElementById("resEditId")) document.getElementById("resEditId").value = "";
        populateMesaSelect();
      }
    });
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const id = document.getElementById("resEditId")?.value || "";
    const nombreEl = document.getElementById("nombreCliente");
    const numEl = document.getElementById("numeroPersonas");
    const fechaEl = document.getElementById("fechaReserva");
    const horaEl = document.getElementById("horaReserva");
    const durEl = document.getElementById("duracionReserva");
    const mesaEl = document.getElementById("idMesaAsignada");
    const estadoEl = document.getElementById("estadoReserva");
    const ocasionEl = document.getElementById("ocasionEspecial");
    const notasEl = document.getElementById("notasAdicionales");

    let ok = true;
    if (!nombreEl || !nombreEl.value.trim()) { setInvalid(nombreEl, "El nombre es obligatorio"); ok = false; } else clearInvalid(nombreEl);
    if (!numEl || !numEl.value || Number(numEl.value) <= 0) { setInvalid(numEl, "Número de personas inválido"); ok = false; } else clearInvalid(numEl);

    if (!fechaEl || !fechaEl.value) { setInvalid(fechaEl, "La fecha es obligatoria"); ok = false; } else {
      const fechaSolo = parseYMD(fechaEl.value);
      const hoy = new Date(); hoy.setHours(0,0,0,0);
      if (!fechaSolo) { setInvalid(fechaEl, "Fecha inválida"); ok = false; }
      else if (fechaSolo < hoy) { setInvalid(fechaEl, "La fecha no puede ser anterior a hoy"); ok = false; } else clearInvalid(fechaEl);
    }

    if (!horaEl || !horaEl.value) { setInvalid(horaEl, "La hora es obligatoria"); ok = false; } else {
      const [hh, mm] = horaEl.value.split(":").map(Number);
      // Validación horario 08:00 - 00:00 (aceptamos 00:00 exacto como límite)
      const valid = !(isNaN(hh) || isNaN(mm)) && ((hh >= 8 && hh <= 23) || (hh === 0 && mm === 0));
      if (!valid) { setInvalid(horaEl, "La hora debe estar entre 08:00 y 00:00"); ok = false; } else clearInvalid(horaEl);
    }

    if (!durEl || !durEl.value || Number(durEl.value) <= 0) { setInvalid(durEl, "Duración inválida"); ok = false; } else clearInvalid(durEl);
    if (!mesaEl || !mesaEl.value) { setInvalid(mesaEl, "Selecciona una mesa"); ok = false; } else clearInvalid(mesaEl);
    if (!estadoEl || !estadoEl.value) { setInvalid(estadoEl, "Selecciona un estado"); ok = false; } else clearInvalid(estadoEl);
    if (!ok) { showAlert("Corrige los errores antes de guardar", "danger"); return; }

    // validación permitir reservar hoy si hora futura
    const fechaSolo = parseYMD(fechaEl.value);
    const ahora = new Date();
    const fechaHora = parseDateTime(fechaEl.value, horaEl.value);
    if (!fechaSolo || !fechaHora) { showAlert("Fecha/hora inválida", "danger"); return; }
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    if (fechaSolo.getTime() === hoy.getTime()) {
      if (fechaHora <= ahora) { showAlert("Si la reserva es para hoy, la hora debe ser posterior a la actual", "danger"); return; }
    }

    // capacidad
    const mesas = getData("mesas") || [];
    const mesaSel = mesas.find(m => m.id === mesaEl.value);
    if (!mesaSel) { showAlert("Mesa inválida", "danger"); return; }
    if (Number(numEl.value) > Number(mesaSel.capacidad)) { showAlert(`La mesa tiene capacidad máxima de ${Number(mesaSel.capacidad)} personas`, "danger"); return; }

    // solapamiento
    const fecha = fechaEl.value, hora = horaEl.value, dur = Number(durEl.value);
    if (existeSolapamiento(mesaEl.value, fecha, hora, dur, id || null)) { showAlert("La mesa seleccionada ya está ocupada en ese rango horario", "danger"); return; }

    let reservas = getData("reservas") || [];

    if (id) {
      const idx = reservas.findIndex(r => (r.idReserva === id || r.id === id));
      if (idx >= 0) {
        const prevMesa = reservas[idx].idMesaAsignada || reservas[idx].idMesa;
        reservas[idx].nombreCliente = nombreEl.value;
        reservas[idx].numeroPersonas = Number(numEl.value);
        reservas[idx].fecha = fecha;
        reservas[idx].hora = hora;
        reservas[idx].duracion = Number(dur);
        reservas[idx].idMesaAsignada = mesaEl.value;
        reservas[idx].estado = estadoEl.value;
        reservas[idx].ocasionEspecial = ocasionEl.value;
        reservas[idx].notasAdicionales = notasEl.value;
        saveData("reservas", reservas);

        if (prevMesa && prevMesa !== mesaEl.value) {
          const otras = reservas.some(r => {
            const rMesa = r.idMesaAsignada || r.idMesa;
            if (!rMesa || rMesa !== prevMesa) return false;
            if (r.estado === "Cancelada" || r.estado === "Finalizada") return false;
            return true;
          });
          const mesasArr = getData("mesas") || [];
          const pmi = mesasArr.findIndex(m => m.id === prevMesa);
          if (!otras && pmi >= 0 && mesasArr[pmi].estado !== "deshabilitada") {
            mesasArr[pmi].estado = "disponible";
            saveData("mesas", mesasArr);
          }
        }
        const mesasArr2 = getData("mesas") || [];
        const nmi = mesasArr2.findIndex(m => m.id === mesaEl.value);
        if (nmi >= 0 && mesasArr2[nmi].estado !== "deshabilitada") { mesasArr2[nmi].estado = "ocupada"; saveData("mesas", mesasArr2); }
        showAlert("Reserva actualizada", "success");
      } else {
        showAlert("Reserva a editar no encontrada", "danger");
        return;
      }
    } else {
      const newRes = {
        idReserva: generateReservaId(),
        nombreCliente: nombreEl.value,
        numeroPersonas: Number(numEl.value),
        fechaReserva: fecha,
        horaReserva: hora,
        duracion: Number(dur),
        idMesaAsignada: mesaEl.value,
        estado: estadoEl.value || "Pendiente",
        ocasionEspecial: ocasionEl.value,
        notasAdicionales: notasEl.value
      };
      reservas.push(newRes);
      saveData("reservas", reservas);
      const mesasArr = getData("mesas") || [];
      const mi = mesasArr.findIndex(m => m.id === newRes.idMesaAsignada);
      if (mi >= 0 && mesasArr[mi].estado !== "deshabilitada") { mesasArr[mi].estado = "ocupada"; saveData("mesas", mesasArr); }
      showAlert("Reserva creada", "success");
    }

    renderReservas();
    renderMesas();
    populateMesaSelect();
    try { bootstrap.Modal.getInstance(document.getElementById("modalReserva")).hide(); } catch (e) {}
    form.reset();
    if (document.getElementById("resEditId")) document.getElementById("resEditId").value = "";
  });
})();

/* ---------------- FILTROS RÁPIDOS ---------------- */
(function bindQuickFilters() {
  const btnHoy = document.getElementById("btnHoy");
  const btnManana = document.getElementById("btnMañana");
  const btnSemana = document.getElementById("btnSemana");
  const btnLimpiar = document.getElementById("btnLimpiarFiltros");

  if (btnHoy) btnHoy.addEventListener("click", (e) => { e.preventDefault(); document.getElementById("filtroFecha").value = formatDateYMD(new Date()); renderReservas(); });
  if (btnManana) btnManana.addEventListener("click", (e) => { e.preventDefault(); const d = new Date(); d.setDate(d.getDate()+1); document.getElementById("filtroFecha").value = formatDateYMD(d); renderReservas(); });
  if (btnSemana) btnSemana.addEventListener("click", (e) => { e.preventDefault(); const inicio = new Date(); inicio.setHours(0,0,0,0); const fin = new Date(); fin.setDate(fin.getDate()+6); fin.setHours(23,59,59,999); renderReservas("week", { from: inicio, to: fin }); });
  if (btnLimpiar) btnLimpiar.addEventListener("click", (e) => { e.preventDefault(); const f = document.getElementById("filtroFecha"), s = document.getElementById("filtroEstado"); if (f) f.value = ""; if (s) s.value = ""; renderReservas(); });

  const filtroFecha = document.getElementById("filtroFecha");
  const filtroEstado = document.getElementById("filtroEstado");
  if (filtroFecha) filtroFecha.addEventListener("change", () => renderReservas());
  if (filtroEstado) filtroEstado.addEventListener("change", () => renderReservas());
})();

/* ---------------- BIND FORM MESA ---------------- */
(function bindFormMesa() {
  const form = document.getElementById("formMesa");
  if (!form) return;
  form.setAttribute("novalidate", "true");

  const modalEl = document.getElementById("modalMesa");
  if (modalEl) {
    modalEl.addEventListener("show.bs.modal", () => {
      const editId = document.getElementById("mesaEditId")?.value || "";
      const estadoWrapper = document.getElementById("estadoMesaGroup");
      if (estadoWrapper) estadoWrapper.style.display = editId ? "block" : "none";
    });
    modalEl.addEventListener("hidden.bs.modal", () => {
      form.reset();
      clearAllValidation(form);
      if (document.getElementById("mesaEditId")) document.getElementById("mesaEditId").value = "";
      const estadoWrapper = document.getElementById("estadoMesaGroup");
      if (estadoWrapper) estadoWrapper.style.display = "none";
    });
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const editId = document.getElementById("mesaEditId")?.value || "";
    const capacidadEl = document.getElementById("capacidad");
    const ubicacionEl = document.getElementById("ubicacion");
    const estadoEl = document.getElementById("estadoMesa");

    let ok = true;
    if (!capacidadEl || !capacidadEl.value || Number(capacidadEl.value) <= 0) { setInvalid(capacidadEl, "La capacidad debe ser mayor a 0"); ok = false; } else clearInvalid(capacidadEl);
    if (!ubicacionEl || !ubicacionEl.value.trim()) { setInvalid(ubicacionEl, "La ubicación es obligatoria"); ok = false; } else clearInvalid(ubicacionEl);
    if (editId) {
      if (estadoEl && !estadoEl.value) { setInvalid(estadoEl, "Selecciona un estado"); ok = false; } else if (estadoEl) clearInvalid(estadoEl);
    }
    if (!ok) { showAlert("Corrige los errores del formulario de mesa", "danger"); return; }

    let mesas = getData("mesas") || [];
    const capacidadNum = Number(capacidadEl.value);

    if (editId) {
      const idx = mesas.findIndex(m => m.id === editId);
      if (idx >= 0) {
        mesas[idx].capacidad = capacidadNum;
        mesas[idx].ubicacion = ubicacionEl.value;
        if (estadoEl) mesas[idx].estado = estadoEl.value || mesas[idx].estado;
        renumberMesas(mesas);
        saveData("mesas", mesas);
        showAlert("Mesa actualizada", "success");
      } else {
        showAlert("Mesa a editar no encontrada", "danger");
      }
    } else {
      const newMesa = {
        id: generateMesaShortId(),
        capacidad: capacidadNum,
        ubicacion: ubicacionEl.value,
        estado: "disponible"
      };
      mesas.push(newMesa);
      renumberMesas(mesas);
      saveData("mesas", mesas);
      showAlert("Mesa creada", "success");
    }

    renderMesas();
    populateMesaSelect();
    try { bootstrap.Modal.getInstance(document.getElementById("modalMesa")).hide(); } catch (e) {}
    form.reset();
    const estadoWrapper = document.getElementById("estadoMesaGroup");
    if (estadoWrapper) estadoWrapper.style.display = "none";
  });
})();

/* ---------------- INICIALIZACIÓN ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("mesas")) resetMesas();
  else {
    const ms = getData("mesas") || [];
    if (ms.length) { ms.forEach(m => m.capacidad = Number(m.capacidad || 0)); renumberMesas(ms); saveData("mesas", ms); }
  }
  if (!localStorage.getItem("reservas")) saveData("reservas", []);

  const page = document.body.dataset.page || "";
  if (page === "mesas") {
    renderMesas();
    const estadoWrapper = document.getElementById("estadoMesaGroup");
    if (estadoWrapper) estadoWrapper.style.display = "none";
    const btnAgregarMesa = document.getElementById("btnAgregarMesa");
    if (btnAgregarMesa) {
      btnAgregarMesa.addEventListener("click", () => {
        const f = document.getElementById("formMesa");
        if (f) { f.reset(); clearAllValidation(f); }
        if (document.getElementById("mesaEditId")) document.getElementById("mesaEditId").value = "";
        const estadoWrapper = document.getElementById("estadoMesaGroup");
        if (estadoWrapper) estadoWrapper.style.display = "none";
        try { new bootstrap.Modal(document.getElementById("modalMesa")).show(); } catch (e) {}
      });
    }
  }

  if (page === "reservas") {
    const mesaSel = localStorage.getItem("mesaSeleccionada");
    if (mesaSel) {
      localStorage.removeItem("mesaSeleccionada");
      const form = document.getElementById("formReserva");
      if (form) { form.reset(); clearAllValidation(form); }
      populateMesaSelect(mesaSel);
      setTimeout(() => { if (document.getElementById("idMesaAsignada")) document.getElementById("idMesaAsignada").value = mesaSel; }, 0);
      try { new bootstrap.Modal.getInstance(document.getElementById("modalReserva")).show(); } catch (e) {}
    }
    populateMesaSelect();
    renderReservas();
  }

  const modalRes = document.getElementById("modalReserva");
  if (modalRes) modalRes.addEventListener("hidden.bs.modal", () => {
    const form = document.getElementById("formReserva");
    if (form) { form.reset(); clearAllValidation(form); }
    if (document.getElementById("resEditId")) document.getElementById("resEditId").value = "";
    populateMesaSelect();
  });
});







