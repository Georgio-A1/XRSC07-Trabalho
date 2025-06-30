const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId, GridFSBucket } = require('mongodb');
const upload = require('../config/storage');
const Documento = require('../models/Documento');

let bucket;

mongoose.connection.once('open', () => {
    bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads',
    });
});

router.get('/', async (req, res) => {
    const { usuarioId } = req.query;
    if (!usuarioId) {
        return res.status(400).json({ error: 'Parâmetro usuarioId é obrigatório.' });
    }

    try {
        const documentos = await Documento.find({ usuarioId });
        return res.json(documentos);
    } catch (error) {
        console.error('Erro ao buscar documentos:', error);
        return res.status(500).json({ error: 'Erro ao buscar documentos' });
    }
});

router.post('/cadastrar', upload.single('file'), (req, res) => {
    const { usuarioId, tipo } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'Arquivo não enviado.' });
    }
    if (!usuarioId || !tipo) {
        return res.status(400).json({ error: 'usuarioId e tipo são obrigatórios.' });
    }
    if (!bucket) {
        return res.status(500).json({ error: 'GridFSBucket não inicializado ainda.' });
    }

    const uploadStream = bucket.openUploadStream(
        `${Date.now()}-${req.file.originalname}`,
        {
            contentType: req.file.mimetype,
            metadata: { usuarioId, tipo, estado: 'enviado' },
        }
    );

    uploadStream.end(req.file.buffer);

    uploadStream.on('error', (err) => {
        console.error('Erro no upload GridFS:', err);
        res.status(500).json({ error: 'Erro no upload do arquivo.' });
    });

    uploadStream.on('finish', async () => {
        try {
            const file = uploadStream;
            const novoDocumento = new Documento({
                usuarioId: new ObjectId(usuarioId),
                tipo,
                estado: 'enviado',
                uploadDate: new Date(),
                filename: file.filename,
                fileSize: file.length,
                fileId: file.id,
            });
            await novoDocumento.save();

            res.status(201).json({ message: 'Documento enviado com sucesso!', fileId: file.id });
        } catch (err) {
            console.error('Erro ao salvar documento:', err);
            res.status(500).json({ error: 'Erro ao salvar documento no banco.' });
        }
    });
});

// rota para pegar documentos enviados (apenas para avaliação)
router.get('/enviados', async (req, res) => {
  try {
    // Busca documentos com estado 'enviado' e já popula os dados do usuário
    const documentos = await Documento.find({ estado: 'enviado' }).populate('usuarioId', 'nome_completo numero_matricula cpf endereco');

    //console.log('Documentos enviados populados:', documentos);

    res.json(documentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar documentos enviados' });
  }
});

router.get('/visualizar/:documentoId', async (req, res) => {
  const { documentoId } = req.params;

  try {
    const documento = await Documento.findById(documentoId);
    if (!documento) return res.status(404).send('Documento não encontrado');

    const fileId = documento.fileId;
    if (!fileId) return res.status(404).send('Arquivo não encontrado');

    const downloadStream = bucket.openDownloadStream(fileId);

    res.set('Content-Type', 'application/pdf');

    downloadStream.on('error', (err) => {
      console.error(err);
      res.status(404).send('Erro ao ler arquivo');
    });

    downloadStream.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro interno do servidor');
  }
});

// rota para atualizar status do documento
router.post('/atualizar-status', async (req, res) => {
    const { documentoId, novoStatus, usuarioAvaliadorId } = req.body;
    if (!['aprovado', 'reprovado'].includes(novoStatus)) {
        return res.status(400).json({ error: 'Status inválido' });
    }

    try {
        const doc = await Documento.findById(documentoId);
        if (!doc) return res.status(404).json({ error: 'Documento não encontrado' });

        doc.estado = novoStatus;
        doc.metadata.aprovadoPor = usuarioAvaliadorId;
        doc.metadata.dataAprovacao = new Date();
        await doc.save();

        res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar status do documento' });
    }
});


module.exports = router;
