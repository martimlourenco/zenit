import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function MovieCard({ movie }) {
  return (
    <View style={styles.card}>
      {/* Poster do filme, se existir */}
      {movie.poster_path && (
        <Image
          style={styles.image}
          source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
        />
      )}
      {/* Informações do filme: título e overview */}
      <View style={styles.info}>
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.overview} numberOfLines={3}>
          {movie.overview}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',    // Fundo branco, estilo iOS
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
    // Sombra leve (iOS/Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 150,
    resizeMode: 'cover',
  },
  info: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,          // Menor que antes, para estilo iOS
    fontWeight: '600',
    color: '#000',         // Texto escuro
    marginBottom: 5,
  },
  overview: {
    fontSize: 14,
    color: '#333',         // Texto cinza-escuro
  },
});
