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

  if (loading) return <div>Carregando editais...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      <h2>Excluir Editais</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {editais.map((edital) => (
          <li key={edital._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{edital.nome_bolsa}</h3>
            <p><strong>Período Letivo:</strong> {edital.periodo_letivo}</p>
            <p><strong>Descrição:</strong> {edital.descricao}</p>
            <button
              onClick={() => handleExcluir(edital._id)}
              style={{ color: 'white', backgroundColor: 'red', padding: '0.5rem 1rem', border: 'none' }}
            >
              Excluir Edital
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExcluirEditais;
