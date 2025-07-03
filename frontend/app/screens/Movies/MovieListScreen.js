import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants/Config';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
function isComplete(movie) {
    return (
      !!movie.title &&
      !!movie.poster_path &&
      !!movie.overview &&
      !!movie.release_date &&
      movie.vote_average != null
    );
  }
  
export default function MovieListScreen() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/movies/list`);
      
      const sortedMovies = [...response.data.movies].sort((a, b) => {
        const aComplete = isComplete(a);
        const bComplete = isComplete(b);
      
        // 1) Filmes completos vêm antes dos incompletos
        if (aComplete && !bComplete) return -1;
        if (!aComplete && bComplete) return 1;
      
        // 2) Se ambos (in)completos, você pode aplicar outra regra.
        //    Exemplo: priorizar poster_path, ou ordenar por nota.
        //    Aqui vou só priorizar por nota decrescente:
        const aVote = a.vote_average || 0;
        const bVote = b.vote_average || 0;
        if (bVote !== aVote) {
          return bVote - aVote; // maior nota primeiro
        }
      
        // 3) Se empatar, priorizar poster_path:
        const aHasPoster = !!a.poster_path;
        const bHasPoster = !!b.poster_path;
        if (aHasPoster && !bHasPoster) return -1;
        if (!aHasPoster && bHasPoster) return 1;
      
        // 4) Se empatar, mantém a ordem original
        return 0;
      });
      
      
      setMovies(sortedMovies);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ========== DIVIDINDO FILMES EM SEÇÕES (EXEMPLO) ==========
  const topMovies = movies.slice(0, 6);      // Ex: 6 top
  const popularMovies = movies.slice(6, 14); // Ex: 8 populares
  const newMovies = movies.slice(14, 20);    // Ex: 6 novos
  const allMovies = movies.slice(20);        // Resto

  // Vamos criar um array de "seções" para renderizar no FlatList vertical
  const sections = [
    { id: 'section1', title: 'Top Filmes', type: 'horizontal', data: topMovies },
    { id: 'section2', title: 'Filmes Populares', type: 'grid2', data: popularMovies },
    { id: 'section3', title: 'Novos Filmes', type: 'horizontal', data: newMovies },
    { id: 'section4', title: 'Todos os Filmes', type: 'grid3', data: allMovies },
  ];

  // ========== RENDERIZADORES DE ITEM ==========

  // Item de lista horizontal (com ranking)
  const renderHorizontalItem = ({ item, index }) => {
    const rankingNumber = index + 1; // ranking
    return (
      <TouchableOpacity
        style={styles.horizontalItemContainer}
        onPress={() => navigation.navigate('MovieDetails', { movieId: item.tmdb_id })}
      >
        {/* Ranking Badge */}
        <View style={styles.rankingBadge}>
          <Text style={styles.rankingText}>{rankingNumber}</Text>
        </View>
        {item.poster_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w300${item.poster_path}` }}
            style={styles.moviePoster}
          />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>Sem Imagem</Text>
          </View>
        )}
        <Text style={styles.movieTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  // Item de grade (sem ranking)
  const renderGridItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.gridItemContainer}
        onPress={() => navigation.navigate('MovieDetails', { movieId: item.tmdb_id })}
      >
        {item.poster_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w300${item.poster_path}` }}
            style={styles.gridPoster}
          />
        ) : (
          <View style={styles.noImageGrid}>
            <Text style={styles.noImageText}>Sem Imagem</Text>
          </View>
        )}
        <Text style={styles.gridMovieTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  };

  // ========== RENDERIZADORES DE SEÇÃO ==========

  // Renderiza uma seção horizontal (swipe lateral)
  const renderHorizontalSection = (section) => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <FlatList
          data={section.data}
          keyExtractor={(item) => item.tmdb_id.toString()}
          renderItem={renderHorizontalItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          // Permite rolagem horizontal dentro do FlatList vertical
          nestedScrollEnabled
          contentContainerStyle={{ paddingHorizontal: 10 }}
        />
      </View>
    );
  };

  // Renderiza uma seção em grid (2 ou 3 colunas)
  const renderGridSection = (section, numColumns) => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <FlatList
          data={section.data}
          keyExtractor={(item) => item.tmdb_id.toString()}
          renderItem={renderGridItem}
          numColumns={numColumns}
          // Desativa scroll no grid, para não conflitar com o FlatList vertical
          scrollEnabled={false}
          contentContainerStyle={styles.gridContentContainer}
        />
      </View>
    );
  };

  // ========== RENDERIZA CADA "SEÇÃO" NA LISTA VERTICAL ==========

  const renderSection = ({ item: section }) => {
    if (!section.data || section.data.length === 0) return null;

    // Decide se é horizontal ou grid
    switch (section.type) {
      case 'horizontal':
        return renderHorizontalSection(section);
      case 'grid2':
        return renderGridSection(section, 2);
      case 'grid3':
        return renderGridSection(section, 3);
      default:
        return null;
    }
  };

  // ========== LAYOUT PRINCIPAL ==========

  return (
    <View style={styles.container}>
      {/* Cabeçalho com "martim" e ícone de busca */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HiCulture</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          style={styles.searchIconContainer}
        >
          <Ionicons name="search" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#999" />
        </View>
      ) : (
        // FlatList vertical principal: cada item é uma "seção"
        <FlatList
          data={sections}
          keyExtractor={(section) => section.id}
          renderItem={renderSection}
          // Dá um espaço ao final, para não ficar colado
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

// ========== ESTILOS ==========

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(88, 88, 88, 0.18)', // Fundo branco
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 0, // espaço para status bar
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  searchIconContainer: {
    padding: 5,
  },
  loadingContainer: {
    marginTop: 50,
    alignItems: 'center',
  },

  // Seções
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
    marginBottom: 10,
  },

  // ========== LISTA HORIZONTAL ==========
  horizontalItemContainer: {
    width: 120,
    marginRight: 10,
  },
  rankingBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 2,
    backgroundColor: '#007aff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  rankingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moviePoster: {
    width: 120,
    height: 180,
    borderRadius: 6,
    marginBottom: 5,
  },
  noImage: {
    width: 120,
    height: 180,
    borderRadius: 6,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  noImageText: {
    color: '#555',
  },
  movieTitle: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },

  // ========== GRADE (GRID) ==========
  gridContentContainer: {
    paddingHorizontal: 10,
  },
  gridItemContainer: {
    flex: 1,
    margin: 5,
    maxWidth: '50%', // se 2 colunas
    // se for 3 colunas, maxWidth pode ser '33%'
  },
  gridPoster: {
    width: '100%',
    aspectRatio: 2 / 3, // proporção aproximada de poster
    borderRadius: 6,
    marginBottom: 5,
    resizeMode: 'cover',
  },
  noImageGrid: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 6,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  gridMovieTitle: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
});
