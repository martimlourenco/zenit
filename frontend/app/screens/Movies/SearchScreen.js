import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/Config';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('movies'); // "movies" ou "users"
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigation = useNavigation();

  const handleToggleSearchType = (type) => {
    setSearchType(type);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const url =
        searchType === 'movies'
          ? `${API_BASE_URL}/movies/search?title=${encodeURIComponent(query)}`
          : `${API_BASE_URL}/users/search?query=${encodeURIComponent(query)}`;
  
      const response = await axios.get(url);
      const items =
        searchType === 'movies'
          ? response.data.movies || []
          : response.data.users || [];
  
      setResults(items);
    } catch (error) {
      if (error.response && error.response.status === 404 && searchType === 'users') {
        // Trata erro 404 como "nenhum usuário encontrado"
        setResults([]);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const renderMovie = (movie) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('MovieDetails', { movieId: movie.tmdb_id })}
    >
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
        <Text style={styles.title} numberOfLines={1}>{movie.title}</Text>
        <Text style={styles.subtitle} numberOfLines={3}>{movie.overview}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderUser = (user) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('UserDetails', { userId: user.id })}
    >
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{user.name}</Text>
        <Text style={styles.subtitle}>@{user.username}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) =>
    searchType === 'movies' ? renderMovie(item) : renderUser(item);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Procurar</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          {/* Toggle */}
          <View style={styles.toggleContainer}>
            {['movies', 'users'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.toggleButton,
                  searchType === type && styles.toggleButtonActive,
                ]}
                onPress={() => handleToggleSearchType(type)}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    searchType === type && styles.toggleButtonTextActive,
                  ]}
                >
                  {type === 'movies' ? 'Filmes' : 'Utilizadores'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder={
                searchType === 'movies'
                  ? 'Escreva o título do filme'
                  : 'Escreva o nome ou nome de utilizador'
              }
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={query}
              onChangeText={setQuery}
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
              <Ionicons name="search" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Lista ou Loading */}
          {loading ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
          ) : (
            <>
              {searched && results.length === 0 ? (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>Nenhum resultado encontrado.</Text>
                </View>
              ) : (
                <FlatList
                  data={results}
                  keyExtractor={(item, idx) =>
                    searchType === 'movies'
                      ? String(item.tmdb_id)
                      : String(item.id)
                  }
                  renderItem={renderItem}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </>
          )}
        </View>
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
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginLeft: 10 },

  content: { flex: 1, padding: 10 },

  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  toggleButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: '#222430',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ccc',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: '#fff',
  },
  searchIcon: {
    padding: 6,
    
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
  poster: { width: 60, height: 90, borderRadius: 10, marginRight: 12, resizeMode: 'cover' },
  noPoster: {
    width: 60,
    height: 90,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noPosterText: { fontSize: 10, color: '#ddd' },
  infoContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#ccc' },

  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#ccc',
  },
});
