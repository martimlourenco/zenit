import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthdate, setBirthdate] = useState(null);
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { register } = useAuth();
  const navigation = useNavigation();

  const scrollRef = useRef(null);
  const [offsets, setOffsets] = useState({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Captura altura do teclado
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Guarda o y de cada campo
  const onLayoutField = key => e => {
    const { y, height } = e.nativeEvent.layout;
    setOffsets(prev => ({ ...prev, [key]: y + height / 2 }));
  };

  // Scroll ajustado ao teclado
  const scrollToField = key => {
    if (offsets[key] == null) return;
    const windowHeight = Dimensions.get('window').height;
    const spaceAboveKeyboard = windowHeight - keyboardHeight;
    // queremos o centro do campo no meio do espaço visível
    const targetY = offsets[key] - spaceAboveKeyboard / 2;
    scrollRef.current?.scrollTo({
      y: targetY > 0 ? targetY : 0,
      animated: true,
    });
  };

  const handleRegister = async () => {
    try {
      const birthdateString = birthdate
        ? format(birthdate, 'yyyy-MM-dd')
        : '';

      await register({
        name,
        username,
        email,
        password,
        birthdate: birthdateString,
        location,
        country,
      });

      Alert.alert('Success', 'Utilizador registado com sucesso!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Não foi possível registar.');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setBirthdate(selectedDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Criar uma Conta</Text>

          <View onLayout={onLayoutField('name')} style={styles.inputContainer}>
            <Input
              placeholder="Nome"
              value={name}
              onChangeText={setName}
              onFocus={() => scrollToField('name')}
              style={styles.inputText}
            />
          </View>

          <View onLayout={onLayoutField('username')} style={styles.inputContainer}>
            <Input
              placeholder="Nome de Utilizador"
              value={username}
              onChangeText={setUsername}
              onFocus={() => scrollToField('username')}
              style={styles.inputText}
            />
          </View>

          <View onLayout={onLayoutField('email')} style={styles.inputContainer}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => scrollToField('email')}
              style={styles.inputText}
            />
          </View>

          <View onLayout={onLayoutField('password')} style={styles.inputContainer}>
            <Input
              placeholder="Palavra-passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              onFocus={() => scrollToField('password')}
              style={styles.inputText}
            />
          </View>

          <View onLayout={onLayoutField('birthdate')} style={styles.inputContainer}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                scrollToField('birthdate');
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.dateText}>
                {birthdate
                  ? format(birthdate, 'yyyy-MM-dd')
                  : 'Selecionar Data'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthdate || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeDate}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View onLayout={onLayoutField('location')} style={styles.inputContainer}>
            <Input
              placeholder="Localidade"
              value={location}
              onChangeText={setLocation}
              onFocus={() => scrollToField('location')}
              style={styles.inputText}
            />
          </View>

          <View onLayout={onLayoutField('country')} style={styles.inputContainer}>
            <Input
              placeholder="País"
              value={country}
              onChangeText={setCountry}
              onFocus={() => scrollToField('country')}
              style={styles.inputText}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button title="Registar" onPress={handleRegister} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Já tens uma conta? Inicia sessão</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 15,
  },
  inputText: {
    color: '#000',
  },
  buttonContainer: {
    width: '80%',
    marginTop: 10,
  },
  link: {
    marginTop: 20,
    color: '#007aff',
    fontSize: 14,
  },
  label: {
    color: '#000',
    marginBottom: 5,
    fontWeight: '600',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    color: '#000',
  },
});
