const express = require('express');
const router = express.Router();
const Inscricao = require('../models/Inscricao');
const Usuario = require('../models/Usuario');
const Edital = require('../models/Edital');
const Documento = require('../models/Documento');
const { calcularNotaMaximaPossivel } = require('../utils/calculoPontuacao');
const { calcularPontuacaoInscricao } = require('../utils/calcularPontuacaoInscricao');

router.get('/pendentes', async (req, res) => {
    try {
        const inscricoes = await Inscricao.find({ status: 'pendente' })
            .populate({
                path: 'editalId',
                select: 'nome_bolsa perguntas formula_avaliacao'
            })
            .populate('usuarioId', 'nome_completo numero_matricula email')
            .exec();

        // Para cada inscrição, calcular a nota máxima
        const inscricoesComNotas = inscricoes.map((inscricao) => {
            const edital = inscricao.editalId;
            let notaMaxima = null;

            if (edital?.formula_avaliacao && edital?.perguntas) {
                try {
                    const resultado = calcularNotaMaximaPossivel(edital);
                    notaMaxima = resultado.nota_maxima;
                } catch (e) {
                    console.warn(`Erro ao calcular nota máxima da inscrição ${inscricao._id}:`, e.message);
                }
            }

            return {
                ...inscricao.toObject(),
                notaMaximaPossivel: notaMaxima
            };
        });

        res.json(inscricoesComNotas);
    } catch (error) {
        console.error('Erro ao buscar inscrições pendentes:', error);
        res.status(500).json({ error: 'Erro ao buscar inscrições pendentes' });
    }
});

// Rota para obter os detalhes de uma inscrição para avaliação
router.get('/:id', async (req, res) => {
    try {
        const inscricao = await Inscricao.findById(req.params.id)
            .populate('usuarioId', 'nome_completo email cpf endereco')
            .lean();

        if (!inscricao) return res.status(404).json({ error: 'Inscrição não encontrada' });

        const edital = await Edital.findById(inscricao.editalId).lean();
        if (!edital) return res.status(404).json({ error: 'Edital associado não encontrado' });

        // Calcular a nota máxima da fórmula
        try {
            const resultado = calcularNotaMaximaPossivel(edital);
            edital.nota_maxima = resultado.nota_maxima;
        } catch (e) {
            console.warn(`Erro ao calcular nota máxima para o edital ${edital._id}:`, e.message);
            edital.nota_maxima = null;
        }

        res.json({ inscricao, edital });
    } catch (err) {
        console.error('Erro ao buscar dados para avaliação:', err);
        res.status(500).json({ error: 'Erro ao buscar dados da inscrição' });
    }
});

// Rota para atualizar o status da inscrição após avaliação (atualiza pesos e comentários)
// Salvar avaliação de inscrição
router.post('/:id/avaliar', async (req, res) => {
    try {
        const inscricaoId = req.params.id;
        const { respostas, observacaoAvaliador } = req.body;

        // Buscar a inscrição
        const inscricao = await Inscricao.findById(inscricaoId);
        if (!inscricao) return res.status(404).json({ error: 'Inscrição não encontrada' });

        // Buscar o edital relacionado
        const edital = await Edital.findById(inscricao.editalId);
        if (!edital) return res.status(404).json({ error: 'Edital associado não encontrado' });

        // Atualiza as respostas manualmente
        inscricao.respostas = respostas;

        console.log('Tipo de respostas:', typeof respostas);
        console.log('É array?', Array.isArray(respostas));
        console.log('Conteúdo:', respostas);


        // Recalcula a nota final com base na fórmula
        const resultado = calcularPontuacaoInscricao(
            respostas,
            edital.perguntas,
            edital.formula_avaliacao
        );
        inscricao.pontuacaoFinal = resultado.pontuacaoFinal;

        // Salva observação do avaliador, se enviada
        if (observacaoAvaliador !== undefined) {
            inscricao.observacaoAvaliador = observacaoAvaliador;
        }

        // Atualiza status para "avaliada"
        inscricao.status = 'avaliada';

        await inscricao.save();

        return res.status(200).json({ message: 'Avaliação salva com sucesso', inscricao });

    } catch (error) {
        console.error('Erro ao salvar avaliação:', error);
        return res.status(500).json({ error: 'Erro ao salvar avaliação' });
    }
});

module.exports = router;
