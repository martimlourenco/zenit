import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../constants/Config';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

export default function MailboxScreen() {
  const [loading, setLoading] = useState(false);
  const [inbox, setInbox] = useState([]);
  const [senderNames, setSenderNames] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_BASE_URL}/recommendations/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInbox(response.data);
      fetchSenderNames(response.data);
    } catch (error) {
      console.error("Erro ao encontrar caixa de entrada:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível carregar a caixa de entrada.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSenderNames = async (recommendations) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const names = { ...senderNames };
      
      const requests = recommendations.map(async (rec) => {
        if (!names[rec.sender_id]) {
          const response = await axios.get(`${API_BASE_URL}/users/profile/${rec.sender_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          names[rec.sender_id] = response.data.user.name;
        }
      });
      
      await Promise.all(requests);
      setSenderNames(names);
    } catch (error) {
      console.error("Erro ao procurar nomes dos remetentes:", error);
    }
  };

  const handleDeleteRecommendation = async (recommendationId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      await axios.delete(`${API_BASE_URL}/recommendations/${recommendationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Sucesso', 'Recomendação apagada com sucesso.');
      fetchInbox();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível apagar a recomendação.');
      console.error(error);
    }
  };

  const renderItem = ({ item }) => {
    const movieTmdbId = item.Movie ? item.Movie.tmdb_id : null;
    const movieTitle = item.Movie ? item.Movie.title : 'Filme não foi encontrado';
    const senderName = senderNames[item.sender_id] || 'A Carregar...';

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity
          style={styles.itemContent}
          onPress={() => {
            if (movieTmdbId) {
              navigation.navigate('MovieDetails', { movieId: movieTmdbId });
            } else {
              Alert.alert('Erro', 'Filme não encontrado.');
            }
          }}
        >
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={styles.senderText}>De: {senderName}</Text>
          <Text style={styles.movieTitleText}>Filme: {movieTitle}</Text>
          <Text style={styles.dateText}>Enviado em: {format(new Date(item.createdAt), 'dd/MM/yyyy')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteRecommendation(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Caixa de Entrada</Text>
          <View style={{ width: 40 }} />
        </View>
        {inbox.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma recomendação recebida.</Text>
          </View>
        ) : (
          <FlatList
            data={inbox}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  backButton: { width: 40, alignItems: 'center' },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: { fontSize: 16, color: '#999' },
  listContent: { padding: 12 },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  itemContent: { flex: 1 },
  messageText: { fontSize: 16, color: '#fff' },
  senderText: { fontSize: 14, color: '#ccc', marginTop: 4 },
  movieTitleText: { fontSize: 14, color: '#222430', marginTop: 4 },
  dateText: { fontSize: 12, color: '#222430', marginTop: 2 },
  deleteButton: {
    padding: 6,
    backgroundColor: 'rgba(109, 75, 75, 0.15)',
    borderRadius: 10,
  },
});
