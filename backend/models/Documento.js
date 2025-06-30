const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema(
  {
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }, // Relacionado ao aluno
    tipo: { type: String, required: true }, // Tipo de documento (e.g., CPF, RG)
    estado: { type: String, enum: ['pendente', 'enviado', 'aprovado', 'reprovado'], default: 'pendente' }, // Status do documento
    uploadDate: { type: Date, default: Date.now }, // Data do upload
    filename: { type: String, required: true }, // Nome do arquivo
    fileSize: { type: Number, required: true }, // Tamanho do arquivo
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Referência ao arquivo no GridFS
    metadata: {
      // Metadados extras se necessário, como comentários ou informações de aprovação
      aprovadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // ID do funcionário que aprovou/reprovou
      dataAprovacao: { type: Date },
    },
  },
  { timestamps: true } // Gerar os campos createdAt e updatedAt
);

module.exports = mongoose.model('Documento', documentoSchema);
