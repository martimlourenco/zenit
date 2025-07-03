# 🎬 Hiculture

**Hiculture** é uma aplicação mobile de recomendação e partilha de filmes com funcionalidades sociais e integração de sistemas de recomendação baseados em IA.

## 📱 Funcionalidades Principais

- Autenticação de utilizadores (registo, login, recuperação de palavra-passe)
- Pesquisa por filmes e utilizadores
- Envio e receção de recomendações personalizadas
- Sistema de favoritos, gostos e não gostos
- Recomendações com base em:
  - Sistema content-based (TF-IDF + Nearest Neighbors)
  - Collaborative filtering
- Gestão de perfil de utilizador
- Interface responsiva e intuitiva desenvolvida com React Native (Expo)

---

## ⚙️ Tecnologias Utilizadas

- **Frontend:** React Native (Expo)
- **Backend:** Node.js, Express.js
- **Base de Dados:** PostgreSQL
- **Machine Learning:** Python, Flask, Scikit-learn
- **Autenticação:** JWT

---

## 🚀 Instruções de Instalação

### 1. Instalar dependências

npm install

    ⚠️ Nota: A pasta node_modules foi removida do repositório por questões de espaço.

2. Iniciar o Backend

cd backend
npm install
npm start

3. Iniciar o Frontend

cd frontend
npm install
npx expo start

4. Iniciar o Módulo de Machine Learning

Certifica-te de que tens o Python e as bibliotecas necessárias instaladas.

cd ml
pip install -r requirements.txt
python app.py
