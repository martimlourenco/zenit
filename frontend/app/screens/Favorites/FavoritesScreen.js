import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { API_BASE_URL } from '../../../constants/Config';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return setLoading(false);
      const response = await axios.get(`${API_BASE_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(response.data.favorites);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFavorites();
    setRefreshing(false);
  };

  const openMenu = (movie) => {
    setSelectedMovie(movie);
    setMenuVisible(true);
  };
  const closeMenu = () => {
    setSelectedMovie(null);
    setMenuVisible(false);
  };
  const goToMovie = () => {
    if (!selectedMovie) return;
    navigation.navigate('MovieDetails', { movieId: selectedMovie.tmdb_id });
    closeMenu();
  };
  const removeFavorite = async () => {
    if (!selectedMovie) return closeMenu();
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await axios.delete(`${API_BASE_URL}/favorites/remove`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { movieId: selectedMovie.tmdb_id },
      });
      fetchFavorites();
    } catch (error) {
      console.error(error);
    } finally {
      closeMenu();
    }
  };

  const renderItem = ({ item }) => {
    const movie = item.Movie;
    return (
      <View style={styles.itemContainer}>
        {movie.poster_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
            style={styles.poster}
          />
        ) : (
          <View style={styles.noPoster}>
            <Text style={styles.noPosterText}>Sem Imagem</Text>
          </View>
        )}
        <View style={styles.infoContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MovieDetails', { movieId: movie.tmdb_id })}
          >
            <Text style={styles.title} numberOfLines={1}>
              {movie.title}
            </Text>
            <Text style={styles.subtitle}>Adicionado aos Favoritos</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => openMenu(movie)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filmes Favoritos</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}

        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={closeMenu}
        >
          <Pressable style={styles.menuOverlay} onPress={closeMenu}>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuOption} onPress={goToMovie}>
                <Text style={styles.menuOptionText}>Ir para o Filme</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuOption} onPress={removeFavorite}>
                <Text style={[styles.menuOptionText, styles.menuOptionDanger]}>
                  Remover dos Favoritos
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: { width: 40, alignItems: 'center' },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 10,
    marginRight: 12,
    resizeMode: 'cover',
  },
  noPoster: {
    width: 60,
    height: 90,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noPosterText: {
    fontSize: 10,
    color: '#ddd',
  },
  infoContainer: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
  },
  menuButton: { padding: 8 },
  
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: 220,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  menuOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  menuOptionText: {
    fontSize: 16,
    color: '#fff',
  },
  menuOptionDanger: {
    color: 'rgba(255,59,48,0.9)',
  },
});
