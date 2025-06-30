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

  if (loading) return <div>Carregando editais...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Editar Editais</h1>
      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>Nome da Bolsa</th>
            <th>Descrição</th>
            <th>Período Letivo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {editais.map((edital) => (
            <tr key={edital._id}>
              <td>{edital.nome_bolsa}</td>
              <td>{edital.descricao}</td>
              <td>{edital.periodo_letivo}</td>
              <td>
                <Link to={`/editar-edital/${edital._id}`}>
                  <button>Editar</button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaEditais;
