// ================= UTILIDADES =================
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (e) {
    return [];
  }
}
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function generateId(prefix = "id") {
  return prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 9000 + 1000);
}

// Alertas simples (no alert nativo)
function showAlert(msg, type = "info", ms = 3000) {
  const area = document.getElementById("alertContainer");
  if (!area) {
    console.log(`[${type}] ${msg}`);
    return;
  }
  const el = document.createElement("div");
  // mapear tipos a clases bootstrap
  const map = { info: "info", success: "success", danger: "danger", warning: "warning" };
  const cls = map[type] || "info";
  el.className = `alert alert-${cls} alert-dismissible fade show`;
  el.setAttribute("role", "alert");
  el.innerHTML = `
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  area.appendChild(el);
  setTimeout(() => {
    try { el.remove(); } catch (e) {}
  }, ms);
}

// ================= VALIDACIONES UI =================
function setInvalid(input, message) {
  if (!input) return;
  input.classList.add("is-invalid");
  let fb = input.parentElement.querySelector(".invalid-feedback");
  if (!fb) {
    fb = document.createElement("div");
    fb.className = "invalid-feedback";
    input.parentElement.appendChild(fb);
  }
  fb.textContent = message;
}
function clearInvalid(input) {
  if (!input) return;
  input.classList.remove("is-invalid");
  const fb = input.parentElement.querySelector(".invalid-feedback");
  if (fb) fb.textContent = "";
}

// ================ Helpers tiempo ===================
function timeToMinutes(t) {
  // t => "HH:MM"
  if (!t || typeof t !== "string") return NaN;
  const parts = t.split(":").map(Number);
  if (parts.length < 2) return NaN;
  return parts[0] * 60 + parts[1];
}
function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
}
function addHoursToTime(timeStr, hours) {
  const mins = timeToMinutes(timeStr);
  if (isNaN(mins)) return null;
  return minutesToTime(mins + Math.round(hours * 60));
}
function sameDate(d1, d2) {
  return new Date(d1).toISOString().split("T")[0] === new Date(d2).toISOString().split("T")[0];
}

// ================ MESAS ===================
// ================ MESAS ===================
function renderMesas() {
  const grid = document.getElementById("gridMesas");
  if (!grid) return;
  const mesas = getData("mesas");
  grid.innerHTML = "";
  mesas.forEach(m => {
    const col = document.createElement("div");
    col.className = "col-md-3";
    col.innerHTML = `
      <div class="card state-${m.estado}">
        <div class="card-body text-center">
          <h5 class="card-title text-light">Mesa ${m.id}</h5>
          <p class="text-light-weak mb-1">Capacidad: ${m.capacidad}</p>
          <p class="text-light-weak mb-2">Ubicación: ${m.ubicacion}</p>
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-light" onclick="openEditMesa('${m.id}')">Editar</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteMesa('${m.id}')">Eliminar</button>
            <button class="btn btn-sm btn-info" onclick="reservarDesdeMesa('${m.id}')">Reservar</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });
}

// Nueva función: reservar desde mesas
function reservarDesdeMesa(mesaId) {
  // guardamos mesa seleccionada temporalmente
  localStorage.setItem("mesaSeleccionada", mesaId);

  // si estamos en la página de reservas, abrimos modal directo
  if (document.body.dataset.page === "reservas") {
    document.getElementById("resEditId").value = "";
    document.getElementById("formReserva").reset();
    populateMesaSelect(mesaId);
    if (document.getElementById("idMesaAsignada")) {
      document.getElementById("idMesaAsignada").value = mesaId;
    }
    const modal = new bootstrap.Modal(document.getElementById("modalReserva"));
    modal.show();
  } else {
    // si estamos en mesas.html → ir a reservas.html
    location.href = "reservas.html";
  }
}

// Al cargar reservas, si hay mesa preseleccionada, abrir modal automáticamente
document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "reservas") {
    const mesaSel = localStorage.getItem("mesaSeleccionada");
    if (mesaSel) {
      localStorage.removeItem("mesaSeleccionada");
      reservarDesdeMesa(mesaSel);
    }
  }
});

