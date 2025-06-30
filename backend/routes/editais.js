const express = require('express');
const router = express.Router();
const Edital = require('../models/Edital');

// Função auxiliar para validar a fórmula
function validarFormula(formula, perguntas) {
  const idsValidos = perguntas.map(p => p.id);
  const formulaSemEspacos = formula.replace(/\s+/g, '');

  if (!/^[\w\d\+\-\*/().]+$/.test(formulaSemEspacos)) {
    return 'A fórmula contém caracteres inválidos.';
  }

  const tokens = formula.match(/Q\d+/g) || [];
  for (const token of tokens) {
    if (!idsValidos.includes(token)) {
      return `A fórmula utiliza o identificador "${token}" que não existe nas perguntas.`;
    }
  }

  try {
    const formulaTestada = formula.replace(/Q\d+/g, '1');
    eval(formulaTestada);
  } catch (err) {
    return 'A fórmula está malformada ou não pode ser avaliada.';
  }

  return null;
}

// POST /api/editais/cadastrar
router.post('/cadastrar', async (req, res) => {
  try {
    const { formula_avaliacao, perguntas } = req.body;

    const erroFormula = validarFormula(formula_avaliacao, perguntas);
    if (erroFormula) {
      return res.status(400).json({ message: erroFormula });
    }

    const novoEdital = new Edital(req.body);
    await novoEdital.save();

    res.status(201).json({ message: 'Edital criado com sucesso.', edital: novoEdital });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar edital.' });
  }
});

// GET /api/editais/listar
router.get('/listar', async (req, res) => {
  try {
    const editais = await Edital.find({}, 'nome_bolsa descricao periodo_letivo')
      .sort({ createdAt: -1 });

    res.json(editais);
  } catch (err) {
    console.error('Erro ao buscar editais:', err);
    res.status(500).json({ error: 'Erro ao buscar editais' });
  }
});

// GET /api/editais/encerrados-nao-finalizados
router.get('/encerrados-nao-finalizados', async (req, res) => {
  try {
    const hoje = new Date();

    const editais = await Edital.find({
      data_fim_inscricoes: { $lt: hoje },
      finalizado: false
    });

    res.json(editais);
  } catch (err) {
    console.error('Erro ao buscar editais encerrados:', err);
    res.status(500).json({ error: 'Erro ao buscar editais' });
  }
});

// GET /api/editais/:id
router.get('/:id', async (req, res) => {
  try {
    const edital = await Edital.findById(req.params.id);
    if (!edital) {
      return res.status(404).json({ message: 'Edital não encontrado.' });
    }
    res.json(edital);
  } catch (err) {
    console.error('Erro ao buscar edital:', err);
    res.status(500).json({ message: 'Erro ao buscar edital.' });
  }
});

// PUT /api/editais/editar/:id
router.put('/editar/:id', async (req, res) => {
  try {
    const { formula_avaliacao, perguntas } = req.body;

    const erroFormula = validarFormula(formula_avaliacao, perguntas);
    if (erroFormula) {
      return res.status(400).json({ message: erroFormula });
    }

    const editalAtualizado = await Edital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!editalAtualizado) {
      return res.status(404).json({ message: 'Edital não encontrado.' });
    }

    res.json({ message: 'Edital atualizado com sucesso.', edital: editalAtualizado });
  } catch (err) {
    console.error('Erro ao atualizar edital:', err);
    res.status(500).json({ message: 'Erro ao atualizar edital.' });
  }
});

// DELETE /api/editais/:id
router.delete('/:id', async (req, res) => {
  try {
    const edital = await Edital.findByIdAndDelete(req.params.id);
    if (!edital) return res.status(404).json({ message: 'Edital não encontrado.' });

    res.json({ message: 'Edital excluído com sucesso.' });
  } catch (err) {
    console.error('Erro ao excluir edital:', err);
    res.status(500).json({ message: 'Erro ao excluir edital.' });
  }
});

module.exports = router;
