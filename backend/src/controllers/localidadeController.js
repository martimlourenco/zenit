const Localidade = require('../models/Localidade');

exports.getLocalidades = async (req, res) => {
    try {
        const localidades = await Localidade.findAll({
            order: [['nome', 'ASC']]
        });

        res.json({ localidades });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createLocalidade = async (req, res) => {
    try {
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({ error: 'Nome da localidade é obrigatório' });
        }

        const localidade = await Localidade.create({ nome });

        res.status(201).json({ 
            message: 'Localidade criada com sucesso!',
            localidade 
        });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Localidade já existe' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateLocalidade = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome } = req.body;

        const localidade = await Localidade.findByPk(id);
        
        if (!localidade) {
            return res.status(404).json({ error: 'Localidade não encontrada' });
        }

        await localidade.update({ nome });

        res.json({ 
            message: 'Localidade atualizada com sucesso!',
            localidade 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteLocalidade = async (req, res) => {
    try {
        const { id } = req.params;

        const localidade = await Localidade.findByPk(id);
        
        if (!localidade) {
            return res.status(404).json({ error: 'Localidade não encontrada' });
        }

        await localidade.destroy();

        res.json({ message: 'Localidade eliminada com sucesso!' });

    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ error: 'Não é possível eliminar localidade com eventos associados' });
        }
        res.status(500).json({ error: error.message });
    }
};
