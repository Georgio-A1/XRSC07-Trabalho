// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">Login</h1>

                {erro && <p className="text-red-600 text-sm mb-4 text-center">{erro}</p>}
                {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">CPF</label>
                        <input
                            type="text"
                            id="cpf"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            placeholder="Digite seu CPF"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="senha" className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Digite sua senha"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Entrar
                    </button>
                </form>

                <button
                    onClick={() => setShowForgotPassword(!showForgotPassword)}
                    className="w-full text-sm text-blue-600 mt-4 hover:underline"
                >
                    Esqueceu a senha?
                </button>

                {showForgotPassword && (
                    <form onSubmit={handleForgotPassword} className="mt-6 space-y-4 border-t pt-4">
                        <h2 className="text-lg font-semibold text-blue-700 text-center">Redefinir Senha</h2>

                        <div>
                            <label htmlFor="forgotCpf" className="block text-sm font-medium text-gray-700">CPF</label>
                            <input
                                type="text"
                                id="forgotCpf"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                placeholder="Digite seu CPF"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white font-semibold py-2 rounded-lg hover:bg-blue-600 transition"
                        >
                            Solicitar Redefinição de Senha
                        </button>
                    </form>
                )}
            </div>
        </div>

    );
};

export default LoginPage;
