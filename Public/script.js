// Variables globales
let token = null;
let usuarioActual = null;
let parteSeleccionada = null;

// Variables para el buscador
let todasLasCamisetas = [];
let busquedaActiva = false;

// Elementos DOM del login
const authScreen = document.getElementById('authScreen');
const mainContent = document.getElementById('mainContent');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authMessage = document.getElementById('authMessage');
const tabBtns = document.querySelectorAll('.tab-btn');
const logoutBtn = document.getElementById('logoutBtn');

// Elementos DOM del diseñador
const colorPicker = document.getElementById('colorPicker');
const parteActual = document.getElementById('parteActual');
const btnGuardar = document.getElementById('btnGuardar');
const btnLimpiar = document.getElementById('btnLimpiar');
const contenedorCamisetas = document.getElementById('contenedorCamisetas');

// ========== FUNCIONES DE AUTENTICACIÓN ==========

// Cambiar entre tabs
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        document.getElementById(`${tab}Form`).classList.add('active');
        authMessage.textContent = '';
    });
});

function mostrarMensaje(mensaje, esError = true) {
    authMessage.textContent = mensaje;
    authMessage.style.color = esError ? '#dc3545' : '#28a745';
    setTimeout(() => {
        if (authMessage.textContent === mensaje) {
            authMessage.textContent = '';
        }
    }, 3000);
}

function guardarSesion(tokenUsuario, usuario) {
    token = tokenUsuario;
    usuarioActual = usuario;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

function cerrarSesion() {
    token = null;
    usuarioActual = null;
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    authScreen.style.display = 'flex';
    mainContent.style.display = 'none';
    
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
}

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, clave: password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            guardarSesion(data.token, data.usuario);
            mostrarMensaje('✅ ¡Inicio de sesión exitoso!', false);
            setTimeout(() => {
                authScreen.style.display = 'none';
                mainContent.style.display = 'block';
                cargarCamisetas();
                inicializarDiseñador();
                inicializarBuscador();
            }, 1000);
        } else {
            mostrarMensaje(data.error || 'Error al iniciar sesión');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión al servidor');
    }
});


// Elementos de la interfaz (Ajusta los IDs según tu HTML real)
const registerForm = document.getElementById('registerForm');
const authScreen = document.getElementById('authScreen');
const mainContent = document.getElementById('mainContent');

// Función auxiliar para mostrar alertas en pantalla
function mostrarMensaje(texto, esError = true) {
    alert(texto); // Reemplaza esto si usas un contenedor div de alertas
}

// Función auxiliar para guardar la sesión en el navegador
function guardarSesion(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

// Funciones vacías para evitar errores si aún no las creas
function cargarCamisetas() { console.log("Cargando camisetas..."); }
function inicializarDiseñador() { console.log("Diseñador listo..."); }
function inicializarBuscador() { console.log("Buscador listo..."); }

// EVENTO DE REGISTRO CORREGIDO
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const nombre = document.getElementById('registerNombre').value || email.split('@')[0];
        const password = document.getElementById('registerPassword').value;
        
        if (password.length < 6) {
            mostrarMensaje('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        try {
            // Se envía a /api/registro usando 'clave' en el JSON para el backend
            const response = await fetch('/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, clave: password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                guardarSesion(data.token, data.usuario);
                mostrarMensaje('✅ ¡Cuenta creada exitosamente!', false);
                setTimeout(() => {
                    if(authScreen) authScreen.style.display = 'none';
                    if(mainContent) mainContent.style.display = 'block';
                    cargarCamisetas();
                    inicializarDiseñador();
                    inicializarBuscador();
                }, 1000);
            } else {
                mostrarMensaje(data.error || 'Error al crear cuenta');
            }
        } catch (error) {
            mostrarMensaje('Error de conexión al servidor');
        }
    });
}