// Botón "Agregar Mesa"
const btnAgregarMesa = document.getElementById("btnAgregarMesa");
if (btnAgregarMesa) {
  btnAgregarMesa.addEventListener("click", () => {
    document.getElementById("formMesa").reset();
    document.getElementById("mesaEditId").value = "";
    document.getElementById("estadoMesaGroup").style.display = "none"; // ocultar en agregar
    const modal = new bootstrap.Modal(document.getElementById("modalMesa"));
    modal.show();
  });
}


// Abrir modal para edición
function openEditMesa(id) {
  const mesas = getData("mesas");
  const mesa = mesas.find(x => x.id === id);
  if (!mesa) {
    showAlert("Mesa no encontrada", "danger");
    return;
  }
  // cargar campos
  const editId = document.getElementById("mesaEditId");
  const capacidad = document.getElementById("capacidad");
  const ubicacion = document.getElementById("ubicacion");
  const estado = document.getElementById("estadoMesa");

  if (editId) editId.value = mesa.id;
  if (capacidad) capacidad.value = mesa.capacidad;
  if (ubicacion) ubicacion.value = mesa.ubicacion;
  if (estado) estado.value = mesa.estado;

  // mostrar control de estado (si existe wrapper lo mostramos; si no, no pasa nada)
  const estadoWrapper = document.getElementById("estadoMesaGroup");
  if (estadoWrapper) estadoWrapper.style.display = "block";

  // abrir modal
  const modalEl = document.getElementById("modalMesa");
  if (modalEl) new bootstrap.Modal(modalEl).show();
}

function deleteMesa(id) {
  // antes de eliminar, podríamos comprobar reservas referenciadas (opcional).
  let mesas = getData("mesas");
  mesas = mesas.filter(m => m.id !== id);
  saveData("mesas", mesas);
  renderMesas();
  // actualizar selects de reservas por si estaba listado
  populateMesaSelect();
  showAlert("Mesa eliminada", "success");
}

// Guardar mesa (crear o editar)
(function bindFormMesa() {
  const form = document.getElementById("formMesa");
  if (!form) return;
  form.setAttribute("novalidate", "true");

  // Al abrir el modal vía botón 'Agregar Mesa' (si existe), queremos ocultar estado.
  // Escuchamos el evento show.bs.modal para ajustar la visibilidad.
  const modalEl = document.getElementById("modalMesa");
  if (modalEl) {
    modalEl.addEventListener("show.bs.modal", () => {
      // si hay id vacío -> es "agregar", ocultamos estado
      const editId = document.getElementById("mesaEditId")?.value || "";
      const estadoWrapper = document.getElementById("estadoMesaGroup");
      if (estadoWrapper) {
        if (!editId) estadoWrapper.style.display = "none";
        // if editing, show; otherwise hide
      }
    });
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const editId = document.getElementById("mesaEditId")?.value || "";
    const capacidadEl = document.getElementById("capacidad");
    const ubicacionEl = document.getElementById("ubicacion");
    const estadoEl = document.getElementById("estadoMesa");

    let ok = true;
    // validaciones
    if (!capacidadEl || !capacidadEl.value || Number(capacidadEl.value) <= 0) {
      setInvalid(capacidadEl, "La capacidad debe ser mayor a 0");
      ok = false;
    } else clearInvalid(capacidadEl);
    if (!ubicacionEl || !ubicacionEl.value.trim()) {
      setInvalid(ubicacionEl, "La ubicación es obligatoria");
      ok = false;
    } else clearInvalid(ubicacionEl);
    // si estamos editando, validamos estado (si existe)
    if (editId) {
      if (estadoEl && !estadoEl.value) {
        setInvalid(estadoEl, "Selecciona un estado");
        ok = false;
      } else if (estadoEl) clearInvalid(estadoEl);
    }

    if (!ok) {
      showAlert("Corrige los errores del formulario de mesa", "danger");
      return;
    }

    let mesas = getData("mesas");
    if (editId) {
      const idx = mesas.findIndex(m => m.id === editId);
      if (idx >= 0) {
        mesas[idx].capacidad = Number(capacidadEl.value);
        mesas[idx].ubicacion = ubicacionEl.value;
        // si existe estadoEl usamos su valor, si no dejamos la antigua
        if (estadoEl) mesas[idx].estado = estadoEl.value || mesas[idx].estado;
        showAlert("Mesa actualizada", "success");
      } else {
        showAlert("Mesa a editar no encontrada", "danger");
      }
    } else {
      const newMesa = {
        id: generateId("M"),
        capacidad: Number(capacidadEl.value),
        ubicacion: ubicacionEl.value,
        estado: "disponible"
      };
      mesas.push(newMesa);
      showAlert("Mesa creada", "success");
    }
    saveData("mesas", mesas);
    renderMesas();
    populateMesaSelect();
    // cerrar modal si existe
    try {
      const modalInst = bootstrap.Modal.getInstance(document.getElementById("modalMesa"));
      if (modalInst) modalInst.hide();
    } catch (e) {}
    form.reset();
    // ocultar wrapper si existe (preparar para siguiente alta)
    const estadoWrapper = document.getElementById("estadoMesaGroup");
    if (estadoWrapper) estadoWrapper.style.display = "none";
  });
})();

