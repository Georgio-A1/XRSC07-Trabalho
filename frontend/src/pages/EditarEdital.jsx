import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import FormularioEdital from '../components/FormularioEdital';

const EditarEdital = () => {
  const { id } = useParams(); // ID do edital
  const navigate = useNavigate();

  // Função utilitária para formatar data no formato yyyy-MM-dd
  const formatarData = (isoString) => isoString?.substring(0, 10);


  const [formData, setFormData] = useState(null); // começa como null até carregar

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const { tipo_usuario } = jwtDecode(token);
    if (tipo_usuario !== 'administrador') return navigate('/dashboard');

    const fetchEdital = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/editais/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Erro ao carregar edital');
        const data = await res.json();

        // Formatar datas
        data.data_inicio_inscricao = formatarData(data.data_inicio_inscricao);
        data.data_fim_inscricao = formatarData(data.data_fim_inscricao);

        // Reconstruir perguntas com os campos usados no frontend
        const perguntasReconstruidas = data.perguntas.map((p) => {
          let subtipo = p.subtipo || 'texto_curto'; // fallback caso não tenha
          let perguntaFrontend = {
            id: p.id,
            texto: p.texto,
            tipo: subtipo, // usado no frontend
            obrigatorio: p.obrigatorio || false,
            opcoes: p.opcoes || [],
            pesoSim: p.pesoSim || 0,
            pesoNao: p.pesoNao || 0,
            valorInicial: p.valorInicial || '',
            valorFinal: p.valorFinal || '',
            faixasNota: p.faixasNota || [],
          };
          return perguntaFrontend;
        });

        setFormData({
          ...data,
          perguntas: perguntasReconstruidas,
          documentos_exigidos: data.documentos_exigidos || [],
          formula_avaliacao: data.formula_avaliacao || '',
        });
      } catch (err) {
        alert(err.message || 'Erro ao carregar edital');
        navigate('/dashboard');
      }
    };

    fetchEdital();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('Faça login novamente.');

    const inicio = new Date(formData.data_inicio_inscricao);
    const fim = new Date(formData.data_fim_inscricao);

    if (fim <= inicio) {
      alert('A data de fim da inscrição deve ser posterior à de início.');
      return;
    }

    const backendTypeMap = {
      texto_curto: 'texto',
      texto_longo: 'texto',
      sim_nao: 'opcao',
      numero: 'numerico',
      unica_escolha: 'opcao',
      multipla_escolha: 'multi-opcao',
      escala_likert: 'numerico'
    };

    const algumaMultiplaInvalida = formData.perguntas.some(pergunta =>
      pergunta.tipo === 'multipla_escolha' &&
      Math.abs((pergunta.opcoes || []).reduce((s, o) => s + (parseFloat(o.peso) || 0), 0) - 1) > 0.01
    );

    const algumPesoInvalido = formData.perguntas.some(pergunta =>
      (pergunta.opcoes || []).some(op => op.peso < 0 || op.peso > 1) ||
      (pergunta.faixasNota || []).some(faixa => faixa.peso < 0 || faixa.peso > 1) ||
      (['sim_nao', 'unica_escolha'].includes(pergunta.tipo) &&
        ((pergunta.pesoSim && (pergunta.pesoSim < 0 || pergunta.pesoSim > 1)) ||
          (pergunta.pesoNao && (pergunta.pesoNao < 0 || pergunta.pesoNao > 1))))
    );

    if (algumaMultiplaInvalida) {
      alert("Perguntas de múltipla escolha devem ter a soma dos pesos igual a 1.");
      return;
    }

    if (algumPesoInvalido) {
      alert("Todos os pesos devem estar entre 0 e 1.");
      return;
    }

    const dataToSubmit = {
      ...formData,
      perguntas: formData.perguntas.map(pergunta => ({
        id: pergunta.id,
        texto: pergunta.texto,
        tipo: backendTypeMap[pergunta.tipo],
        subtipo: pergunta.tipo,
        obrigatorio: pergunta.obrigatorio,
        opcoes: pergunta.opcoes,
        pesoSim: pergunta.pesoSim,
        pesoNao: pergunta.pesoNao,
        valorInicial: pergunta.valorInicial,
        valorFinal: pergunta.valorFinal,
        faixasNota: pergunta.faixasNota
      })),
      documentos_exigidos: formData.documentos_exigidos.map(doc => ({
        tipo: doc.tipo,
        descricao: doc.descricao,
        obrigatorio: doc.obrigatorio
      }))
    };

    const res = await fetch(`http://localhost:5000/api/editais/editar/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dataToSubmit)
    });

    if (res.ok) {
      alert('Edital atualizado com sucesso!');
      navigate('/dashboard');
    } else {
      const err = await res.json();
      alert(err.message || 'Erro ao atualizar edital.');
    }
  };

  if (!formData) return <div>Carregando dados do edital...</div>;

  return (
    <FormularioEdital
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      modo="editar"
    />
  );
};

export default EditarEdital;
