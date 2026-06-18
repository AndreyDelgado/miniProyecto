document.addEventListener("DOMContentLoaded", () => {
    // Formularios y contenedores
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const loginContainer = document.getElementById("login-container");
    const registerContainer = document.getElementById("register-container");
    
    // Enlaces de cambio de vista
    const linkToRegister = document.getElementById("link-to-register");
    const linkToLogin = document.getElementById("link-to-login");

    // Elementos del Nav
    const navLogin = document.getElementById("nav-login");
    const navUser = document.getElementById("nav-user");
    const userNameDisplay = document.getElementById("user-name-display");
    const btnLogout = document.getElementById("btn-logout");

    // --- LÓGICA DE INTERFAZ (CAMBIAR ENTRE LOGIN Y REGISTRO) ---
    if (linkToRegister) {
        linkToRegister.addEventListener("click", (e) => {
            e.preventDefault();
            loginContainer.style.display = "none";
            registerContainer.style.display = "block";
            document.querySelector('.breadcrumb span').textContent = "Crear cuenta";
        });
    }

    if (linkToLogin) {
        linkToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            registerContainer.style.display = "none";
            loginContainer.style.display = "block";
            document.querySelector('.breadcrumb span').textContent = "Iniciar sesión";
        });
    }

    // --- LÓGICA DE SESIÓN (NAVEGACIÓN) ---
    function checkSession() {
        const activeUser = JSON.parse(localStorage.getItem("aptify_session"));
        
        if (activeUser) {
            // Usuario logueado
            if(navLogin) navLogin.style.display = "none";
            if(navUser) {
                navUser.style.display = "flex";
                navUser.style.alignItems = "center";
            }
            if(userNameDisplay) userNameDisplay.textContent = activeUser.nombre;
        } else {
            // Nadie logueado
            if(navLogin) navLogin.style.display = "block";
            if(navUser) navUser.style.display = "none";
        }
    }

    // --- OBTENER USUARIOS DE LA "BASE DE DATOS" ---
    function getUsers() {
        const users = localStorage.getItem("aptify_users");
        return users ? JSON.parse(users) : [];
    }

    // --- EVENTO: CREAR CUENTA ---
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const name = document.getElementById("reg-name").value.trim();
            const email = document.getElementById("reg-email").value.trim();
            const pass = document.getElementById("reg-pass").value;

            const users = getUsers();

            // Validar si el correo ya existe
            const userExists = users.find(u => u.correo === email);
            if (userExists) {
                alert("Este correo electrónico ya está registrado. Intenta iniciar sesión.");
                return;
            }

            // Guardar nuevo usuario
            const newUser = { nombre: name, correo: email, contrasena: pass };
            users.push(newUser);
            localStorage.setItem("aptify_users", JSON.stringify(users));

            // Iniciar sesión automáticamente
            localStorage.setItem("aptify_session", JSON.stringify(newUser));
            
            checkSession();
            registerForm.reset();
            alert(`¡Cuenta creada con éxito! Bienvenido a Aptify, ${name}.`);
            
            // Opcional: Redirigir al inicio después de registrarse
            window.location.href = "index.html"; 
        });
    }

    // --- EVENTO: INICIAR SESIÓN ---
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const email = document.getElementById("login-email").value.trim();
            const pass = document.getElementById("login-pass").value;

            const users = getUsers();

            // Buscar si el correo existe
            const foundUser = users.find(u => u.correo === email);

            if (!foundUser) {
                alert("No encontramos ninguna cuenta con este correo.");
                return;
            }

            // Validar si la contraseña coincide
            if (foundUser.contrasena !== pass) {
                alert("La contraseña es incorrecta. Inténtalo de nuevo.");
                return;
            }

            // Si todo está bien, iniciamos sesión
            localStorage.setItem("aptify_session", JSON.stringify(foundUser));
            
            checkSession();
            loginForm.reset();
            alert(`¡Qué bueno verte de nuevo, ${foundUser.nombre}!`);
            
            // Redirigir al inicio después de entrar
            window.location.href = "index.html";
        });
    }

    // --- EVENTO: CERRAR SESIÓN ---
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("aptify_session"); // Borramos solo la sesión actual
            checkSession(); 
            alert("Has cerrado sesión correctamente.");
            // Si estamos en la página de publicar, lo sacamos al inicio por seguridad
            if(window.location.pathname.includes("publicar.html")){
                window.location.href = "index.html";
            }
        });
    }

    // Ejecutar la revisión de la barra de navegación en cuanto carga la página
    checkSession();
});