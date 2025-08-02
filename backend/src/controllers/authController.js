const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Modalidade = require('../models/Modalidade');
const Localidade = require('../models/Localidade');

exports.register = async (req, res) => {
    try {
        const { nome, username, email, password, desporto_favorito, localidade } = req.body;
        
        // Validações básicas
        if (!nome || !username || !email || !password) {
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            nome, 
            username, 
            email, 
            password: hashedPassword, 
            desporto_favorito, 
            localidade
        });

        res.status(201).json({ message: 'Utilizador criado com sucesso!' });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Email ou username já existem' });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ 
            where: { email },
            include: [
                { model: Modalidade, as: 'modalidade' },
                { model: Localidade, as: 'localidade_origem' }
            ]
        });

        if (!user) return res.status(400).json({ error: 'Utilizador não encontrado' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Senha incorreta' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ 
            token,
            user: {
                id: user.id,
                nome: user.nome,
                username: user.username,
                email: user.email,
                pontos: user.pontos,
                modalidade: user.modalidade,
                localidade_origem: user.localidade_origem
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Modalidade, as: 'modalidade' },
                { model: Localidade, as: 'localidade_origem' }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: "Utilizador não encontrado!" });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nome, username, email, desporto_favorito, localidade } = req.body;

        const [updated] = await User.update(
            { nome, username, email, desporto_favorito, localidade },
            { where: { id: userId } }
        );

        if (!updated) {
            return res.status(400).json({ error: "Falha ao atualizar o utilizador!" });
        }

        res.json({ message: "Utilizador atualizado com sucesso!" });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Email ou username já existem' });
        }
        res.status(500).json({ error: error.message });
    }
};
