require('dotenv').config();
const express = require('express');
const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const Movie = require('./src/models/Movie');
const Genre = require('./src/models/Genre'); // 🔥 Importa o modelo de Gênero
const Favorite = require('./src/models/Favorite');
const authRoutes = require('./src/routes/authRoutes');
const movieRoutes = require('./src/routes/movieRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const likeDislikeRoutes = require('./src/routes/likeDislikeRoutes');
const userRoutes = require('./src/routes/userRoutes');
const passwordRoutes = require('./src/routes/passwordRoutes');
const recommendationRoutes = require('./src/routes/recommendationRoutes'); // 🔥 Nova rota de Recomendações
const { populateMovies } = require('./src/controllers/movieController');
const fetchGenres = require('./src/scripts/fetchGenres');

const app = express();
app.use(express.json());

// Registrando as rotas
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/favorites', favoriteRoutes);
app.use('/likes', likeDislikeRoutes);
app.use('/users', userRoutes);
app.use('/password', passwordRoutes);
app.use('/recommendations', recommendationRoutes); // Registrando as rotas de recomendação
// Sincronizar banco de dados e popular automaticamente
sequelize.sync({ force: false }) 
    .then(async () => {
        console.log('📀 Base de dados sincronizada!');
        
        // 🔥 Buscar e salvar os gêneros antes de popular os filmes
        await fetchGenres(); 

        // 🔹 Chama a função de popular filmes automaticamente
        await populateMovies(); 
    })
    .catch(err => console.error('❌ Erro ao sincronizar base:', err));

app.listen(3000, '0.0.0.0', () => {
    console.log('🚀 Servidor a rodar na porta 3000');
});
