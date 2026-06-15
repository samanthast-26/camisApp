const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('./esquemaUsuario');
const Camiseta = require('./esquemaCamiseta');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'SECRETO_SUPER_SEGUR0';

// ==========================
// MIDDLEWARES
// ==========================

// Permite recibir JSON desde el frontend
app.use(express.json());

// Sirve los archivos HTML, CSS y JS desde la carpeta Public
app.use(express.static(path.join(__dirname, 'Public')));

// ==========================
// CONEXIÓN A MONGODB LOCAL
// ==========================

mongoose.connect('mongodb://localhost:27017/camisaApp')
  .then(() => {
    console.log('MongoDB local conectado correctamente');
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error);
  });

// ==========================
// MIDDLEWARE DE AUTENTICACIÓN (NUEVO)
// ==========================

// Middleware para verificar JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  const token = authHeader.split(' ')[1];  // Espera formato "Bearer token"
  try {
    const decoded = jwt.verify(token, JWT_SECRET);    // Verifica y decodifica el token
    req.usuarioId = decoded.id;                    // Guardamos el id del token en la request
    next();                                       // Token válido, continuar
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

// ==========================
// RUTAS PRINCIPALES (TUS RUTAS ORIGINALES)
// ==========================

// Cargar la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// Cargar también si escriben /index.html
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

// ==========================
// RUTAS DE USUARIOS (TUS RUTAS ORIGINALES)
// ==========================

// Crear usuario (TU RUTA ORIGINAL)
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nombre, email, clave } = req.body;

    const nuevoUsuario = new Usuario({
      nombre,
      email,
      clave
    });

    const usuarioGuardado = await nuevoUsuario.save();

    res.status(201).json({
      mensaje: 'Usuario creado correctamente',
      usuario: usuarioGuardado
    });

  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al crear el usuario',
      error: error.message
    });
  }
});

// Obtener usuarios (TU RUTA ORIGINAL)
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();

    res.json(usuarios);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener usuarios',
      error: error.message
    });
  }
});

// Obtener un usuario por ID (TU RUTA ORIGINAL)
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualizar un usuario (TU RUTA ORIGINAL)
app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const datosActualizados = req.body;
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true }
    );
    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuarioActualizado);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario (TU RUTA ORIGINAL)
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// ==========================
// RUTAS DE CAMISETAS - CRUD (TUS RUTAS ORIGINALES)
// ==========================

// CREATE - Crear una camiseta (TU RUTA ORIGINAL - MODIFICADA PARA ASOCIAR AL USUARIO)
app.post('/api/camisetas', verificarToken, async (req, res) => {
  try {
    const {
      nombreDiseno,
      autor,
      descripcion,
      torsoColor,
      mangaIzquierdaColor,
      mangaDerechaColor,
      cuelloColor
    } = req.body;

    const nuevaCamiseta = new Camiseta({
      nombreDiseno,
      autor,
      descripcion,
      torsoColor,
      mangaIzquierdaColor,
      mangaDerechaColor,
      cuelloColor,
      usuarioId: req.usuarioId  // AGREGADO: asociar al usuario logueado
    });

    const camisetaGuardada = await nuevaCamiseta.save();

    res.status(201).json({
      mensaje: 'Diseño de camiseta guardado correctamente',
      camiseta: camisetaGuardada
    });

  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al guardar la camiseta',
      error: error.message
    });
  }
});

// READ - Obtener todas las camisetas (TU RUTA ORIGINAL - MODIFICADA PARA FILTRAR POR USUARIO)
app.get('/api/camisetas', verificarToken, async (req, res) => {
  try {
    const camisetas = await Camiseta.find({ usuarioId: req.usuarioId }).sort({ fechaCreacion: -1 });
    res.json(camisetas);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener las camisetas',
      error: error.message
    });
  }
});

// READ - Obtener una camiseta por ID (TU RUTA ORIGINAL - MODIFICADA)
app.get('/api/camisetas/:id', verificarToken, async (req, res) => {
  try {
    const camiseta = await Camiseta.findOne({ _id: req.params.id, usuarioId: req.usuarioId });

    if (!camiseta) {
      return res.status(404).json({
        mensaje: 'Camiseta no encontrada'
      });
    }

    res.json(camiseta);

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener la camiseta',
      error: error.message
    });
  }
});

