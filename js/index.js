let propiedades = [];

function cargarPropiedadesBase() {
    return fetch("data/propiedades.json")
        .then(function(response) {
            if (!response.ok) throw new Error("Error cargando JSON");
            return response.json();
        })
        .then(function(data) {
            propiedades = data;
        })
        .catch(function(error) {
            console.error(error);
        });
}

function combinarPropiedadesConLocalStorage() {
    const propiedadesLocales = JSON.parse(localStorage.getItem("aptify_propiedades")) || [];
    propiedadesLocales.forEach(function(propLocal) {
        const yaExiste = propiedades.some(function(p) {
            return p.id === propLocal.id;
        });
        if (!yaExiste) propiedades.push(propLocal);
    });
}

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

function crearTarjetaPropiedad(propiedad) {
    const tagsHTML = propiedad.etiquetas.map(function(etiqueta) {
        const icono = iconosEtiqueta[etiqueta] || "&#127968;";
        return '<span class="tag tag-sm">' + icono + ' ' + etiqueta + '</span>';
    }).join("");

    return (
        '<article class="property-card">' +
            '<figure>' +
                '<img src="' + propiedad.imagen + '" alt="' + propiedad.nombre + '">' +
                '<figcaption>' + propiedad.provincia + ', ' + propiedad.canton + '</figcaption>' +
            '</figure>' +
            '<span class="card-label">' + propiedad.tipo + '</span>' +
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

/* Lógica para movimiento del Carrusel */
let posicionActual = 0;

function inicializarCarrusel() {
    const contenedor = document.getElementById("contenedorRecientes");
    const btnPrev = document.getElementById("btn-prev");
    const btnNext = document.getElementById("btn-next");

    const activas = propiedades.filter(function(p) {
        return p.activa;
    });

    if (activas.length === 0) {
        contenedor.innerHTML = '<p class="mensaje-vacio">No hay propiedades disponibles por el momento.</p>';
        if(btnPrev) btnPrev.style.display = 'none';
        if(btnNext) btnNext.style.display = 'none';
        return;
    }

    contenedor.innerHTML = activas.map(crearTarjetaPropiedad).join("");

    /* Control de navegación */
    const tarjetas = contenedor.querySelectorAll(".property-card");
    
    function moverCarrusel() {
        if (tarjetas.length === 0) return;
        const anchoTarjeta = tarjetas[0].getBoundingClientRect().width;
        const gap = window.innerWidth <= 480 ? 0 : 20;
        
        const desplazamiento = posicionActual * (anchoTarjeta + gap);
        contenedor.style.transform = "translateX(-" + desplazamiento + "px)";
    }

    if(btnNext) {
        btnNext.addEventListener("click", function() {
            const tarjetasVisibles = Math.floor(contenedor.parentElement.clientWidth / tarjetas[0].clientWidth);
            if (posicionActual < tarjetas.length - tarjetasVisibles) {
                posicionActual++;
                moverCarrusel();
            } else {
                posicionActual = 0;
                moverCarrusel();
            }
        });
    }

    if(btnPrev) {
        btnPrev.addEventListener("click", function() {
            if (posicionActual > 0) {
                posicionActual--;
                moverCarrusel();
            } else {
                const tarjetasVisibles = Math.floor(contenedor.parentElement.clientWidth / tarjetas[0].clientWidth);
                posicionActual = tarjetas.length - tarjetasVisibles;
                moverCarrusel();
            }
        });
    }

    // Ajusta la posición si el usuario cambia el tamaño del navegador
    window.addEventListener("resize", moverCarrusel);
}

document.addEventListener("DOMContentLoaded", function() {
    cargarPropiedadesBase().then(function() {
        combinarPropiedadesConLocalStorage();
        inicializarCarrusel();
    });
});