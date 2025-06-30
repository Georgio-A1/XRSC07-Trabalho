import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Corrigido o erro no import

const CancelarInscricao = () => {
    const [inscricoesPendentes, setInscricoesPendentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [usuarioId, setUsuarioId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        const decodedToken = jwtDecode(token);
        setUsuarioId(decodedToken.id);
    }, [navigate]);

    useEffect(() => {
        if (!usuarioId) return;  // Apenas executa o fetch se o usuarioId for definido

        const fetchInscricoes = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/inscricoes/pendentes/${usuarioId}`);
                setInscricoesPendentes(response.data);
            } catch (error) {
                console.error('Erro ao carregar inscrições:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInscricoes();
    }, [usuarioId]);

    const handleCancelarInscricao = async (inscricaoId) => {
        try {
            await axios.delete(`http://localhost:5000/api/inscricoes/${inscricaoId}`);
            setInscricoesPendentes(prev => prev.filter(inscricao => inscricao._id !== inscricaoId)); // Atualiza a lista
        } catch (error) {
            console.error('Erro ao cancelar inscrição:', error);
        }
    };

    if (loading) {
        return <p>Carregando inscrições...</p>;
    }

    return (
        <div>
            <h1>Cancelar Inscrição</h1>
            {inscricoesPendentes.length === 0 ? (
                <p>Você não tem inscrições pendentes para cancelar.</p>
            ) : (
                <ul>
                    {inscricoesPendentes.map((inscricao) => (
                        <li key={inscricao._id}>
                            <h2>{inscricao.editalId.nome_bolsa}</h2>
                            <p>{inscricao.editalId.descricao}</p>
                            <p>Período Letivo: {inscricao.editalId.periodo_letivo}</p>
                            <p>Status da Inscrição: {inscricao.status}</p>
                            <button onClick={() => handleCancelarInscricao(inscricao._id)}>
                                Cancelar Inscrição
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CancelarInscricao;