// Verificar sesión al cargar
async function verificarSesion() {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');
    
    if (tokenGuardado && usuarioGuardado) {
        try {
            const response = await fetch('/api/verificar', {
                headers: { 'Authorization': `Bearer ${tokenGuardado}` }
            });
            
            const data = await response.json();
            
            if (data.valido) {
                token = tokenGuardado;
                usuarioActual = JSON.parse(usuarioGuardado);
                authScreen.style.display = 'none';
                mainContent.style.display = 'block';
                cargarCamisetas();
                inicializarDiseñador();
                inicializarBuscador();
                return;
            }
        } catch (error) {
            console.error('Error verificando sesión');
        }
    }
    
    authScreen.style.display = 'flex';
    mainContent.style.display = 'none';
}

// Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', cerrarSesion);
}

// ========== FUNCIONES DEL DISEÑADOR ==========

function inicializarDiseñador() {
    const partes = document.querySelectorAll('.parte-camiseta');
    
    partes.forEach((parte) => {
        parte.addEventListener('click', () => {
            partes.forEach((p) => p.classList.remove('parte-activa'));
            parteSeleccionada = parte;
            parteSeleccionada.classList.add('parte-activa');
            
            if (colorPicker) {
                colorPicker.value = parte.getAttribute('fill');
            }
            if (parteActual) {
                parteActual.textContent = `Parte seleccionada: ${parte.id}`;
            }
        });
    });
    
    if (colorPicker) {
        colorPicker.addEventListener('input', () => {
            if (parteSeleccionada) {
                parteSeleccionada.setAttribute('fill', colorPicker.value);
            } else if (parteActual) {
                parteActual.textContent = 'Primero selecciona una parte de la camisa';
                setTimeout(() => {
                    if (parteActual.textContent === 'Primero selecciona una parte de la camisa') {
                        parteActual.textContent = 'Selecciona una parte de la camisa';
                    }
                }, 2000);
            }
        });
    }
    
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            partes.forEach((parte) => {
                parte.setAttribute('fill', '#ffffff');
                parte.classList.remove('parte-activa');
            });
            parteSeleccionada = null;
            if (parteActual) {
                parteActual.textContent = 'Selecciona una parte de la camisa';
            }
        });
    }
    
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarDiseno);
    }
}

async function guardarDiseno() {
    const nombreDiseno = document.getElementById('nombreDiseno')?.value.trim();
    const autor = document.getElementById('autor')?.value.trim();
    
    if (!nombreDiseno || !autor) {
        alert('Debes escribir el nombre del diseño y el autor.');
        return;
    }
    
    const camiseta = {
        nombreDiseno,
        autor,
        torsoColor: document.getElementById('torso')?.getAttribute('fill') || '#ffffff',
        mangaIzquierdaColor: document.getElementById('mangaIzquierda')?.getAttribute('fill') || '#ffffff',
        mangaDerechaColor: document.getElementById('mangaDerecha')?.getAttribute('fill') || '#ffffff',
        cuelloColor: document.getElementById('cuello')?.getAttribute('fill') || '#ffffff'
    };
    
    try {
        const respuesta = await fetch('/api/camisetas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(camiseta)
        });
        
        const datos = await respuesta.json();
        
        if (respuesta.ok) {
            alert('¡Diseño guardado exitosamente!');
            document.getElementById('nombreDiseno').value = '';
            document.getElementById('autor').value = '';
            cargarCamisetas();
        } else {
            alert(datos.mensaje || datos.error || 'Error al guardar');
        }
    } catch (error) {
        console.error(error);
        alert('Error al guardar la camiseta.');
    }
}

// ========== FUNCIONES PARA MOSTRAR Y BUSCAR CAMISETAS ==========

async function cargarCamisetas() {
    if (!contenedorCamisetas) return;
    
    try {
        const respuesta = await fetch('/api/camisetas', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!respuesta.ok) {
            throw new Error('Error al cargar');
        }
        
        todasLasCamisetas = await respuesta.json();
        
        if (busquedaActiva) {
            const busquedaInput = document.getElementById('buscadorInput');
            if (busquedaInput && busquedaInput.value) {
                filtrarCamisetas(busquedaInput.value);
                return;
            }
        }
        
        mostrarCamisetas(todasLasCamisetas);
    } catch (error) {
        console.error(error);
        contenedorCamisetas.innerHTML = '<p class="mensaje-vacio">❌ Error al cargar los diseños</p>';
    }
}

