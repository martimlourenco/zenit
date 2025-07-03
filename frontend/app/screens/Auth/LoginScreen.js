import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (error) {
      if (error.response) {
        // Exibe a mensagem real do backend
        Alert.alert('Erro', error.response.data.error || 'Ocorreu um erro inesperado');
      } else {
        Alert.alert('Erro', 'Erro ao conectar ao servidor');
      }
    }
  };
  

  return (
    <>
      {/* Define a cor de fundo do status bar e o estilo dos ícones */}
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      
      {/* SafeAreaView para evitar barra cinza no topo em iOS */}
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>Iniciar Sessão</Text>

          <Text style={styles.subTitle}>
          Entra na tua conta para continuar a usar a HiCulture.
          </Text>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.inputText} // Texto digitado em preto
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              placeholder="Palavra-passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputText} // Texto digitado em preto
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordButton}
          >
            <Text style={styles.forgotPasswordText}>Esqueceste-te da palavra-passe?</Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <Button title="Entrar" onPress={handleLogin} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkBottom}>Não tens conta? Regista-te</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff', // Fundo branco para o SafeArea
  },
  container: {
    flex: 1,
    backgroundColor: '#fff', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,  // Ajuste moderado para "puxar" conteúdo para baixo
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
    width: '80%',
    marginBottom: 20,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 15,
  },
  inputText: {
    color: '#000', // Garante texto em preto
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginRight: '10%',
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#007aff',
  },
  buttonContainer: {
    marginTop: 30,
    width: '80%',
  },
  linkBottom: {
    marginTop: 20,
    fontSize: 14,
    color: '#007aff',
    textAlign: 'center',
  },
});
