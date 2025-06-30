import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './AvaliarDocumento.module.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles['modal-overlay']} onClick={onClose}>
      <div className={styles['modal-content']} onClick={e => e.stopPropagation()}>
        <button className={styles['modal-close-btn']} onClick={onClose}>×</button>
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

  return (
    <div>
      <h1>Avaliar Documentos</h1>

      {mensagemErro && <p className="error-message">{mensagemErro}</p>}
      {mensagemSucesso && <p className="success-message">{mensagemSucesso}</p>}
      {loading && <p>Carregando...</p>}

      <div className={styles['documentos-list']}>
        {documentos.map(doc => (
          <div key={doc._id} className={styles['documento-box']}>
            <h3>{doc.tipo}</h3>
            <p><strong>Aluno:</strong> {doc.usuarioId?.nome_completo || 'Desconhecido'}</p>
            <p><strong>Matrícula:</strong> {doc.usuarioId?.numero_matricula || 'N/A'}</p>
            <p><strong>Status:</strong> {doc.estado}</p>
            <p><strong>Arquivo:</strong> {doc.filename}</p>
            <button onClick={() => abrirModal(doc)}>Visualizar e Avaliar</button>
          </div>
        ))}
      </div>

      <Modal isOpen={modalAberto} onClose={fecharModal}>
        {documentoSelecionado && (
          <div className={styles['modal-avaliacao']}>
            <h2>Avaliação do Documento</h2>
            <div className={styles['painel-aluno']}>
              <h3>Informações do Aluno</h3>
              <p><strong>Nome:</strong> {documentoSelecionado.usuarioId?.nome_completo}</p>
              <p><strong>CPF:</strong> {documentoSelecionado.usuarioId?.cpf}</p>
              <p><strong>Matrícula:</strong> {documentoSelecionado.usuarioId?.numero_matricula}</p>
              <p><strong>Endereço:</strong> {
                (() => {
                  const endereco = documentoSelecionado.usuarioId?.endereco;
                  if (!endereco) return 'N/A';
                  return `${endereco.rua}, ${endereco.numero}${endereco.complemento ? ', ' + endereco.complemento : ''}, ${endereco.bairro}, ${endereco.cidade} - ${endereco.estado}, CEP: ${endereco.cep}`;
                })()
              }</p>
            </div>
            <div className={styles['painel-documento']}>
              <embed
                src={`http://localhost:5000/api/documentos/visualizar/${documentoSelecionado._id}`}
                width="100%" height="600px" type="application/pdf"
              />
              <div className={styles['botoes-avaliacao']}>
                <button onClick={() => atualizarStatusDocumento(documentoSelecionado._id, 'aprovado')} disabled={loading}>Aprovar</button>
                <button onClick={() => atualizarStatusDocumento(documentoSelecionado._id, 'reprovado')} disabled={loading}>Reprovar</button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AvaliarDocumentos;
