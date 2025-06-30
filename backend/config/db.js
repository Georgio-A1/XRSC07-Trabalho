const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
require('dotenv').config();

let conn;
let gfs;

const connectDB = async () => {
  try {
    conn = await mongoose.connect(process.env.MONGO_URI);

    console.log('Conectado ao MongoDB');

    const db = mongoose.connection;

    db.once('open', () => {
      gfs = Grid(db.db, mongoose.mongo);
      gfs.collection('uploads'); // Define a collection padrão do GridFS
      console.log('GridFS inicializado');
    });
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB', err);
    process.exit(1);
  }
};

// Função auxiliar para acessar a instância do GridFS
const getGFS = () => gfs;

module.exports = { connectDB, getGFS };
