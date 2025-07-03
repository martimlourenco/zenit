import pandas as pd
from sqlalchemy import create_engine

# Configurações do banco de dados
DB_NAME = 'app'
DB_USER = 'postgres'
DB_PASS = '2004'
DB_HOST = '192.168.1.75'
DB_DIALECT = 'postgresql'

# Cria a conexão
CONNECTION_STRING = f'{DB_DIALECT}://{DB_USER}:{DB_PASS}@{DB_HOST}:5432/{DB_NAME}'
engine = create_engine(CONNECTION_STRING)

def get_data():
    """
    Extrai os dados das tabelas Movies, Favorites, LikeDislikes, MovieGenres e Genres.
    """
    try:
        # Filmes
        movies_query = """
            SELECT id, tmdb_id, title, overview, release_date, poster_path, backdrop_path, vote_average 
            FROM "Movies"
        """
        movies_df = pd.read_sql(movies_query, engine)

        # Favoritos
        favorites_query = """SELECT user_id, movie_id FROM "Favorites" """
        favorites_df = pd.read_sql(favorites_query, engine)

        # Likes/Dislikes
        likes_query = """SELECT user_id, movie_id, type FROM "LikeDislikes" """
        likes_df = pd.read_sql(likes_query, engine)

        # MovieGenres (corrigido para renomear colunas)
        moviegenres_query = """SELECT "MovieId", "GenreId" FROM "MovieGenres" """
        moviegenres_df = pd.read_sql(moviegenres_query, engine)
        moviegenres_df.rename(columns={"MovieId": "movie_id", "GenreId": "genre_id"}, inplace=True)

        # Gêneros
        genres_query = """SELECT id, name FROM "Genres" """
        genres_df = pd.read_sql(genres_query, engine)

        # Mescla MovieGenres com Genres para obter os nomes dos gêneros
        mg_genres = pd.merge(moviegenres_df, genres_df, left_on='genre_id', right_on='id', how='left')

        # Agrupa os gêneros por movie_id e junta os nomes em uma única string
        if not mg_genres.empty:
            genres_agg = mg_genres.groupby('movie_id')['name'].apply(lambda x: ' '.join(x.dropna().astype(str))).reset_index()
            genres_agg.rename(columns={'name': 'genres'}, inplace=True)
        else:
            genres_agg = pd.DataFrame(columns=['movie_id', 'genres'])  # Evita erro ao mesclar

        # Mescla os gêneros agregados ao DataFrame de filmes
        movies_df = pd.merge(movies_df, genres_agg, left_on='id', right_on='movie_id', how='left')
        movies_df.drop(columns=['movie_id'], inplace=True, errors='ignore')

        # Caso algum filme não tenha gênero, preenche com string vazia
        movies_df['genres'] = movies_df['genres'].fillna('')

        return {
            'movies': movies_df,
            'favorites': favorites_df,
            'likes': likes_df
        }
    
    except Exception as e:
        print(f"Erro ao obter os dados: {e}")
        return None
    
    finally:
        engine.dispose()  # Fecha a conexão corretamente

