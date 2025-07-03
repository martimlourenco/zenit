import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/Config';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function RecommendationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { receiverId, receiverName } = route.params;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState('search');
  const [refreshing, setRefreshing] = useState(false);

  const fetchSearch = async () => {
    if (!query) return;
    setSearchLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/movies/search?title=${encodeURIComponent(query)}`
      );
      const movies = response.data.movies || [];
      if (!movies.length) Alert.alert('Nenhum resultado encontrado.');
      setResults(movies);
    } catch {
      Alert.alert('Erro', 'Não foi possível realizar a procura.');
    } finally {
      setSearchLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSearch();
    setRefreshing(false);
  }, [query]);

  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    setStep('finalize');
  };

  const handleSend = async () => {
    if (!selectedMovie) return;
    setSending(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Utilizador não autenticado.');
        setSending(false);
        return;
      }
      await axios.post(
        `${API_BASE_URL}/recommendations`,
        { receiver_id: receiverId, tmdb_id: selectedMovie.tmdb_id, message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Show success alert and navigate back to profile on OK
      Alert.alert(
        'Sucesso',
        'Recomendação enviada com sucesso!',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ],
        { cancelable: false }
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a recomendação.');
    } finally {
      setSending(false);
    }
  };

  const renderMovie = ({ item }) => (
    <TouchableOpacity style={styles.movieRow} onPress={() => handleSelectMovie(item)}>
      {item.poster_path && <Image source={{ uri: `https://image.tmdb.org/t/p/w200${item.poster_path}` }} style={styles.poster} />}
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieOverview} numberOfLines={3}>{item.overview}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 100, android: 80 })}
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Recomendar para {receiverName}</Text>
          <View style={{ width: 28 }} />
        </View>

        {step === 'search' ? (
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.tmdb_id)}
            renderItem={renderMovie}
            contentContainerStyle={styles.scrollContent}
            ListHeaderComponent={
              <View style={styles.glassCard}>
                <Text style={styles.label}>Escolha um filme:</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    placeholder="Escreva o título do filme"
                    placeholderTextColor="#ccc"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.input}
                  />
                  <TouchableOpacity style={styles.searchBtn} onPress={fetchSearch}>
                    <Text style={styles.searchBtnText}>Procurar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            ListEmptyComponent={!searchLoading && <Text style={styles.noResults}>Nenhum filme pesquisado.</Text>}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.glassCard}>
              <Text style={styles.label}>Filme selecionado:</Text>
              <View style={styles.selectedMovieRow}>
                {selectedMovie.poster_path && (
                  <Image source={{ uri: `https://image.tmdb.org/t/p/w200${selectedMovie.poster_path}` }} style={styles.selectedPoster} />
                )}
                <Text style={styles.selectedTitle}>{selectedMovie.title}</Text>
              </View>
              <Text style={styles.label}>Mensagem:</Text>
              <TextInput
                placeholder="Escreva a sua mensagem"
                placeholderTextColor="#ccc"
                value={message}
                onChangeText={setMessage}
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                multiline
              />
              {sending ? (
                <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
              ) : (
                <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                  <Text style={styles.sendBtnText}>Enviar Recomendação</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.changeBtn} onPress={() => setStep('search')}>
                <Text style={styles.changeBtnText}>Escolher outro filme</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,30,30,0.5)' },
  scrollContent: { padding: 20, alignItems: 'center', paddingBottom: 100 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  glassCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '500', color: '#fff', marginBottom: 8 },
  inputRow: { flexDirection: 'row', width: '100%', marginBottom: 15 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 15, color: '#fff' },
  searchBtn: { marginLeft: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  searchBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  noResults: { color: '#fff', marginTop: 20 },
  movieRow: { flexDirection: 'row', width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, marginVertical: 5, overflow: 'hidden' },
  poster: { width: 80, height: 120 },
  movieInfo: { flex: 1, padding: 10, justifyContent: 'center' },
  movieTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 4 },
  movieOverview: { fontSize: 12, color: '#eee' },
  selectedMovieRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  selectedPoster: { width: 60, height: 90, resizeMode: 'cover', marginRight: 10 },
  selectedTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  sendBtn: { width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  sendBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  changeBtn: { marginTop: 10, alignItems: 'center' },
  changeBtnText: { color: '#fff', fontSize: 16 },
});
