import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const STATUS = {
  PENDENTE: 'pendente',
  APROVADO: 'aprovado',
  REPROVADO: 'reprovado',
  ENVIADO: 'enviado',
};

const STATUS_TOOLTIPS = {
  [STATUS.PENDENTE]: 'Documento ainda não enviado.',
  [STATUS.APROVADO]: 'Documento aprovado pelo avaliador.',
  [STATUS.REPROVADO]: 'Documento reprovado. É necessário reenviar.',
  [STATUS.ENVIADO]: 'Documento enviado, aguardando avaliação.',
};

const CadastrarDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
  const [documentoAtual, setDocumentoAtual] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const token = localStorage.getItem('token');
  const usuarioId = token ? jwtDecode(token).id : null;

  useEffect(() => {
    if (usuarioId) {
      carregarDocumentos();
    }
  }, [usuarioId]);

  const documentosFixos = [
    { id: 1, titulo: 'CPF', status: STATUS.PENDENTE },
    { id: 2, titulo: 'RG', status: STATUS.PENDENTE },
    { id: 3, titulo: 'Comprovante de Residência', status: STATUS.PENDENTE },
    { id: 4, titulo: 'Comprovante de Renda', status: STATUS.PENDENTE },
    { id: 5, titulo: 'Comprovante de Matrícula', status: STATUS.PENDENTE },
  ];

  async function carregarDocumentos() {
    setLoadingDocs(true);
    setMensagemErro('');
    try {
      const response = await axios.get(`http://localhost:5000/api/documentos?usuarioId=${usuarioId}`);

      const documentosDoBanco = response.data.map((doc) => ({
        id: doc._id,
        titulo: doc.tipo,
        status: doc.estado,
      }));

      const documentosAtualizados = documentosFixos.map((fixo) => {
        const docBanco = documentosDoBanco.find((doc) => doc.titulo === fixo.titulo);
        return docBanco ? { ...fixo, id: docBanco.id, status: docBanco.status } : fixo;
      });

      setDocumentos(documentosAtualizados);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setMensagemErro('Erro ao carregar documentos. Exibindo documentos padrão.');
      setDocumentos(documentosFixos);
    } finally {
      setLoadingDocs(false);
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Apenas limpa mensagens, validação feita no backend
    setMensagemErro('');
    setArquivoSelecionado(file);
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

    setLoadingUpload(true);
    setMensagemErro('');
    setMensagemSucesso('');

    const formData = new FormData();
    formData.append('file', arquivoSelecionado);
    formData.append('usuarioId', usuarioId);
    formData.append('tipo', documentoAtual.titulo);

    try {
      await axios.post(
        'http://localhost:5000/api/documentos/cadastrar',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      carregarDocumentos();
      setDocumentoAtual(null);
      setArquivoSelecionado(null);
      setMensagemSucesso('Documento enviado com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error.response?.data || error.message);
      setMensagemErro(error.response?.data?.error || 'Erro ao enviar o documento. Tente novamente.');
    } finally {
      setLoadingUpload(false);
    }
  };

  const abrirTelaDocumento = (documento) => {
    if (documento.status === STATUS.PENDENTE || documento.status === STATUS.REPROVADO) {
      setDocumentoAtual(documento);
      setMensagemErro('');
      setMensagemSucesso('');
      setArquivoSelecionado(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Cadastrar Documentos</h1>

      {!documentoAtual ? (
        loadingDocs ? (
          <p className="text-gray-700">Carregando documentos...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                onClick={() => abrirTelaDocumento(doc)}
                className={`
                  cursor-pointer p-4 rounded-lg shadow-md border transition
                  ${doc.status === STATUS.APROVADO ? 'bg-green-100 border-green-300' : ''}
                  ${doc.status === STATUS.REPROVADO ? 'bg-red-100 border-red-300' : ''}
                  ${doc.status === STATUS.PENDENTE ? 'bg-yellow-100 border-yellow-300' : ''}
                  ${doc.status === STATUS.ENVIADO ? 'bg-blue-100 border-blue-300' : ''}
                  hover:shadow-lg
                `}
                title={STATUS_TOOLTIPS[doc.status] || ''}
              >
                <h3 className="text-lg font-semibold text-gray-800">{doc.titulo}</h3>
                <p className="text-sm text-gray-700">
                  Status: <span className="capitalize">{doc.status}</span>
                </p>
              </div>
            ))}
          </div>
        )
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
          {mensagemSucesso && <p className="text-green-600">{mensagemSucesso}</p>}

          <div className="flex gap-4">
            <button
              onClick={handleUpload}
              disabled={loadingUpload}
              className={`px-6 py-2 rounded text-white transition ${
                loadingUpload ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loadingUpload ? 'Enviando...' : 'Enviar'}
            </button>

            <button
              onClick={() => setDocumentoAtual(null)}
              disabled={loadingUpload}
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