// ================ RESERVAS ===================

// llena select de mesas disponibles (considerando fecha/hora/duración opcional)
function populateMesaSelect(currentMesaId = null) {
  const select = document.getElementById("idMesaAsignada");
  if (!select) return;
  select.innerHTML = "";
  const mesas = getData("mesas");
  const reservas = getData("reservas");

  const fecha = document.getElementById("fechaReserva")?.value || "";
  const hora = document.getElementById("horaReserva")?.value || "";
  const dur = Number(document.getElementById("duracionReserva")?.value || 1);
  const editingId = document.getElementById("resEditId")?.value || null;

  // helper para saber si mesa está libre en ese horario (no solapa con reservas activas)
  function mesaLibrePara(mesaId) {
    // si no hay fecha/hora seleccionados devolvemos true solo para mesas 'disponible' y el current
    if (!fecha || !hora) {
      const m = mesas.find(x => x.id === mesaId);
      return m && (m.estado === "disponible" || m.id === currentMesaId);
    }
    const start = timeToMinutes(hora);
    const end = start + Math.round(dur * 60);

    return !reservas.some(r => {
      if (!r.id || !r.idMesaAsignada) return false;
      if (r.id === editingId) return false; // permitimos la propia reserva en edición
      if (r.idMesaAsignada !== mesaId) return false;
      if (r.estado === "Cancelada" || r.estado === "Finalizada") return false;
      if (!sameDate(r.fecha, fecha)) return false;

      const rStart = timeToMinutes(r.hora);
      const rDur = Number(r.duracion || 1);
      const rEnd = rStart + Math.round(rDur * 60);

      // solapan si start < rEnd && rStart < end
      return (start < rEnd) && (rStart < end);
    });
  }

  const available = mesas.filter(m => mesaLibrePara(m.id) || m.id === currentMesaId);

  if (available.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "No hay mesas disponibles";
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);
    const msg = document.getElementById("msgMesasDisponibles");
    if (msg) {
      msg.textContent = "⚠️ No hay mesas disponibles en este horario";
      msg.className = "form-text text-danger";
    }
    return;
  }

  available.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.id;
    opt.textContent = `Mesa ${m.id} - Cap: ${m.capacidad} - ${m.ubicacion}`;
    select.appendChild(opt);
  });
  // info
  const msg = document.getElementById("msgMesasDisponibles");
  if (msg) {
    msg.textContent = `✅ Mesas disponibles: ${available.length}`;
    msg.className = "form-text text-success";
  }
}

// comprobar solapamiento (usada en validación)
function existeSolapamiento(mesaId, fecha, hora, dur, excludeReservaId = null) {
  const reservas = getData("reservas");
  if (!fecha || !hora) return false;
  const start = timeToMinutes(hora);
  const end = start + Math.round(dur * 60);

  return reservas.some(r => {
    if (!r.idMesaAsignada || r.idMesaAsignada !== mesaId) return false;
    if (excludeReservaId && r.id === excludeReservaId) return false;
    if (r.estado === "Cancelada" || r.estado === "Finalizada") return false;
    if (!sameDate(r.fecha, fecha)) return false;
    const rStart = timeToMinutes(r.hora);
    const rEnd = rStart + Math.round((Number(r.duracion) || 1) * 60);
    return (start < rEnd) && (rStart < end);
  });
}

