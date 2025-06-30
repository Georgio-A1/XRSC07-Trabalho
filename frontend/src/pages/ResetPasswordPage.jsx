// src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPasswordPage.css';

const ResetPasswordPage = () => {
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [erro, setErro] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!novaSenha || !confirmarSenha) {
            setErro('Por favor, preencha todos os campos.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5000/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ novaSenha }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Senha redefinida com sucesso!');
                // Limpa o token e redireciona para o login após um breve período
                setTimeout(() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                }, 2000);
            } else {
                setErro(data.message || 'Erro ao redefinir a senha.');
            }
        } catch (err) {
            setErro('Erro ao conectar com o servidor.');
        }
    };

    return (
        <div className="reset-password-container">
            <h1>Redefinir Senha</h1>
            {erro && <p className="error-message">{erro}</p>}
            {message && <p className="success-message">{message}</p>}
            <form onSubmit={handleResetPassword}>
                <div className="input-group">
                    <label htmlFor="novaSenha">Nova Senha</label>
                    <input
                        type="password"
                        id="novaSenha"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        placeholder="Digite sua nova senha"
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="confirmarSenha">Confirmar Senha</label>
                    <input
                        type="password"
                        id="confirmarSenha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        placeholder="Confirme sua nova senha"
                        required
                    />
                </div>
                <button type="submit">Redefinir Senha</button>
            </form>
        </div>
    );
};

export default ResetPasswordPage;