function mostrarCamisetas(camisetas) {
    contenedorCamisetas.innerHTML = '';
    
    if (camisetas.length === 0) {
        contenedorCamisetas.innerHTML = '<p class="mensaje-vacio">✨ No hay diseños que coincidan con tu búsqueda</p>';
        return;
    }
    
    camisetas.forEach((camiseta) => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta-camiseta');
        
        const calificacion = Number(camiseta.calificacion || 0).toFixed(1);
        
        tarjeta.innerHTML = `
            <h3>${escapeHtml(camiseta.nombreDiseno)}</h3>
            <p><strong>Autor:</strong> ${escapeHtml(camiseta.autor)}</p>
            <p><strong>⭐ Calificación:</strong> ${calificacion} (${camiseta.votos} votos)</p>
            <div class="mini-camisa">
                <div class="color-box" style="background:${camiseta.torsoColor}" title="Torso"></div>
                <div class="color-box" style="background:${camiseta.mangaIzquierdaColor}" title="Manga izquierda"></div>
                <div class="color-box" style="background:${camiseta.mangaDerechaColor}" title="Manga derecha"></div>
                <div class="color-box" style="background:${camiseta.cuelloColor}" title="Cuello"></div>
            </div>
            <div class="botones-accion">
                <button class="btn-editar-colores" onclick="editarColores('${camiseta._id}')">
                    🎨 Editar colores
                </button>
                <button class="btn-eliminar" onclick="eliminarCamiseta('${camiseta._id}')">
                    🗑️ Eliminar
                </button>
            </div>
            <div class="estrellas">
                <button onclick="votar('${camiseta._id}', 1)">1 ⭐</button>
                <button onclick="votar('${camiseta._id}', 2)">2 ⭐</button>
                <button onclick="votar('${camiseta._id}', 3)">3 ⭐</button>
                <button onclick="votar('${camiseta._id}', 4)">4 ⭐</button>
                <button onclick="votar('${camiseta._id}', 5)">5 ⭐</button>
            </div>
        `;
        
        contenedorCamisetas.appendChild(tarjeta);
    });
}

function filtrarCamisetas(textoBusqueda) {
    busquedaActiva = true;
    const texto = textoBusqueda.toLowerCase().trim();
    
    if (texto === "") {
        mostrarCamisetas(todasLasCamisetas);
        return;
    }
    
    const resultados = todasLasCamisetas.filter(camiseta => 
        camiseta.nombreDiseno.toLowerCase().includes(texto) ||
        camiseta.autor.toLowerCase().includes(texto)
    );
    
    mostrarCamisetas(resultados);
    
    const mensajeResultados = document.createElement('div');
    mensajeResultados.className = 'resultado-busqueda';
    mensajeResultados.innerHTML = `<p>🔍 Se encontraron ${resultados.length} diseño(s) para "${texto}"</p>`;
    
    const mensajeAnterior = document.querySelector('.resultado-busqueda');
    if (mensajeAnterior) mensajeAnterior.remove();
    
    contenedorCamisetas.parentNode.insertBefore(mensajeResultados, contenedorCamisetas);
    
    setTimeout(() => {
        if (mensajeResultados.parentNode) mensajeResultados.remove();
    }, 3000);
}

function limpiarBusqueda() {
    busquedaActiva = false;
    const buscadorInput = document.getElementById('buscadorInput');
    if (buscadorInput) {
        buscadorInput.value = '';
    }
    mostrarCamisetas(todasLasCamisetas);
    
    const mensajeResultados = document.querySelector('.resultado-busqueda');
    if (mensajeResultados) mensajeResultados.remove();
}