function renderReservas(filterMode = null, weekRange = null) {
  // filterMode: null | "week". weekRange: {from:Date, to:Date}
  const tbody = document.getElementById("tablaReservas");
  if (!tbody) return;
  const reservas = getData("reservas");
  const filtroFecha = document.getElementById("filtroFecha")?.value || "";
  const filtroEstado = document.getElementById("filtroEstado")?.value || "";

  const filas = reservas.filter(r => {
    if (filterMode === "week" && weekRange) {
      const dt = new Date(r.fecha);
      if (dt < weekRange.from || dt > weekRange.to) return false;
    } else {
      if (filtroFecha && r.fecha !== filtroFecha) return false;
    }
    if (filtroEstado && r.estado !== filtroEstado) return false;
    return true;
  });

  tbody.innerHTML = "";

  if (filas.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="11" class="text-center text-muted">No hay reservas que coincidan con los filtros.</td>`;
    tbody.appendChild(tr);
    return;
  }

  filas.forEach(r => {
    const tr = document.createElement("tr");
    // Aceptamos que la reserva tiene propiedad id (si en tu dataset la has usado idReserva, adapta).
    const rid = r.id || r.idReserva || "";

    tr.innerHTML = `
      <td>${rid}</td>
      <td>${r.nombreCliente || "-"}</td>
      <td>${r.numeroPersonas || "-"}</td>
      <td>${r.fecha || "-"}</td>
      <td>${r.hora || "-"}</td>
      <td>${(r.duracion !== undefined && r.duracion !== null) ? r.duracion + " h" : "-"}</td>
      <td>${r.idMesaAsignada || "-"}</td>
      <td>${r.estado || "-"}</td>
      <td>${r.ocasionEspecial || "-"}</td>
      <td>${r.notasAdicionales || "-"}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditReserva('${rid}')">Editar</button>
        <button class="btn btn-sm btn-success me-1" onclick="pagarReserva('${rid}')">Pagar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteReserva('${rid}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// abrir modal editar reserva
function openEditReserva(id) {
  const reservas = getData("reservas");
  const res = reservas.find(r => (r.id === id || r.idReserva === id));
  if (!res) {
    showAlert("Reserva no encontrada", "danger");
    return;
  }
  // rellenar modal
  document.getElementById("resEditId").value = res.id || res.idReserva || "";
  document.getElementById("nombreCliente").value = res.nombreCliente || "";
  document.getElementById("numeroPersonas").value = res.numeroPersonas || "";
  document.getElementById("fechaReserva").value = res.fecha || "";
  document.getElementById("horaReserva").value = res.hora || "";
  document.getElementById("duracionReserva").value = res.duracion || 1;
  // actualizar select de mesas incluyendo la actual aunque esté ocupada
  populateMesaSelect(res.idMesaAsignada || null);
  if (document.getElementById("idMesaAsignada")) document.getElementById("idMesaAsignada").value = res.idMesaAsignada || "";
  if (document.getElementById("estadoReserva")) document.getElementById("estadoReserva").value = res.estado || "Pendiente";
  if (document.getElementById("ocasionEspecial")) document.getElementById("ocasionEspecial").value = res.ocasionEspecial || "";
  if (document.getElementById("notasAdicionales")) document.getElementById("notasAdicionales").value = res.notasAdicionales || "";

  // show modal
  const modalEl = document.getElementById("modalReserva");
  if (modalEl) new bootstrap.Modal(modalEl).show();
}

// borrar reserva
function deleteReserva(id) {
  let reservas = getData("reservas");
  reservas = reservas.filter(r => (r.id !== id && r.idReserva !== id));
  saveData("reservas", reservas);
  renderReservas();
  populateMesaSelect();
  showAlert("Reserva eliminada", "success");
}

// pagar reserva -> cambiar estado a Finalizada y liberar mesa si corresponde
function pagarReserva(id) {
  const reservas = getData("reservas");
  const idx = reservas.findIndex(r => (r.id === id || r.idReserva === id));
  if (idx === -1) {
    showAlert("Reserva no encontrada", "danger");
    return;
  }
  reservas[idx].estado = "Finalizada";
  saveData("reservas", reservas);

  // intentar liberar mesa si no hay otra reserva confirmada para la misma mesa y mismo slot
  const mesaId = reservas[idx].idMesaAsignada;
  liberarMesaSiCorresponde(mesaId);

  renderReservas();
  renderMesas();
  populateMesaSelect();
  showAlert("Reserva pagada y mesa liberada (si corresponde)", "success");
}

// cuando una reserva queda Confirmada marcamos mesa ocupada
function marcarMesaOcupada(idMesa) {
  const mesas = getData("mesas");
  const idx = mesas.findIndex(m => m.id === idMesa);
  if (idx >= 0) {
    mesas[idx].estado = "ocupada";
    saveData("mesas", mesas);
  }
}
// liberar si no hay reservas Confirmada activas para esa mesa
function liberarMesaSiCorresponde(idMesa) {
  const reservas = getData("reservas");
  const tieneConfirmada = reservas.some(r => r.idMesaAsignada === idMesa && r.estado === "Confirmada");
  const mesas = getData("mesas");
  const idx = mesas.findIndex(m => m.id === idMesa);
  if (idx >= 0) {
    mesas[idx].estado = tieneConfirmada ? "ocupada" : "disponible";
    saveData("mesas", mesas);
  }
}

// ============ FORMULARIO RESERVA (bind) =============
(function bindFormReserva() {
  const form = document.getElementById("formReserva");
  if (!form) return;
  form.setAttribute("novalidate", "true");

  // reactivo: cuando cambian fecha/hora/duración recalculate available mesas
  ["fechaReserva", "horaReserva", "duracionReserva"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => populateMesaSelect(document.getElementById("resEditId")?.value || null));
  });

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
      const hoy = new Date();
      const f = new Date(fechaEl.value);
      if (f < new Date(hoy.toDateString())) { setInvalid(fechaEl, "La fecha no puede ser en el pasado"); ok = false; } else clearInvalid(fechaEl);
    }

    if (!horaEl || !horaEl.value) { setInvalid(horaEl, "La hora es obligatoria"); ok = false; } else {
      const [hh, mm] = horaEl.value.split(":").map(Number);
      if (isNaN(hh) || hh < 8 || hh > 20) { setInvalid(horaEl, "La hora debe estar entre 08:00 y 20:00"); ok = false; } else clearInvalid(horaEl);
    }

    if (!durEl || !durEl.value || Number(durEl.value) <= 0) { setInvalid(durEl, "Duración inválida"); ok = false; } else clearInvalid(durEl);

    if (!mesaEl || !mesaEl.value) { setInvalid(mesaEl, "Selecciona una mesa"); ok = false; } else clearInvalid(mesaEl);

    if (!estadoEl || !estadoEl.value) { setInvalid(estadoEl, "Selecciona un estado"); ok = false; } else clearInvalid(estadoEl);

    if (!ok) {
      showAlert("Corrige los errores antes de guardar", "danger");
      return;
    }

    // validación solapamiento y capacidad
    const mesas = getData("mesas");
    const mesaSel = mesas.find(m => m.id === mesaEl.value);
    if (mesaSel && Number(numEl.value) > Number(mesaSel.capacidad)) {
      showAlert(`La mesa tiene capacidad máxima de ${mesaSel.capacidad} personas`, "danger");
      return;
    }

    // comprobar solapamiento
    const fecha = fechaEl.value;
    const hora = horaEl.value;
    const dur = Number(durEl.value);
    if (existeSolapamiento(mesaEl.value, fecha, hora, dur, id || null)) {
      showAlert("La mesa seleccionada ya está ocupada en ese rango horario", "danger");
      return;
    }

    // ahora guardamos
    let reservas = getData("reservas");

    if (id) {
      // editar reserv existente
      const idx = reservas.findIndex(r => (r.id === id || r.idReserva === id));
      if (idx >= 0) {
        reservas[idx].nombreCliente = nombreEl.value;
        reservas[idx].numeroPersonas = Number(numEl.value);
        reservas[idx].fecha = fecha;
        reservas[idx].hora = hora;
        reservas[idx].duracion = Number(dur);
        reservas[idx].idMesaAsignada = mesaEl.value;
        reservas[idx].estado = estadoEl.value;
        reservas[idx].ocasionEspecial = ocasionEl.value;
        reservas[idx].notasAdicionales = notasEl.value;
        showAlert("Reserva actualizada", "success");
      } else {
        showAlert("Reserva a editar no encontrada", "danger");
        return;
      }
    } else {
      // nueva reserva
      const newRes = {
        id: generateId("R"),
        nombreCliente: nombreEl.value,
        numeroPersonas: Number(numEl.value),
        fecha: fecha,
        hora: hora,
        duracion: Number(dur),
        idMesaAsignada: mesaEl.value,
        estado: estadoEl.value,
        ocasionEspecial: ocasionEl.value,
        notasAdicionales: notasEl.value
      };
      reservas.push(newRes);
      // si la nueva reserva está confirmada marcamos mesa ocupada
      if (newRes.estado === "Confirmada") {
        marcarMesaOcupada(newRes.idMesaAsignada);
      }
      showAlert("Reserva creada", "success");
    }

    saveData("reservas", reservas);
    renderReservas();
    renderMesas();
    populateMesaSelect();
    // cerrar modal
    try { bootstrap.Modal.getInstance(document.getElementById("modalReserva")).hide(); } catch (e) {}
    form.reset();
  });
})();

