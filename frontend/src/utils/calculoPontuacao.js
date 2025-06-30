// utils/calculoPontuacao.js
function calcularPontuacaoMaxima(perguntas) {
  let total = 0;
  perguntas.forEach(pergunta => {
    if (pergunta.faixasNota && pergunta.faixasNota.length > 0) {
      const maxPeso = Math.max(...pergunta.faixasNota.map(f => f.peso));
      total += maxPeso;
    } else if (pergunta.opcoes && pergunta.opcoes.length > 0) {
      const maxPeso = Math.max(...pergunta.opcoes.map(o => o.peso || 0));
      total += maxPeso;
    } else if (pergunta.tipo === 'sim_nao') {
      const maxPeso = Math.max(pergunta.pesoSim || 0, pergunta.pesoNao || 0);
      total += maxPeso;
    } else {
      total += 1; // peso padrão se não definido
    }
  });
  return total;
}

module.exports = calcularPontuacaoMaxima;