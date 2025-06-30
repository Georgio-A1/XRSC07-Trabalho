// src/components/FormularioEdital.jsx
import React from 'react';

const FormularioEdital = ({ modo, formData, setFormData, onSubmit }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePerguntaChange = (index, field, value) => {
        const updated = [...formData.perguntas];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, perguntas: updated }));
    };

    const handleDocumentoChange = (index, field, value) => {
        const updated = [...formData.documentos_exigidos];
        updated[index][field] = value;
        setFormData((prev) => ({ ...prev, documentos_exigidos: updated }));
    };

    const handleAddPergunta = () => {
        const novaPerguntaId = `Q${formData.perguntas.length + 1}`;
        setFormData((prev) => ({
            ...prev,
            perguntas: [
                ...prev.perguntas,
                {
                    id: novaPerguntaId,
                    texto: '',
                    tipo: 'texto_curto',
                    obrigatorio: false,
                    opcoes: [],
                    faixasNota: [],
                },
            ],
        }));
    };

    const handleRemovePergunta = (index) => {
        setFormData((prev) => ({
            ...prev,
            perguntas: prev.perguntas.filter((_, i) => i !== index),
        }));
    };

    const handleAddDocumento = () => {
        setFormData((prev) => ({
            ...prev,
            documentos_exigidos: [
                ...prev.documentos_exigidos,
                { tipo: '', descricao: '', obrigatorio: false },
            ],
        }));
    };

    const handleRemoveDocumento = (index) => {
        setFormData((prev) => ({
            ...prev,
            documentos_exigidos: prev.documentos_exigidos.filter((_, i) => i !== index),
        }));
    };

    return (
        <form onSubmit={onSubmit}>
            <h2>{modo === 'editar' ? 'Editar Edital' : 'Criar Novo Edital'}</h2>

            {/* Campos básicos */}
            <div>
                <label>Nome da Bolsa:</label>
                <input name="nome_bolsa" value={formData.nome_bolsa} onChange={handleChange} required />
            </div>
            <div>
                <label>Descrição:</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleChange} required />
            </div>
            <div>
                <label>Critérios de Elegibilidade:</label>
                <textarea name="criterios_elegibilidade" value={formData.criterios_elegibilidade} onChange={handleChange} required />
            </div>
            <div>
                <label>Período Letivo:</label>
                <input name="periodo_letivo" value={formData.periodo_letivo} onChange={handleChange} required />
            </div>
            <div>
                <label>Data Início:</label>
                <input type="date" name="data_inicio_inscricao" value={formData.data_inicio_inscricao} onChange={handleChange} required />
            </div>
            <div>
                <label>Data Fim:</label>
                <input type="date" name="data_fim_inscricao" value={formData.data_fim_inscricao} onChange={handleChange} required />
            </div>
            <div>
                <label>Máximo de Alunos Aprovados:</label>
                <input type="number" name="maximo_alunos_aprovados" value={formData.maximo_alunos_aprovados} onChange={handleChange} />
            </div>

            {/* Perguntas Dinâmicas */}
            <div>
                <h3>Perguntas</h3>
                {formData.perguntas.map((pergunta, index) => (
                    <div key={index}>
                        <p><strong>ID:</strong> {pergunta.id}</p>
                        <input
                            type="text"
                            placeholder="Texto da pergunta"
                            value={pergunta.texto}
                            onChange={(e) => handlePerguntaChange(index, 'texto', e.target.value)}
                            required
                        />
                        <select
                            value={pergunta.tipo}
                            onChange={(e) => handlePerguntaChange(index, 'tipo', e.target.value)}
                            required
                        >
                            <option value="texto_curto">Texto Curto</option>
                            <option value="texto_longo">Texto Longo</option>
                            <option value="sim_nao">Sim/Não</option>
                            <option value="numero">Número</option>
                            <option value="multipla_escolha">Múltipla Escolha</option>
                            <option value="escala_likert">Escala de Likert</option>
                            <option value="unica_escolha">Única Escolha</option> {/* Nova opção */}
                        </select>

                        {pergunta.tipo === 'unica_escolha' && (
                            <div>
                                <h4>Opções:</h4>
                                {pergunta.opcoes?.map((opcao, opcaoIndex) => (
                                    <div key={opcaoIndex}>
                                        <input
                                            type="text"
                                            placeholder={`Opção ${opcaoIndex + 1}`}
                                            value={opcao.texto || ''}
                                            onChange={(e) => {
                                                const updatedOpcoes = [...(pergunta.opcoes || [])];
                                                updatedOpcoes[opcaoIndex] = {
                                                    ...updatedOpcoes[opcaoIndex],
                                                    texto: e.target.value,
                                                };
                                                handlePerguntaChange(index, 'opcoes', updatedOpcoes);
                                            }}
                                            required
                                        />
                                        <label>
                                            Peso:
                                            <input
                                                type="number"
                                                value={opcao.peso || 0}
                                                onChange={(e) => {
                                                    const updatedOpcoes = [...(pergunta.opcoes || [])];
                                                    updatedOpcoes[opcaoIndex] = {
                                                        ...updatedOpcoes[opcaoIndex],
                                                        peso: parseFloat(e.target.value),
                                                    };
                                                    handlePerguntaChange(index, 'opcoes', updatedOpcoes);
                                                }}
                                                min="0"
                                                step="0.01"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedOpcoes = [...(pergunta.opcoes || [])];
                                                updatedOpcoes.splice(opcaoIndex, 1);
                                                handlePerguntaChange(index, 'opcoes', updatedOpcoes);
                                            }}
                                        >
                                            Remover Opção
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        handlePerguntaChange(index, 'opcoes', [
                                            ...(pergunta.opcoes || []),
                                            { texto: '', peso: 0 },
                                        ])
                                    }
                                >
                                    Adicionar Opção
                                </button>
                            </div>
                        )}

                        {pergunta.tipo === 'sim_nao' && (
                            <div>
                                <label>
                                    Peso para "Sim":
                                    <input
                                        type="number"
                                        value={pergunta.pesoSim || 0}
                                        onChange={(e) =>
                                            handlePerguntaChange(index, 'pesoSim', parseFloat(e.target.value))
                                        }
                                        min="0"
                                        step="0.01"
                                    />
                                </label>
                                <label>
                                    Peso para "Não":
                                    <input
                                        type="number"
                                        value={pergunta.pesoNao || 0}
                                        onChange={(e) =>
                                            handlePerguntaChange(index, 'pesoNao', parseFloat(e.target.value))
                                        }
                                        min="0"
                                        step="0.01"
                                    />
                                </label>
                            </div>
                        )}

                        {/* Configuração para Múltipla Escolha */}
                        {pergunta.tipo === 'multipla_escolha' && (
                            <div>
                                <h4>Opções:</h4>
                                {pergunta.opcoes?.map((opcao, opcaoIndex) => (
                                    <div key={opcaoIndex}>
                                        <input
                                            type="text"
                                            placeholder={`Opção ${opcaoIndex + 1}`}
                                            value={opcao.texto || ''}
                                            onChange={(e) => {
                                                const updatedOpcoes = [...(pergunta.opcoes || [])];
                                                updatedOpcoes[opcaoIndex] = {
                                                    ...updatedOpcoes[opcaoIndex],
                                                    texto: e.target.value,
                                                };
                                                handlePerguntaChange(index, 'opcoes', updatedOpcoes);
                                            }}
                                            required
                                        />
                                        <label>
                                            Peso:
                                            <input
                                                type="number"
                                                value={opcao.peso || 0}
                                                onChange={(e) => {
                                                    const updatedOpcoes = [...(pergunta.opcoes || [])];
                                                    updatedOpcoes[opcaoIndex] = {
                                                        ...updatedOpcoes[opcaoIndex],
                                                        peso: parseFloat(e.target.value),
                                                    };
                                                    handlePerguntaChange(index, 'opcoes', updatedOpcoes);
                                                }}
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                required
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedOpcoes = [...(pergunta.opcoes || [])];
                                                updatedOpcoes.splice(opcaoIndex, 1);
                                                handlePerguntaChange(index, 'opcoes', updatedOpcoes);
                                            }}
                                        >
                                            Remover Opção
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handlePerguntaChange(index, 'opcoes', [
                                            ...(pergunta.opcoes || []),
                                            { texto: '', peso: 0 },
                                        ])
                                    }
                                >
                                    Adicionar Opção
                                </button>

                                {/* Soma dos pesos */}
                                <p style={{
                                    color: (() => {
                                        const soma = (pergunta.opcoes || []).reduce((acc, op) => acc + (parseFloat(op.peso) || 0), 0);
                                        return Math.abs(soma - 1) < 0.01 ? 'green' : 'red';
                                    })()
                                }}>
                                    Soma dos pesos: {(
                                        (pergunta.opcoes || []).reduce((acc, op) => acc + (parseFloat(op.peso) || 0), 0)
                                    ).toFixed(2)} (deve ser 1.00)
                                </p>
                            </div>
                        )}

                        {/* Configuração para Escala de Likert */}
                        {pergunta.tipo === 'escala_likert' && (
                            <div>
                                <label>
                                    Valor Inicial:
                                    <input
                                        type="number"
                                        value={pergunta.valorInicial || ''}
                                        onChange={(e) =>
                                            handlePerguntaChange(index, 'valorInicial', parseInt(e.target.value, 10))
                                        }
                                        required
                                    />
                                </label>
                                <label>
                                    Valor Final:
                                    <input
                                        type="number"
                                        value={pergunta.valorFinal || ''}
                                        onChange={(e) =>
                                            handlePerguntaChange(index, 'valorFinal', parseInt(e.target.value, 10))
                                        }
                                        required
                                    />
                                </label>
                            </div>
                        )}

                        {/* Configuração de Faixas de Nota */}
                        {/* Configuração de Faixas de Nota (somente para número e Likert) */}
                        {['numero', 'escala_likert'].includes(pergunta.tipo) && (
                            <div>
                                <h4>Faixas de Nota:</h4>
                                {pergunta.faixasNota?.map((faixa, faixaIndex) => (
                                    <div key={faixaIndex}>
                                        <label>
                                            Valor Mínimo:
                                            <input
                                                type="number"
                                                value={faixa.min || ''}
                                                onChange={(e) => {
                                                    const updatedFaixas = [...(pergunta.faixasNota || [])];
                                                    updatedFaixas[faixaIndex] = {
                                                        ...updatedFaixas[faixaIndex],
                                                        min: parseFloat(e.target.value),
                                                    };
                                                    handlePerguntaChange(index, 'faixasNota', updatedFaixas);
                                                }}
                                                required
                                            />
                                        </label>
                                        <label>
                                            Valor Máximo:
                                            <input
                                                type="number"
                                                value={faixa.max || ''}
                                                onChange={(e) => {
                                                    const updatedFaixas = [...(pergunta.faixasNota || [])];
                                                    updatedFaixas[faixaIndex] = {
                                                        ...updatedFaixas[faixaIndex],
                                                        max: parseFloat(e.target.value),
                                                    };
                                                    handlePerguntaChange(index, 'faixasNota', updatedFaixas);
                                                }}
                                                required
                                            />
                                        </label>
                                        <label>
                                            Peso:
                                            <input
                                                type="number"
                                                value={faixa.peso || ''}
                                                onChange={(e) => {
                                                    const updatedFaixas = [...(pergunta.faixasNota || [])];
                                                    updatedFaixas[faixaIndex] = {
                                                        ...updatedFaixas[faixaIndex],
                                                        peso: parseFloat(e.target.value),
                                                    };
                                                    handlePerguntaChange(index, 'faixasNota', updatedFaixas);
                                                }}
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                required
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedFaixas = [...(pergunta.faixasNota || [])];
                                                updatedFaixas.splice(faixaIndex, 1);
                                                handlePerguntaChange(index, 'faixasNota', updatedFaixas);
                                            }}
                                        >
                                            Remover Faixa
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() =>
                                        handlePerguntaChange(index, 'faixasNota', [
                                            ...(pergunta.faixasNota || []),
                                            { min: '', max: '', peso: 0 },
                                        ])
                                    }
                                >
                                    Adicionar Faixa de Nota
                                </button>
                            </div>
                        )}


                        <label>
                            <input
                                type="checkbox"
                                checked={pergunta.obrigatorio}
                                onChange={(e) => handlePerguntaChange(index, 'obrigatorio', e.target.checked)}
                            />
                            Obrigatório
                        </label>
                        <button type="button" onClick={() => handleRemovePergunta(index)}>Remover</button>
                    </div>
                ))}
                <button type="button" onClick={handleAddPergunta}>Adicionar Pergunta</button>

            </div>
            {/* Documentos Exigidos Dinâmicos */}
            <div>
                <h3>Documentos Exigidos</h3>
                {formData.documentos_exigidos.map((documento, index) => (
                    <div key={index}>
                        <select
                            value={documento.tipo}
                            onChange={(e) => handleDocumentoChange(index, 'tipo', e.target.value)}
                            required
                        >
                            <option value="">Selecione o tipo do documento</option>
                            <option value="CPF">CPF</option>
                            <option value="RG">RG</option>
                            <option value="Comprovante de Renda">Comprovante de Renda</option>
                            <option value="Comprovante de Residência">Comprovante de Residência</option>
                            <option value="Comprovante de Matrícula">Comprovante de Matrícula</option>
                        </select>
                        <textarea
                            placeholder="Descrição do documento"
                            value={documento.descricao}
                            onChange={(e) => handleDocumentoChange(index, 'descricao', e.target.value)}
                            required
                        ></textarea>
                        <label>
                            <input
                                type="checkbox"
                                checked={documento.obrigatorio}
                                onChange={(e) => handleDocumentoChange(index, 'obrigatorio', e.target.checked)}
                            />
                            Obrigatório
                        </label>
                        <button type="button" onClick={() => handleRemoveDocumento(index)}>Remover</button>
                    </div>
                ))}
                <button type="button" onClick={handleAddDocumento}>Adicionar Documento</button>
            </div>

            <div>
                <h3>Fórmula de Avaliação</h3>
                <div style={{ marginBottom: '8px' }}>
                    {formData.perguntas.map((pergunta, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, formula_avaliacao: (prev.formula_avaliacao || '') + pergunta.id }))}
                        >
                            {pergunta.id}
                        </button>
                    ))}
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, formula_avaliacao: (prev.formula_avaliacao || '') + ' + ' }))}>+</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, formula_avaliacao: (prev.formula_avaliacao || '') + ' - ' }))}>-</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, formula_avaliacao: (prev.formula_avaliacao || '') + ' * ' }))}>*</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, formula_avaliacao: (prev.formula_avaliacao || '') + ' / ' }))}>/</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, formula_avaliacao: (prev.formula_avaliacao || '') + '(' }))}>(</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, formula_avaliacao: (prev.formula_avaliacao || '') + ')' }))}>)</button>
                </div>
                <input
                    type="text"
                    value={formData.formula_avaliacao || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, formula_avaliacao: e.target.value }))}
                    placeholder="Ex: Q1 + Q2 * 0.5"
                    style={{ width: '100%' }}
                />
            </div>

            <button type="submit">{modo === 'editar' ? 'Salvar Alterações' : 'Criar Edital'}</button>
        </form>
    );
};

export default FormularioEdital;
