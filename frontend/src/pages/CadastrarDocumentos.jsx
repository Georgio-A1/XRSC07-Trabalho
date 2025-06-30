import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Importa a biblioteca para decodificar o JWT
import styles from './CadastrarDocumentos.module.css';

const CadastrarDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [documentoAtual, setDocumentoAtual] = useState(null);

  // Decodifica o token para extrair o ID do usuário
  const usuarioId = localStorage.getItem('token')
    ? jwtDecode(localStorage.getItem('token')).id
    : null;

  console.log('ID do usuário extraído do JWT:', usuarioId); // Log para depuração

  // Carregar documentos inicialmente
  useEffect(() => {
    if (usuarioId) {
      carregarDocumentos();
    }
  }, [usuarioId]);

  // Documentos fixos (os que o sistema sempre exige)
  const documentosFixos = [
    { id: 1, titulo: 'CPF', status: 'pendente' },
    { id: 2, titulo: 'RG', status: 'pendente' },
    { id: 3, titulo: 'Comprovante de Residência', status: 'pendente' },
    { id: 4, titulo: 'Comprovante de Renda', status: 'pendente' },
    { id: 5, titulo: 'Comprovante de Matrícula', status: 'pendente' },
  ];

  const carregarDocumentos = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/documentos?usuarioId=${usuarioId}`);
      console.log('Documentos carregados:', response.data);

      // Extraia os dados do backend
      const documentosDoBanco = response.data.map((doc) => ({
        id: doc._id, // Use o ID retornado do backend
        titulo: doc.tipo, // Acessa o tipo no metadata
        status: doc.estado, // Acessa o estado no metadata
      }));

      // Atualize os documentos fixos com o estado real ou mantenha como "pendente"
      const documentosAtualizados = documentosFixos.map((fixo) => {
        const docBanco = documentosDoBanco.find((doc) => doc.titulo === fixo.titulo);
        return docBanco
          ? { ...fixo, id: docBanco.id, status: docBanco.status } // Atualiza status e mantém os dados fixos
          : fixo; // Se não encontrado no backend, mantém como "pendente"
      });

      setDocumentos(documentosAtualizados);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setMensagemErro('Erro ao carregar documentos. Exibindo documentos padrão.');

      // Se houver erro, carregar os documentos fixos como pendentes
      setDocumentos(documentosFixos);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setMensagemErro('Todos os documentos devem ser enviados no formato PDF.');
      setArquivoSelecionado(null);
    } else if (file && file.size > 10 * 1024 * 1024) {
      setMensagemErro('O tamanho máximo permitido para o arquivo é 10 MB.');
      setArquivoSelecionado(null);
    } else {
      setMensagemErro('');
      setArquivoSelecionado(file);
    }
  };

  const handleUpload = async () => {
    if (!arquivoSelecionado) {
      setMensagemErro('Selecione um arquivo antes de fazer o upload.');
      return;
    }

    if (!usuarioId) {
      setMensagemErro('Usuário não autenticado!');
      return;
    }

    const formData = new FormData();
    formData.append('file', arquivoSelecionado);
    formData.append('usuarioId', usuarioId); // Enviar o ID do usuário
    formData.append('tipo', documentoAtual.titulo); // Enviar o tipo de documento (e.g., "RG", "CPF")

    try {
      const response = await axios.post(
        'http://localhost:5000/api/documentos/cadastrar',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      console.log('Resposta do backend:', response.data);

      // Após o upload, recarregar os documentos atualizados
      carregarDocumentos();
      setDocumentoAtual(null);
      setArquivoSelecionado(null);
      alert('Documento enviado com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error.response?.data || error.message);
      setMensagemErro(
        error.response?.data?.error || 'Erro ao enviar o documento. Tente novamente.'
      );
    }
  };

  const abrirTelaDocumento = (documento) => {
    // Apenas permite editar documentos com status "pendente" ou "reprovado"
    if (documento.status === 'pendente' || documento.status === 'reprovado') {
      setDocumentoAtual(documento);
      setMensagemErro('');
      setArquivoSelecionado(null);
    }
  };

  return (
    <div className={styles['cadastrar-documentos-container']}>
      <h1>Cadastrar Documentos</h1>
      {!documentoAtual && (
        <div className="documentos-grid">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className={`${styles['documento-box']} ${styles[doc.status]}`}

              onClick={() => abrirTelaDocumento(doc)}
            >
              <h3>{doc.titulo}</h3>
              <p>Status: {doc.status}</p>
            </div>
          ))}
        </div>
      )}
      {documentoAtual && (
        <div className={styles['upload-container']}>
          <h2>{`Enviar ${documentoAtual.titulo}`}</h2>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          {mensagemErro && <p className="error-message">{mensagemErro}</p>}
          <button onClick={handleUpload}>Enviar</button>
          <button onClick={() => setDocumentoAtual(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default CadastrarDocumentos;
