from flask import Flask, jsonify

from recommendation_model import recommend_movies  # Importa a função de recomendação

app = Flask(__name__)

# Página inicial
@app.route('/')
def home():
    return "Bem-vindo à API de recomendações de filmes! Use a rota /machinelearning/<id> para obter recomendações."

# Rota para obter recomendações via IA
@app.route('/machinelearning/<int:id>', methods=['GET'])
def get_machine_learning_recommendations(id):
    """
    Endpoint que recebe um id (do usuário) e retorna os filmes recomendados.
    """
    recommendations = recommend_movies(id)
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True, host='192.168.1.75', port=5000)

