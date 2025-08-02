const express = require('express');
const { 
    createEvent, 
    getEvents, 
    getEventById, 
    updateEvent, 
    deleteEvent,
    joinEvent,
    leaveEvent,
    getEventParticipants,
    inviteUser,
    approveParticipant,
    rejectParticipant
} = require('../controllers/eventController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// CRUD Eventos
router.post('/', authMiddleware, createEvent);
router.get('/', getEvents);
router.get('/:eventId', getEventById);
router.put('/:eventId', authMiddleware, updateEvent);
router.delete('/:eventId', authMiddleware, deleteEvent);

// Participação
router.post('/:eventId/join', authMiddleware, joinEvent);
router.delete('/:eventId/leave', authMiddleware, leaveEvent);
router.get('/:eventId/participants', getEventParticipants);

// Convites e aprovações
router.post('/:eventId/invite', authMiddleware, inviteUser);
router.put('/:eventId/approve/:participationId', authMiddleware, approveParticipant);
router.put('/:eventId/reject/:participationId', authMiddleware, rejectParticipant);

module.exports = router;
