const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

connectDB();

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/editais', require('./routes/editais'));
app.use('/api/documentos', require('./routes/documentos'));
app.use('/api/inscricoes', require('./routes/inscricao'));
app.use('/api/avaliacao', require('./routes/avaliacao'));

const { getGFS } = require('./config/db');
app.use((req, res, next) => {
  req.app.set('gfs', getGFS());
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
