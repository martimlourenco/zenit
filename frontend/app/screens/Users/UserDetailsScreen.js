import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/Config';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function UserDetailsScreen() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, [])
  );

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(
        `${API_BASE_URL}/users/profile/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(response.data.user);
      setFavorites(response.data.favorites || []);
      setLikes(response.data.likes || []);
      setDislikes(response.data.dislikes || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserDetails();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#fff' }}>Utilizador não encontrado.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 100, android: 80 })}
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Perfil</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.glassCard}>
            <Ionicons
              name="person-circle"
              size={80}
              color="#fff"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.name}>{user.name}</Text>
            <View style={styles.infoRow}>
              <InfoItem label="Email" value={user.email} />
              <InfoItem label="Username" value={user.username} />
            </View>

            <TouchableOpacity
              style={styles.recommendBtn}
              onPress={() =>
                navigation.navigate('Recommendation', { receiverId: user.id, receiverName: user.name })
              }
            >
              <Text style={styles.recommendBtnText}>Recomendar um Filme</Text>
            </TouchableOpacity>

            <View style={styles.linksContainer}>
              <ProfileLink
                icon="star-outline"
                label="Favoritos"
                onPress={() => navigation.navigate('UserFavorites', { userId, movies: favorites })}
              />
              <ProfileLink
                icon="thumbs-up-outline"
                label="Likes"
                onPress={() => navigation.navigate('UserLikes', { userId, movies: likes })}
              />
              <ProfileLink
                icon="thumbs-down-outline"
                label="Dislikes"
                onPress={() => navigation.navigate('UserDislikes', { userId, movies: dislikes })}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

function ProfileLink({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress}>
      <Text style={styles.linkLabel}>{label}</Text>
      <View style={styles.linkIconContainer}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,30,30,0.5)' },
  scrollContent: { padding: 20, paddingBottom: 100, alignItems: 'center' },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  glassCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  name: { fontSize: 20, fontWeight: '600', color: '#fff', textAlign: 'center', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, width: '100%' },
  infoItem: { width: '48%' },
  infoLabel: { fontSize: 12, color: '#ccc' },
  infoValue: { fontSize: 14, color: '#fff', fontWeight: '500' },
  recommendBtn: { width: '100%', backgroundColor: '#222430', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  recommendBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linksContainer: { marginTop: 0, width: '100%' },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.2)' },
  linkLabel: { fontSize: 16, color: '#fff' },
  linkIconContainer: { flexDirection: 'row', alignItems: 'center' },
});
