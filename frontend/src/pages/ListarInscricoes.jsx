import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ListarInscricoes = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroMatricula, setFiltroMatricula] = useState('');
  const [filtroEdital, setFiltroEdital] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInscricoes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/avaliacao/pendentes');
        setInscricoes(response.data || []);
      } catch (error) {
        console.error('Erro ao carregar inscrições:', error);
        setErro('Erro ao carregar inscrições');
      } finally {
        setLoading(false);
      }
    };

    fetchInscricoes();
  }, []);

  const handleAvaliar = (inscricaoId) => {
    navigate(`/avaliar-inscricao/${inscricaoId}`);
  };

  const inscricoesFiltradas = inscricoes.filter((inscricao) => {
    const matriculaMatch = inscricao.usuarioId?.numero_matricula
      ?.toLowerCase()
      .includes(filtroMatricula.toLowerCase());
    const editalMatch =
      filtroEdital === '' || inscricao.editalId?._id === filtroEdital;
    return matriculaMatch && editalMatch;
  });

  const inscricoesAgrupadas = inscricoesFiltradas.reduce((acc, insc) => {
    const editalId = insc.editalId?._id || 'sem-edital';
    if (!acc[editalId]) acc[editalId] = { edital: insc.editalId, inscricoes: [] };
    acc[editalId].inscricoes.push(insc);
    return acc;
  }, {});

  if (loading) return <p>Carregando inscrições...</p>;
  if (erro) return <p style={{ color: 'red' }}>{erro}</p>;
  if (inscricoes.length === 0) return <p>Não há inscrições pendentes para avaliar.</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Lista de Inscrições Pendentes</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Filtrar por matrícula"
          value={filtroMatricula}
          onChange={(e) => setFiltroMatricula(e.target.value)}
          className="px-4 py-2 border rounded-md w-full md:w-1/2"
        />

        <select
          value={filtroEdital}
          onChange={(e) => setFiltroEdital(e.target.value)}
          className="px-4 py-2 border rounded-md w-full md:w-1/2"
        >
          <option value="">Todos os editais</option>
          {[...new Map(inscricoes.map((i) => [i.editalId?._id, i.editalId]))].map(
            ([id, edital]) => (
              <option key={id} value={id}>
                {edital?.nome_bolsa || 'Sem nome'}
              </option>
            )
          )}
        </select>
      </div>

      {Object.entries(inscricoesAgrupadas).map(([editalId, grupo]) => (
        <div key={editalId} className="mb-10">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            {grupo.edital?.nome_bolsa || 'Edital não disponível'}
          </h2>
          <ul className="space-y-4">
            {grupo.inscricoes
              .sort((a, b) => (b.pontuacaoFinal || 0) - (a.pontuacaoFinal || 0))
              .map((inscricao) => (
                <li
                  key={inscricao._id}
                  className="border border-gray-300 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <p className="text-sm text-gray-700">
                    <strong>Status:</strong> {inscricao.status || 'Sem status'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Candidato:</strong>{' '}
                    {inscricao.usuarioId
                      ? `${inscricao.usuarioId.nome_completo || 'Nome não disponível'} (Matrícula: ${inscricao.usuarioId.numero_matricula || 'Não informado'})`
                      : 'Nome não disponível'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Data da Inscrição:</strong>{' '}
                    {inscricao.createdAt
                      ? new Date(inscricao.createdAt).toLocaleDateString()
                      : 'Não informada'}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Nota:</strong>{' '}
                    {inscricao.pontuacaoFinal != null && inscricao.notaMaximaPossivel ? (
                      <>
                        {((inscricao.pontuacaoFinal / inscricao.notaMaximaPossivel) * 10).toFixed(2)} / 10
                        {inscricao.status === 'pendente' ? '*' : ''}
                      </>
                    ) : (
                      '—'
                    )}
                  </p>
                  <button
                    onClick={() => handleAvaliar(inscricao._id)}
                    disabled={inscricao.status !== 'pendente'}
                    className={`mt-3 inline-block px-4 py-2 rounded ${inscricao.status === 'pendente'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      } transition-colors`}
                  >
                    Avaliar agora
                  </button>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ListarInscricoes;
