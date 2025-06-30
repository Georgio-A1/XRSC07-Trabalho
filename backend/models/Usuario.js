const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');  // Para criptografar a senha

// Definindo o esquema do modelo de Usuario
const UsuarioSchema = new mongoose.Schema(
  {
    nome_completo: { type: String, required: true },
    cpf: { 
      type: String, 
      required: true, 
      unique: true, 
      match: [/^\d{11}$/, 'CPF inválido']  // Validação para garantir que o CPF seja válido (11 dígitos)
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      match: [/\S+@\S+\.\S+/, 'Email inválido']  // Validação de formato de email
    },
    numero_matricula: { 
      type: String, 
      required: true, 
      unique: true 
    },
    telefone: { 
      type: String, 
      required: true, 
      match: [/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Número de telefone inválido']  // Formato de telefone (ex: (11) 99999-9999)
    },
    endereco: {
      rua: { type: String, required: true },
      numero: { type: String, required: true },
      complemento: { type: String },
      bairro: { type: String, required: true },
      cidade: { type: String, required: true },
      estado: { type: String, required: true },
      cep: { 
        type: String, 
        required: true, 
        match: [/^\d{5}-\d{3}$/, 'CEP inválido']  // Validação para o formato de CEP (ex: 12345-678)
      }
    },
    senha: { 
      type: String, 
      required: true 
    },
    tipo_usuario: { 
      type: String, 
      enum: ['aluno', 'funcionario', 'administrador'], 
      required: true 
    }
  },
  { timestamps: true }  // Vai criar campos createdAt e updatedAt automaticamente
);

// Middleware para encriptar a senha antes de salvar o Usuario no banco
UsuarioSchema.pre('save', async function (next) {
  if (this.isModified('senha') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);  // Gera um "sal" para a senha
      this.senha = await bcrypt.hash(this.senha, salt);  // Criptografa a senha com o "sal"
      next();  // Prosegue para salvar o Usuario
    } catch (err) {
      next(err);  // Caso ocorra um erro, o próximo middleware será chamado com o erro
    }
  } else {
    return next();
  }
});

// Método para comparar a senha digitada com a senha criptografada
UsuarioSchema.methods.compareSenha = async function (senha) {
  return await bcrypt.compare(senha, this.senha);  // Compara a senha informada com a armazenada
};

// Criar o modelo do Usuario a partir do esquema
module.exports = mongoose.model('Usuario', UsuarioSchema);
