const mongoose = require('mongoose');

const inscricaoSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    }, // Referência ao aluno

    editalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Edital',
      required: true
    }, // Edital ao qual a inscrição pertence

    dataInscricao: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      default: 'pendente',
      enum: ['pendente', 'avaliada','aprovado', 'rejeitado']
    },

    // Documentos enviados pelo aluno especificamente para esta inscrição
    documentosEnviados: [
      {
        tipo: { type: String, required: true },
        arquivoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'uploads.files',
          required: true
        }
      }
    ],

    // Respostas às perguntas do edital
    respostas: [
      {
        identificadorPergunta: { type: String, required: true },
        tipoResposta: {
          type: String,
          required: true,
          enum: ['texto_curto', 'texto_longo', 'sim_nao', 'numero', 'unica_escolha', 'multipla_escolha', 'escala_likert']
        },
        resposta: {
          type: mongoose.Schema.Types.Mixed,
          required: true
        }, // Pode ser texto, número, booleano ou array
        pesoCalculado: {
          type: Number,
          default: 0
        } // Campo para guardar o peso da resposta de cada pergunta
      }
    ],

    pontuacaoFinal: {
      type: Number,
      default: 0
    }, // Resultado da avaliação automática (calculado pelo sistema)

    observacaoAvaliador: {
      type: String
    } // Campo adicional para comentário manual do funcionário/admin

  },
  {
    collection: 'inscricoes',
    timestamps: true
  }
);

module.exports = mongoose.model('Inscricao', inscricaoSchema);
