import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ListaEditais = () => {
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

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

  const handleLimparFiltros = () => {
    setBusca('');
    setPeriodo('');
    setPaginaAtual(1);
  };

  const periodosUnicos = [...new Set(editais.map(e => e.periodo_letivo).filter(Boolean))];

  const editaisFiltrados = editais.filter((edital) => {
    const correspondeBusca = edital.nome_bolsa.toLowerCase().includes(busca.toLowerCase());
    const correspondePeriodo = periodo === '' || edital.periodo_letivo === periodo;
    return correspondeBusca && correspondePeriodo;
  });

  const totalPaginas = Math.ceil(editaisFiltrados.length / itensPorPagina);
  const editaisPaginados = editaisFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  if (loading) return <div className="p-6 text-center text-gray-700">Carregando editais...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Erro: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Editar Editais</h1>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
        <input
          type="text"
          placeholder="Buscar por nome da bolsa..."
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setPaginaAtual(1);
          }}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={periodo}
          onChange={(e) => {
            setPeriodo(e.target.value);
            setPaginaAtual(1);
          }}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todos os períodos</option>
          {periodosUnicos.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <button
          onClick={handleLimparFiltros}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
        >
          Limpar filtros
        </button>
      </div>

      {editaisFiltrados.length === 0 ? (
        <p className="text-gray-600 italic bg-gray-100 p-4 rounded shadow-inner">
          Nenhum edital encontrado com os filtros aplicados.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="text-left px-4 py-3">Nome da Bolsa</th>
                <th className="text-left px-4 py-3">Descrição</th>
                <th className="text-left px-4 py-3">Período Letivo</th>
                <th className="text-center px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {editaisPaginados.map((edital) => (
                <tr key={edital._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">{edital.nome_bolsa}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-md whitespace-normal break-words">{edital.descricao}</td>
                  <td className="px-4 py-3 text-gray-700">{edital.periodo_letivo}</td>
                  <td className="px-4 py-3 text-center">
                    <Link to={`/editar-edital/${edital._id}`}>
                      <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition">
                        ✏️ Editar
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginação */}
          <div className="mt-4 flex justify-center items-center gap-4 text-sm">
            <button
              onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              « Anterior
            </button>
            <span className="text-gray-700">
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            >
              Próxima »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaEditais;
