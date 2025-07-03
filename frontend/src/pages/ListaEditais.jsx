// src/pages/ListaEditais.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ListaEditais = () => {
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEditais = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/editais/listar');
        if (!response.ok) throw new Error('Erro ao carregar editais');
        const data = await response.json();
        setEditais(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEditais();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-700">Carregando editais...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Erro: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Editais</h1>

      {editais.length === 0 ? (
        <p className="text-gray-600">Nenhum edital encontrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="text-left px-4 py-3">Nome da Bolsa</th>
                <th className="text-left px-4 py-3">Descrição</th>
                <th className="text-left px-4 py-3">Período Letivo</th>
                <th className="text-center px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {editais.map((edital) => (
                <tr key={edital._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800">{edital.nome_bolsa}</td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-xs">{edital.descricao}</td>
                  <td className="px-4 py-3 text-gray-700">{edital.periodo_letivo}</td>
                  <td className="px-4 py-3 text-center">
                    <Link to={`/editar-edital/${edital._id}`}>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors">
                        Editar
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaEditais;
