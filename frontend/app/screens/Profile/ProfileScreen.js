import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/Config';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [recommendationCount, setRecommendationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', email: '', birthdate: '', location: '', country: '' });
  const [birthdateObj, setBirthdateObj] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfile();
    fetchRecommendationCount();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRecommendationCount();
    }, [])
  );

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const { data } = await axios.get(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      const user = data.user;
      setProfile(user);
      setForm({
        name: user.name,
        username: user.username,
        email: user.email,
        birthdate: user.birthdate ? user.birthdate.split('T')[0] : '',
        location: user.location || '',
        country: user.country || '',
      });
      if (user.birthdate) {
        const [year, month, day] = user.birthdate.split('T')[0].split('-');
        setBirthdateObj(new Date(+year, +month - 1, +day));
      }
    } catch (error) {
      console.error("Erro ao buscar perfil:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendationCount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const { data } = await axios.get(`${API_BASE_URL}/recommendations/received/count`, { headers: { Authorization: `Bearer ${token}` } });
      setRecommendationCount(data.count);
    } catch (error) {
      console.error("Erro ao buscar contagem de recomendações:", error.response?.data || error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchRecommendationCount()]);
    setRefreshing(false);
  };

  const handleUpdate = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return Alert.alert('Erro', 'Usuário não autenticado.');
      const birth = birthdateObj ? format(birthdateObj, 'yyyy-MM-dd') : form.birthdate;
      await axios.put(
        `${API_BASE_URL}/auth/me`,
        { ...form, birthdate: birth },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sucesso', 'Perfil atualizado!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
      console.error("Erro ao atualizar perfil:", error.response?.data || error.message);
    }
  }, [birthdateObj, form]);

  const onChangeDate = useCallback((event, date) => {
    if (date) setBirthdateObj(date);
    setShowDatePicker(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 100, android: 80 })}
    >
      {/* Background Frosted */}
      <View style={styles.backgroundOverlay} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
          <View style={styles.header}>
            {!editing && (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
            )}
            <Text style={styles.title}>{editing ? 'Editar Perfil' : 'Perfil'}</Text>
            {editing ? (
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Ionicons name="close-outline" size={28} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Ionicons name="create-outline" size={28} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.glassCard}>
            <Ionicons name="person-circle" size={80} color="#fff" style={{ marginBottom: 12 }} />
            {!editing ? (
              <ProfileView profile={profile} recommendationCount={recommendationCount} navigation={navigation} logout={logout} />
            ) : (
              <ProfileEditMemoized
                form={form}
                setForm={setForm}
                birthdateObj={birthdateObj}
                setBirthdateObj={setBirthdateObj}
                showDatePicker={showDatePicker}
                setShowDatePicker={setShowDatePicker}
                onChangeDate={onChangeDate}
                handleUpdate={handleUpdate}
                cancelEdit={() => setEditing(false)}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function ProfileView({ profile, recommendationCount, navigation, logout }) {
  return (
    <>
      <Text style={styles.name}>{profile?.name}</Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <View style={styles.infoRow}>
        <InfoItem label="Username" value={profile?.username} />
        <InfoItem label="Nasc." value={profile?.birthdate?.split('T')[0]} />
      </View>
      <View style={styles.infoRow}>
        <InfoItem label="Localidade" value={profile?.location} />
        <InfoItem label="País" value={profile?.country} />
      </View>
      <View style={styles.linksContainer}>
        <ProfileLink icon="mail-outline" label="Caixa de Entrada" badge={recommendationCount} onPress={() => navigation.navigate('Mailbox')} />
        <ProfileLink icon="star-outline" label="Favoritos" onPress={() => navigation.navigate('Favorites')} />
        <ProfileLink icon="thumbs-up-outline" label="Likes" onPress={() => navigation.navigate('Likes')} />
        <ProfileLink icon="thumbs-down-outline" label="Dislikes" onPress={() => navigation.navigate('Dislikes')} />
        <ProfileLink icon="lock-closed-outline" label="Alterar Palavra-passe" onPress={() => navigation.navigate('ChangePassword')} />
      </View>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Terminar Sessão</Text>
      </TouchableOpacity>
    </>
  );
}

const ProfileEdit = ({
  form,
  setForm,
  birthdateObj,
  setBirthdateObj,
  showDatePicker,
  setShowDatePicker,
  onChangeDate,
  handleUpdate,
  cancelEdit,
}) => {
  const onChangeText = useCallback(
    (field) => (text) => setForm((f) => ({ ...f, [field]: text })),
    [setForm]
  );

  return (
    <>
      <Input
        placeholder="Nome"
        value={form.name}
        onChangeText={onChangeText('name')}
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <Input
        placeholder="Username"
        value={form.username}
        onChangeText={onChangeText('username')}
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <Input
        placeholder="Email"
        value={form.email}
        onChangeText={onChangeText('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.datePickerText}>{birthdateObj ? format(birthdateObj, 'yyyy-MM-dd') : 'Selecionar Data'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={birthdateObj || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}
      <Input
        placeholder="Localidade"
        value={form.location}
        onChangeText={onChangeText('location')}
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <Input
        placeholder="País"
        value={form.country}
        onChangeText={onChangeText('country')}
        placeholderTextColor="#ccc"
        style={styles.input}
      />
      <View style={styles.btnColumn}>
        <Button title="Guardar" onPress={handleUpdate} />
        <Button title="Cancelar" onPress={cancelEdit} variant="outline" />
      </View>
    </>
  );
};

const ProfileEditMemoized = memo(ProfileEdit);

function InfoItem({ label, value }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

function ProfileLink({ icon, label, onPress, badge }) {
  return (
    <TouchableOpacity style={styles.linkRow} onPress={onPress}>
      <Text style={styles.linkLabel}>{label}</Text>
      <View style={styles.linkIconContainer}>
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
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
  name: { fontSize: 20, fontWeight: '600', color: '#fff', textAlign: 'center' },
  email: { fontSize: 14, color: '#ddd', textAlign: 'center', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoItem: { width: '48%' },
  infoLabel: { fontSize: 12, color: '#ccc' },
  infoValue: { fontSize: 14, color: '#fff', fontWeight: '500' },
  linksContainer: { marginTop: 20 },
  linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.2)' },
  linkLabel: { fontSize: 16, color: '#fff' },
  linkIconContainer: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: '#ff3b30', borderRadius: 10, minWidth: 20, paddingHorizontal: 6, paddingVertical: 2, marginRight: 5, alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  logoutBtn: { marginTop: 20, alignItems: 'center' },
  logoutText: { color: '#ff3b30', fontWeight: '600' },
  input: { width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 15, color: '#fff', marginBottom: 15 },
  datePickerBtn: { width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 15 },
  datePickerText: { color: '#fff' },
  btnColumn: { flexDirection: 'column', width: '100%', marginTop: 10 },
});
