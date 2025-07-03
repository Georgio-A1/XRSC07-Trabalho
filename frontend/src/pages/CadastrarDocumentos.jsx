import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Importa a biblioteca para decodificar o JWT

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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Cadastrar Documentos</h1>

      {!documentoAtual ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className={`
    cursor-pointer p-4 rounded-lg shadow-md border transition 
    ${doc.status === 'aprovado' ? 'bg-green-100 border-green-300' : ''}
    ${doc.status === 'reprovado' ? 'bg-red-100 border-red-300' : ''}
    ${doc.status === 'pendente' ? 'bg-yellow-100 border-yellow-300' : ''}
    ${doc.status === 'enviado' ? 'bg-blue-100 border-blue-300' : ''}
    hover:shadow-lg
  `}
              onClick={() => abrirTelaDocumento(doc)}
            >
              <h3 className="text-lg font-semibold text-gray-800">{doc.titulo}</h3>
              <p className="text-sm text-gray-700">Status: <span className="capitalize">{doc.status}</span></p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Enviar {documentoAtual.titulo}</h2>

          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />

          {mensagemErro && <p className="text-red-600">{mensagemErro}</p>}

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              Enviar
            </button>
            <button
              onClick={() => setDocumentoAtual(null)}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastrarDocumentos;
