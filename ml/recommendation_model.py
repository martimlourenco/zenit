import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.neighbors import NearestNeighbors

from data_preparation import get_data

# Variáveis globais para armazenar os modelos treinados e dados
content_model = None
collaborative_model = None
tfidf_matrix = None
movie_ids = None
user_movie_matrix = None

def train_models():
    """
    Extrai os dados da base e treina os modelos:
      - Content-based: TF-IDF + NearestNeighbors
      - Collaborative: Matriz usuário-filme + NearestNeighbors
    """
    global content_model, collaborative_model, tfidf_matrix, movie_ids, user_movie_matrix

    # Obter os dados: movies (com gêneros), favorites e likes/dislikes
    data = get_data()
    movies_df = data['movies']       # DataFrame com informações dos filmes (incluindo coluna 'genres')
    favorites_df = data['favorites']   # DataFrame com favoritos
    likes_df = data['likes']           # DataFrame com likes/dislikes

    # ----- Content-based -----
    # Combina overview e gêneros em um único texto
    movies_df['combined'] = movies_df['overview'].fillna('') + ' ' + movies_df['genres'].fillna('')

    # Vetorização do texto com TF-IDF
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(movies_df['combined'])

    # Modelo de vizinhos para calcular similaridade entre filmes
    content_model = NearestNeighbors(metric='cosine', algorithm='brute')
    content_model.fit(tfidf_matrix)

    # ----- Collaborative Filtering -----
    # Constrói uma lista de ratings a partir de favoritos e likes/dislikes:
    # - favorito = 2, like = 1, dislike = -1
    ratings = []
    for _, row in favorites_df.iterrows():
        ratings.append({'user_id': row['user_id'], 'movie_id': row['movie_id'], 'rating': 2})
    for _, row in likes_df.iterrows():
        rating = 1 if row['type'] == 'like' else -1
        ratings.append({'user_id': row['user_id'], 'movie_id': row['movie_id'], 'rating': rating})
    ratings_df = pd.DataFrame(ratings)

    # Cria a matriz pivô: linhas = user_id, colunas = movie_id, valores = rating
    user_movie_matrix = ratings_df.pivot_table(index='user_id', columns='movie_id', values='rating', fill_value=0)

    # Modelo de vizinhos para o filtering colaborativo
    collaborative_model = NearestNeighbors(metric='cosine', algorithm='brute')
    collaborative_model.fit(user_movie_matrix.values)

    # Armazena os IDs dos filmes (para mapear índices do TF-IDF com movie_id)
    movie_ids = movies_df['id'].tolist()

def recommend_movies(user_id, top_n=5):
    """
    Gera recomendações combinando os dois métodos para um dado user_id.
    """
    # Treina os modelos se ainda não estiverem treinados
    if content_model is None or collaborative_model is None:
        train_models()

    # Recarrega os dados
    data = get_data()
    movies_df = data['movies']
    favorites_df = data['favorites']
    likes_df = data['likes']

    # Filtra as interações do usuário
    user_favorites = favorites_df[favorites_df['user_id'] == user_id]['movie_id'].tolist()
    user_likes = likes_df[(likes_df['user_id'] == user_id) & (likes_df['type'] == 'like')]['movie_id'].tolist()
    user_dislikes = likes_df[(likes_df['user_id'] == user_id) & (likes_df['type'] == 'dislike')]['movie_id'].tolist()

    # ----- Recomendação Content-based -----
    content_recs = set()
    for movie in user_favorites:
        # Encontra o índice do filme no DataFrame
        try:
            idx = movies_df[movies_df['id'] == movie].index[0]
        except IndexError:
            continue
        distances, indices = content_model.kneighbors(tfidf_matrix[idx], n_neighbors=top_n+1)
        # Ignora o próprio filme (primeiro índice) e adiciona os demais
        for i in indices.flatten()[1:]:
            content_recs.add(movies_df.iloc[i]['id'])

    # ----- Recomendação Collaborative Filtering -----
    if user_id in user_movie_matrix.index:
        user_vector = user_movie_matrix.loc[user_id].values.reshape(1, -1)
        distances, indices = collaborative_model.kneighbors(user_vector, n_neighbors=top_n+1)
        collab_recs = set()
        # Para cada vizinho (exceto o próprio usuário), pega filmes com avaliação positiva
        for i in indices.flatten():
            neighbor_user_id = user_movie_matrix.index[i]
            if neighbor_user_id == user_id:
                continue
            neighbor_ratings = user_movie_matrix.loc[neighbor_user_id]
            pos_movies = neighbor_ratings[neighbor_ratings > 0].index.tolist()
            collab_recs.update(pos_movies)
    else:
        collab_recs = set()

    # ----- Combinação dos dois métodos -----
    combined_recs = content_recs.union(collab_recs)

    # Exclui filmes já avaliados pelo usuário (favoritos, likes ou dislikes)
    interacted = set(user_favorites + user_likes + user_dislikes)
    final_recs = [mid for mid in combined_recs if mid not in interacted]

    # Seleciona apenas os top_n resultados
    final_recs = final_recs[:top_n]

    # Retorna os detalhes dos filmes recomendados
    rec_movies = movies_df[movies_df['id'].isin(final_recs)]
    return rec_movies.to_dict(orient='records')
