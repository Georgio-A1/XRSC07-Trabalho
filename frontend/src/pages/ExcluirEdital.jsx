// src/pages/ExcluirEditais.jsx
import React, { useState, useEffect } from 'react';

const ExcluirEditais = () => {
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [buscaNome, setBuscaNome] = useState('');
  const [buscaPeriodo, setBuscaPeriodo] = useState('');

  const fetchEditais = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/editais/listar');
      if (!res.ok) throw new Error('Erro ao carregar editais');
      const data = await res.json();
      setEditais(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditais();
  }, []);

  const handleExcluir = async (id) => {
    const confirm = window.confirm('Tem certeza que deseja excluir este edital? Essa ação não poderá ser desfeita.');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/editais/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Edital excluído com sucesso!');
        setEditais(prev => prev.filter(e => e._id !== id));
      } else {
        alert(data.message || 'Erro ao excluir edital.');
      }
    } catch (err) {
      alert('Erro ao excluir edital.');
      console.error(err);
    }
  };

  const editaisFiltrados = editais.filter((edital) => {
    const nomeMatch = edital.nome_bolsa.toLowerCase().includes(buscaNome.toLowerCase());
    const periodoMatch = edital.periodo_letivo.toLowerCase().includes(buscaPeriodo.toLowerCase());
    return nomeMatch && periodoMatch;
  });

  if (loading) return <div className="p-6 text-center text-gray-700">Carregando editais...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Erro: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Excluir Editais</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome da bolsa"
          className="w-full md:w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
        />
        <select
          value={buscaPeriodo}
          onChange={(e) => setBuscaPeriodo(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os períodos</option>
          {[...new Set(editais.map(e => e.periodo_letivo).filter(Boolean))].map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>


      {editaisFiltrados.length === 0 ? (
        <p className="text-gray-600 italic">Nenhum edital encontrado com os filtros aplicados.</p>
      ) : (
        <ul className="space-y-4">
          {editaisFiltrados.map((edital) => (
            <li key={edital._id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{edital.nome_bolsa}</h3>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Período Letivo:</strong> {edital.periodo_letivo}
              </p>
              <p className="text-sm text-gray-700 mb-4">
                <strong>Descrição:</strong> {edital.descricao}
              </p>
              <button
                onClick={() => handleExcluir(edital._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
              >
                Excluir Edital
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExcluirEditais;
