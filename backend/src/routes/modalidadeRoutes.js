const express = require('express');
const { 
    getModalidades,
    createModalidade,
    updateModalidade,
    deleteModalidade
} = require('../controllers/modalidadeController');

const router = express.Router();

// Listar modalidades (público)
router.get('/', getModalidades);

// CRUD modalidades (sem autenticação - apenas para desenvolvimento)
router.post('/', createModalidade);
router.put('/:id', updateModalidade);
router.delete('/:id', deleteModalidade);

module.exports = router;
