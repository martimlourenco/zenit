import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function Input({ placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize }) {
  return (
    <TextInput 
      style={styles.input} 
      placeholder={placeholder} 
      placeholderTextColor="#888" 
      value={value} 
      onChangeText={onChangeText} 
      secureTextEntry={secureTextEntry} 
      keyboardType={keyboardType} 
      autoCapitalize={autoCapitalize || 'none'} 
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 50,
    borderColor: '#222430',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#000'
  }
});
