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

    const handleChange = (e) => setValorAtual(e.target.value);
    const handleBlur = () => handleRespostaChange(pergunta._id, valorAtual);

    return (
      <div className="space-y-2">
        <label className="block font-semibold text-gray-700">{pergunta.texto}</label>

        {pergunta.subtipo === "texto_curto" && (
          <input
            type="text"
            value={valorAtual}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {pergunta.subtipo === "texto_longo" && (
          <textarea
            value={valorAtual}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded px-3 py-2 h-24 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {pergunta.subtipo === "numero" && (
          <input
            type="number"
            value={valorAtual}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        {pergunta.subtipo === "sim_nao" && (
          <div className="flex gap-4">
            {["sim", "nao"].map((val) => (
              <label key={val} className="inline-flex items-center space-x-1">
                <input
                  type="radio"
                  name={pergunta._id}
                  value={val}
                  checked={valorAtual === val}
                  onChange={() => handleRespostaChange(pergunta._id, val)}
                  className="form-radio"
                />
                <span className="capitalize">{val}</span>
              </label>
            ))}
          </div>
        )}

        {pergunta.subtipo === "multipla_escolha" && (
          <div className="flex flex-col gap-1">
            {pergunta.opcoes.map((opcao) => {
              const checked = valorAtual?.includes(opcao._id) ?? false;
              return (
                <label key={opcao._id} className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={opcao._id}
                    checked={checked}
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
                    className="form-checkbox"
                  />
                  <span>{opcao.texto}</span>
                </label>
              );
            })}
          </div>
        )}

        {pergunta.subtipo === "unica_escolha" && (
          <div className="flex flex-col gap-1">
            {pergunta.opcoes.map((opcao) => (
              <label key={opcao._id} className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name={pergunta._id}
                  value={opcao._id}
                  checked={valorAtual === opcao._id}
                  onChange={() => handleRespostaChange(pergunta._id, opcao._id)}
                  className="form-radio"
                />
                <span>{opcao.texto}</span>
              </label>
            ))}
          </div>
        )}

        {pergunta.subtipo === "escala_likert" && (
          <div className="flex gap-3">
            {[...Array(5).keys()].map((v) => {
              const val = v + 1;
              return (
                <label key={val} className="inline-flex items-center space-x-1">
                  <input
                    type="radio"
                    name={pergunta._id}
                    value={val}
                    checked={valorAtual === val}
                    onChange={() => handleRespostaChange(pergunta._id, val)}
                    className="form-radio"
                  />
                  <span>{val}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">{`Inscrição para: ${edital.nome_bolsa}`}</h1>
      <p className="text-gray-700">{edital.descricao}</p>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Critérios de Elegibilidade</h2>
        <p className="text-gray-600">{edital.criterios_elegibilidade}</p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Documentos Necessários</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {edital.documentos_exigidos.map((doc) => (
            <li key={doc.tipo}>
              <strong>Tipo:</strong> {doc.tipo} <br />
              <strong>Descrição:</strong> {doc.descricao} <br />
              <strong>Obrigatório:</strong> {doc.obrigatorio ? "Sim" : "Não"}
            </li>
          ))}
        </ul>

        <div className="mt-4 space-x-4">
          <button
            onClick={() => handleImport(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            Importar Documentos Obrigatórios
          </button>
          <button
            onClick={() => handleImport(false)}
            className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700 transition"
          >
            Importar Todos os Documentos
          </button>
        </div>

        <h3 className="mt-6 text-xl font-semibold text-gray-800">Status dos Documentos</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {documentosStatus.map((doc) => (
            <li key={doc.tipo}>
              <strong>{doc.tipo}:</strong> {doc.status}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Perguntas</h2>
        <form className="space-y-6">
          {edital.perguntas.map((pergunta) => (
            <Pergunta
              key={pergunta._id}
              pergunta={pergunta}
              respostas={respostas}
              handleRespostaChange={handleRespostaChange}
            />
          ))}
        </form>
      </section>

      <button
        type="button"
        onClick={handleSubmitInscricao}
        className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
      >
        Finalizar Inscrição
      </button>
    </div>
  );

};

export default RealizarInscricao;
