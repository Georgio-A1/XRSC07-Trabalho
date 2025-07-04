import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const AvaliarDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const [documentoSelecionado, setDocumentoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);

  const [filtroMatricula, setFiltroMatricula] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    carregarDocumentosEnviados();
  }, []);

  const carregarDocumentosEnviados = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/documentos/enviados');
      if (response.data && response.data.length > 0) {
        setDocumentos(response.data);
        setMensagemErro('');
      } else {
        setMensagemErro('Nenhum documento encontrado.');
      }
    } catch (error) {
      setMensagemErro('Erro ao carregar documentos enviados.');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusDocumento = async (documentoId, novoStatus) => {
    if (
      novoStatus === 'reprovado' &&
      !window.confirm('Tem certeza que deseja reprovar este documento?')
    )
      return;

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/documentos/atualizar-status', {
        documentoId,
        novoStatus,
      });
      if (response.status === 200) {
        setMensagemSucesso(`Documento ${novoStatus} com sucesso!`);
        carregarDocumentosEnviados();
        fecharModal();
      }
    } catch (error) {
      setMensagemErro(`Erro ao ${novoStatus} o documento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (documento) => {
    setDocumentoSelecionado(documento);
    setModalAberto(true);
    setMensagemErro('');
    setMensagemSucesso('');
  };

  const fecharModal = () => {
    setDocumentoSelecionado(null);
    setModalAberto(false);
    setMensagemErro('');
    setMensagemSucesso('');
  };

  const tiposUnicos = [...new Set(documentos.map((d) => d.tipo).filter(Boolean))];

  const documentosFiltrados = documentos.filter((doc) => {
    const matchMatricula =
      filtroMatricula === '' ||
      doc.usuarioId?.numero_matricula?.includes(filtroMatricula);
    const matchTipo = filtroTipo === '' || doc.tipo === filtroTipo;
    return matchMatricula && matchTipo;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Avaliar Documentos</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Filtrar por matrícula"
          value={filtroMatricula}
          onChange={(e) => setFiltroMatricula(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todos os tipos</option>
          {tiposUnicos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      {mensagemErro && <p className="text-red-600 font-medium">{mensagemErro}</p>}
      {mensagemSucesso && <p className="text-green-600 font-medium">{mensagemSucesso}</p>}
      {loading && <p className="text-gray-600">Carregando...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentosFiltrados.map((doc) => (
          <div
            key={doc._id}
            className="border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold text-gray-800">{doc.tipo}</h3>
            <p className="text-sm text-gray-700">
              <strong>Aluno:</strong> {doc.usuarioId?.nome_completo || 'Desconhecido'}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Matrícula:</strong> {doc.usuarioId?.numero_matricula || 'N/A'}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Arquivo:</strong> {doc.filename}
            </p>
            <button
              onClick={() => abrirModal(doc)}
              className="mt-3 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              title={`Avaliar documento de ${doc.usuarioId?.nome_completo}`}
            >
              Visualizar e Avaliar
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalAberto} onClose={fecharModal}>
        {documentoSelecionado && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Avaliação do Documento</h2>

            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-semibold text-gray-700 mb-2">Informações do Aluno</h3>
              <p>
                <strong>Nome:</strong> {documentoSelecionado.usuarioId?.nome_completo}
              </p>
              <p>
                <strong>CPF:</strong> {documentoSelecionado.usuarioId?.cpf}
              </p>
              <p>
                <strong>Matrícula:</strong> {documentoSelecionado.usuarioId?.numero_matricula}
              </p>
              <p>
                <strong>Endereço:</strong>{' '}
                {(() => {
                  const endereco = documentoSelecionado.usuarioId?.endereco;
                  if (!endereco) return 'N/A';
                  return `${endereco.rua}, ${endereco.numero}${
                    endereco.complemento ? ', ' + endereco.complemento : ''
                  }, ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}, CEP: ${endereco.cep}`;
                })()}
              </p>
            </div>

            <div className="space-y-4">
              <embed
                src={`http://localhost:5000/api/documentos/visualizar/${documentoSelecionado._id}`}
                width="100%"
                height="600px"
                type="application/pdf"
                className="border rounded"
              />

              <div className="flex gap-4">
                <button
                  onClick={() =>
                    atualizarStatusDocumento(documentoSelecionado._id, 'aprovado')
                  }
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Aprovando...' : 'Aprovar'}
                </button>
                <button
                  onClick={() =>
                    atualizarStatusDocumento(documentoSelecionado._id, 'reprovado')
                  }
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Reprovando...' : 'Reprovar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AvaliarDocumentos;
