import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ListarEditais = () => {
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filtroNome, setFiltroNome] = useState('');
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const navigate = useNavigate();

  function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.substring(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }

  useEffect(() => {
    const fetchEditais = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token não encontrado');
          return;
        }
        const decodedToken = jwtDecode(token);
        const usuarioId = decodedToken.id;

        const response = await axios.get('http://localhost:5000/api/inscricoes/disponiveis', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'usuarioId': usuarioId,
          }
        });
        setEditais(response.data);
      } catch (error) {
        console.error('Erro ao carregar editais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEditais();
  }, []);

  // Filtros combinados
  const aplicarFiltros = (edital) => {
    const nomeMatch = edital.nome_bolsa.toLowerCase().includes(filtroNome.toLowerCase());

    const inicioFiltro = dataInicioFiltro ? new Date(dataInicioFiltro) : null;
    const fimFiltro = dataFimFiltro ? new Date(dataFimFiltro) : null;

    const inicioInscricao = edital.data_inicio_inscricao ? new Date(edital.data_inicio_inscricao) : null;
    const fimInscricao = edital.data_fim_inscricao ? new Date(edital.data_fim_inscricao) : null;

    if (!inicioInscricao || !fimInscricao) return nomeMatch; // Se não tem datas, filtra só pelo nome

    // Lógica para verificar se o período do edital intersecta com o período filtro
    // Ou seja, existe alguma sobreposição entre o período do edital e o intervalo do filtro
    let dataMatch = true;
    if (inicioFiltro && fimFiltro) {
      // Edital começa antes do fim do filtro E edital termina depois do início do filtro
      dataMatch = inicioInscricao <= fimFiltro && fimInscricao >= inicioFiltro;
    } else if (inicioFiltro) {
      // Edital termina depois do início do filtro (ainda ativo depois dessa data)
      dataMatch = fimInscricao >= inicioFiltro;
    } else if (fimFiltro) {
      // Edital começa antes do fim do filtro (ainda ativo antes dessa data)
      dataMatch = inicioInscricao <= fimFiltro;
    }

    return nomeMatch && dataMatch;
  };

  // Aplica filtros aos editais
  const editaisFiltrados = editais.filter(aplicarFiltros);

  // Paginação: calcula os itens da página atual
  const totalPaginas = Math.ceil(editaisFiltrados.length / itensPorPagina);
  const editaisPaginaAtual = editaisFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const handleInscricao = (id) => {
    navigate(`/realizar-inscricao/${id}`);
  };

  const handleMudarPagina = (numPagina) => {
    if (numPagina < 1 || numPagina > totalPaginas) return;
    setPaginaAtual(numPagina);
  };

  // Limpa todos os filtros e reseta a página
  const limparFiltros = () => {
    setFiltroNome('');
    setDataInicioFiltro('');
    setDataFimFiltro('');
    setPaginaAtual(1);
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Editais Disponíveis</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
        <div className="flex-1">
          <label htmlFor="filtroNome" className="block mb-1 font-semibold text-gray-700">
            Buscar por nome
          </label>
          <input
            type="text"
            id="filtroNome"
            value={filtroNome}
            onChange={(e) => {
              setFiltroNome(e.target.value);
              setPaginaAtual(1);
            }}
            placeholder="Nome da bolsa..."
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>

        <div>
          <label htmlFor="dataInicioFiltro" className="block mb-1 font-semibold text-gray-700">
            Data Início Inscrição
          </label>
          <input
            type="date"
            id="dataInicioFiltro"
            value={dataInicioFiltro}
            onChange={(e) => {
              setDataInicioFiltro(e.target.value);
              setPaginaAtual(1);
            }}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="dataFimFiltro" className="block mb-1 font-semibold text-gray-700">
            Data Fim Inscrição
          </label>
          <input
            type="date"
            id="dataFimFiltro"
            value={dataFimFiltro}
            onChange={(e) => {
              setDataFimFiltro(e.target.value);
              setPaginaAtual(1);
            }}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          onClick={limparFiltros}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition ml-auto"
          title="Limpar filtros"
        >
          Limpar filtros
        </button>
      </div>

      {editaisFiltrados.length === 0 ? (
        <p className="text-gray-600 text-center">
          Nenhum edital disponível para inscrição no período e nome selecionados.
        </p>
      ) : (
        <>
          <ul className="space-y-6">
            {editaisPaginaAtual.map((edital) => (
              <li
                key={edital._id}
                className="border border-gray-300 rounded-lg p-5 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-2xl font-semibold text-blue-700">{edital.nome_bolsa}</h2>
                <p className="mt-2 text-gray-700">{edital.descricao}</p>
                <p className="mt-3 text-gray-600">
                  <strong>Período de Inscrição:</strong>{" "}
                  <span>
                    {formatarData(edital.data_inicio_inscricao)} - {formatarData(edital.data_fim_inscricao)}
                  </span>
                </p>

                <div className="mt-4">
                  <p className="font-semibold text-gray-800 mb-1">Documentos Obrigatórios:</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {edital.documentos_exigidos
                      .filter((doc) => doc.obrigatorio)
                      .map((doc) => (
                        <li key={doc.tipo}>
                          <span className="font-medium">{doc.tipo}</span> - {doc.descricao}
                        </li>
                      ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleInscricao(edital._id)}
                  className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Inscreva-se
                </button>
              </li>
            ))}
          </ul>

          {/* Paginação */}
          <div className="flex justify-center space-x-3 mt-6">
            <button
              onClick={() => handleMudarPagina(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className={`px-4 py-2 rounded border ${
                paginaAtual === 1
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-blue-600 border-blue-600 hover:bg-blue-100"
              }`}
            >
              Anterior
            </button>

            {[...Array(totalPaginas)].map((_, idx) => {
              const num = idx + 1;
              return (
                <button
                  key={num}
                  onClick={() => handleMudarPagina(num)}
                  className={`px-4 py-2 rounded border ${
                    paginaAtual === num
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-blue-600 border-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {num}
                </button>
              );
            })}

            <button
              onClick={() => handleMudarPagina(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              className={`px-4 py-2 rounded border ${
                paginaAtual === totalPaginas
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "text-blue-600 border-blue-600 hover:bg-blue-100"
              }`}
            >
              Próximo
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ListarEditais;
