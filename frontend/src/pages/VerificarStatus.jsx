import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const VerificarStatusInscricoes = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuarioId, setUsuarioId] = useState(null);

  const [filtroNome, setFiltroNome] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const decoded = jwtDecode(token);
    setUsuarioId(decoded.id);
  }, [navigate]);

  useEffect(() => {
    if (!usuarioId) return;

    const fetchInscricoes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/inscricoes/usuario/${usuarioId}`);
        setInscricoes(response.data);
      } catch (err) {
        console.error('Erro ao buscar inscrições do aluno:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInscricoes();
  }, [usuarioId]);

  const formatarData = (dataISO) => {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.substring(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const corStatus = (status) => {
    switch (status) {
      case 'aprovado':
        return 'text-green-600 font-semibold';
      case 'reprovado':
        return 'text-red-600 font-semibold';
      case 'avaliada':
        return 'text-blue-600 font-semibold';
      case 'pendente':
      default:
        return 'text-yellow-600 font-semibold';
    }
  };

  const limparFiltros = () => {
    setFiltroNome('');
    setFiltroPeriodo('');
    setFiltroStatus('');
  };

  const inscricoesFiltradas = inscricoes.filter((inscricao) => {
    const nomeMatch = inscricao.editalId?.nome_bolsa.toLowerCase().includes(filtroNome.toLowerCase());
    const periodoMatch = filtroPeriodo ? inscricao.editalId?.periodo_letivo === filtroPeriodo : true;
    const statusMatch = filtroStatus ? inscricao.status === filtroStatus : true;
    return nomeMatch && periodoMatch && statusMatch;
  });

  const periodosUnicos = [...new Set(inscricoes.map(i => i.editalId?.periodo_letivo).filter(Boolean))];

  if (loading)
    return <p className="text-center mt-10 text-gray-700">Carregando inscrições...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Minhas Inscrições</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nome da bolsa"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-full"
        />

        <select
          value={filtroPeriodo}
          onChange={(e) => setFiltroPeriodo(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-full"
        >
          <option value="">Todos os períodos</option>
          {periodosUnicos.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded w-full"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="avaliada">Avaliada</option>
          <option value="aprovado">Aprovada</option>
          <option value="rejeitado">Rejeitada</option>
        </select>

        <button
          onClick={limparFiltros}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Limpar filtros
        </button>
      </div>

      {inscricoesFiltradas.length === 0 ? (
        <p className="text-gray-600">Nenhuma inscrição encontrada com os filtros aplicados.</p>
      ) : (
        <ul className="space-y-5">
          {inscricoesFiltradas.map((inscricao) => {
            const isPreliminar = inscricao.status === 'pendente';
            const notaMaxima = inscricao.notaMaximaPossivel;

            return (
              <li
                key={inscricao._id}
                className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm"
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-1">
                  {inscricao.editalId?.nome_bolsa || 'Edital não disponível'}
                </h2>

                <p className="text-gray-700">
                  <strong>Período Letivo:</strong> {inscricao.editalId?.periodo_letivo || '---'}
                </p>

                <p className={`mt-2 ${corStatus(inscricao.status)}`}>
                  <strong>Status da Inscrição:</strong> {inscricao.status}
                </p>

                <p className="mt-1 text-gray-700">
                  <strong>Nota Final:</strong>{' '}
                  {typeof inscricao.pontuacaoFinal === 'number' && typeof notaMaxima === 'number' ? (
                    <>
                      {((inscricao.pontuacaoFinal / notaMaxima) * 10).toFixed(2)} / 10
                      {isPreliminar ? '*' : ''}
                    </>
                  ) : (
                    '---'
                  )}
                </p>

                {inscricao.observacaoAvaliador && (
                  <p className="mt-2 text-gray-700 whitespace-pre-line">
                    <strong>Comentário do Avaliador:</strong><br />
                    {inscricao.observacaoAvaliador}
                  </p>
                )}

                {inscricao.data_avaliacao && (
                  <p className="mt-2 text-gray-600 text-sm">
                    <strong>Data de Avaliação:</strong>{' '}
                    {formatarData(inscricao.data_avaliacao)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default VerificarStatusInscricoes;
