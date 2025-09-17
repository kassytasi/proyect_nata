/* app.js - Sistema de Mesas y Reservas
   - compatible con los HTML que intercambiamos (ids usados: gridMesas, gridReservas,
     modalMesa, modalReserva, formMesa, formReserva, idMesa, capacidadMesa OR capacidad,
     ubicacionMesa OR ubicacion, estadoMesa, idMesaAsignada, msgMesasDisponibles,
     btnNuevaMesa (optional), btnNuevaReserva (optional), alertContainer)
*/

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
function showAlert(msg, type = "info", containerId = "alertContainer") {
  const area =
    document.getElementById(containerId) ||
    document.getElementById("alertArea") ||
    document.querySelector(".alert-area") ||
    null;
  if (!area) {
    // fallback to console
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

// =====================
// Mapeos / Constantes
// =====================
const OCASION_IMAGENES = {
  "cumpleaños": "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
  "aniversario": "https://cdn-icons-png.flaticon.com/512/2917/2917995.png",
  "negocios": "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  "graduación": "https://cdn-icons-png.flaticon.com/512/3135/3135800.png",
  "compromiso": "https://cdn-icons-png.flaticon.com/512/535/535234.png",
  "amigos": "https://cdn-icons-png.flaticon.com/512/1077/1077114.png",
  "romántica": "https://cdn-icons-png.flaticon.com/512/833/833472.png",
  "familia": "https://cdn-icons-png.flaticon.com/512/2922/2922561.png"
};
const OCASION_EMOJIS = {
  "cumpleaños": "🎂",
  "aniversario": "💖",
  "negocios": "💼",
  "graduación": "🎓",
  "compromiso": "💍",
  "amigos": "👯‍♂️",
  "romántica": "🌹",
  "familia": "👨‍👩‍👧‍👦"
};
const ESTADO_COLORES = {
  "Pendiente": "primary",   // azul
  "Confirmada": "success",  // verde
  "Finalizada": "secondary",// gris
  "Cancelada": "dark",      // negro
  "No Show": "secondary"    // gris
};

// =====================
// Seed demo (mesas + reservas) - solo si no existen
// =====================
function randomHora() {
  const min = 8, max = 20;
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
    const demoReservas = [
      {
        idReserva: "R1001",
        nombreCliente: "Ana López",
        numeroPersonas: 4,
        fechaReserva: randomFechaSemana(),
        horaReserva: randomHora(),
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
        idMesaAsignada: "M2",
        estado: "Pendiente",
        ocasionEspecial: "Negocios",
        notasAdicionales: ""
      }
    ];
    setLS(LS_KEYS.RESERVAS, demoReservas);
  }
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
    col.className = "col-md-3";
    // class state-... for visual color (you have css mapping)
    col.innerHTML = `
      <div class="card state-${m.estado}">
        <div class="card-body text-center">
          <h5 class="card-title text-light">Mesa ${m.id}</h5>
          <p class="text-light-weak mb-1">Capacidad: ${m.capacidad}</p>
          <p class="text-light-weak mb-2">Ubicación: ${m.ubicacion}</p>
          <div class="d-flex justify-content-center gap-2">
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
    cont.innerHTML = `<p class="text-muted">No hay reservas que coincidan con los filtros.</p>`;
    renderResumenReservas();
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
            <th>Hora</th>
            <th>Mesa</th>
            <th>Ocasión</th>
            <th>Estado</th>
            <th>Operaciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  reservasFiltradas.forEach(r => {
    const mesa = getLS(LS_KEYS.MESAS).find(m => m.id === r.idMesaAsignada);
    const emoji = r.ocasionEspecial ? OCASION_EMOJIS[r.ocasionEspecial.toLowerCase()] || "" : "";
    const color = ESTADO_COLORES[r.estado] || "secondary";

    html += `
      <tr>
        <td>${r.nombreCliente}</td>
        <td>${r.numeroPersonas}</td>
        <td>${r.fechaReserva}</td>
        <td>${r.horaReserva}</td>
        <td>${mesa ? `Mesa ${mesa.id} (${mesa.ubicacion})` : r.idMesaAsignada}</td>
        <td>${r.ocasionEspecial ? `${emoji} ${r.ocasionEspecial}` : "-"}</td>
        <td><span class="badge bg-${color}">${r.estado}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${r.idReserva}">Editar</button>
          <button class="btn btn-sm btn-success" data-action="pay" data-id="${r.idReserva}">Pagar</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${r.idReserva}">Eliminar</button>
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
}


// =====================
// Cargar mesas disponibles en el select (solo las libres para fecha/hora).
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
  const idReservaActual = document.getElementById("resEditId")?.value || null;

  // Filtrar mesas disponibles: estado 'disponible' y sin reserva activa en esa fecha/hora.
  const mesasDisponibles = mesas.filter(m => {
    // permitir la mesa actual aunque no esté 'disponible' para que pueda verse en edición
    if (m.estado !== "disponible" && m.id !== mesaActual) return false;

    // si fecha/hora no están seleccionadas, consideramos disponibles (pero we'll just show all 'disponible' mesas)
    if (!fechaInput || !horaInput) return m.estado === "disponible" || m.id === mesaActual;

    // verificar si hay una reserva distinta (no cancelada/no finalizada) en mismo fecha+hora
    const ocupada = reservas.some(r =>
      r.idMesaAsignada === m.id &&
      r.fechaReserva === fechaInput &&
      r.horaReserva === horaInput &&
      r.estado !== "Cancelada" &&
      r.estado !== "Finalizada" &&
      r.idReserva !== idReservaActual // exclude editing reservation itself
    );
    return (!ocupada) || m.id === mesaActual;
  });

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
    msg.textContent = "⚠️ No hay mesas disponibles en este horario";
    msg.className = "form-text text-danger";
  } else {
    msg.textContent = `✅ Mesas disponibles: ${mesasDisponibles.length}`;
    msg.className = "form-text text-success";
  }
}

