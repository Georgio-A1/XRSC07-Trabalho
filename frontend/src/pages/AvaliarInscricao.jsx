import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const fetchInscricaoAndEdital = async (inscricaoId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/avaliacao/${inscricaoId}`);
    if (!response.ok) throw new Error('Erro ao buscar a inscrição. Status: ' + response.status);
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar a inscrição:", error);
    throw error;
  }
};

const AvaliarInscricao = () => {
  const { id } = useParams();
  const [inscricao, setInscricao] = useState(null);
  const [edital, setEdital] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchInscricaoAndEdital(id);
        setInscricao(data.inscricao);
        setEdital(data.edital);
      } catch (error) {
        setErro(error.message);
      }
    };
    getData();
  }, [id]);

  const handleNotaTextoChange = (index, novaNota) => {
    const novaInscricao = { ...inscricao };
    novaInscricao.respostas[index].pesoCalculado = parseFloat(novaNota);
    novaInscricao.pontuacaoFinal = novaInscricao.respostas.reduce(
      (acc, r) => acc + (typeof r.pesoCalculado === 'number' ? r.pesoCalculado : 0), 0
    );
    setInscricao(novaInscricao);
  };

  const [observacaoAvaliador, setObservacaoAvaliador] = useState('');

  const salvarAvaliacao = async () => {
    const response = await fetch(`http://localhost:5000/api/avaliacao/${id}/avaliar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        respostas: inscricao.respostas,
        pontuacaoFinal: inscricao.pontuacaoFinal,
        observacaoAvaliador: observacaoAvaliador
      })
    });

    if (!response.ok) {
      alert('Erro ao salvar avaliação.');
    } else {
      alert('Avaliação salva com sucesso!');
    }
  };

  if (erro) return <div>{erro}</div>;
  if (!inscricao || !edital) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Avaliar Inscrição - ID: {id}</h1>

      <h2>Edital: {edital.nome_bolsa}</h2>
      <p><strong>Descrição:</strong> {edital.descricao}</p>
      <p><strong>Critérios de Elegibilidade:</strong> {edital.criterios_elegibilidade}</p>
      <p><strong>Pontuação Final:</strong> {inscricao.pontuacaoFinal?.toFixed(2)}</p>
      <p><strong>Pontuação Máxima do Edital:</strong> {edital.nota_maxima?.toFixed(2)}</p>

      <h3>Documentos Enviados</h3>
      <ul>
        {inscricao.documentosEnviados.map(doc => (
          <li key={doc._id}>
            <strong>{doc.tipo}:</strong>{' '}
            <a
              href={`http://localhost:5000/api/documentos/visualizar/${doc.arquivoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visualizar PDF
            </a>
          </li>
        ))}
      </ul>

      <h3>Respostas do Candidato</h3>
      {inscricao.respostas.map((resposta, index) => {
        const pergunta = edital.perguntas.find(p => p.id === resposta.identificadorPergunta);
        if (!pergunta) return null;

        const isTexto = ['texto_curto', 'texto_longo'].includes(pergunta.subtipo);

        return (
          <div key={resposta.identificadorPergunta} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
            <p><strong>{pergunta.texto}</strong> ({pergunta.tipo})</p>
            <p><strong>Resposta:</strong>{' '}
              {Array.isArray(resposta.resposta)
                ? resposta.resposta.map((r, i) => {
                  const opcao = pergunta.opcoes.find(o => o._id === r || o._id?.toString() === r);
                  return <span key={i}>{opcao ? opcao.texto : r}{i < resposta.resposta.length - 1 ? ', ' : ''}</span>;
                })
                : (() => {
                  const opcao = pergunta.opcoes?.find(o => o._id === resposta.resposta || o._id?.toString() === resposta.resposta);
                  return opcao ? opcao.texto : resposta.resposta;
                })()}
            </p>


            {isTexto ? (
              <div>
                <label>
                  <strong>Nota atribuída (0 a 1):</strong>{' '}
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={resposta.pesoCalculado ?? ''}
                    onChange={(e) => handleNotaTextoChange(index, e.target.value)}
                  />
                </label>
              </div>
            ) : (
              <p><strong>Peso Calculado:</strong> {resposta.pesoCalculado}</p>
            )}

            {pergunta.opcoes?.length > 0 && (
              <div>
                <strong>Opções:</strong>
                <ul>
                  {pergunta.opcoes.map(op => (
                    <li key={op._id}>{op.texto} (peso: {op.peso})</li>
                  ))}
                </ul>
              </div>
            )}

            {pergunta.faixasNota?.length > 0 && (
              <div>
                <strong>Faixas de Nota:</strong>
                <ul>
                  {pergunta.faixasNota.map(faixa => (
                    <li key={faixa._id}>De {faixa.min} até {faixa.max} → peso: {faixa.peso}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: '24px' }}>
        <label>
          <strong>Observações do Avaliador:</strong><br />
          <textarea
            rows="4"
            cols="80"
            value={observacaoAvaliador}
            onChange={(e) => setObservacaoAvaliador(e.target.value)}
          />
        </label>
      </div>


      <button onClick={salvarAvaliacao}>Salvar Avaliação</button>
    </div>
  );
};

export default AvaliarInscricao;
