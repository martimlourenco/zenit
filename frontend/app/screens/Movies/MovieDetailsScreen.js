import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function MovieDetailsScreen({ navigation, route }) {
  const { movieId } = route.params;
  const [movie, setMovie] = useState(null);
  const [reactions, setReactions] = useState({ likes: 0, dislikes: 0 });
  const [isFavorite, setIsFavorite] = useState(false);
  // userReaction pode ser 'like', 'dislike' ou null
  const [userReaction, setUserReaction] = useState(null);

  useEffect(() => {
    fetchMovieDetails();
    fetchReactions();
    fetchFavoriteState();
    fetchUserReaction();
  }, []);

  const fetchMovieDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/details/${movieId}`);
      setMovie(response.data.movie);
    } catch (error) {
      console.error(
        "Erro ao buscar detalhes do filme:",
        error.response?.data || error.message
      );
    }
  };

  const fetchReactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/likes/${movieId}`);
      setReactions(response.data);
    } catch (error) {
      console.error(
        "Erro ao buscar reações:",
        error.response?.data || error.message
      );
    }
  };

  const fetchFavoriteState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const favorites = response.data.favorites;
      const found = favorites.some(item => item.Movie.tmdb_id === movieId);
      setIsFavorite(found);
    } catch (error) {
      console.error(
        "Erro ao buscar estado de favorito:",
        error.response?.data || error.message
      );
    }
  };

  const fetchUserReaction = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const likesResponse = await axios.get(`${API_BASE_URL}/likes/my-likes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dislikesResponse = await axios.get(`${API_BASE_URL}/likes/my-dislikes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const likedItems = likesResponse.data.likes || [];
      const dislikedItems = dislikesResponse.data.dislikes || [];

      if (likedItems.some(item => item.Movie.tmdb_id === movieId)) {
        setUserReaction('like');
      } else if (dislikedItems.some(item => item.Movie.tmdb_id === movieId)) {
        setUserReaction('dislike');
      } else {
        setUserReaction(null);
      }
    } catch (error) {
      console.error(
        "Erro ao buscar a reação do usuário:",
        error.response?.data || error.message
      );
    }
  };

  const handleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }
      if (isFavorite) {
        await axios.delete(`${API_BASE_URL}/favorites/remove`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { movieId },
        });
        setIsFavorite(false);
        Alert.alert('Sucesso', 'Filme removido dos favoritos!');
      } else {
        await axios.post(
          `${API_BASE_URL}/favorites/add`,
          { movieId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
        Alert.alert('Sucesso', 'Filme adicionado aos favoritos!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Operação de favorito falhou.');
      console.error(
        "Favorite error:",
        error.response?.data || error.message
      );
    }
  };

  const handleLikeDislike = async (type) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }
      await axios.post(
        `${API_BASE_URL}/likes`,
        { movieId, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchReactions();
      await fetchUserReaction();
      if (userReaction === type) {
        Alert.alert('Sucesso', `Você removeu seu ${type}!`);
      } else {
        Alert.alert('Sucesso', `Você deu ${type} ao filme!`);
      }
    } catch (error) {
      Alert.alert('Erro', `Não foi possível dar ${type}.`);
      console.error(
        "Like/Dislike error:",
        error.response?.data || error.message
      );
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  if (!movie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>A Carregar...</Text>
      </View>
    );
  }

  return (
    // Usa a imagem de fundo do filme (backdrop) como fundo de tela com blur aplicado
    <View style={styles.fullScreen}>
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` }}
        style={styles.backgroundImage}
        blurRadius={10}
      />
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject} />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Cabeçalho com botão de voltar */}
          <View style={styles.headerContainer}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Container glass para detalhes do filme */}
          <View style={styles.glassContainer}>
            <Text style={styles.movieTitle}>{movie.title}</Text>
            <Text style={styles.movieInfo}>
              {movie.Genres?.map(g => g.name).join(', ')} · {formatDate(movie.release_date).slice(-4)} · {movie.vote_average ? `${movie.vote_average.toFixed(1)} ★` : ''}
            </Text>
            
            {/* Botões de ação com estilo glass */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={[styles.actionButton, userReaction === 'like' && styles.activeLike]}
                onPress={() => handleLikeDislike('like')}
              >
                <Text style={styles.actionButtonText}>
                  {userReaction === 'like' ? 'Like ✓' : 'Like'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, userReaction === 'dislike' && styles.activeDislike]}
                onPress={() => handleLikeDislike('dislike')}
              >
                <Text style={styles.actionButtonText}>
                  {userReaction === 'dislike' ? 'Dislike ✓' : 'Dislike'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, isFavorite && styles.activeFavorite]}
                onPress={handleFavorite}
              >
                <Text style={styles.actionButtonText}>
                  {isFavorite ? 'Favorito ✓' : 'Favorito'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Conteúdo principal */}
          <View style={styles.detailsContainer}>
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
              style={styles.posterImage}
            />
            <Text style={styles.releaseDate}>Data de Lançamento: {formatDate(movie.release_date)}</Text>
            <Text style={styles.reactionsText}>Likes: {reactions.likes} · Dislikes: {reactions.dislikes}</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
            <View style={styles.genresContainer}>
              {movie.Genres &&
                movie.Genres.map((genre, index) => (
                  <View key={index} style={styles.genreBadge}>
                    <Text style={styles.genreBadgeText}>{genre.name}</Text>
                  </View>
                ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  glassContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  movieTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  movieInfo: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  activeLike: {
    backgroundColor: 'rgba(52,199,89,0.8)',
  },
  activeDislike: {
    backgroundColor: 'rgba(255,59,48,0.8)',
  },
  activeFavorite: {
    backgroundColor: 'rgba(255,149,0,0.8)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
  },
  posterImage: {
    width: 140,
    height: 210,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 15,
  },
  releaseDate: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  reactionsText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  overview: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 20,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  genreBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    margin: 4,
  },
  genreBadgeText: {
    fontSize: 12,
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#000',
    fontSize: 18,
  },
});
