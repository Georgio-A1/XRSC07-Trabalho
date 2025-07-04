import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const RealizarInscricao = () => {
  const { id } = useParams();
  const [edital, setEdital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [respostas, setRespostas] = useState({});
  const [documentosStatus, setDocumentosStatus] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  const handleRespostaChange = (perguntaId, valor) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: valor }));
  };

  const handleImport = async (obrigatorios = true) => {
    try {
      const documentosFiltrados = edital.documentos_exigidos
        .filter((doc) => !obrigatorios || doc.obrigatorio)
        .map((doc) => doc.tipo);

      const token = localStorage.getItem("token");
      if (!token) return alert("Usuário não está logado.");
      const usuarioId = jwtDecode(token).id;

      const { data } = await axios.post("http://localhost:5000/api/inscricoes/importar-documentos", {
        usuarioId,
        editalId: id,
        documentosObrigatorios: documentosFiltrados,
      });

      const statusAtualizado = edital.documentos_exigidos.map((doc) => {
        const importado = data.documentosImportados.find(
          (d) => d.tipo.toLowerCase().trim() === doc.tipo.toLowerCase().trim()
        );
        return {
          tipo: doc.tipo,
          status: importado
            ? "Importado com sucesso"
            : doc.obrigatorio
              ? "Faltando ou não aprovado (obrigatório)"
              : "Ignorado / Não encontrado (opcional)",
          id: importado?.id || doc._id,
        };
      });

      setDocumentosStatus(statusAtualizado);

      if (data.documentosFaltantes?.length > 0) {
        alert(
          obrigatorios
            ? `Documentos obrigatórios faltando: ${data.documentosFaltantes.join(", ")}`
            : `Documentos não obrigatórios faltando: ${data.documentosFaltantes.join(", ")}`
        );
      } else {
        alert("Documentos importados com sucesso!");
      }
    } catch (error) {
      alert("Erro ao importar documentos.");
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchEdital = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/inscricoes/${id}`);
        setEdital(response.data);
      } catch (error) {
        console.error("Erro ao carregar edital:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEdital();
  }, [id]);

  const handleSubmitInscricao = async () => {
    if (!window.confirm("Deseja realmente enviar sua inscrição?")) return;

    const obrigatoriasNaoRespondidas = edital.perguntas.filter((p) => p.obrigatoria && (respostas[p._id] === undefined || respostas[p._id] === ""));
    if (obrigatoriasNaoRespondidas.length > 0) {
      alert("Responda todas as perguntas obrigatórias antes de enviar.");
      return;
    }

    const faltandoDocObrigatorio = documentosStatus.some(
      (doc) => doc.status.includes("Faltando") && edital.documentos_exigidos.find(d => d.tipo === doc.tipo && d.obrigatorio)
    );
    if (faltandoDocObrigatorio) {
      alert("Importe todos os documentos obrigatórios antes de enviar.");
      return;
    }

    try {
      setEnviando(true);
      const token = localStorage.getItem("token");
      const usuarioId = jwtDecode(token).id;

      const respostasFormatadas = Object.keys(respostas).map((pid) => ({ perguntaId: pid, resposta: respostas[pid] }));
      const data = {
        usuarioId,
        editalId: id,
        respostas: respostasFormatadas,
        documentos: documentosStatus.map((doc) => ({ tipo: doc.tipo, status: doc.status, arquivoId: doc.id })),
      };

      await axios.post("http://localhost:5000/api/inscricoes/criar-inscricao", data);
      alert("Inscrição realizada com sucesso!");
      navigate("/realizar-inscricao");
    } catch (error) {
      console.error("Erro ao criar inscrição:", error);
      alert("Erro ao realizar a inscrição.");
    } finally {
      setEnviando(false);
    }
  };

  const Pergunta = ({ pergunta, index }) => {
    const valorAtual = respostas[pergunta._id] || "";
    const handleChange = (v) => handleRespostaChange(pergunta._id, v);
    const inputId = `pergunta-${pergunta._id}`;

    const obrigatorioLabel = pergunta.obrigatorio ? (
      <span className="text-red-600 font-bold ml-1" title="Campo obrigatório">*</span>
    ) : null;


    const renderTextoPergunta = () => (
      <p className="block font-semibold text-gray-800">
        {index + 1}. {pergunta.texto} {obrigatorioLabel}
      </p>
    );

    return (
      <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-gray-50 space-y-3">
        {/* Título da pergunta */}
        {renderTextoPergunta()}

        {pergunta.subtipo === "texto_curto" && (
          <input
            id={inputId}
            type="text"
            value={valorAtual}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        )}

        {pergunta.subtipo === "texto_longo" && (
          <textarea
            id={inputId}
            value={valorAtual}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 h-24 resize-y"
          />
        )}

        {pergunta.subtipo === "numero" && (
          <input
            id={inputId}
            type="number"
            value={valorAtual}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        )}

        {pergunta.subtipo === "sim_nao" && (
          <div className="flex gap-6">
            {["sim", "nao"].map((v) => (
              <label key={v} className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name={pergunta._id}
                  value={v}
                  checked={valorAtual === v}
                  onChange={() => handleChange(v)}
                  className="form-radio"
                />
                <span className="capitalize">{v}</span>
              </label>
            ))}
          </div>
        )}

        {pergunta.subtipo === "multipla_escolha" && (
          <div className="flex flex-col gap-2">
            {pergunta.opcoes.map((op) => {
              const checked = valorAtual?.includes(op._id);
              return (
                <label key={op._id} className="inline-flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={op._id}
                    checked={checked}
                    onChange={() => {
                      const novas = [...(valorAtual || [])];
                      const idx = novas.indexOf(op._id);
                      idx === -1 ? novas.push(op._id) : novas.splice(idx, 1);
                      handleChange(novas);
                    }}
                    className="form-checkbox"
                  />
                  <span>{op.texto}</span>
                </label>
              );
            })}
          </div>
        )}

        {pergunta.subtipo === "unica_escolha" && (
          <div className="flex flex-col gap-2">
            {pergunta.opcoes.map((op) => (
              <label key={op._id} className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name={pergunta._id}
                  value={op._id}
                  checked={valorAtual === op._id}
                  onChange={() => handleChange(op._id)}
                  className="form-radio"
                />
                <span>{op.texto}</span>
              </label>
            ))}
          </div>
        )}

        {pergunta.subtipo === "escala_likert" && (
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((v) => (
              <label key={v} className="inline-flex items-center space-x-2">
                <input
                  type="radio"
                  name={pergunta._id}
                  value={v}
                  checked={valorAtual === v}
                  onChange={() => handleChange(v)}
                  className="form-radio"
                />
                <span>{v}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <p>Carregando...</p>;
  if (!edital) return <p>Erro ao carregar o edital.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Inscrição para: {edital.nome_bolsa}</h1>
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
          <button onClick={() => handleImport(true)} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition">
            Importar Documentos Obrigatórios
          </button>
          <button onClick={() => handleImport(false)} className="bg-gray-600 text-white px-5 py-2 rounded hover:bg-gray-700 transition">
            Importar Todos os Documentos
          </button>
        </div>

        <h3 className="mt-6 text-xl font-semibold text-gray-800">Status dos Documentos</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {documentosStatus.map((doc) => (
            <li key={doc.tipo} className={doc.status.includes("Faltando") ? "text-red-600" : "text-green-700"}>
              <strong>{doc.tipo}:</strong> {doc.status}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Perguntas</h2>
        <form className="space-y-6">
          {edital.perguntas.map((pergunta, index) => (
            <Pergunta key={pergunta._id} pergunta={pergunta} index={index} />
          ))}
        </form>

      </section>

      <button onClick={handleSubmitInscricao} disabled={enviando} className={`bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition ${enviando && "opacity-50 cursor-not-allowed"}`}>
        {enviando ? "Enviando..." : "Finalizar Inscrição"}
      </button>
    </div>
  );
};

export default RealizarInscricao;
