// utils/calculoPontuacao.js

function extrairVariaveisDaFormula(formula) {
    const regex = /\bQ\d+\b/g;
    return [...new Set(formula.match(regex))];
}

function obterPesoMaximoPergunta(pergunta) {
    const tipo = pergunta.tipo;
    switch (tipo) {
        case 'sim_nao':
            return Math.max(pergunta.pesoSim || 0, pergunta.pesoNao || 0);

        case 'unica_escolha':
            // única escolha: máximo peso entre opções (só pode escolher uma)
            return (pergunta.opcoes || []).reduce((max, op) => Math.max(max, op.peso || 0), 0);

        case 'multipla_escolha':
            // múltipla escolha: soma dos pesos de todas as opções (pode escolher todas)
            return (pergunta.opcoes || []).reduce((sum, op) => sum + (op.peso || 0), 0);

        case 'numero':
        case 'escala_likert':
            return (pergunta.faixasNota || []).reduce((max, faixa) => Math.max(max, faixa.peso || 0), 0);

        default:
            return 1;
    }
}

function obterPesoMinimoPergunta(pergunta) {
    const tipo = pergunta.tipo;
    switch (tipo) {
        case 'sim_nao':
            return Math.min(pergunta.pesoSim || 0, pergunta.pesoNao || 0);

        case 'unica_escolha':
        case 'multipla_escolha':
            return (pergunta.opcoes || []).reduce((min, op) => Math.min(min, op.peso || 0), Infinity);

        case 'numero':
        case 'escala_likert':
            return (pergunta.faixasNota || []).reduce((min, faixa) => Math.min(min, faixa.peso || 0), Infinity);

        default:
            return 0;  // Para textos no mínimo 0, ajustaremos abaixo
    }
}

function identificarOperacaoSobreVariavel(formula, variavel) {
    // Regex para encontrar ocorrências da variável na fórmula
    // e verificar o caractere antes e depois dela para inferir contexto

    // Exemplo: "Q5 * Q6 / 2 - Q7"
    // Se variavel = Q6, verificar se está antes ou depois do "/"

    const regex = new RegExp(`([\\w\\.]+|\\d+|\\S)?\\s*${variavel}\\s*([\\w\\.]+|\\d+|\\S)?`, 'g');

    let match;
    while ((match = regex.exec(formula)) !== null) {
        const antes = match[1];
        const depois = match[2];

        // Verificar se variável está no denominador de uma divisão:
        // Se o caractere antes da variável for '/' → está no denominador, ex: "/ Q6"
        if (antes === '/') return 'divisao_denominador';

        // Se o caractere depois da variável for '/' → está no numerador de uma divisão, ex: "Q6 /"
        if (depois === '/') return 'divisao_numerador';

        // Se o caractere antes da variável for '-' → subtração
        if (antes === '-') return 'subtracao';
    }

    // Se não detectou nada, assume soma ou multiplicação (valor máximo)
    return 'soma';
}


function calcularNotaMaximaPossivel(edital) {
    const formula = edital.formula_avaliacao || '';
    const variaveis = extrairVariaveisDaFormula(formula);

    const pesosParaFormula = {};

    //console.log('--- Início do cálculo da nota máxima ---');
    //console.log('Fórmula:', formula);
    //console.log('Variáveis encontradas:', variaveis);

    for (const pergunta of edital.perguntas) {
        const id = pergunta.id;
        if (!variaveis.includes(id)) continue;

        const operacao = identificarOperacaoSobreVariavel(formula, id);

        let peso;

        if (operacao === 'subtracao') {
            if (pergunta.tipo.startsWith('texto')) {
                peso = 0;
            } else {
                peso = obterPesoMinimoPergunta(pergunta);
            }
        } else if (operacao === 'divisao') {
            if (pergunta.tipo.startsWith('texto')) {
                peso = 0.01;
            } else {
                peso = obterPesoMinimoPergunta(pergunta);
            }
        } else {
            if (pergunta.tipo.startsWith('texto')) {
                peso = 1;
            } else {
                peso = obterPesoMaximoPergunta(pergunta);
            }
        }

        pesosParaFormula[id] = peso;
        //console.log(`Peso para ${id} (operação: ${operacao}, tipo: ${pergunta.tipo}): ${peso}`);
    }

    const notaMaxima = avaliarFormulaComPesos(formula, pesosParaFormula);
    //console.log('Nota máxima calculada:', notaMaxima);

    return {
        nota_maxima: notaMaxima,
    };
}

function avaliarFormulaComPesos(formula, pesosPorPergunta) {
    const expressao = formula.replace(/\bQ\d+\b/g, (match) => {
        return pesosPorPergunta[match] ?? 0;
    });

    try {
        // eslint-disable-next-line no-eval
        return eval(expressao);
    } catch (error) {
        console.error('Erro ao avaliar fórmula:', error);
        return null;
    }
}

module.exports = {
    calcularNotaMaximaPossivel
};
