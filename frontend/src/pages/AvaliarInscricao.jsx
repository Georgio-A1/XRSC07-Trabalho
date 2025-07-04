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
  const [observacaoAvaliador, setObservacaoAvaliador] = useState('');

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchInscricaoAndEdital(id);
        setInscricao(data.inscricao);
        setEdital(data.edital);
        setObservacaoAvaliador(data.inscricao.observacaoAvaliador || '');
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

  const salvarAvaliacao = async () => {
    const response = await fetch(`http://localhost:5000/api/avaliacao/${id}/avaliar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        respostas: inscricao.respostas,
        pontuacaoFinal: inscricao.pontuacaoFinal,
        observacaoAvaliador
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
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Avaliar Inscrição - ID: {id}</h1>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-700">Edital: {edital.nome_bolsa}</h2>
        <p><strong>Descrição:</strong> {edital.descricao}</p>
        <p><strong>Critérios de Elegibilidade:</strong> {edital.criterios_elegibilidade}</p>
        <p>
          <strong>Pontuação Final:</strong>{' '}
          {inscricao.pontuacaoFinal != null && edital.nota_maxima ? (
            <>
              {((inscricao.pontuacaoFinal / edital.nota_maxima) * 10).toFixed(2)} / 10
              {inscricao.status === 'pendente' ? '*' : ''}
            </>
          ) : (
            '—'
          )}
        </p>
        <p className="text-sm text-gray-500">
          (Nota bruta: {inscricao.pontuacaoFinal?.toFixed(2)} / {edital.nota_maxima?.toFixed(2)})
        </p>


      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Documentos Enviados</h3>
        <ul className="list-disc list-inside space-y-1">
          {inscricao.documentosEnviados.map(doc => (
            <li key={doc._id}>
              <strong>{doc.tipo}:</strong>{' '}
              <a
                href={`http://localhost:5000/api/documentos/visualizar/${doc.arquivoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Visualizar PDF
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Respostas do Candidato</h3>
        {inscricao.respostas.map((resposta, index) => {
          const pergunta = edital.perguntas.find(p => p.id === resposta.identificadorPergunta);
          if (!pergunta) return null;

          const isTexto = ['texto_curto', 'texto_longo'].includes(pergunta.subtipo);

          return (
            <div key={resposta.identificadorPergunta} className="border border-gray-300 rounded-md p-4 space-y-2 bg-gray-50">
              <p className="text-gray-800 font-medium">
                {pergunta.texto} <span className="text-sm text-gray-600">({pergunta.tipo})</span>
              </p>
              <p><strong>Resposta:</strong>{' '}
                {Array.isArray(resposta.resposta)
                  ? resposta.resposta.map((r, i) => {
                    const opcao = pergunta.opcoes?.find(o => o._id === r || o._id?.toString() === r);
                    return <span key={i}>{opcao ? opcao.texto : r}{i < resposta.resposta.length - 1 ? ', ' : ''}</span>;
                  })
                  : (() => {
                    const opcao = pergunta.opcoes?.find(o => o._id === resposta.resposta || o._id?.toString() === resposta.resposta);
                    return opcao ? opcao.texto : resposta.resposta;
                  })()}
              </p>

              {isTexto ? (
                <div>
                  <label className="block text-sm text-gray-700">
                    <strong>Nota atribuída (0 a 1):</strong>
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={resposta.pesoCalculado ?? ''}
                      onChange={(e) => handleNotaTextoChange(index, e.target.value)}
                      className="mt-1 block w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </label>
                </div>
              ) : (
                <p><strong>Peso Calculado:</strong> {resposta.pesoCalculado}</p>
              )}

              {pergunta.opcoes?.length > 0 && (
                <div>
                  <strong>Opções:</strong>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {pergunta.opcoes.map(op => (
                      <li key={op._id}>{op.texto} (peso: {op.peso})</li>
                    ))}
                  </ul>
                </div>
              )}

              {pergunta.faixasNota?.length > 0 && (
                <div>
                  <strong>Faixas de Nota:</strong>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {pergunta.faixasNota.map(faixa => (
                      <li key={faixa._id}>De {faixa.min} até {faixa.max} → peso: {faixa.peso}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <label className="block text-gray-700 font-medium mb-1">
          Observações do Avaliador:
        </label>
        <textarea
          rows="4"
          value={observacaoAvaliador}
          onChange={(e) => setObservacaoAvaliador(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mt-6">
        <button
          onClick={salvarAvaliacao}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Salvar Avaliação
        </button>
      </div>
    </div>
  );
};

export default AvaliarInscricao;
