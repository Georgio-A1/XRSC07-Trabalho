const express = require('express');
const router = express.Router();
const Edital = require('../models/Edital');
const Inscricao = require('../models/Inscricao');
const Usuario = require('../models/Usuario');
const Documento = require('../models/Documento');
const { calcularPontuacaoInscricao } = require('../utils/calcularPontuacaoInscricao');
const { calcularNotaMaximaPossivel } = require('../utils/calculoPontuacao');


// Listar editais disponíveis para inscrição
router.get('/disponiveis', async (req, res) => {
    try {
        const dataAtual = new Date();

        const editaisDisponiveis = await Edital.find({
            data_inicio_inscricao: { $lte: dataAtual },
            data_fim_inscricao: { $gte: dataAtual },
        });

        res.json(editaisDisponiveis);
    } catch (error) {
        console.error('Erro ao buscar editais disponíveis:', error);
        res.status(500).json({ error: 'Erro ao buscar editais disponíveis' });
    }
});

// Obter dados de um edital específico (para preencher a tela de inscrição)
router.get('/:id', async (req, res) => {
    try {
        const edital = await Edital.findById(req.params.id);
        if (!edital) {
            return res.status(404).json({ error: 'Edital não encontrado' });
        }
        res.json(edital);
    } catch (error) {
        console.error('Erro ao buscar edital:', error);
        res.status(500).json({ error: 'Erro ao buscar edital' });
    }
});

// POST /api/inscricoes/importar-documentos
router.post('/importar-documentos', async (req, res) => {
    try {
        const { usuarioId, editalId, documentosObrigatorios = [], importarTodos } = req.body;

        if (!usuarioId || !editalId) {
            return res.status(400).json({ error: 'usuarioId e editalId são obrigatórios' });
        }

        // Utilitário para normalizar strings (sem acento e lowercase)
        const normalizar = (texto) =>
            texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

        // Buscar edital para pegar documentos exigidos
        const edital = await Edital.findById(editalId);
        if (!edital) {
            return res.status(404).json({ error: 'Edital não encontrado' });
        }

        const documentosExigidos = edital.documentos_exigidos || [];

        // Determina os tipos a serem buscados
        const tiposParaBuscar = importarTodos
            ? documentosExigidos.map((doc) => doc.tipo)
            : documentosObrigatorios;

        // Normaliza os tipos para facilitar comparação
        const tiposNormalizadosParaBuscar = tiposParaBuscar.map(normalizar);

        // Buscar todos os documentos aprovados do usuário
        const documentosUsuario = await Documento.find({
            usuarioId,
            estado: 'aprovado',
        });

        // Filtrar documentos que batem com os tipos esperados
        const documentosEncontrados = documentosUsuario.filter((doc) =>
            tiposNormalizadosParaBuscar.includes(normalizar(doc.tipo))
        );

        // Coletar os tipos e os _ids dos documentos encontrados
        const documentosImportados = documentosEncontrados.map((doc) => ({
            tipo: doc.tipo,
            id: doc._id,
        }));

        // Determinar faltantes (só para obrigatórios, se não for importarTodos)
        let documentosFaltantes = [];
        if (!importarTodos) {
            documentosFaltantes = tiposParaBuscar.filter((tipo) => {
                const tipoNormalizado = normalizar(tipo);
                return !documentosEncontrados.some(
                    (doc) => normalizar(doc.tipo) === tipoNormalizado
                );
            });
        }

        res.json({
            documentosImportados,
            documentosFaltantes,
        });

    } catch (error) {
        console.error('Erro na importação de documentos:', error);
        res.status(500).json({ error: 'Erro interno ao importar documentos' });
    }
});

// Criar uma nova inscrição
router.post('/criar-inscricao', async (req, res) => {
    try {
        const { usuarioId, editalId, respostas, documentos } = req.body;

        if (!usuarioId || !editalId || !respostas || !documentos) {
            return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
        }

        const edital = await Edital.findById(editalId);
        if (!edital) {
            return res.status(404).json({ error: 'Edital não encontrado.' });
        }

        // 🔒 VALIDAÇÃO: perguntas obrigatórias devem estar respondidas
        const respostasMap = new Map(respostas.map(r => [r.perguntaId, r.resposta]));
        const perguntasObrigatoriasNaoRespondidas = edital.perguntas.filter(p => {
            if (!p.obrigatorio) return false;
            const resp = respostasMap.get(p.id);
            if (p.subtipo === 'multipla_escolha') return !Array.isArray(resp) || resp.length === 0;
            return resp === undefined || resp === null || resp === '';
        });

        if (perguntasObrigatoriasNaoRespondidas.length > 0) {
            const lista = perguntasObrigatoriasNaoRespondidas.map(p => p.texto).join(', ');
            return res.status(400).json({
                error: 'Existem perguntas obrigatórias não respondidas.',
                perguntasNaoRespondidas: lista,
            });
        }

        // Cálculo da pontuação
        const { respostasComPeso, pontuacaoFinal } = calcularPontuacaoInscricao(
            respostas,
            edital.perguntas,
            edital.formula_avaliacao
        );

        const novaInscricao = new Inscricao({
            usuarioId,
            editalId,
            respostas: respostasComPeso,
            documentosEnviados: documentos.map(doc => ({
                tipo: doc.tipo,
                arquivoId: doc.arquivoId
            })),
            pontuacaoFinal
        });

        await novaInscricao.save();

        return res.status(201).json({
            message: 'Inscrição criada com sucesso',
            inscricao: novaInscricao
        });

    } catch (error) {
        console.error('Erro ao criar inscrição:', error);
        return res.status(500).json({ error: 'Erro interno ao criar inscrição' });
    }
});

// Buscar inscrições pendentes de um aluno
router.get('/pendentes/:usuarioId', async (req, res) => {
    try {
        const inscricoes = await Inscricao.find({
            usuarioId: req.params.usuarioId,
            status: 'pendente'
        }).populate('editalId');

        res.json(inscricoes);
    } catch (err) {
        console.error('Erro ao buscar inscrições pendentes:', err);
        res.status(500).json({ error: 'Erro ao buscar inscrições' });
    }
});

// Cancelar uma inscrição
router.delete('/:id', async (req, res) => {
    try {
        const inscricao = await Inscricao.findById(req.params.id);
        if (!inscricao) {
            return res.status(404).json({ error: 'Inscrição não encontrada' });
        }

        // Só permitir exclusão se ainda estiver pendente
        if (inscricao.status !== 'pendente') {
            return res.status(400).json({ error: 'Inscrição não pode ser cancelada pois já foi avaliada' });
        }

        await Inscricao.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Inscrição cancelada com sucesso' });
    } catch (err) {
        console.error('Erro ao cancelar inscrição:', err);
        res.status(500).json({ error: 'Erro ao cancelar inscrição' });
    }
});

// Buscar todas as inscrições de um aluno
router.get('/usuario/:usuarioId', async (req, res) => {
    try {
        // Busca inscrições do aluno com edital populado
        const inscricoes = await Inscricao.find({ usuarioId: req.params.usuarioId })
            .populate('editalId') // popula tudo do edital, para ter perguntas, fórmula, etc
            .lean(); // para trabalhar com objeto simples

        // Mapeia para adicionar nota máxima calculada
        const inscricoesComNotas = inscricoes.map(inscricao => {
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
                ...inscricao,
                notaMaximaPossivel: notaMaxima
            };
        });

        res.json(inscricoesComNotas);
    } catch (err) {
        console.error('Erro ao buscar inscrições do aluno:', err);
        res.status(500).json({ error: 'Erro ao buscar inscrições' });
    }
});

module.exports = router;
