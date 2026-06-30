let propiedades = [];

function cargarPropiedadesBase() {
    return fetch("data/propiedades.json")
        .then(function(response) {
            if (!response.ok) {
                throw new Error("No se pudo cargar el archivo JSON");
            }
            return response.json();
        })
        .then(function(data) {
            propiedades = data;
        })
        .catch(function(error) {
            console.error("Error en Fetch:", error);
        });
}

function combinarPropiedadesConLocalStorage() {
    const propiedadesLocales = JSON.parse(localStorage.getItem("aptify_propiedades")) || [];

    propiedadesLocales.forEach(function(propLocal) {
        // Evita duplicas al recargar
        const yaExiste = propiedades.some(function(p) {
            return p.id === propLocal.id;
        });

        if (!yaExiste) {
            propiedades.push(propLocal);
        }
    });
}

/* Íconos de etiqueta de cada característica */
const iconosEtiqueta = {
    "Mascotas": "&#128062;",
    "Cochera": "&#128663;",
    "Familias": "&#128106;",
    "Estudiantes": "&#127891;",
    "Parejas": "&#128145;"
};

function formatearPrecio(precio) {
    return "₡" + precio.toLocaleString("es-CR");
}

function obtenerEstado(propiedad) {
    if (!propiedad.activa) {
        return { texto: "No disponible", clase: "estado-inactivo" };
    }
    return { texto: "Disponible", clase: "estado-disponible" };
}

function crearTarjetaBusqueda(propiedad) {
    const estado = obtenerEstado(propiedad);

    const tagsHTML = propiedad.etiquetas.map(function(etiqueta) {
        const icono = iconosEtiqueta[etiqueta] || "&#127968;";
        return '<span class="tag tag-sm">' + icono + ' ' + etiqueta + '</span>';
    }).join("");

    return (
        '<article class="property-card' + (!propiedad.activa ? ' card-inactiva' : '') + '">' +
            '<figure>' +
                '<img src="' + propiedad.imagen + '" alt="' + propiedad.nombre + '">' +
                '<figcaption>' + propiedad.provincia + ', ' + propiedad.canton + '</figcaption>' +
            '</figure>' +
            '<span class="card-label">' + propiedad.tipo + '</span>' +
            '<span class="card-estado ' + estado.clase + '">' + estado.texto + '</span>' +
            '<div class="property-card-content">' +
                '<h3>' + propiedad.nombre + '</h3>' +
                '<p class="property-location">&#128205; ' + propiedad.provincia + ', ' + propiedad.canton + '</p>' +
                '<div class="property-features">' +
                    '<span>' + propiedad.habitaciones + ' hab.</span>' +
                    '<span>' + propiedad.banos + ' baño' + (propiedad.banos > 1 ? 's' : '') + '</span>' +
                    '<span>' + propiedad.metros + ' m²</span>' +
                '</div>' +
                '<div class="property-tags">' + tagsHTML + '</div>' +
                '<div class="property-footer" style="align-items: flex-end;">' +
                    '<div>' +
                        '<span style="display:block; font-size: 0.75rem; color: var(--color-texto-suave); margin-bottom: 2px;">Depósito: ' + (propiedad.deposito ? 
                        formatearPrecio(propiedad.deposito) : 'Consultar') + '</span>' +
                        '<span class="property-price">' + formatearPrecio(propiedad.precio) + ' <small>/mes</small></span>' +
                    '</div>' +
                    '<a href="#" class="btn-card' + (!propiedad.activa ? ' btn-card-disabled' : '') + '">Ver más</a>' +
                '</div>' +
            '</div>' +
        '</article>'
    );
}

function aplicarFiltros() {
    const filtroNombre = document.getElementById("filtroNombre").value.toLowerCase().trim();
    const filtroProvincia = document.getElementById("filtroProvincia").value;
    const filtroTipo = document.getElementById("filtroTipo").value;
    const filtroPrecio = document.getElementById("filtroPrecio").value;
    const filtroEtiqueta = document.getElementById("filtroEtiqueta").value;
    const filtroHabitacion = document.getElementById("filtroHabitacion").value;

    const resultado = propiedades.filter(function(p) {

        if (filtroNombre && !p.nombre.toLowerCase().includes(filtroNombre)) return false;

        if (filtroProvincia && p.provincia !== filtroProvincia) return false;

        if (filtroTipo && p.tipo !== filtroTipo) return false;

        if (filtroPrecio && p.precio > Number(filtroPrecio)) return false;

        if (filtroEtiqueta && !p.etiquetas.includes(filtroEtiqueta)) return false;

        if (filtroHabitacion && p.habitaciones < Number(filtroHabitacion)) return false;

        return true;
    });

    renderizarResultados(resultado);
}

function renderizarResultados(lista) {
    const contenedor = document.getElementById("contenedorPropiedades");
    const mensaje    = document.getElementById("mensajePropiedades");

    mensaje.textContent = "Mostrando " + lista.length + " propiedad(es).";

    if (lista.length === 0) {
        contenedor.innerHTML =
            '<div class="empty-state">' +
                '<h3>Sin resultados</h3>' +
                '<p>Ninguna propiedad coincide con los filtros seleccionados. Intentá con otras opciones.</p>' +
            '</div>';
        return;
    }

    contenedor.innerHTML = lista.map(crearTarjetaBusqueda).join("");
}

/* Valida y limpia el texto mientras el usuario escribe */
function validarEntradaNombre(evento) {
    const input = evento.target;
    const mensajeError = document.getElementById("errorNombre");
    
    const regexPermitido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-_]*$/;

    if (!regexPermitido.test(input.value)) {
        // Muestra el mensaje de error visual
        if (mensajeError) mensajeError.style.display = "block";
        
        // Remueve el último carácter inválido introducido
        input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s-_]/g, "");
    } else {
        // Oculta el mensaje si todo está correcto
        if (mensajeError) mensajeError.style.display = "none";
    }

    aplicarFiltros(); // Letra por letra
}

function limpiarFiltros() {
    document.getElementById("filtroNombre").value = "";
    const mensajeError = document.getElementById("errorNombre");
    if (mensajeError) mensajeError.style.display = "none";

    document.getElementById("filtroProvincia").value = "";
    document.getElementById("filtroTipo").value = "";
    document.getElementById("filtroPrecio").value = "";
    document.getElementById("filtroEtiqueta").value = "";
    document.getElementById("filtroHabitacion").value = "";

    aplicarFiltros();
}

document.addEventListener("DOMContentLoaded", function() {
    cargarPropiedadesBase().then(function() {
        combinarPropiedadesConLocalStorage();
        aplicarFiltros();
    });

    // Tiempo real para filtrar y validar al escribir
    const inputNombre = document.getElementById("filtroNombre");
    if (inputNombre) {
        inputNombre.addEventListener("input", validarEntradaNombre);
    }

    document.getElementById("filtroProvincia").addEventListener("change", aplicarFiltros);
    document.getElementById("filtroTipo").addEventListener("change", aplicarFiltros);
    document.getElementById("filtroPrecio").addEventListener("change", aplicarFiltros);
    document.getElementById("filtroEtiqueta").addEventListener("change", aplicarFiltros);
    document.getElementById("filtroHabitacion").addEventListener("change", aplicarFiltros);
    document.getElementById("btnLimpiarFiltros").addEventListener("click", limpiarFiltros);
});