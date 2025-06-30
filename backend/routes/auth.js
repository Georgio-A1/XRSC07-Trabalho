// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// Rota de login
router.post('/login', async (req, res) => {
    const { cpf, senha } = req.body;

    //console.log('CPF recebido:', cpf);
    //console.log('Senha recebida:', senha);

    try {
        const usuario = await Usuario.findOne({ cpf });
        //console.log('Usuário encontrado:', usuario);

        if (!usuario) {
            return res.status(401).json({ message: 'CPF ou senha inválidos.' });
        }

        const senhaValida = await usuario.compareSenha(senha);

        if (!senhaValida) {
            return res.status(401).json({ message: 'CPF ou senha inválidos.' });
        }

        const token = jwt.sign(
            {
                id: usuario._id,
                tipo_usuario: usuario.tipo_usuario,
                nome_completo: usuario.nome_completo  // Adiciona as informações no payload
            },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        // forçar troca de senha se for temporária - faltando
        const requireNewPassword = usuario.senha_temporaria === true;

        res.json({ token, tipo: usuario.tipo_usuario, requireNewPassword });
    } catch (err) {
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

module.exports = router;