// =====================
// Helpers: actualizar estado de mesas según reservas confirmadas
// - sencillo: cuando una reserva se guarda como Confirmada -> set mesa estado = 'ocupada'
// - cuando se finaliza/paga -> mesa -> 'disponible' (si no existe otra reserva confirmada en el mismo instante)
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
  // si no hay reservas activas 'Confirmada' para esa mesa (cualquier fecha/hora),
  // la dejamos disponible. (simple heurística)
  const reservas = getLS(LS_KEYS.RESERVAS);
  const tieneConfirmada = reservas.some(r => r.idMesaAsignada === idMesa && r.estado === "Confirmada");
  const mesas = getLS(LS_KEYS.MESAS);
  const idx = mesas.findIndex(m => m.id === idMesa);
  if (idx >= 0) {
    mesas[idx].estado = tieneConfirmada ? "ocupada" : "disponible";
    setLS(LS_KEYS.MESAS, mesas);
  }
}

// =====================
// Iniciar Mesas: CRUD + acciones
// =====================
function initMesas() {
  renderMesas();

  // btnNuevaMesa puede existir con id, si no usamos selector con data-bs-target
  const btnNuevaMesa = document.getElementById("btnNuevaMesa") || document.querySelector('[data-bs-target="#modalMesa"]');
  if (btnNuevaMesa) {
    btnNuevaMesa.addEventListener("click", () => {
      // Reseteamos los campos si existen
      if (document.getElementById("mesaEditId")) document.getElementById("mesaEditId").value = "";
      if (document.getElementById("idMesa")) document.getElementById("idMesa").value = "";
      if (document.getElementById("capacidadMesa")) document.getElementById("capacidadMesa").value = "";
      if (document.getElementById("capacidad")) document.getElementById("capacidad").value = "";
      if (document.getElementById("ubicacionMesa")) document.getElementById("ubicacionMesa").value = "";
      if (document.getElementById("ubicacion")) document.getElementById("ubicacion").value = "";
      if (document.getElementById("estadoMesa")) document.getElementById("estadoMesa").value = "disponible";
      // show modal (Bootstrap)
      const modalEl = document.getElementById("modalMesa");
      if (modalEl) new bootstrap.Modal(modalEl).show();
    });
  }

  // Guardar mesa (form id puede variar: formMesa)
  const formMesa = document.getElementById("formMesa");
  if (formMesa) {
    formMesa.addEventListener("submit", e => {
      e.preventDefault();
      let mesas = getLS(LS_KEYS.MESAS);

      // campos posibles (para compatibilidad con varias versiones de HTML)
      const idEdit = document.getElementById("mesaEditId")?.value || "";
      // si hay input idMesa, usamos el valor; si no, generamos
      let idCampo = document.getElementById("idMesa")?.value || null;
      if (!idCampo && !idEdit) idCampo = "M" + new Date().getTime().toString().slice(-4);

      const capacidad = parseInt(document.getElementById("capacidadMesa")?.value || document.getElementById("capacidad")?.value || "1");
      const ubicacion = document.getElementById("ubicacionMesa")?.value || document.getElementById("ubicacion")?.value || "General";
      const estado = document.getElementById("estadoMesa")?.value || "disponible";

      const nuevaMesa = { id: idCampo, capacidad: capacidad, ubicacion: ubicacion, estado: estado };

      if (idEdit) {
        const idx = mesas.findIndex(m => m.id === idEdit);
        if (idx >= 0) mesas[idx] = nuevaMesa;
        showAlert("Mesa actualizada", "success");
      } else {
        // evitar IDs duplicados
        if (mesas.find(m => m.id === nuevaMesa.id)) {
          showAlert("Ya existe una mesa con ese ID", "danger");
          return;
        }
        mesas.push(nuevaMesa);
        showAlert("Mesa creada", "success");
      }

      setLS(LS_KEYS.MESAS, mesas);
      renderMesas();
      // cerrar modal si existe
      const modalEl = document.getElementById("modalMesa");
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
      }
    });
  }

  // Acciones de editar/reservar/eliminar en gridMesas
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
        if (document.getElementById("idMesa")) document.getElementById("idMesa").value = mesa.id;
        if (document.getElementById("capacidadMesa")) document.getElementById("capacidadMesa").value = mesa.capacidad;
        if (document.getElementById("capacidad")) document.getElementById("capacidad").value = mesa.capacidad;
        if (document.getElementById("ubicacionMesa")) document.getElementById("ubicacionMesa").value = mesa.ubicacion;
        if (document.getElementById("ubicacion")) document.getElementById("ubicacion").value = mesa.ubicacion;
        if (document.getElementById("estadoMesa")) document.getElementById("estadoMesa").value = mesa.estado;
        const modalEl = document.getElementById("modalMesa");
        if (modalEl) new bootstrap.Modal(modalEl).show();
      }

      if (action === "delete") {
        let mesas = getLS(LS_KEYS.MESAS);
        mesas = mesas.filter(m => m.id !== id);
        setLS(LS_KEYS.MESAS, mesas);
        // actualizar reservas que apuntaban a esa mesa? (no forzamos, pero they will show id if mesa removed)
        renderMesas();
        showAlert("Mesa eliminada", "success");
      }

      if (action === "reserve") {
        // guardamos y redirigimos a reservas.html (si existe) o abrimos modal de reservas si estamos en la misma página
        localStorage.setItem("mesaSeleccionada", id);
        // si la página actual tiene data-page="reservas", abrimos modal en la misma página
        if (document.body.dataset.page === "reservas") {
          // si estamos en reservas, cargar modal y prefijar mesa
          cargarMesasDisponibles(id);
          document.getElementById("idMesaAsignada").value = id;
          const modalEl = document.getElementById("modalReserva");
          if (modalEl) new bootstrap.Modal(modalEl).show();
        } else {
          // ir a reservas.html
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

  // listeners para filtros rápidos (Hoy, Mañana, Semana)
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
    // semana actual: desde hoy hasta 6 días adelante -> mostramos mediante filtroFecha empty + custom: we'll show a week view
    // implementamos como: filtrar reservas cuya fecha esté entre hoy y hoy+6
    const inicio = new Date();
    const fin = new Date();
    fin.setDate(fin.getDate() + 6);
    const reservas = getLS(LS_KEYS.RESERVAS);
    const filtradas = reservas.filter(r => {
      const fr = new Date(r.fechaReserva);
      return fr >= new Date(inicio.toDateString()) && fr <= new Date(fin.toDateString());
    });
    // renderizamos manualmente con esas
    // reuse renderReservas by setting a temporary hidden field? simpler: build UI here
    const cont = document.getElementById("gridReservas");
    if (!cont) return;
    cont.innerHTML = "";
    if (filtradas.length === 0) cont.innerHTML = `<div class="col-12"><p class="text-muted">No hay reservas esta semana.</p></div>`;
    filtradas.forEach(r => {
      const col = document.createElement("div");
      col.className = "col-md-4";
      const emoji = r.ocasionEspecial ? OCASION_EMOJIS[r.ocasionEspecial.toLowerCase()] || "" : "";
      const mesa = getLS(LS_KEYS.MESAS).find(m => m.id === r.idMesaAsignada);
      const color = ESTADO_COLORES[r.estado] || "secondary";
      col.innerHTML = `
        <div class="card border-${color} shadow-sm h-100">
          <div class="card-header bg-${color} text-white text-center fw-bold">${r.estado}</div>
          <div class="card-body">
            <h5 class="card-title">${r.nombreCliente}</h5>
            <p class="mb-1">Personas: <b>${r.numeroPersonas}</b></p>
            <p class="mb-1">Fecha: <b>${r.fechaReserva}</b> · Hora: <b>${r.horaReserva}</b></p>
            ${mesa ? `<p class="mb-1">Mesa: <b>${mesa.id}</b> - Capacidad: ${mesa.capacidad} - ${mesa.ubicacion}</p>` : `<p class="mb-1">Mesa: ${r.idMesaAsignada}</p>`}
            ${r.ocasionEspecial ? `<p class="mb-1">Ocasión: <b>${emoji} ${r.ocasionEspecial}</b></p>` : ""}
            ${r.notasAdicionales ? `<p class="mb-0">Notas: ${r.notasAdicionales}</p>` : ""}
          </div>
          <div class="card-footer d-flex gap-2">
            <button class="btn btn-sm btn-outline-light flex-grow-1" data-action="edit" data-id="${r.idReserva}">Editar</button>
            <button class="btn btn-sm btn-success" data-action="pay" data-id="${r.idReserva}">Pagar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${r.idReserva}">Eliminar</button>
          </div>
        </div>
      `;
      cont.appendChild(col);
    });
    renderResumenReservas();
  });

  // filtros básicos
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
    // setear valor si existe opción
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
      cargarMesasDisponibles();
      const modalEl = document.getElementById("modalReserva");
      if (modalEl) new bootstrap.Modal(modalEl).show();
    });
  }

  // actualizar select cuando cambian fecha/hora (reactividad)
  document.getElementById("fechaReserva")?.addEventListener("change", () => cargarMesasDisponibles());
  document.getElementById("horaReserva")?.addEventListener("change", () => cargarMesasDisponibles());

  // submit reserva (crear/editar)
  const formReserva = document.getElementById("formReserva");
  if (formReserva) {
    formReserva.addEventListener("submit", (e) => {
      e.preventDefault();
      let reservas = getLS(LS_KEYS.RESERVAS);

      const idEdit = document.getElementById("resEditId")?.value || "";
      const nombreCliente = (document.getElementById("nombreCliente")?.value || "").trim();
      const numeroPersonas = parseInt(document.getElementById("numeroPersonas")?.value || "0");
      const fechaReservaVal = document.getElementById("fechaReserva")?.value || "";
      const horaReservaVal = document.getElementById("horaReserva")?.value || "";
      const idMesaAsignadaVal = document.getElementById("idMesaAsignada")?.value || "";
      const estadoVal = document.getElementById("estadoReserva")?.value || "Pendiente";
      const ocasionVal = document.getElementById("ocasionEspecial")?.value || "";
      const notasVal = document.getElementById("notasAdicionales")?.value || "";

      // validaciones básicas
      if (!nombreCliente) {
        showAlert("El nombre del cliente es obligatorio", "danger");
        return;
      }
      if (!numeroPersonas || numeroPersonas <= 0) {
        showAlert("El número de personas debe ser mayor a cero", "danger");
        return;
      }
      if (!fechaReservaVal) {
        showAlert("La fecha es obligatoria", "danger");
        return;
      }
      if (!horaReservaVal) {
        showAlert("La hora es obligatoria", "danger");
        return;
      }
      // Validación hora 08:00 - 20:00
      const [h, min] = horaReservaVal.split(":").map(Number);
      if (isNaN(h) || h < 8 || (h === 20 && min > 0) || h > 20) {
        showAlert("La hora debe estar entre 08:00 y 20:00", "danger");
        return;
      }
      // Fecha/hora posterior a "ahora"
      const fechaHora = new Date(fechaReservaVal + "T" + horaReservaVal);
      if (fechaHora <= new Date()) {
        showAlert("La fecha y hora deben ser posteriores a la actual", "danger");
        return;
      }

      // Validar que exista una mesa disponible seleccionada
      const selectMesa = document.getElementById("idMesaAsignada");
      if (!selectMesa || selectMesa.options.length === 0 || !selectMesa.value || selectMesa.disabled) {
        showAlert("No hay mesas disponibles para la fecha y hora seleccionadas", "danger");
        return;
      }

      const nuevaReserva = {
        idReserva: idEdit || genId("R"),
        nombreCliente: nombreCliente,
        numeroPersonas: numeroPersonas,
        fechaReserva: fechaReservaVal,
        horaReserva: horaReservaVal,
        idMesaAsignada: idMesaAsignadaVal,
        estado: estadoVal,
        ocasionEspecial: ocasionVal,
        notasAdicionales: notasVal
      };

      if (idEdit) {
        const idx = reservas.findIndex(r => r.idReserva === idEdit);
        if (idx >= 0) reservas[idx] = nuevaReserva;
        showAlert("Reserva actualizada", "success");
      } else {
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
      // cerrar modal
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
        // cargar datos al modal
        if (document.getElementById("resEditId")) document.getElementById("resEditId").value = r.idReserva;
        if (document.getElementById("nombreCliente")) document.getElementById("nombreCliente").value = r.nombreCliente;
        if (document.getElementById("numeroPersonas")) document.getElementById("numeroPersonas").value = r.numeroPersonas;
        if (document.getElementById("fechaReserva")) document.getElementById("fechaReserva").value = r.fechaReserva;
        if (document.getElementById("horaReserva")) document.getElementById("horaReserva").value = r.horaReserva;
        // cargar mesas disponibles pero pasando la mesa actual para que aparezca en edición
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
        // si la reserva eliminada estaba Confirmada, intentamos liberar mesa
        if (toDelete && toDelete.idMesaAsignada) {
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

          // liberar mesa asociada (y actualizar almacenamiento)
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

  // inicializas según la página (body data-page)
  const page = document.body.dataset.page || "";

  // renderizar / inicializar ambos para que todo esté listo si el usuario tiene ambas páginas abiertas
  if (page === "mesas" || page === "") {
    // small delay to ensure DOM modals are loaded
    initMesas();
  }
  if (page === "reservas" || page === "") {
    initReservas();
  }
});
