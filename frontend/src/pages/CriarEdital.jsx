import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import FormularioEdital from '../components/FormularioEdital';

const CriarEdital = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome_bolsa: '',
    descricao: '',
    criterios_elegibilidade: '',
    periodo_letivo: '',
    data_inicio_inscricao: '',
    data_fim_inscricao: '',
    maximo_alunos_aprovados: '',
    perguntas: [],
    documentos_exigidos: [],
    formula_avaliacao: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    const { tipo_usuario } = jwtDecode(token);
    if (tipo_usuario !== 'administrador') return navigate('/dashboard');
  }, [navigate]);

  // Funções para manipular perguntas e documentos
  const handleAddPergunta = () => {
    const novaPerguntaId = `Q${formData.perguntas.length + 1}`;
    setFormData((prevState) => ({
      ...prevState,
      perguntas: [
        ...prevState.perguntas,
        {
          id: novaPerguntaId,
          texto: '',
          tipo: 'texto_curto',
          obrigatorio: false,
          faixas: [], // Novo campo para faixas de pontuação
        },
      ],
    }));
  };

  const handleRemovePergunta = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      perguntas: prevState.perguntas.filter((_, i) => i !== index),
    }));
  };

  const handlePerguntaChange = (index, field, value) => {
    const updatedPerguntas = [...formData.perguntas];
    if (field === 'opcoes') {
      // Inicializar opcoes se for undefined
      if (!updatedPerguntas[index].opcoes) {
        updatedPerguntas[index].opcoes = [];
      }
    }
    updatedPerguntas[index][field] = value;
    setFormData({ ...formData, perguntas: updatedPerguntas });
  };

  const handleAddDocumento = () => {
    setFormData((prevState) => ({
      ...prevState,
      documentos_exigidos: [...prevState.documentos_exigidos, { tipo: '', descricao: '', obrigatorio: false }],
    }));
  };

  const handleRemoveDocumento = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      documentos_exigidos: prevState.documentos_exigidos.filter((_, i) => i !== index),
    }));
  };

  const handleDocumentoChange = (index, field, value) => {
    const updatedDocumentos = [...formData.documentos_exigidos];
    updatedDocumentos[index][field] = value;
    setFormData({ ...formData, documentos_exigidos: updatedDocumentos });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validações de datas já ok

    const token = localStorage.getItem('token');
    if (!token) return alert('Faça login novamente.');

    const inicio = new Date(formData.data_inicio_inscricao);
    const fim = new Date(formData.data_fim_inscricao);

    if (fim <= inicio) {
      alert('A data de fim da inscrição deve ser posterior à data de início.');
      return;
    }

    // Mapeia tipos para o backend
    const backendTypeMap = {
      texto_curto: 'texto',
      texto_longo: 'texto',
      sim_nao: 'opcao',
      numero: 'numerico',
      unica_escolha: 'opcao',
      multipla_escolha: 'multi-opcao',
      escala_likert: 'numerico'
    };

    // Validação extra
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
      formula_avaliacao: formData.formula_avaliacao,
      perguntas: formData.perguntas.map(pergunta => ({
        id: pergunta.id, // novo campo
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

    const res = await fetch('http://localhost:5000/api/editais/cadastrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(dataToSubmit)
    });

    if (res.ok) {
      alert('Edital criado com sucesso!');
      navigate('/dashboard');
    } else {
      const err = await res.json();
      alert(err.message || 'Erro ao criar edital.');
    }
  };

  return (
    <FormularioEdital
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      modo="criar"
    />
  );
};

export default CriarEdital;