// ================= FILTROS RÁPIDOS ===================
(function bindQuickFilters() {
  const btnHoy = document.getElementById("btnHoy");
  const btnManana = document.getElementById("btnMañana");
  const btnSemana = document.getElementById("btnSemana");
  const btnLimpiar = document.getElementById("btnLimpiarFiltros");

  if (btnHoy) {
    btnHoy.addEventListener("click", (e) => {
      e.preventDefault();
      const hoy = new Date();
      document.getElementById("filtroFecha").value = hoy.toISOString().split("T")[0];
      renderReservas();
    });
  }
  if (btnManana) {
    btnManana.addEventListener("click", (e) => {
      e.preventDefault();
      const manana = new Date();
      manana.setDate(manana.getDate() + 1);
      document.getElementById("filtroFecha").value = manana.toISOString().split("T")[0];
      renderReservas();
    });
  }
  if (btnSemana) {
    btnSemana.addEventListener("click", (e) => {
      e.preventDefault();
      const inicio = new Date();
      inicio.setHours(0,0,0,0);
      const fin = new Date();
      fin.setDate(fin.getDate() + 6);
      fin.setHours(23,59,59,999);
      renderReservas("week", { from: inicio, to: fin });
    });
  }
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", (e) => {
      e.preventDefault();
      const f = document.getElementById("filtroFecha");
      const s = document.getElementById("filtroEstado");
      if (f) f.value = "";
      if (s) s.value = "";
      renderReservas();
    });
  }

  // listeners de filtro manuales
  const filtroFecha = document.getElementById("filtroFecha");
  const filtroEstado = document.getElementById("filtroEstado");
  if (filtroFecha) filtroFecha.addEventListener("change", () => renderReservas());
  if (filtroEstado) filtroEstado.addEventListener("change", () => renderReservas());
})();

