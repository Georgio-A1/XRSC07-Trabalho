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
        <div>
            <h2>Cadastrar Novo Usuário</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>CPF:</label>
                    <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
                </div>

                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div>
                    <label>Nome Completo:</label>
                    <input type="text" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} required />
                </div>

                <div>
                    <label>Matrícula:</label>
                    <input type="text" value={matricula} onChange={(e) => setMatricula(e.target.value)} required />
                </div>

                <div>
                    <label>Telefone:</label>
                    <input type="text" value={numeroCelular} onChange={(e) => setNumeroCelular(e.target.value)} />
                </div>

                {/* Endereço */}
                <fieldset>
                    <legend>Endereço</legend>

                    <div>
                        <label>Rua:</label>
                        <input
                            type="text"
                            value={endereco.rua}
                            onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label>Número:</label>
                        <input
                            type="text"
                            value={endereco.numero}
                            onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label>Complemento:</label>
                        <input
                            type="text"
                            value={endereco.complemento}
                            onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                        />
                    </div>

                    <div>
                        <label>Bairro:</label>
                        <input
                            type="text"
                            value={endereco.bairro}
                            onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label>Cidade:</label>
                        <input
                            type="text"
                            value={endereco.cidade}
                            onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label>Estado:</label>
                        <input
                            type="text"
                            value={endereco.estado}
                            onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label>CEP:</label>
                        <input
                            type="text"
                            value={endereco.cep}
                            onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
                            required
                        />
                    </div>
                </fieldset>

                <div>
                    <label>Senha:</label>
                    <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                </div>

                <div>
                    <label>Tipo de Usuário:</label>
                    <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
                        <option value="aluno">Aluno</option>
                        <option value="funcionario">Funcionário</option>
                        <option value="administrador">Administrador</option>
                    </select>
                </div>

                <button type="submit">Cadastrar Usuário</button>
            </form>
        </div>
    );
};

export default CadastrarUsuario;
