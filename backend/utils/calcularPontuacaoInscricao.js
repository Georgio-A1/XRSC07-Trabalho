const calcularPontuacaoInscricao = (respostas, perguntas, formulaAvaliacao) => {
  const respostasComPeso = respostas.map(respostaObj => {
    const pergunta = perguntas.find(p =>
      p.id === respostaObj.perguntaId || p._id.toString() === respostaObj.perguntaId
    );
    if (!pergunta) return null;

    let pesoCalculado = 0;

    switch (pergunta.subtipo) {
      case 'sim_nao':
        pesoCalculado = respostaObj.resposta === 'sim' ? pergunta.pesoSim || 0 : pergunta.pesoNao || 0;
        break;

      case 'unica_escolha':
        const unica = pergunta.opcoes.find(op => op._id.toString() === respostaObj.resposta);
        pesoCalculado = unica ? unica.peso || 0 : 0;
        break;

      case 'multipla_escolha':
        pesoCalculado = (respostaObj.resposta || []).reduce((soma, opcaoId) => {
          const op = pergunta.opcoes.find(o => o._id.toString() === opcaoId);
          return soma + (op?.peso || 0);
        }, 0);
        break;

      case 'numero':
      case 'escala_likert':
        const valor = Number(respostaObj.resposta);
        if (pergunta.faixasNota && pergunta.faixasNota.length > 0) {
          const faixa = pergunta.faixasNota.find(f => valor >= f.min && valor <= f.max);
          pesoCalculado = faixa ? faixa.peso : 0;
        } else {
          pesoCalculado = valor || 0.01;
        }
        break;

      case 'texto_curto':
      case 'texto_longo':
        pesoCalculado = respostaObj.pesoCalculado || 0; // ← nesse caso, virá manualmente da avaliação
        break;

      default:
        pesoCalculado = 0.01;
    }

    return {
      identificadorPergunta: pergunta.id,
      tipoResposta: pergunta.subtipo,
      resposta: respostaObj.resposta,
      pesoCalculado
    };
  }).filter(Boolean);

  // Substituição na fórmula
  let formula = formulaAvaliacao;
  const variaveis = formula.match(/\bQ\d+\b/g) || [];
  for (const id of variaveis) {
    const resp = respostasComPeso.find(r => r.identificadorPergunta === id);
    const val = resp ? resp.pesoCalculado : 0.01;
    const regex = new RegExp(`\\b${id}\\b`, 'g');
    formula = formula.replace(regex, `(${val})`);
  }

  let pontuacaoFinal = 0;
  try {
    pontuacaoFinal = eval(formula);
  } catch (err) {
    console.error('Erro ao avaliar fórmula:', err);
    pontuacaoFinal = 0;
  }

  return { respostasComPeso, pontuacaoFinal };
};

module.exports = { calcularPontuacaoInscricao };
