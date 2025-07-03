import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Button,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const API_NODE_URL = 'http://192.168.1.75:3000';
const API_FLASK_URL = 'http://192.168.1.75:5000';

const MLRecommendationsScreen = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swiperKey, setSwiperKey] = useState(0);
  const [userId, setUserId] = useState(null);
  const swiperRef = useRef(null);
  const navigation = useNavigation();

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_NODE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.user;
      setUserId(userData.id);
      await fetchRecommendations(userData.id);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error.response?.data || error.message);
      setLoading(false);
    }
  };

  const fetchRecommendations = async (id) => {
    try {
      const response = await axios.get(`${API_FLASK_URL}/machinelearning/${id}`);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    if (userId) {
      setLoading(true);
      await fetchRecommendations(userId);
      if (swiperRef.current) {
        swiperRef.current.jumpToCardIndex(0);
      }
      setSwiperKey((prev) => prev + 1);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const onCardPress = (movie) => {
    navigation.navigate('MovieDetails', { movieId: movie.tmdb_id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
        <Text style={styles.loadingText}>A carregar recomendações...</Text>
      </View>
    );
  }

  const currentBackdrop = recommendations[swiperRef.current?.state?.firstCardIndex || 0]?.backdrop_path;

  return (
    <View style={styles.fullScreen}>
      {currentBackdrop && (
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${currentBackdrop}` }}
          style={styles.backgroundImage}
          blurRadius={10}
        />
      )}
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>O que ver?</Text>
        <Button title="Atualizar" onPress={refreshRecommendations} color="#007BFF" />

        {recommendations.length > 0 ? (
          <Swiper
            key={swiperKey}
            ref={swiperRef}
            cards={recommendations}
            loop={false}
            renderCard={(movie) => (
              <TouchableOpacity style={styles.card} onPress={() => onCardPress(movie)}>
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
                  style={styles.image}
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.movieTitle}>{movie.title}</Text>
                  <Text style={styles.stars}>{movie.vote_average.toFixed(1)} ★</Text>
                </View>
              </TouchableOpacity>
            )}
            stackSize={3}
            backgroundColor="transparent"
            cardVerticalMargin={100}
            cardHorizontalMargin={20}
            disableTopSwipe={true}
            disableBottomSwipe={false}
            onSwipedAll={() => {
              if (swiperRef.current) {
                swiperRef.current.jumpToCardIndex(0);
              }
              setSwiperKey((prev) => prev + 1);
            }}
            animateCardOpacity
          />
        ) : (
          <Text style={styles.noCards}>Nenhuma recomendação encontrada.</Text>
        )}
      </SafeAreaView>
    </View>
  );
};

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
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 15,
  },
  card: {
    borderRadius: 20,
    backgroundColor: 'rgba(88, 88, 88, 0.86)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  image: {
    width: '100%',
    height: width * 1.2,
    borderRadius: 15,
    marginBottom: 10,
  },
  infoContainer: {
    alignItems: 'center',
  },
  movieTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stars: {
    fontSize: 16,
    color: '#ffd700',
    marginTop: 4,
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
  noCards: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MLRecommendationsScreen;