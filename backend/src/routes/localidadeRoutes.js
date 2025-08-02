const express = require('express');
const { 
    getLocalidades,
    createLocalidade,
    updateLocalidade,
    deleteLocalidade
} = require('../controllers/localidadeController');

const router = express.Router();

// Listar localidades (público)
router.get('/', getLocalidades);

// CRUD localidades (sem autenticação - apenas para desenvolvimento)
router.post('/', createLocalidade);
router.put('/:id', updateLocalidade);
router.delete('/:id', deleteLocalidade);

module.exports = router;
