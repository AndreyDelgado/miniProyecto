document.addEventListener("DOMContentLoaded", () => {
    const publishForm = document.getElementById("publish-form");
    const authWarning = document.getElementById("auth-warning");
    let idEdicion = null; // Variable para saber si está creando o editando

    function verificarAcceso() {
        const activeUser = JSON.parse(localStorage.getItem("aptify_session"));
        
        if (activeUser) {
            if (publishForm) publishForm.style.display = "block";
            if (authWarning) authWarning.style.display = "none";
        } else {
            if (publishForm) publishForm.style.display = "none";
            if (authWarning) authWarning.style.display = "block";
        }
    }

    verificarAcceso();

    // Conecta con los formularios de sesión para actualizar
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const btnLogout = document.getElementById("btn-logout");

    if (loginForm) {
        loginForm.addEventListener("submit", () => {
            setTimeout(verificarAcceso, 100); 
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener("submit", () => {
            setTimeout(verificarAcceso, 100);
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            setTimeout(verificarAcceso, 100);
        });
    }

    // Lógica de publicación de propiedad
    if (publishForm) {
        publishForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const activeUser = JSON.parse(localStorage.getItem("aptify_session"));
            
            if (!activeUser) {
                alert("Debes iniciar sesión para publicar.");
                return; 
            }

            // Bloqueo de envío si hay errores matemáticos o de longitud
            const tituloValido = document.getElementById("prop-title").value.trim().length >= 10;
            const precioValido = Number(document.getElementById("prop-price").value) >= 50000;
            const metrosValido = Number(document.getElementById("prop-metros").value) >= 10;
            const cantonValido = document.getElementById("prop-canton").value.trim().length >= 3;
            const roomsValido = Number(document.getElementById("prop-rooms").value) >= 1;
            const bathsValido = Number(document.getElementById("prop-baths").value) >= 1;
            const depositoValido = Number(document.getElementById("prop-deposito").value) > 0;

            if (!tituloValido || !precioValido || !metrosValido || !cantonValido || !roomsValido || !bathsValido || !depositoValido) {
                alert("Por favor, corrige los campos marcados en rojo antes de publicar.");
                return; 
            }
            
            const etiquetasSeleccionadas = [];
            const tagMascotas = document.getElementById("tag-mascotas");
            const tagCochera = document.getElementById("tag-cochera");
            const tagFamilias = document.getElementById("tag-familias");
            const tagEstudiantes = document.getElementById("tag-estudiantes");
            const tagParejas = document.getElementById("tag-parejas");
            const estadoSelect = document.getElementById("prop-estado");
            const estaActiva = estadoSelect ? estadoSelect.value === "true" : true;

            if (tagMascotas && tagMascotas.checked) etiquetasSeleccionadas.push("Mascotas");
            if (tagCochera && tagCochera.checked) etiquetasSeleccionadas.push("Cochera");
            if (tagFamilias && tagFamilias.checked) etiquetasSeleccionadas.push("Familias");
            if (tagEstudiantes && tagEstudiantes.checked) etiquetasSeleccionadas.push("Estudiantes");
            if (tagParejas && tagParejas.checked) etiquetasSeleccionadas.push("Parejas");

            const nuevaPropiedad = {
                id: idEdicion ? idEdicion : Date.now(), // Si se edita, mantiene el ID original
                nombre: document.getElementById("prop-title").value.trim(),
                precio: Number(document.getElementById("prop-price").value),
                deposito: Number(document.getElementById("prop-deposito").value),
                tipo: document.getElementById("prop-tipo").value,
                provincia: document.getElementById("prop-provincia").value,
                canton: document.getElementById("prop-canton").value.trim(),
                habitaciones: Number(document.getElementById("prop-rooms").value),
                banos: Number(document.getElementById("prop-baths").value),
                metros: Number(document.getElementById("prop-metros").value),
                etiquetas: etiquetasSeleccionadas,
                imagen: document.getElementById("prop-image").value.trim(),
                activa: estaActiva,
                descripcion: document.getElementById("prop-desc").value.trim(),
                propietario: activeUser.nombre,
                correoPropietario: activeUser.correo,
            };

            // Propiedades publicadas anteriormente
            let propiedades = JSON.parse(localStorage.getItem("aptify_propiedades")) || [];
            
            if (idEdicion) {
                // Actualiza la propiedad existente
                const index = propiedades.findIndex(p => p.id === idEdicion);
                if (index !== -1) {
                    nuevaPropiedad.fechaPublicacion = propiedades[index].fechaPublicacion; // Mantiene fecha original
                    propiedades[index] = nuevaPropiedad;
                }
                alert("¡Los cambios se han guardado con éxito!");
            } else {
                // Añade una nueva
                nuevaPropiedad.fechaPublicacion = new Date().toLocaleDateString();
                propiedades.push(nuevaPropiedad);
                alert("¡Éxito! Tu propiedad ha sido publicada en Aptify.");
            }
            
            localStorage.setItem("aptify_propiedades", JSON.stringify(propiedades));

            publishForm.reset();
            idEdicion = null;
            document.querySelector("#publish-form button[type='submit']").textContent = "Publicar Propiedad";
            
            renderizarMisPropiedades();
            
        });
    }

    const btnLimpiar = document.getElementById("btn-limpiar");
    if (btnLimpiar && publishForm) {
        btnLimpiar.addEventListener("click", () => {
            if (confirm("¿Estás seguro de que deseas borrar todos los datos ingresados en el formulario?")) {
                publishForm.reset();
                
                idEdicion = null;
                document.querySelector("#publish-form button[type='submit']").textContent = "Publicar Propiedad";
                
                alert("El formulario ha sido limpiado.");
            }
        });
    }

    // Gestión y eliminación de registros
    const gestionSection = document.getElementById("gestion-propiedades");
    const listaMisPropiedades = document.getElementById("lista-mis-propiedades");

    function renderizarMisPropiedades() {
        const activeUser = JSON.parse(localStorage.getItem("aptify_session"));
        if (!activeUser || !gestionSection || !listaMisPropiedades) return;

        // Mostrar la sección si hay sesión
        gestionSection.style.display = "block";

        const propiedades = JSON.parse(localStorage.getItem("aptify_propiedades")) || [];
        
        const misPropiedades = propiedades.filter(p => p.correoPropietario === activeUser.correo);

        if (misPropiedades.length === 0) {
            listaMisPropiedades.innerHTML = '<p style="color: var(--color-texto-suave); font-size: 0.9rem;">Aún no has publicado ninguna propiedad.</p>';
            return;
        }

        // Renderiza cada propiedad con sus botones de editar y eliminar
        listaMisPropiedades.innerHTML = misPropiedades.map(prop => `
            <div style="background-color: var(--color-superficie-2); border: 1px solid var(--color-borde); padding: 16px; border-radius: var(--radio-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h4 style="color: var(--color-dorado); margin-bottom: 4px; font-size: 1rem;">
                        ${prop.nombre} 
                        <span style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${prop.activa ? '#3bba6c20' : '#dc262620'}; color: ${prop.activa ? '#3bba6c' : '#fca5a5'}; margin-left: 8px;">
                            ${prop.activa ? 'Disponible' : 'Alquilada'}
                        </span>
                    </h4>
                    <p style="color: var(--color-texto-suave); margin-bottom: 0; font-size: 0.85rem;">
                        ${prop.provincia}, ${prop.canton} — Mensualidad: ₡${prop.precio.toLocaleString("es-CR")}
                    </p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="editarPropiedad(${prop.id})" style="background-color: transparent; border: 1px solid var(--color-dorado); color: var(--color-dorado); padding: 8px 16px; border-radius: var(--radio-sm); cursor: pointer; font-size: 0.85rem; font-family: var(--fuente-cuerpo); transition: 0.2s;">
                        Editar
                    </button>
                    <button onclick="eliminarPropiedad(${prop.id})" style="background-color: transparent; border: 1px solid #dc2626; color: #fca5a5; padding: 8px 16px; border-radius: var(--radio-sm); cursor: pointer; font-size: 0.85rem; font-family: var(--fuente-cuerpo); transition: 0.2s;">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join("");
    }

    window.eliminarPropiedad = function(idAEliminar) {
        if (confirm("¿Estás seguro de que deseas eliminar permanentemente esta publicación?")) {
            let propiedades = JSON.parse(localStorage.getItem("aptify_propiedades")) || [];
            
            // Filtra quitando el ID que se quiere eliminar
            propiedades = propiedades.filter(p => p.id !== idAEliminar);
            
            // Guarda el nuevo arreglo
            localStorage.setItem("aptify_propiedades", JSON.stringify(propiedades));
            
            renderizarMisPropiedades();
            alert("La propiedad ha sido eliminada con éxito.");
        }
    };

    const originalVerificarAcceso = verificarAcceso;
    verificarAcceso = function() {
        originalVerificarAcceso();
        renderizarMisPropiedades();
    };
    
    renderizarMisPropiedades();

    // Validación en tiempo real
    
    const inputTitle = document.getElementById("prop-title");
    const errorTitle = document.getElementById("error-title");

    const inputPrice = document.getElementById("prop-price");
    const errorPrice = document.getElementById("error-price");

    const inputMetros = document.getElementById("prop-metros");
    const errorMetros = document.getElementById("error-metros");

    const inputCanton = document.getElementById("prop-canton");
    const errorCanton = document.getElementById("error-canton");

    const inputRooms = document.getElementById("prop-rooms");
    const errorRooms = document.getElementById("error-rooms");

    const inputBaths = document.getElementById("prop-baths");
    const errorBaths = document.getElementById("error-baths");
    
    const inputDeposito = document.getElementById("prop-deposito");
    const errorDeposito = document.getElementById("error-deposito");

    // Estilos de error/éxito
    function aplicarEstiloValidacion(input, errorElement, esInvalido) {
        if (esInvalido) {
            errorElement.style.display = "block";
            input.style.borderColor = "#dc2626";
            input.style.backgroundColor = "rgba(220, 38, 38, 0.05)";
        } else {
            errorElement.style.display = "none";
            input.style.borderColor = "#3bba6c";
            input.style.backgroundColor = "var(--color-superficie-2)";
        }
        
        // Si el campo está vacío, se regresa a su estado original
        if (input.value.trim() === "") {
            errorElement.style.display = "none";
            input.style.borderColor = "var(--color-borde)";
            input.style.backgroundColor = "var(--color-superficie-2)";
        }
    }

    // Validar Título
    if (inputTitle) {
        inputTitle.addEventListener("input", (e) => {
            const texto = e.target.value.trim();
            const esInvalido = texto.length > 0 && texto.length < 10;
            aplicarEstiloValidacion(e.target, errorTitle, esInvalido);
        });
    }

    // Validar Precio
    if (inputPrice) {
        inputPrice.addEventListener("input", (e) => {
            const valor = Number(e.target.value);
            const esInvalido = e.target.value !== "" && valor < 50000;
            aplicarEstiloValidacion(e.target, errorPrice, esInvalido);
        });
    }

    // Validar Metros
    if (inputMetros) {
        inputMetros.addEventListener("input", (e) => {
            const valor = Number(e.target.value);
            const esInvalido = e.target.value !== "" && valor < 10;
            aplicarEstiloValidacion(e.target, errorMetros, esInvalido);
        });
    }

    // Validar Cantón
    if (inputCanton) {
        inputCanton.addEventListener("input", (e) => {
            const texto = e.target.value.trim();
            const esInvalido = texto.length > 0 && texto.length < 3;
            aplicarEstiloValidacion(e.target, errorCanton, esInvalido);
        });
    }

    // Validar Habitaciones
    if (inputRooms) {
        inputRooms.addEventListener("input", (e) => {
            const valor = Number(e.target.value);
            const esInvalido = e.target.value !== "" && valor < 1;
            aplicarEstiloValidacion(e.target, errorRooms, esInvalido);
        });
    }

    // Validar Baños
    if (inputBaths) {
        inputBaths.addEventListener("input", (e) => {
            const valor = Number(e.target.value);
            const esInvalido = e.target.value !== "" && valor < 1;
            aplicarEstiloValidacion(e.target, errorBaths, esInvalido);
        });
    }

    if (inputDeposito) {
    inputDeposito.addEventListener("input", (e) => {
        const valor = Number(e.target.value);
        const esInvalido = e.target.value !== "" && valor <= 0;
        aplicarEstiloValidacion(e.target, errorDeposito, esInvalido);
    });
}

    // Campo autocalculado (Depósito Sugerido)
    const inputTipo = document.getElementById("prop-tipo");
    const calcDeposito = document.getElementById("calc-deposito");

    function calcularDepositoSugerido() {
        const precio = Number(inputPrice.value) || 0;
        const metros = Number(inputMetros.value) || 0;
        const tipo = inputTipo ? inputTipo.value : "";

        if (precio > 0) {
            let multiplicador = 1.0; // 100% del mes base

            // Condicional por tipo de propiedad
            if (tipo === "Estudio") {
                multiplicador -= 0.10; // -10% para estudios
            } else if (tipo === "Casa") {
                multiplicador += 0.15; // +15% para casas
            }

            // Condicional por tamaño (más de 200m2 = +10%)
            if (metros >= 200) {
                multiplicador += 0.10; 
            }

            // Calcula el total y lo redondea para que no den decimales feos
            const depositoFinal = Math.round(precio * multiplicador);
            
            calcDeposito.textContent = "₡" + depositoFinal.toLocaleString("es-CR");
        } else {
            // Si no ha puesto precio válido, vuelve a 0
            calcDeposito.textContent = "₡0";
        }
    }

    if (inputPrice) inputPrice.addEventListener("input", calcularDepositoSugerido);
    if (inputMetros) inputMetros.addEventListener("input", calcularDepositoSugerido);
    
    if (inputTipo) inputTipo.addEventListener("change", calcularDepositoSugerido);

    // Función para editar propiedad
    window.editarPropiedad = function(id) {
        const propiedades = JSON.parse(localStorage.getItem("aptify_propiedades")) || [];
        const prop = propiedades.find(p => p.id === id);
        if (!prop) return;

        // Llena todos los campos con los datos guardados
        document.getElementById("prop-title").value = prop.nombre;
        document.getElementById("prop-price").value = prop.precio;
        if(document.getElementById("prop-deposito")) document.getElementById("prop-deposito").value = prop.deposito || prop.precio;
        document.getElementById("prop-tipo").value = prop.tipo;
        if(document.getElementById("prop-estado")) document.getElementById("prop-estado").value = prop.activa ? "true" : "false";
        document.getElementById("prop-provincia").value = prop.provincia;
        document.getElementById("prop-canton").value = prop.canton;
        document.getElementById("prop-rooms").value = prop.habitaciones;
        document.getElementById("prop-baths").value = prop.banos;
        document.getElementById("prop-metros").value = prop.metros;
        document.getElementById("prop-image").value = prop.imagen;
        document.getElementById("prop-desc").value = prop.descripcion;

        // Llena los checkboxes
        document.getElementById("tag-mascotas").checked = prop.etiquetas.includes("Mascotas");
        document.getElementById("tag-cochera").checked = prop.etiquetas.includes("Cochera");
        document.getElementById("tag-familias").checked = prop.etiquetas.includes("Familias");
        document.getElementById("tag-estudiantes").checked = prop.etiquetas.includes("Estudiantes");
        document.getElementById("tag-parejas").checked = prop.etiquetas.includes("Parejas");

        idEdicion = prop.id;
        
        const btnSubmit = document.querySelector("#publish-form button[type='submit']");
        if (btnSubmit) btnSubmit.textContent = "Guardar Cambios";

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
});