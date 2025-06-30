import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const RealizarInscricao = () => {
  const { id } = useParams(); // Obtém o ID do edital da URL
  const [edital, setEdital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState({});
  const [documentosStatus, setDocumentosStatus] = useState([]); // Estado para status dos documentos
  const navigate = useNavigate();

  const handleRespostaChange = (perguntaId, valor) => {
    console.log("pergunta", perguntaId)
    console.log("valor", valor)
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: valor, // Aqui garantimos que o valor completo será atualizado
    }));
  };

  const handleImport = async (obrigatorios = true) => {
    try {
      const documentosFiltrados = edital.documentos_exigidos
        .filter((doc) => !obrigatorios || doc.obrigatorio === true)
        .map((doc) => doc.tipo); // Filtra os tipos de documentos

      console.log("Documentos filtrados para importação:", documentosFiltrados);

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Erro: Usuário não está logado.");
        return;
      }

      const decodedToken = jwtDecode(token);
      const usuarioId = decodedToken.id;

      console.log("ID do usuário decodificado:", usuarioId);

      if (!usuarioId) {
        alert("Erro: ID do usuário não encontrado no token.");
        return;
      }

      const url = "http://localhost:5000/api/inscricoes/importar-documentos";

      console.log("URL para a requisição:", url);

      const response = await axios.post(url, {
        usuarioId,
        editalId: id,
        documentosObrigatorios: documentosFiltrados, // Aqui envia os tipos dos documentos
      });

      console.log("Resposta do backend:", response.data);

      const { documentosFaltantes = [], documentosImportados = [] } = response.data;

      console.log("Documentos faltantes:", documentosFaltantes);
      console.log("Documentos importados:", documentosImportados);

      // Atualiza o status de todos os documentos, levando em consideração o retorno da API
      const statusAtualizado = edital.documentos_exigidos.map((doc) => {
        const importado = documentosImportados.find(
          (d) => d.tipo.toLowerCase().trim() === doc.tipo.toLowerCase().trim()
        );

        if (importado) {
          return {
            tipo: doc.tipo,
            status: "Importado com sucesso",
            id: importado.id, // usa o id correto do backend
          };
        }

        return {
          tipo: doc.tipo,
          status: doc.obrigatorio
            ? "Faltando ou não aprovado (obrigatório)"
            : "Ignorado / Não foi encontrado (opcional)",
          id: doc._id,
        };
      });


      console.log("Status dos documentos após atualização:", statusAtualizado);

      // Atualiza o estado dos status de documentos
      setDocumentosStatus(statusAtualizado);

      if (documentosFaltantes.length > 0) {
        const mensagemFaltantes = obrigatorios
          ? `Os seguintes documentos obrigatórios estão faltando: ${documentosFaltantes.join(", ")}.`
          : `Os seguintes documentos não obrigatórios estão faltando ou não aprovados: ${documentosFaltantes.join(", ")}. Porém, todos os documentos obrigatórios foram registrados com sucesso.`;

        console.log("Mensagem de documentos faltantes:", mensagemFaltantes);
        alert(mensagemFaltantes);
      } else {
        alert(
          obrigatorios
            ? "Todos os documentos obrigatórios foram cadastrados com sucesso!"
            : "Todos os documentos foram cadastrados com sucesso!"
        );
      }
    } catch (error) {
      console.error("Erro ao importar documentos:", error.response?.data || error);
      alert(
        "Ocorreu um erro ao importar os documentos. Verifique se possui todos os documentos aprovados e tente novamente."
      );
    }
  };

  useEffect(() => {
    const fetchEdital = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/inscricoes/${id}`
        );
        setEdital(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Erro ao carregar edital:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEdital();
  }, [id]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!edital) {
    return <p>Erro ao carregar o edital.</p>;
  }

  const handleSubmitInscricao = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Erro: Usuário não está logado.");
        return;
      }

      const decodedToken = jwtDecode(token);
      const usuarioId = decodedToken.id;

      if (!usuarioId) {
        alert("Erro: ID do usuário não encontrado no token.");
        return;
      }

      // Criando o array de respostas com perguntaId e resposta para envio ao backend
      const respostasFormatadas = Object.keys(respostas).map((perguntaId) => ({
        perguntaId: perguntaId,  // Incluindo o ID da pergunta
        resposta: respostas[perguntaId],  // O valor da resposta
      }));

      const data = {
        usuarioId,
        editalId: id,
        respostas: respostasFormatadas,  // Respostas com formato correto
        documentos: documentosStatus.map((doc) => ({
          tipo: doc.tipo,
          status: doc.status,
          arquivoId: doc.id,  // Garantir que o id do arquivo seja enviado como 'arquivoId'
        })),
      };

      console.log("Dados para inscrição:", data);

      const faltandoDocObrigatorio = documentosStatus.some(
        (doc) => doc.status.includes('Faltando') && edital.documentos_exigidos.find(d => d.tipo === doc.tipo && d.obrigatorio)
      );
      if (faltandoDocObrigatorio) {
        alert("Você deve importar todos os documentos obrigatórios antes de enviar.");
        return;
      }


      // Enviando ao backend
      const response = await axios.post("http://localhost:5000/api/inscricoes/criar-inscricao", data);

      console.log("Resposta do backend ao criar inscrição:", response.data);

      alert("Inscrição realizada com sucesso!");
      navigate('/realizar-inscricao');
    } catch (error) {
      console.error("Erro ao criar inscrição:", error.response?.data || error);
      alert("Erro ao realizar a inscrição. Verifique os dados e tente novamente.");
    }
  };

  const Pergunta = ({ pergunta, respostas, handleRespostaChange }) => {
    const [valorAtual, setValorAtual] = useState(respostas[pergunta._id] || "");
    const inputRef = useRef(null);  // Referência para o campo de input

    // Atualiza o estado local sem disparar re-renderizações
    const handleChange = (e) => {
      setValorAtual(e.target.value);
    };

    // Atualiza o estado global quando o usuário sai do campo
    const handleBlur = () => {
      handleRespostaChange(pergunta._id, valorAtual);
    };

    return (
      <div key={pergunta._id}>
        <label>{pergunta.texto}</label>

        {/* Texto curto */}
        {pergunta.subtipo === "texto_curto" && (
          <input
            ref={inputRef}
            type="text"
            value={valorAtual}
            onChange={handleChange}  // Apenas atualiza o valor local enquanto o usuário digita
            onBlur={handleBlur}  // Atualiza o estado global quando o campo perde o foco
          />
        )}

        {/* Texto longo */}
        {pergunta.subtipo === "texto_longo" && (
          <textarea
            ref={inputRef}
            value={valorAtual}
            onChange={handleChange}  // Apenas atualiza o valor local enquanto o usuário digita
            onBlur={handleBlur}  // Atualiza o estado global quando o campo perde o foco
          />
        )}

        {/* Número */}
        {pergunta.subtipo === "numero" && (
          <input
            ref={inputRef}
            type="number"
            value={valorAtual}
            onChange={handleChange}  // Apenas atualiza o valor local enquanto o usuário digita
            onBlur={handleBlur}  // Atualiza o estado global quando o campo perde o foco
          />
        )}

        {/* Sim/Não */}
        {pergunta.subtipo === "sim_nao" && (
          <div>
            <label>
              <input
                type="radio"
                name={pergunta._id}
                value="sim"
                checked={valorAtual === "sim"}
                onChange={() => handleRespostaChange(pergunta._id, "sim")}
              />
              Sim
            </label>
            <label>
              <input
                type="radio"
                name={pergunta._id}
                value="nao"
                checked={valorAtual === "nao"}
                onChange={() => handleRespostaChange(pergunta._id, "nao")}
              />
              Não
            </label>
          </div>
        )}

        {/* Múltipla escolha */}
        {pergunta.subtipo === "multipla_escolha" && (
          <div>
            {pergunta.opcoes.map((opcao) => (
              <label key={opcao._id}>
                <input
                  type="checkbox"
                  value={opcao._id}
                  checked={valorAtual?.includes(opcao._id) || false}
                  onChange={() => {
                    const novasRespostas = [...(valorAtual || [])];
                    const index = novasRespostas.indexOf(opcao._id);
                    if (index === -1) {
                      novasRespostas.push(opcao._id);
                    } else {
                      novasRespostas.splice(index, 1);
                    }
                    handleRespostaChange(pergunta._id, novasRespostas);
                  }}
                />
                {opcao.texto}
              </label>
            ))}
          </div>
        )}

        {/* Única escolha */}
        {pergunta.subtipo === "unica_escolha" && (
          <div>
            {pergunta.opcoes.map((opcao) => (
              <label key={opcao._id}>
                <input
                  type="radio"
                  name={pergunta._id}
                  value={opcao._id}
                  checked={valorAtual === opcao._id}
                  onChange={() => handleRespostaChange(pergunta._id, opcao._id)}
                />
                {opcao.texto}
              </label>
            ))}
          </div>
        )}

        {/* Escala Likert */}
        {pergunta.subtipo === "escala_likert" && (
          <div>
            {[...Array(5).keys()].map((valor) => (
              <label key={valor + 1}>
                <input
                  type="radio"
                  name={pergunta._id}
                  value={valor + 1}
                  checked={valorAtual === valor + 1}
                  onChange={() => handleRespostaChange(pergunta._id, valor + 1)}
                />
                {valor + 1}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };
  return (
    <div>
      <h1>Inscrição para: {edital.nome_bolsa}</h1>
      <p>{edital.descricao}</p>

      <h2>Critérios de Elegibilidade</h2>
      <p>{edital.criterios_elegibilidade}</p>

      <h2>Documentos Necessários</h2>
      <ul>
        {edital.documentos_exigidos.map((doc) => (
          <li key={doc.tipo}>
            <strong>Tipo:</strong> {doc.tipo} <br />
            <strong>Descrição:</strong> {doc.descricao} <br />
            <strong>Obrigatório:</strong> {doc.obrigatorio ? "Sim" : "Não"}
          </li>
        ))}
      </ul>

      <button onClick={() => handleImport(true)}>Importar Documentos Obrigatórios</button>
      <button onClick={() => handleImport(false)}>Importar Todos os Documentos</button>

      <h2>Status dos Documentos</h2>
      <ul>
        {documentosStatus.map((doc) => (
          <li key={doc.tipo}>
            <strong>{doc.tipo}:</strong> {doc.status}
          </li>
        ))}
      </ul>

      <h2>Perguntas</h2>
      <form>
        {edital.perguntas.map((pergunta) => (
          <Pergunta
            key={pergunta._id}
            pergunta={pergunta}
            respostas={respostas}
            handleRespostaChange={handleRespostaChange}
          />
        ))}
      </form>

      {/* Botão para finalizar a inscrição */}
      <button type="button" onClick={handleSubmitInscricao}>
        Finalizar Inscrição
      </button>
    </div>

  );
};

export default RealizarInscricao;
