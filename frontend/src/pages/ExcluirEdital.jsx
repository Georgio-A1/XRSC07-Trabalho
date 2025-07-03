// src/pages/ExcluirEditais.jsx
import React, { useState, useEffect } from 'react';

const ExcluirEditais = () => {
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div className="p-6 text-center text-gray-700">Carregando editais...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Erro: {error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Excluir Editais</h2>

      {editais.length === 0 ? (
        <p className="text-gray-600">Nenhum edital disponível.</p>
      ) : (
        <ul className="space-y-4">
          {editais.map((edital) => (
            <li key={edital._id} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{edital.nome_bolsa}</h3>
              <p className="text-sm text-gray-600 mb-1"><strong>Período Letivo:</strong> {edital.periodo_letivo}</p>
              <p className="text-sm text-gray-700 mb-4"><strong>Descrição:</strong> {edital.descricao}</p>
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
