import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ListarEditais = () => {
  const [editais, setEditais] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  function formatarData(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.substring(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }

  useEffect(() => {
    const fetchEditais = async () => {
      try {
        // Obter o token do localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token não encontrado');
          return;
        }

        // Decodificar o token para obter o usuarioId
        const decodedToken = jwtDecode(token);
        const usuarioId = decodedToken.id;
        console.log(usuarioId)

        // Enviar o usuarioId como parte dos headers
        const response = await axios.get('http://localhost:5000/api/inscricoes/disponiveis', {
          headers: {
            'Authorization': `Bearer ${token}`, // Enviar o token para o backend
            'usuarioId': usuarioId, // Enviar o usuarioId se necessário
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

  const handleInscricao = (id) => {
    navigate(`/realizar-inscricao/${id}`);
  };

  if (loading) {
    return <p>Carregando...</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Editais Disponíveis</h1>

      {editais.length === 0 ? (
        <p className="text-gray-600 text-center">Nenhum edital disponível para inscrição no momento.</p>
      ) : (
        <ul className="space-y-6">
          {editais.map((edital) => (
            <li key={edital._id} className="border border-gray-300 rounded-lg p-5 shadow-sm hover:shadow-md transition">
              <h2 className="text-2xl font-semibold text-blue-700">{edital.nome_bolsa}</h2>
              <p className="mt-2 text-gray-700">{edital.descricao}</p>
              <p className="mt-3 text-gray-600">
                <strong>Período de Inscrição:</strong>{" "}
                <span>{formatarData(edital.data_inicio_inscricao)} - {formatarData(edital.data_fim_inscricao)}</span>
              </p>

              <div className="mt-4">
                <p className="font-semibold text-gray-800 mb-1">Documentos Obrigatórios:</p>
                <ul className="list-disc list-inside text-gray-700">
                  {edital.documentos_exigidos
                    .filter(doc => doc.obrigatorio)
                    .map(doc => (
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
      )}
    </div>
  );
};

export default ListarEditais;
