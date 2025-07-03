import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

export default function UserLikesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { movies } = route.params; // "likes"

  const renderItem = ({ item }) => {
    const movie = item.Movie || item;
    return (
      <View style={styles.itemContainer}>
        {movie.poster_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
            style={styles.poster}
          />
        ) : (
          <View style={styles.noPoster}>
            <Text style={styles.noPosterText}>Sem Imagem</Text>
          </View>
        )}

        <View style={styles.infoContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('MovieDetails', { movieId: movie.tmdb_id })}
          >
            <Text style={styles.title} numberOfLines={1}>
              {movie.title}
            </Text>
            <Text style={styles.subtitle}>Like do utilizador</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!movies || movies.length === 0) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Likes</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum like.</Text>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Likes</Text>
        </View>

        <FlatList
          data={movies}
          keyExtractor={(item, index) => String(index)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  backButton: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff', marginLeft: 10 },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { color: '#fff', fontSize: 18 },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 12,
    marginHorizontal: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  poster: { width: 60, height: 90, borderRadius: 10, marginRight: 12, resizeMode: 'cover' },
  noPoster: {
    width: 60, height: 90, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  noPosterText: { fontSize: 10, color: '#ddd' },
  infoContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#ccc' },
});
