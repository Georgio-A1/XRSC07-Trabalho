// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [cpf, setCpf] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Função para lidar com o envio do formulário de login
    const handleLogin = async (e) => {
        e.preventDefault();

        // Validação simples
        if (!cpf || !senha) {
            setErro('Por favor, preencha todos os campos.');
            return;
        }

        // Fazendo a requisição de login para o backend
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cpf, senha }),
            });

            const data = await response.json();

            if (response.ok) {
                // Se o login for bem-sucedido, armazena o token no localStorage
                localStorage.setItem('token', data.token);

                if (data.requireNewPassword) {
                    // Se o usuário tiver uma senha temporária, redireciona para a página de redefinição de senha
                    navigate('/reset-password');
                } else {
                    // Caso contrário, redireciona para o dashboard
                    navigate('/dashboard');
                }
            } else {
                // Se ocorrer um erro no login
                setErro(data.message || 'Erro no login. Tente novamente.');
            }
        } catch (err) {
            setErro('Erro ao conectar com o servidor.');
        }
    };

    // Função para lidar com a solicitação de redefinição de senha
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setErro(''); // Limpa mensagens de erro
        setMessage(''); // Limpa mensagens de sucesso

        // Validação simples
        if (!cpf || !email) {
            setErro('Por favor, preencha CPF e Email.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cpf, email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Chamado criado. Aguarde a recuperação da senha.');
                setShowForgotPassword(false); // Oculta o formulário após o envio
            } else {
                setErro(data.message || 'Erro ao solicitar redefinição de senha.');
            }
        } catch (err) {
            setErro('Erro ao conectar com o servidor.');
        }
    };

    return (
        <div className={styles['login-container']}>
            <h1>Login</h1>
            {erro && <p className={styles['error-message']}>{erro}</p>}
            {message && <p className={styles['success-message']}>{message}</p>}
            <form onSubmit={handleLogin}>
                <div className={styles['input-group']}>
                    <label htmlFor="cpf">CPF</label>
                    <input
                        type="text"
                        id="cpf"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                        placeholder="Digite seu CPF"
                        required
                    />
                </div>
                <div className={styles['input-group']}>
                    <label htmlFor="senha">Senha</label>
                    <input
                        type="password"
                        id="senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Digite sua senha"
                        required
                    />
                </div>
                <button type="submit">Entrar</button>
            </form>

            <button onClick={() => setShowForgotPassword(!showForgotPassword)} className="forgot-password-button">
                Esqueceu a senha?
            </button>

            {showForgotPassword && (
                <form onSubmit={handleForgotPassword} className="forgot-password-form">
                    <h2>Redefinir Senha</h2>
                    <div className={styles['input-group']}>
                        <label htmlFor="forgotCpf">CPF</label>
                        <input
                            type="text"
                            id="forgotCpf"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="Digite seu CPF"
                            required
                        />
                    </div>
                    <div className={styles['input-group']}>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Digite seu email"
                            required
                        />
                    </div>
                    <button type="submit">Solicitar Redefinição de Senha</button>
                </form>
            )}
        </div>
    );
};

export default LoginPage;