// inicializar selects y renders al cargar
document.addEventListener("DOMContentLoaded", () => {
  // crear keys vacías si no existen (seed mínimo)
  if (!localStorage.getItem("mesas")) {
    const demoMesas = [
      { id: "M1", capacidad: 4, ubicacion: "Terraza", estado: "disponible" },
      { id: "M2", capacidad: 2, ubicacion: "Interior", estado: "disponible" },
      { id: "M3", capacidad: 6, ubicacion: "VIP", estado: "deshabilitada" }
    ];
    saveData("mesas", demoMesas);
  }
  if (!localStorage.getItem("reservas")) {
    saveData("reservas", []);
  }

  // Render según la página (body data-page)
  const page = document.body.dataset.page || "";
  if (page === "mesas") {
    renderMesas();
    // si hay wrapper para estado ocultarlo por defecto en nueva mesa
    const estadoWrapper = document.getElementById("estadoMesaGroup");
    if (estadoWrapper) estadoWrapper.style.display = "none";
  }
  if (page === "reservas") {
    // poblar select mesas
    populateMesaSelect();
    renderReservas();
  }

  // también actualizar select si el usuario abre el modal de reserva manualmente
  const modalRes = document.getElementById("modalReserva");
  if (modalRes) {
    modalRes.addEventListener("show.bs.modal", () => {
      // si estamos editando la reserva, populateMesaSelect ya fue llamada desde openEditReserva
      if (!document.getElementById("resEditId")?.value) {
        populateMesaSelect();
      }
    });
  }
});