// UPDATE - Actualizar una camiseta (TU RUTA ORIGINAL - MODIFICADA)
app.put('/api/camisetas/:id', verificarToken, async (req, res) => {
  try {
    const {
      nombreDiseno,
      autor,
      descripcion,
      torsoColor,
      mangaIzquierdaColor,
      mangaDerechaColor,
      cuelloColor
    } = req.body;

    const camisetaActualizada = await Camiseta.findOneAndUpdate(
      { _id: req.params.id, usuarioId: req.usuarioId },
      {
        nombreDiseno,
        autor,
        descripcion,
        torsoColor,
        mangaIzquierdaColor,
        mangaDerechaColor,
        cuelloColor,
        actualizadoEn: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!camisetaActualizada) {
      return res.status(404).json({
        mensaje: 'Camiseta no encontrada'
      });
    }

    res.json({
      mensaje: 'Diseño actualizado correctamente',
      camiseta: camisetaActualizada
    });

  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al actualizar la camiseta',
      error: error.message
    });
  }
});

// DELETE - Eliminar una camiseta (TU RUTA ORIGINAL - MODIFICADA)
app.delete('/api/camisetas/:id', verificarToken, async (req, res) => {
  try {
    const camisetaEliminada = await Camiseta.findOneAndDelete({ 
      _id: req.params.id,
      usuarioId: req.usuarioId 
    });

    if (!camisetaEliminada) {
      return res.status(404).json({
        mensaje: 'Camiseta no encontrada'
      });
    }

    res.json({
      mensaje: 'Camiseta eliminada correctamente'
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar la camiseta',
      error: error.message
    });
  }
});

// ==========================
// RUTA DE VOTACIÓN (TU RUTA ORIGINAL)
// ==========================

// Votar por una camiseta
app.post('/api/camisetas/:id/votar', async (req, res) => {
  try {
    const { valor } = req.body;

    if (!valor || valor < 1 || valor > 5) {
      return res.status(400).json({
        mensaje: 'El voto debe estar entre 1 y 5'
      });
    }

    const camiseta = await Camiseta.findById(req.params.id);

    if (!camiseta) {
      return res.status(404).json({
        mensaje: 'Camiseta no encontrada'
      });
    }

    camiseta.votos += 1;
    camiseta.totalPuntos += Number(valor);
    camiseta.calificacion = camiseta.totalPuntos / camiseta.votos;
    camiseta.actualizadoEn = Date.now();

    await camiseta.save();

    res.json({
      mensaje: 'Voto registrado correctamente',
      camiseta
    });

  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al votar',
      error: error.message
    });
  }
});

// ==========================
// NUEVAS RUTAS DE AUTENTICACIÓN (AGREGADAS)
// ==========================

// Registro de un nuevo usuario (NUEVA RUTA - NO ELIMINA TU RUTA /api/usuarios)
app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, email, clave } = req.body;
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // 1. Generar un salt (semilla aleatoria) para el hash
    const salt = await bcrypt.genSalt(10);
    // 2. Hashear la contraseña proporcionada usando el salt generado
    const hash = await bcrypt.hash(clave, salt);
    
    // 3. Crear y guardar el nuevo usuario con la contraseña hasheada
    const nuevoUsuario = new Usuario({ 
      nombre: nombre || email.split('@')[0], 
      email, 
      clave: hash 
    });
    await nuevoUsuario.save();
    
    // Generar token
    const token = jwt.sign({ id: nuevoUsuario._id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ 
      mensaje: 'Usuario registrado con éxito',
      token,
      usuario: { id: nuevoUsuario._id, email: nuevoUsuario.email, nombre: nuevoUsuario.nombre }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'No se pudo registrar el usuario' });
  }
});

// Login de usuario (autenticación) - NUEVA RUTA
app.post('/api/login', async (req, res) => {
  try {
    const { email, clave } = req.body;
    
    // 1. Buscar al usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    // 2. Verificar la contraseña con bcrypt.compare
    const passwordOk = await bcrypt.compare(clave, usuario.clave);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // 3. Credenciales válidas: Generar token JWT
    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: '24h' });
    
    // 4. Enviar el token al cliente
    res.json({ 
      token,
      usuario: { id: usuario._id, email: usuario.email, nombre: usuario.nombre }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Verificar token (mantener sesión) - NUEVA RUTA
app.get('/api/verificar', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-clave');
    res.json({ valido: true, usuario });
  } catch (error) {
    res.status(500).json({ valido: false, error: 'Error al verificar' });
  }
});

// ==========================
// INICIAR SERVIDOR
// ==========================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});