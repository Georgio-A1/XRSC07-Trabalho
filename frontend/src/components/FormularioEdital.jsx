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
    <form
      onSubmit={onSubmit}
      className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-8"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        {modo === 'editar' ? 'Editar Edital' : 'Criar Novo Edital'}
      </h2>

      {/* Campos básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Nome da Bolsa:
          </label>
          <input
            name="nome_bolsa"
            value={formData.nome_bolsa}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Período Letivo:
          </label>
          <input
            name="periodo_letivo"
            value={formData.periodo_letivo}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Data Início:
          </label>
          <input
            type="date"
            name="data_inicio_inscricao"
            value={formData.data_inicio_inscricao}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Data Fim:
          </label>
          <input
            type="date"
            name="data_fim_inscricao"
            value={formData.data_fim_inscricao}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold text-gray-700 mb-1">
            Máximo de Alunos Aprovados:
          </label>
          <input
            type="number"
            name="maximo_alunos_aprovados"
            value={formData.maximo_alunos_aprovados}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold text-gray-700 mb-1">
            Descrição:
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-semibold text-gray-700 mb-1">
            Critérios de Elegibilidade:
          </label>
          <textarea
            name="criterios_elegibilidade"
            value={formData.criterios_elegibilidade}
            onChange={handleChange}
            required
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Perguntas Dinâmicas */}
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Perguntas</h3>
        <div className="space-y-8">
          {formData.perguntas.map((pergunta, index) => (
            <div
              key={index}
              className="p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-50"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-700">ID: {pergunta.id}</p>
                <button
                  type="button"
                  onClick={() => handleRemovePergunta(index)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                  aria-label="Remover Pergunta"
                >
                  Remover
                </button>
              </div>

              <input
                type="text"
                placeholder="Texto da pergunta"
                value={pergunta.texto}
                onChange={(e) => handlePerguntaChange(index, 'texto', e.target.value)}
                required
                className="w-full mb-3 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <select
                value={pergunta.tipo}
                onChange={(e) => handlePerguntaChange(index, 'tipo', e.target.value)}
                required
                className="w-full mb-4 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="texto_curto">Texto Curto</option>
                <option value="texto_longo">Texto Longo</option>
                <option value="sim_nao">Sim/Não</option>
                <option value="numero">Número</option>
                <option value="multipla_escolha">Múltipla Escolha</option>
                <option value="escala_likert">Escala de Likert</option>
                <option value="unica_escolha">Única Escolha</option>
              </select>

              {/* Opções para Única Escolha */}
              {pergunta.tipo === 'unica_escolha' && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Opções:</h4>
                  {pergunta.opcoes?.map((opcao, opcaoIndex) => (
                    <div
                      key={opcaoIndex}
                      className="flex flex-wrap items-center gap-3 mb-2"
                    >
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
                        className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <label className="flex items-center gap-2">
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
                          className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedOpcoes = [...(pergunta.opcoes || [])];
                          updatedOpcoes.splice(opcaoIndex, 1);
                          handlePerguntaChange(index, 'opcoes', updatedOpcoes);
                        }}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remover
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
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Adicionar Opção
                  </button>
                </div>
              )}

              {/* Opções para Sim/Não */}
              {pergunta.tipo === 'sim_nao' && (
                <div className="mb-4 flex flex-wrap gap-6">
                  <label className="flex flex-col">
                    Peso para "Sim":
                    <input
                      type="number"
                      value={pergunta.pesoSim || 0}
                      onChange={(e) =>
                        handlePerguntaChange(index, 'pesoSim', parseFloat(e.target.value))
                      }
                      min="0"
                      step="0.01"
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </label>
                  <label className="flex flex-col">
                    Peso para "Não":
                    <input
                      type="number"
                      value={pergunta.pesoNao || 0}
                      onChange={(e) =>
                        handlePerguntaChange(index, 'pesoNao', parseFloat(e.target.value))
                      }
                      min="0"
                      step="0.01"
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </label>
                </div>
              )}

              {/* Opções para Múltipla Escolha */}
              {pergunta.tipo === 'multipla_escolha' && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Opções:</h4>
                  {pergunta.opcoes?.map((opcao, opcaoIndex) => (
                    <div
                      key={opcaoIndex}
                      className="flex flex-wrap items-center gap-3 mb-2"
                    >
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
                        className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <label className="flex items-center gap-2">
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
                          className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedOpcoes = [...(pergunta.opcoes || [])];
                          updatedOpcoes.splice(opcaoIndex, 1);
                          handlePerguntaChange(index, 'opcoes', updatedOpcoes);
                        }}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remover
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
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Adicionar Opção
                  </button>

                  {/* Soma dos pesos */}
                  <p
                    className={`mt-2 font-semibold ${
                      Math.abs(
                        (pergunta.opcoes || []).reduce(
                          (acc, op) => acc + (parseFloat(op.peso) || 0),
                          0
                        ) - 1
                      ) < 0.01
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    Soma dos pesos:{' '}
                    {(
                      (pergunta.opcoes || []).reduce(
                        (acc, op) => acc + (parseFloat(op.peso) || 0),
                        0
                      )
                    ).toFixed(2)}{' '}
                    (deve ser 1.00)
                  </p>
                </div>
              )}

              {/* Opções para Escala Likert */}
              {pergunta.tipo === 'escala_likert' && (
                <div className="mb-4 flex flex-wrap gap-6">
                  <label className="flex flex-col">
                    Valor Inicial:
                    <input
                      type="number"
                      value={pergunta.valorInicial || ''}
                      onChange={(e) =>
                        handlePerguntaChange(index, 'valorInicial', parseInt(e.target.value, 10))
                      }
                      required
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </label>
                  <label className="flex flex-col">
                    Valor Final:
                    <input
                      type="number"
                      value={pergunta.valorFinal || ''}
                      onChange={(e) =>
                        handlePerguntaChange(index, 'valorFinal', parseInt(e.target.value, 10))
                      }
                      required
                      className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </label>
                </div>
              )}

              {/* Faixas de Nota */}
              {['numero', 'escala_likert'].includes(pergunta.tipo) && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Faixas de Nota:</h4>
                  {pergunta.faixasNota?.map((faixa, faixaIndex) => (
                    <div
                      key={faixaIndex}
                      className="flex flex-wrap items-center gap-3 mb-2"
                    >
                      <label className="flex flex-col">
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
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </label>
                      <label className="flex flex-col">
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
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </label>
                      <label className="flex flex-col">
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
                          className="border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedFaixas = [...(pergunta.faixasNota || [])];
                          updatedFaixas.splice(faixaIndex, 1);
                          handlePerguntaChange(index, 'faixasNota', updatedFaixas);
                        }}
                        className="text-red-600 hover:text-red-800 font-semibold self-end"
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
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Adicionar Faixa de Nota
                  </button>
                </div>
              )}

              <label className="inline-flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={pergunta.obrigatorio}
                  onChange={(e) => handlePerguntaChange(index, 'obrigatorio', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700 font-semibold">Obrigatório</span>
              </label>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddPergunta}
            className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Adicionar Pergunta
          </button>
        </div>
      </section>

      {/* Documentos Exigidos Dinâmicos */}
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Documentos Exigidos</h3>
        <div className="space-y-6">
          {formData.documentos_exigidos.map((documento, index) => (
            <div
              key={index}
              className="p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-50 flex flex-col gap-3"
            >
              <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                <select
                  value={documento.tipo}
                  onChange={(e) => handleDocumentoChange(index, 'tipo', e.target.value)}
                  required
                  className="w-full md:w-60 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Selecione o tipo do documento</option>
                  <option value="CPF">CPF</option>
                  <option value="RG">RG</option>
                  <option value="Comprovante de Renda">Comprovante de Renda</option>
                  <option value="Comprovante de Residência">Comprovante de Residência</option>
                  <option value="Comprovante de Matrícula">Comprovante de Matrícula</option>
                </select>

                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={documento.obrigatorio}
                    onChange={(e) => handleDocumentoChange(index, 'obrigatorio', e.target.checked)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="text-gray-700 font-semibold">Obrigatório</span>
                </label>
              </div>

              <textarea
                placeholder="Descrição do documento"
                value={documento.descricao}
                onChange={(e) => handleDocumentoChange(index, 'descricao', e.target.value)}
                required
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              ></textarea>

              <button
                type="button"
                onClick={() => handleRemoveDocumento(index)}
                className="self-start text-red-600 hover:text-red-800 font-semibold"
              >
                Remover Documento
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddDocumento}
            className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Adicionar Documento
          </button>
        </div>
      </section>

      {/* Fórmula de Avaliação */}
      <section>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">Fórmula de Avaliação</h3>

        <div className="mb-3 flex flex-wrap gap-2">
          {formData.perguntas.map((pergunta, index) => (
            <button
              key={index}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  formula_avaliacao: (prev.formula_avaliacao || '') + pergunta.id,
                }))
              }
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              {pergunta.id}
            </button>
          ))}
          {[' + ', ' - ', ' * ', ' / ', '(', ')'].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  formula_avaliacao: (prev.formula_avaliacao || '') + op,
                }))
              }
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              {op.trim() || op}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={formData.formula_avaliacao || ''}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, formula_avaliacao: e.target.value }))
          }
          placeholder="Ex: Q1 + Q2 * 0.5"
          className="w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </section>

      <button
        type="submit"
        className="w-full mt-8 py-3 bg-blue-700 text-white text-lg font-semibold rounded hover:bg-blue-800 transition-colors"
      >
        {modo === 'editar' ? 'Salvar Alterações' : 'Criar Edital'}
      </button>
    </form>
  );
};

export default FormularioEdital;
