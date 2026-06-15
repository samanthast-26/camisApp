const { Schema, model } = require('mongoose');

const camisetaSchema = new Schema({
  nombreDiseno: {
    type: String,
    required: true
  },

  autor: {
    type: String,
    required: true
  },

  torsoColor: {
    type: String,
    required: true,
    default: '#ffffff'
  },

  mangaIzquierdaColor: {
    type: String,
    required: true,
    default: '#ffffff'
  },

  mangaDerechaColor: {
    type: String,
    required: true,
    default: '#ffffff'
  },

  cuelloColor: {
    type: String,
    required: true,
    default: '#ffffff'
  },

  votos: {
    type: Number,
    default: 0
  },

  totalPuntos: {
    type: Number,
    default: 0
  },

  calificacion: {
    type: Number,
    default: 0
  },

  fechaCreacion: {
    type: Date,
    default: Date.now
  },

  // NUEVO CAMPO - Para asociar cada diseño a un usuario
  usuarioId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
});

const Camiseta = model('Camiseta', camisetaSchema);

module.exports = Camiseta;