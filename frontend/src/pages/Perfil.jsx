import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {
    const [usuario, setUsuario] = useState(null);
    const [mensagem, setMensagem] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        try {
            const decoded = jwtDecode(token);
            fetch(`http://localhost:5000/api/usuarios/${decoded.id}`)
                .then(res => res.json())
                .then(data => setUsuario(data));
        } catch (err) {
            console.error('Erro ao carregar usuário', err);
            navigate('/login');
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('endereco.')) {
            const campo = name.split('.')[1];
            setUsuario((prev) => ({
                ...prev,
                endereco: { ...prev.endereco, [campo]: value }
            }));
        } else {
            setUsuario((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSalvar = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/usuarios/${usuario._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: usuario.email,
                    telefone: usuario.telefone,
                    endereco: usuario.endereco,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro ao atualizar');

            setMensagem('✅ Dados atualizados com sucesso');
        } catch (err) {
            setMensagem('❌ ' + err.message);
        }
    };

    if (!usuario || !usuario.endereco) return <p className="p-6">Carregando...</p>;

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Meu Perfil</h1>

            {mensagem && (
                <div className={`mb-4 px-4 py-2 rounded ${mensagem.startsWith('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {mensagem}
                </div>
            )}

            <div className="space-y-4">
                <p><strong>Nome:</strong> {usuario.nome_completo}</p>
                <p><strong>CPF:</strong> {usuario.cpf}</p>
                <p><strong>Matrícula:</strong> {usuario.numero_matricula}</p>
                <p><strong>Tipo:</strong> {usuario.tipo_usuario}</p>

                <div>
                    <label>Email:</label>
                    <input type="email" name="email" value={usuario.email} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>

                <div>
                    <label>Telefone:</label>
                    <input type="text" name="telefone" value={usuario.telefone} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
                </div>

                <div>
                    <label>Endereço:</label>
                    <input type="text" name="endereco.rua" value={usuario.endereco.rua} onChange={handleChange} placeholder="Rua" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="text" name="endereco.numero" value={usuario.endereco.numero} onChange={handleChange} placeholder="Número" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="text" name="endereco.bairro" value={usuario.endereco.bairro} onChange={handleChange} placeholder="Bairro" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="text" name="endereco.cidade" value={usuario.endereco.cidade} onChange={handleChange} placeholder="Cidade" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="text" name="endereco.estado" value={usuario.endereco.estado} onChange={handleChange} placeholder="Estado" className="w-full border px-3 py-2 rounded mb-2" />
                    <input type="text" name="endereco.cep" value={usuario.endereco.cep} onChange={handleChange} placeholder="CEP" className="w-full border px-3 py-2 rounded" />
                </div>

                <button
                    onClick={handleSalvar}
                    className="mt-4 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Salvar Alterações
                </button>
            </div>
        </div>
    );
};

export default Perfil;
