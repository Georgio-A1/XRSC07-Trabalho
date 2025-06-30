const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/Usuario'); // Ajuste o caminho conforme seu projeto
require('dotenv').config();

async function criarAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/auxilio-estudantil');

    // Verifica se já existe admin com esse CPF
    const adminExistente = await Usuario.findOne({ cpf: '12345678900' });
    if (adminExistente) {
      console.log('Admin já existe!');
      return process.exit(0);
    }

    const admin = new Usuario({
      nome_completo: 'Administrador Inicial',
      cpf: '12345678900',
      email: 'admin@universidade.com',
      numero_matricula: '00000000',
      telefone: '(11) 99999-9999',
      endereco: {
        rua: 'Rua Central',
        numero: '1',
        bairro: 'Centro',
        cidade: 'Cidade Exemplo',
        estado: 'SP',
        cep: '12345-678',
      },
      senha: 'admin123',
      tipo_usuario: 'administrador',
    });

    await admin.save();
    console.log('Admin criado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    process.exit(1);
  }
}

criarAdmin();
