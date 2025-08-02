require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const sequelize = require('./src/config/database');

// Import all models with associations
const models = require('./src/models');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const passwordRoutes = require('./src/routes/passwordRoutes');
const eventRoutes = require('./src/routes/eventRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const gamificationRoutes = require('./src/routes/gamificationRoutes');
const modalidadeRoutes = require('./src/routes/modalidadeRoutes');
const localidadeRoutes = require('./src/routes/localidadeRoutes');

const app = express();
app.use(express.json());

// Registrar routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/password', passwordRoutes);
app.use('/events', eventRoutes);
app.use('/reports', reportRoutes);
app.use('/gamification', gamificationRoutes);
app.use('/modalidades', modalidadeRoutes);
app.use('/localidades', localidadeRoutes);

// Sincronizar base de dados
sequelize.sync({ force: false }) 
    .then(async () => {
        console.log('📀 Base de dados sincronizada!');
    })
    .catch(err => console.error('❌ Erro ao sincronizar base:', err));

app.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Servidor a rodar na porta 3000');
});
