const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified; // Adiciona os dados do usuário autenticado na requisição
        next(); // Passa para a próxima função
    } catch (error) {
        res.status(400).json({ error: 'Token inválido.' });
    }
};
