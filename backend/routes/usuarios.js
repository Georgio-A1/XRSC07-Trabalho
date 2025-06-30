// routes/usuarios.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware para verificar se o token é de um administrador
const autenticarAdmin = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: 'Token não fornecido.' });

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    if (decoded.tipo_usuario !== 'administrador') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

// Rota para cadastrar novo usuário
router.post('/cadastrar', autenticarAdmin, async (req, res) => {
  try {
    const {
      nome_completo,
      cpf,
      email,
      numero_matricula,
      telefone,
      endereco,
      senha,
      tipo_usuario
    } = req.body;

    // Verificar se já existe usuário com mesmo CPF, email ou matrícula
    const existente = await Usuario.findOne({
      $or: [{ cpf }, { email }, { numero_matricula }]
    });

    if (existente) {
      return res.status(400).json({ message: 'Usuário com CPF, e-mail ou matrícula já cadastrado.' });
    }

    const novoUsuario = new Usuario({
      nome_completo,
      cpf,
      email,
      numero_matricula,
      telefone,
      endereco,
      senha,
      tipo_usuario
    });

    await novoUsuario.save();

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar usuário:', err);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

module.exports = router;
