// src/pages/FecharEdital.jsx
import React, { useEffect, useState } from 'react';

const FecharEdital = () => {
  const [editais, setEditais] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const buscarEditaisEncerrados = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/editais/encerrados-nao-finalizados');
        if (!res.ok) throw new Error('Erro ao buscar editais');
        const data = await res.json();
        setEditais(data);
      } catch (err) {
        console.error(err);
        setMensagem('Erro ao carregar editais.');
      }
    };

    buscarEditaisEncerrados();
  }, []);

  const fecharEdital = async (editalId) => {
    if (!window.confirm('Tem certeza que deseja fechar esse edital? Essa ação é irreversível.')) return;

    setCarregando(true);
    try {
      const res = await fetch(`http://localhost:5000/api/inscricoes/aprovar-automaticamente/${editalId}`, {
        method: 'POST'
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao fechar edital');

      setMensagem(`✅ Edital fechado com sucesso: ${data.aprovadas} aprovados, ${data.reprovadas} reprovados.`);
      setEditais(editais.filter(e => e._id !== editalId));
    } catch (err) {
      console.error(err);
      setMensagem('❌ Erro ao fechar edital: ' + err.message);
    }
    setCarregando(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Fechar Editais</h1>

      {mensagem && (
        <div
          className={`mb-4 px-4 py-2 rounded-md text-sm font-medium ${
            mensagem.startsWith('✅')
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {mensagem}
        </div>
      )}

      {carregando && (
        <p className="text-blue-600 font-medium mb-4 animate-pulse">Processando fechamento...</p>
      )}

      {editais.length === 0 ? (
        <p className="text-gray-600 italic">Não há editais encerrados pendentes de fechamento.</p>
      ) : (
        <div className="space-y-6">
          {editais.map((edital) => (
            <div
              key={edital._id}
              className="border border-gray-200 rounded-lg shadow-sm bg-white p-5"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {edital.nome_bolsa}
              </h3>
              <p className="text-sm text-gray-700 mb-1">
                <strong>Data de Fim das Inscrições:</strong>{' '}
                {new Date(edital.data_fim_inscricoes).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-700 mb-4">
                <strong>Máximo de Aprovados:</strong>{' '}
                {edital.numero_maximo_aprovados ?? 'Não especificado'}
              </p>
              <button
                onClick={() => fecharEdital(edital._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-medium transition"
              >
                Fechar Edital
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FecharEdital;
