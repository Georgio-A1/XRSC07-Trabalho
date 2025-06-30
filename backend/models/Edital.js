const mongoose = require('mongoose');

const editalSchema = new mongoose.Schema(
  {
    nome_bolsa: { type: String, required: true },
    descricao: { type: String, required: true },
    criterios_elegibilidade: { type: String, required: true },
    periodo_letivo: { type: String, required: true },
    data_inicio_inscricao: { type: Date, required: true },
    data_fim_inscricao: { type: Date, required: true },
    maximo_alunos_aprovados: { type: Number, required: false, default: null },

    documentos_exigidos: [
      {
        tipo: { type: String, required: true },
        descricao: { type: String, required: true },
        obrigatorio: { type: Boolean, default: true },
      },
    ],

    perguntas: [
      {
        id: { type: String, required: true }, // identificador único
        texto: { type: String, required: true },
        tipo: { type: String, required: true },
        subtipo: {
          type: String,
          enum: ['texto_curto', 'texto_longo', 'numero', 'sim_nao', 'multipla_escolha', 'unica_escolha', 'escala_likert'],
          required: true
        },
        obrigatorio: { type: Boolean, default: true },
        pesoSim: {
          type: Number,
          min: [0, 'Peso mínimo é 0'],
          max: [1, 'Peso máximo é 1'],
        },
        pesoNao: {
          type: Number,
          min: [0, 'Peso mínimo é 0'],
          max: [1, 'Peso máximo é 1'],
        },
        valorInicial: { type: Number },
        valorFinal: { type: Number },
        faixasNota: [
          {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
            peso: { type: Number, required: true }, // peso por faixa
          },
        ],
        opcoes: [
          {
            texto: { type: String, required: true },
            peso: { type: Number, required: true },
          },
        ],
      },
    ],

    formula_avaliacao: { type: String, required: true }, // fórmula de pontuação

    finalizado: {
      type: Boolean,
      default: false
    }

  },

  { collection: 'editals', timestamps: true }
);

// Função de validação para garantir que todas as perguntas tenham um ID único
editalSchema.path('perguntas').validate(function (value) {
  const ids = value.map(p => p.id);
  return ids.length === new Set(ids).size;
}, 'IDs das perguntas devem ser únicos.');

// Função de validação personalizada para garantir que o campo 'opcoes' seja exigido
// apenas para perguntas do tipo 'multipla_escolha' ou 'unica_escolha'
editalSchema.path('perguntas').validate(function (value) {
  return value.every((pergunta) => {
    if (pergunta.tipo === 'multipla_escolha' || pergunta.tipo === 'unica_escolha') {
      return pergunta.opcoes && pergunta.opcoes.length > 0;
    }
    return true; // Não valida se o tipo for diferente
  });
}, 'Perguntas do tipo "multipla_escolha" ou "unica_escolha" devem ter pelo menos uma opção.');

// Função para validar que a soma os pesos das alternativas de questões de múltipla escolha
// sejam igual a 1 (100%)
editalSchema.path('perguntas').validate(function (value) {
  return value.every((pergunta) => {
    if (pergunta.tipo === 'multipla_escolha') {
      const somaPesos = (pergunta.opcoes || []).reduce((sum, op) => sum + op.peso, 0);
      return Math.abs(somaPesos - 1) < 0.01; // tolerância de 1%
    }
    return true;
  });
}, 'Em perguntas de múltipla escolha, a soma dos pesos das opções deve ser 1.');

// Validação para garantir que a data final de inscrição seja posterior à data inicial
editalSchema.pre('validate', function (next) {
  if (this.data_fim_inscricao <= this.data_inicio_inscricao) {
    this.invalidate('data_fim_inscricao', 'A data de fim da inscrição deve ser posterior à data de início.');
  }
  next();
});

module.exports = mongoose.models.Edital || mongoose.model('Edital', editalSchema);
