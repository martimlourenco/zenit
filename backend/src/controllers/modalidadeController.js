const Modalidade = require('../models/Modalidade');

exports.getModalidades = async (req, res) => {
    try {
        const modalidades = await Modalidade.findAll({
            order: [['nome', 'ASC']]
        });

        res.json({ modalidades });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createModalidade = async (req, res) => {
    try {
        const { nome, icone_url, foto_url } = req.body;

        if (!nome) {
            return res.status(400).json({ error: 'Nome da modalidade é obrigatório' });
        }

        const modalidade = await Modalidade.create({
            nome,
            icone_url,
            foto_url
        });

        res.status(201).json({ 
            message: 'Modalidade criada com sucesso!',
            modalidade 
        });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Modalidade já existe' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateModalidade = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, icone_url, foto_url } = req.body;

        const modalidade = await Modalidade.findByPk(id);
        
        if (!modalidade) {
            return res.status(404).json({ error: 'Modalidade não encontrada' });
        }

        await modalidade.update({
            nome,
            icone_url,
            foto_url
        });

        res.json({ 
            message: 'Modalidade atualizada com sucesso!',
            modalidade 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteModalidade = async (req, res) => {
    try {
        const { id } = req.params;

        const modalidade = await Modalidade.findByPk(id);
        
        if (!modalidade) {
            return res.status(404).json({ error: 'Modalidade não encontrada' });
        }

        await modalidade.destroy();

        res.json({ message: 'Modalidade eliminada com sucesso!' });

    } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ error: 'Não é possível eliminar modalidade com eventos associados' });
        }
        res.status(500).json({ error: error.message });
    }
};
