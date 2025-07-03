

//nao faz nada, prototipo nao faz nada 




import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Input from '../../../components/Input';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/Config';

export default function UserSearchScreen() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/user/search?query=${encodeURIComponent(query)}`);
      setUsers(response.data.users);
    } catch (error) {
      Alert.alert('Erro', 'Utilizador não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.userText}>{item.name} (@{item.username})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscar Usuários</Text>
      <Input placeholder="Escreva o nome ou username" value={query} onChangeText={setQuery} />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>
      {loading ? <ActivityIndicator size="large" color="#fff" /> : (
        <FlatList data={users} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 10, textAlign: 'center' },
  searchButton: { backgroundColor: '#007aff', padding: 10, borderRadius: 5, alignItems: 'center', marginVertical: 10 },
  searchButtonText: { color: '#fff', fontSize: 16 },
  userItem: { padding: 10, borderBottomColor: '#444', borderBottomWidth: 1 },
  userText: { color: '#fff', fontSize: 16 }
});
