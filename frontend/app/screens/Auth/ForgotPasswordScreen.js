import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/Config';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleForgotPassword = async () => {
    try {
      await axios.post(`${API_BASE_URL}/password/forgot-password`, { email });
      Alert.alert('Sucesso', 'E-mail enviado! Verifique a sua caixa de entrada.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o e-mail.');
    }
  };

  // Desabilita o botão se o campo estiver vazio
  const isDisabled = !email.trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        // Em iOS, 'padding' empurra o conteúdo para cima
        // keyboardVerticalOffset adiciona espaço extra entre o teclado e o conteúdo
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={60} // Ajuste conforme desejar
      >
        <View style={styles.container}>
          {/* Botão "Cancel" no canto superior esquerdo */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          {/* Título grande estilo iOS */}
          <Text style={styles.title}>Esqueceste-te da palavra-passe?</Text>

          {/* Subtítulo com instruções */}
          <Text style={styles.subTitle}>
            Introduz o endereço de e-mail que usas na tua conta para continuar.
          </Text>

          {/* Campo de Email / Telefone */}
          <View style={styles.inputContainer}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ color: '#000' }}
            />
          </View>

          {/* Espaçador para empurrar o botão para o fim da tela */}
          <View style={{ flex: 1 }} />

          {/* Botão “Continue” fixado ao fim da tela */}
          <View style={styles.buttonContainer}>
            <Button
              title="Continuar"
              onPress={handleForgotPassword}
              disabled={isDisabled}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ======== ESTILOS ========
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 40,      // Espaço no topo
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  cancelText: {
    color: '#007aff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 40,
  },
});
