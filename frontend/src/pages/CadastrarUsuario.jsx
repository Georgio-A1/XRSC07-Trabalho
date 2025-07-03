import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const CadastrarUsuario = () => {
    const navigate = useNavigate();

    // Proteção da página: só admins acessam
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const decoded = jwtDecode(token);
        if (decoded.tipo_usuario !== 'administrador') {
            navigate('/dashboard');
        }
    }, [navigate]);

    // Estado do formulário
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [matricula, setMatricula] = useState('');
    const [numeroCelular, setNumeroCelular] = useState('');
    const [senha, setSenha] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('aluno');

    const [endereco, setEndereco] = useState({
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
    });

    // Função de envio
    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('token');

        if (!token) {
            alert('Token de autenticação não encontrado. Faça login novamente.');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/usuarios/cadastrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    cpf,
                    email,
                    nome_completo: nomeCompleto,
                    numero_matricula: matricula,
                    telefone: numeroCelular,
                    endereco,
                    senha,
                    tipo_usuario: tipoUsuario.toLowerCase(),
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Usuário cadastrado com sucesso!');
                // Limpa os campos
                setCpf('');
                setEmail('');
                setNomeCompleto('');
                setMatricula('');
                setNumeroCelular('');
                setSenha('');
                setTipoUsuario('aluno');
                setEndereco({
                    rua: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                    cep: ''
                });
            } else {
                alert(data.message || 'Erro ao cadastrar usuário!');
            }
        } catch (error) {
            console.error('Erro ao cadastrar usuário:', error);
            alert('Erro ao cadastrar usuário!');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Cadastrar Novo Usuário</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">CPF:</label>
                        <input
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Nome Completo:</label>
                        <input
                            type="text"
                            value={nomeCompleto}
                            onChange={(e) => setNomeCompleto(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Matrícula:</label>
                        <input
                            type="text"
                            value={matricula}
                            onChange={(e) => setMatricula(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Telefone:</label>
                        <input
                            type="text"
                            value={numeroCelular}
                            onChange={(e) => setNumeroCelular(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>
                </div>

                {/* Endereço */}
                <fieldset className="border-t border-gray-200 pt-4">
                    <legend className="text-lg font-semibold text-gray-800 mb-2">Endereço</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rua:</label>
                            <input
                                type="text"
                                value={endereco.rua}
                                onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
                                required
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Número:</label>
                            <input
                                type="text"
                                value={endereco.numero}
                                onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                                required
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Complemento:</label>
                            <input
                                type="text"
                                value={endereco.complemento}
                                onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bairro:</label>
                            <input
                                type="text"
                                value={endereco.bairro}
                                onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                                required
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cidade:</label>
                            <input
                                type="text"
                                value={endereco.cidade}
                                onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                                required
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Estado:</label>
                            <input
                                type="text"
                                value={endereco.estado}
                                onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })}
                                required
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">CEP:</label>
                            <input
                                type="text"
                                value={endereco.cep}
                                onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
                                required
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                            />
                        </div>
                    </div>
                </fieldset>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha:</label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Usuário:</label>
                        <select
                            value={tipoUsuario}
                            onChange={(e) => setTipoUsuario(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring focus:ring-blue-200"
                        >
                            <option value="aluno">Aluno</option>
                            <option value="funcionario">Funcionário</option>
                            <option value="administrador">Administrador</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Cadastrar Usuário
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CadastrarUsuario;
