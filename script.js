// --- LOGIN ---
const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");
const loginScreen = document.getElementById("loginScreen");
const saeScreen = document.getElementById("saeScreen");

// Array de usuarios permitidos
const USUARIOS = [
    {usuario: "admin", contrasena: "1234"},
    {usuario: "jefe1", contrasena: "abcd"},
    {usuario: "jefe2", contrasena: "4321"}
];

loginBtn.addEventListener("click", () => {
    const u = loginUser.value.trim();
    const p = loginPass.value.trim();
    const valido = USUARIOS.some(user => user.usuario === u && user.contrasena === p);

    if(valido){
        loginScreen.style.display = "none";
        saeScreen.style.display = "block";
        inicializarSAE();
    } else {
        loginError.textContent = "Usuario o contraseña incorrectos";
    }
});

// --- SAE ---
let vehiculos = JSON.parse(localStorage.getItem("vehiculos")) || [];
vehiculos.forEach(v => { if(!v.ubicacion) v.ubicacion = "Calle"; });

function inicializarSAE(){
    mostrarEstado();
    mostrarAlertas();

    document.getElementById("agregarBtn").addEventListener("click", agregarVehiculo);
    document.getElementById("registrarBtn").addEventListener("click", registrarRetraso);
    document.getElementById("actualizarHorarioBtn").addEventListener("click", actualizarHorarioPrevisto);
    document.getElementById("actualizarCocheraBtn").addEventListener("click", actualizarCochera);
    document.getElementById("borrarBtn").addEventListener("click", borrarVehiculo);
    document.getElementById("mostrarHorario").addEventListener("change", mostrarEstado);
}

// --- FUNCIONES SAE ---
function guardarVehiculos() {
    localStorage.setItem("vehiculos", JSON.stringify(vehiculos));
}

function convertirATiempoDecimal(texto){
    texto = texto.trim();
    if(!texto) return 0;
    if(texto.includes(":")){
        let partes = texto.split(":");
        let horas = parseInt(partes[0]) || 0;
        let minutos = parseInt(partes[1]) || 0;
        return horas + minutos / 60;
    } else {
        let minutos = parseInt(texto) || 0;
        return minutos / 60;
    }
}

function mostrarEstado() {
    const tabla = document.getElementById("tablaVehiculos");
    const mostrarHorario = document.getElementById("mostrarHorario").checked;
    tabla.innerHTML = `<tr>
        <th>ID</th>
        ${mostrarHorario ? "<th>Horario Previsto</th>" : ""}
        <th>Hora Real</th>
        <th>Estado</th>
        <th>Ubicación</th>
    </tr>`;

    vehiculos.forEach(v => {
        let retrasoDecimal = v.horaReal - v.horarioPrevisto;
        let estado = "OK";
        if(retrasoDecimal > 0){
            let horas = Math.floor(retrasoDecimal);
            let minutos = Math.round((retrasoDecimal - horas) * 60);
            estado = `Retraso de ${horas}h ${minutos}min`;
        }
        tabla.innerHTML += `<tr>
            <td>${v.id}</td>
            ${mostrarHorario ? `<td>${v.horarioPrevisto.toFixed(2)}</td>` : ""}
            <td>${v.horaReal.toFixed(2)}</td>
            <td style="color:${retrasoDecimal>0?'#ff5252':'#00e676'}">${estado}</td>
            <td>${v.ubicacion}</td>
        </tr>`;
    });
}

function mostrarAlertas() {
    const listaAlertas = document.getElementById("alertas");
    listaAlertas.innerHTML = "";
    vehiculos.forEach(v => {
        let retrasoDecimal = v.horaReal - v.horarioPrevisto;
        if(retrasoDecimal > 0){
            let horas = Math.floor(retrasoDecimal);
            let minutos = Math.round((retrasoDecimal - horas) * 60);
            listaAlertas.innerHTML += `<li class="alerta">${v.id} llega con retraso de ${horas}h ${minutos}min</li>`;
        }
    });
}

function agregarVehiculo() {
    const id = document.getElementById("nuevoId").value.trim();
    const horario = convertirATiempoDecimal(document.getElementById("nuevoHorario").value);
    if(!id){
        alert("Introduce un ID válido");
        return;
    }
    if(vehiculos.some(v => v.id === id)){
        alert("El vehículo ya existe");
        return;
    }
    vehiculos.push({id: id, horarioPrevisto: horario, horaReal: horario, ubicacion: "Calle"});
    guardarVehiculos();
    mostrarEstado();
    mostrarAlertas();
    document.getElementById("nuevoId").value = "";
    document.getElementById("nuevoHorario").value = "";
}

function registrarRetraso() {
    const vid = document.getElementById("vehiculoId").value.trim();
    const horaReal = convertirATiempoDecimal(document.getElementById("horaReal").value);
    let encontrado = false;
    vehiculos.forEach(v => {
        if(v.id === vid){
            v.horaReal = horaReal;
            encontrado = true;
        }
    });
    if(!encontrado){
        alert("Vehículo no encontrado");
    }
    guardarVehiculos();
    mostrarEstado();
    mostrarAlertas();
    document.getElementById("vehiculoId").value = "";
    document.getElementById("horaReal").value = "";
}

function actualizarHorarioPrevisto() {
    const vid = document.getElementById("vehiculoHorarioId").value.trim();
    const nuevoHorario = convertirATiempoDecimal(document.getElementById("nuevoHorarioPrevisto").value);
    let encontrado = false;
    vehiculos.forEach(v => {
        if(v.id === vid){
            v.horarioPrevisto = nuevoHorario;
            encontrado = true;
        }
    });
    if(!encontrado){
        alert("Vehículo no encontrado");
        return;
    }
    guardarVehiculos();
    mostrarEstado();
    mostrarAlertas();
    document.getElementById("vehiculoHorarioId").value = "";
    document.getElementById("nuevoHorarioPrevisto").value = "";
}

function actualizarCochera() {
    const vid = document.getElementById("vehiculoCocheraId").value.trim();
    const estado = document.getElementById("estadoCochera").value;
    let encontrado = false;
    vehiculos.forEach(v => {
        if(v.id === vid){
            v.ubicacion = estado;
            encontrado = true;
        }
    });
    if(!encontrado){
        alert("Vehículo no encontrado");
    }
    guardarVehiculos();
    mostrarEstado();
    document.getElementById("vehiculoCocheraId").value = "";
}

function borrarVehiculo() {
    const vid = document.getElementById("vehiculoBorrarId").value.trim();
    const inicialLength = vehiculos.length;
    vehiculos = vehiculos.filter(v => v.id !== vid);
    if(vehiculos.length === inicialLength){
        alert("Vehículo no encontrado");
    } else {
        guardarVehiculos();
        mostrarEstado();
        mostrarAlertas();
        document.getElementById("vehiculoBorrarId").value = "";
    }
}

// --- CERRAR SESIÓN ---
const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");

cerrarSesionBtn.addEventListener("click", () => {
    saeScreen.style.display = "none";      // Oculta SAE
    loginScreen.style.display = "flex";    // Muestra login
    loginUser.value = "";                   // Limpia usuario
    loginPass.value = "";                   // Limpia contraseña
    loginError.textContent = "";            // Limpia errores
});