function inicializarBuscador() {
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpiar = document.getElementById('btnLimpiarBusqueda');
    const buscadorInput = document.getElementById('buscadorInput');
    
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            if (buscadorInput) {
                filtrarCamisetas(buscadorInput.value);
            }
        });
    }
    
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarBusqueda);
    }
    
    if (buscadorInput) {
        buscadorInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                filtrarCamisetas(buscadorInput.value);
            }
        });
    }
}

// ========== FUNCIONES PARA EDITAR COLORES ==========

async function editarColores(id) {
    try {
        const respuesta = await fetch(`/api/camisetas/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!respuesta.ok) throw new Error('Error al cargar');
        
        const camiseta = await respuesta.json();
        
        document.getElementById('torso')?.setAttribute('fill', camiseta.torsoColor);
        document.getElementById('mangaIzquierda')?.setAttribute('fill', camiseta.mangaIzquierdaColor);
        document.getElementById('mangaDerecha')?.setAttribute('fill', camiseta.mangaDerechaColor);
        document.getElementById('cuello')?.setAttribute('fill', camiseta.cuelloColor);
        
        document.getElementById('nombreDiseno').value = camiseta.nombreDiseno;
        document.getElementById('autor').value = camiseta.autor;
        
        window.camisetaEditando = id;
        btnGuardar.textContent = '💾 Actualizar colores';
        
        document.querySelector('.panel-diseno').scrollIntoView({ behavior: 'smooth' });
        
        alert(`Editando colores de: ${camiseta.nombreDiseno}\nSelecciona una parte y cambia su color`);
        
    } catch (error) {
        console.error(error);
        alert('Error al cargar los colores');
    }
}

// Modificar guardarDiseno para que también actualice
const guardarDisenoOriginal = guardarDiseno;
window.guardarDiseno = async function() {
    if (window.camisetaEditando) {
        const datosActualizados = {
            torsoColor: document.getElementById('torso')?.getAttribute('fill') || '#ffffff',
            mangaIzquierdaColor: document.getElementById('mangaIzquierda')?.getAttribute('fill') || '#ffffff',
            mangaDerechaColor: document.getElementById('mangaDerecha')?.getAttribute('fill') || '#ffffff',
            cuelloColor: document.getElementById('cuello')?.getAttribute('fill') || '#ffffff'
        };
        
        try {
            const respuesta = await fetch(`/api/camisetas/${window.camisetaEditando}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(datosActualizados)
            });
            
            if (respuesta.ok) {
                alert('✅ ¡Colores actualizados!');
                window.camisetaEditando = null;
                btnGuardar.textContent = '💾 Guardar diseño';
                document.getElementById('nombreDiseno').value = '';
                document.getElementById('autor').value = '';
                cargarCamisetas();
            } else {
                alert('Error al actualizar colores');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    } else {
        await guardarDisenoOriginal();
    }
};

guardarDiseno = window.guardarDiseno;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function votar(id, valor) {
    try {
        const respuesta = await fetch(`/api/camisetas/${id}/votar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ valor })
        });
        
        const datos = await respuesta.json();
        
        if (respuesta.ok) {
            alert('¡Voto registrado!');
            cargarCamisetas();
        } else {
            alert(datos.mensaje || datos.error || 'Error al votar');
        }
    } catch (error) {
        console.error(error);
        alert('Error al votar.');
    }
}

async function eliminarCamiseta(id) {
    const confirmar = confirm('¿Seguro que deseas eliminar este diseño?');
    if (!confirmar) return;
    
    try {
        const respuesta = await fetch(`/api/camisetas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const datos = await respuesta.json();
        
        if (respuesta.ok) {
            alert('Diseño eliminado');
            cargarCamisetas();
        } else {
            alert(datos.mensaje || 'Error al eliminar');
        }
    } catch (error) {
        console.error(error);
        alert('Error al eliminar la camiseta.');
    }
}

// Hacer funciones globales
window.votar = votar;
window.eliminarCamiseta = eliminarCamiseta;
window.editarColores = editarColores;

// Iniciar
verificarSesion();