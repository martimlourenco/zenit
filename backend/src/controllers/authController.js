const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { name, username, email, password, birthdate, location, country } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name, username, email, password: hashedPassword, birthdate, location, country
        });

        res.status(201).json({ message: 'Utilizador criado com sucesso!' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(400).json({ error: 'Utilizador não encontrado' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Senha incorreta' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.user.id; // ID do usuário autenticado pelo token

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] } 
        });

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado!" });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, username, email, birthdate, location, country } = req.body;

        // Atualiza os dados do usuário
        const [updated] = await User.update(
            { name, username, email, birthdate, location, country },
            { where: { id: userId } }
        );

        if (!updated) {
            return res.status(400).json({ error: "Falha ao atualizar o usuário!" });
        }

        res.json({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
