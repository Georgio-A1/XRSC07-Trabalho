// src/pages/AdminPage.js
import React, { useEffect, useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminPage.css';

const AdminPage = () => {
    const [chamados, setChamados] = useState([]);
    const [erro, setErro] = useState('');
    const [success, setSuccess] = useState('');
    //const navigate = useNavigate();

    useEffect(() => {
        const fetchChamados = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log("Token recebido:", token);
                const response = await axios.get('http://localhost:5000/api/auth/chamados-senha', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log('Chamados recebidos:', response.data.chamados);  // Verifica a estrutura dos dados
                setChamados(response.data.chamados);
            } catch (error) {
                setErro('Erro ao buscar chamados.');
            }
        };

        fetchChamados();
    }, []);

    const handleRespond = async (chamadoId, emailUsuario) => {
        const novaSenha = prompt('Digite a nova senha temporária para o usuário:');
    
        if (!novaSenha) {
            alert('Senha temporária não pode ser vazia.');
            return;
        }
    
        // Verifica se emailUsuario não é null ou undefined antes de enviar a requisição
        if (!emailUsuario) {
            alert('O e-mail do usuário não foi encontrado.');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            console.log('Dados enviados:', { chamadoId, emailUsuario, novaSenha });
    
            const response = await axios.post('http://localhost:5000/api/auth/respond-password-request', {
                chamadoId,
                emailUsuario,
                novaSenha  // Adicionando a novaSenha aqui
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            setSuccess(response.data.message);
            // Atualiza a lista de chamados após a resposta
            setChamados(chamados.filter(chamado => chamado.id !== chamadoId));
        } catch (error) {
            setErro('Erro ao responder ao chamado.');
        }
    };
    

    return (
        <div className="admin-container">
            <h1>Painel Administrativo</h1>
            {erro && <p className="error-message">{erro}</p>}
            {success && <p className="success-message">{success}</p>}
            <h2>Chamados de Redefinição de Senha</h2>
            {chamados.length === 0 ? (
                <p>Não há chamados pendentes.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuário ID</th>
                            <th>Tipo</th>
                            <th>Data de Criação</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chamados.map(chamado => (
                            <tr key={chamado.id}>
                                <td>{chamado.id}</td>
                                <td>{chamado.usuario_id}</td>
                                <td>{chamado.tipo}</td>
                                <td>{new Date(chamado.data_criacao).toLocaleString()}</td>
                                <td>{chamado.status}</td>
                                <td>
                                    <button onClick={() => {
                                        console.log('Email do usuário:', chamado.email);  // Verifica o email
                                        handleRespond(chamado.id, chamado.email);
                                    }}>Responder</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminPage;
