import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/Config';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As novas palavras passe não coincidem!');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erro', 'Utilizador não autenticado.');
        setLoading(false);
        return;
      }
      await axios.put(
        `${API_BASE_URL}/users/change-password`,
        { currentPassword, newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sucesso', 'Palavra passe alterada!');
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao alterar a Palavra passe:", error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.error || 'Não foi possível alterar a Palavra passe.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Poderíamos recarregar dados se necessário
    setRefreshing(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 100, android: 80 })}
    >
      <View style={styles.backgroundOverlay} />
      <SafeAreaView style={styles.safeArea}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.title}>Mudar Palavra passe</Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.glassCard}>
              {/* Senha Atual */}
              <View style={styles.inputContainer}>
                <Input
                  placeholder="Palavra passe Atual"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  placeholderTextColor="#ccc"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(prev => !prev)}>
                  <Ionicons name={showCurrentPassword ? 'eye-off' : 'eye'} size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Nova Senha */}
              <View style={styles.inputContainer}>
                <Input
                  placeholder="Nova Palavra passe"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  placeholderTextColor="#ccc"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(prev => !prev)}>
                  <Ionicons name={showNewPassword ? 'eye-off' : 'eye'} size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Confirmar Nova Senha */}
              <View style={styles.inputContainer}>
                <Input
                  placeholder="Confirmar Nova Palavra passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#ccc"
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.btnColumn}>
                <Button title="Alterar Palavra passe" onPress={handleChangePassword} />
              </View>
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  backgroundOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(30,30,30,0.5)' },
  scrollContent: { padding: 20, paddingBottom: 100, alignItems: 'center' },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  glassCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingRight: 30,     // espaço extra à direita
    overflow: 'hidden',   // impede que o ícone ultrapasse
    marginVertical: 15,   // margem em cima e em baixo
  },
  input: {
    flex: 1,
    color: '#fff',
    marginRight: 10,      // distância interna antes do ícone
  },
  btnColumn: { width: '100%', marginTop: 10 },
});
