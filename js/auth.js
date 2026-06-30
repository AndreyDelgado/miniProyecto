document.addEventListener("DOMContentLoaded", () => {

    // Selección de elementos del DOM
    const sessionDropdown = document.getElementById("session-dropdown");
    const dropLoginContainer = document.getElementById("drop-login-container");
    const dropRegisterContainer = document.getElementById("drop-register-container");
    const dropUserContainer = document.getElementById("drop-user-container");
    
    // Elementos visuales del estado de sesión
    const statusDot = document.getElementById("session-status-dot");
    const statusText = document.getElementById("session-status-text");
    const userNameDisplay = document.getElementById("user-name-display");
    const userEmailDisplay = document.getElementById("user-email-display");

    // Botones y enlaces de acción
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const linkToRegister = document.getElementById("link-to-register");
    const linkToLogin = document.getElementById("link-to-login");
    const btnLogout = document.getElementById("btn-logout");

    // Cerrar el menú desplegable al hacer clic fuera de él
    document.addEventListener("click", (event) => {
        if (sessionDropdown && sessionDropdown.hasAttribute("open")) {
            if (!sessionDropdown.contains(event.target)) {
                sessionDropdown.removeAttribute("open");
            }
        }
    });

    // Alternar entre las vistas de Iniciar Sesión y Crear Cuenta
    if (linkToRegister) {
        linkToRegister.addEventListener("click", (e) => {
            e.preventDefault();
            if (dropLoginContainer) dropLoginContainer.style.display = "none";
            if (dropRegisterContainer) dropRegisterContainer.style.display = "block";
        });
    }

    if (linkToLogin) {
        linkToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            if (dropRegisterContainer) dropRegisterContainer.style.display = "none";
            if (dropLoginContainer) dropLoginContainer.style.display = "block";
        });
    }

    // Función principal para verificar si hay una sesión activa
    function checkSession() {
        const activeUser = JSON.parse(localStorage.getItem("aptify_session"));
        
        if (activeUser) {
            if (statusDot) statusDot.className = "user-online";
            if (statusText) statusText.textContent = activeUser.nombre.split(" ")[0]; // Solo muestra el primer nombre
            
            if (dropLoginContainer) dropLoginContainer.style.display = "none";
            if (dropRegisterContainer) dropRegisterContainer.style.display = "none";
            if (dropUserContainer) dropUserContainer.style.display = "block";
            
            if (userNameDisplay) userNameDisplay.textContent = activeUser.nombre;
            if (userEmailDisplay) userEmailDisplay.textContent = activeUser.correo;
        } else {
            if (statusDot) statusDot.className = "user-offline";
            if (statusText) statusText.textContent = "Ingresar";
            
            if (dropLoginContainer) dropLoginContainer.style.display = "block";
            if (dropRegisterContainer) dropRegisterContainer.style.display = "none";
            if (dropUserContainer) dropUserContainer.style.display = "none";
        }
    }

    function getUsers() {
        const users = localStorage.getItem("aptify_users");
        return users ? JSON.parse(users) : [];
    }

    // Lógica de Registro de nuevo usuario
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Evita que la página se recargue

            const name = document.getElementById("reg-name").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const pass = document.getElementById("reg-pass").value;

            const users = getUsers();
            
            if (users.find(u => u.correo === email)) {
                alert("Este correo ya está registrado.");
                return;
            }

            const newUser = { nombre: name, correo: email, contrasena: pass };
            users.push(newUser);
            localStorage.setItem("aptify_users", JSON.stringify(users));
            localStorage.setItem("aptify_session", JSON.stringify(newUser));
            
            checkSession();
            registerForm.reset();
            if (sessionDropdown) sessionDropdown.removeAttribute("open");
        });
    }

    // Lógica de Inicio de Sesión
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const email = document.getElementById("login-email").value.trim();
            const pass = document.getElementById("login-pass").value;

            const users = getUsers();
            const foundUser = users.find(u => u.correo === email);

            if (!foundUser) {
                alert("No encontramos ninguna cuenta con este correo.");
                return;
            }
            if (foundUser.contrasena !== pass) {
                alert("La contraseña es incorrecta.");
                return;
            }

            localStorage.setItem("aptify_session", JSON.stringify(foundUser));
            checkSession();
            loginForm.reset();
            if (sessionDropdown) sessionDropdown.removeAttribute("open");
        });
    }

    // Lógica de Cerrar Sesión
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("aptify_session");
            checkSession();
            if (sessionDropdown) sessionDropdown.removeAttribute("open");
            
            // Redirigir al inicio
            const urlActual = window.location.pathname.toLowerCase();
            if (!urlActual.includes("index.html") && !urlActual.endsWith("/")) {
                window.location.href = "index.html";
            }
        });
    }

    // Ejecutar revisión inicial al cargar la página
    checkSession();
});