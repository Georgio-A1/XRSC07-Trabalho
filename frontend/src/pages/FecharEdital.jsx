import React, { useEffect, useState } from 'react';

const FecharEdital = () => {
  const [editais, setEditais] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const buscarEditaisEncerrados = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/editais/encerrados-nao-finalizados');
        if (!res.ok) throw new Error('Erro ao buscar editais');
        const data = await res.json();
        setEditais(data);
      } catch (err) {
        console.error(err);
        setMensagem('Erro ao carregar editais.');
      }
    };

    buscarEditaisEncerrados();
  }, []);

  const fecharEdital = async (editalId) => {
    if (!window.confirm('Tem certeza que deseja fechar esse edital? Essa ação é irreversível.')) return;

    setCarregando(true);
    try {
      const res = await fetch(`http://localhost:5000/api/inscricoes/aprovar-automaticamente/${editalId}`, {
        method: 'POST'
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao fechar edital');

      setMensagem(`Edital fechado com sucesso: ${data.aprovadas} aprovados, ${data.reprovadas} reprovados.`);
      
      // Atualiza lista removendo o edital fechado
      setEditais(editais.filter(e => e._id !== editalId));
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao fechar edital: ' + err.message);
    }
    setCarregando(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Fechar Editais</h1>
      {mensagem && <p style={{ color: 'green' }}>{mensagem}</p>}

      {carregando && <p>Processando...</p>}

      {editais.length === 0 && <p>Não há editais encerrados pendentes de fechamento.</p>}

      {editais.map((edital) => (
        <div key={edital._id} style={{ border: '1px solid #ccc', padding: '12px', marginBottom: '12px' }}>
          <h3>{edital.nome_bolsa}</h3>
          <p><strong>Data de Fim das Inscrições:</strong> {new Date(edital.data_fim_inscricoes).toLocaleDateString()}</p>
          <p><strong>Máximo de Aprovados:</strong> {edital.numero_maximo_aprovados ?? 'Não especificado'}</p>
          <button onClick={() => fecharEdital(edital._id)}>Fechar Edital</button>
        </div>
      ))}
    </div>
  );
};

export default FecharEdital;
