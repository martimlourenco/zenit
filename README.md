🏅 Zenit

Zenit é uma aplicação multi-plataforma para gestão e participação em eventos desportivos, com funcionalidades sociais, sistema de gamificação e moderação, pensada para entusiastas do desporto que querem organizar, participar e competir de forma simples e envolvente.
📱 Funcionalidades Principais
1. Funcionalidades Gerais

    Autenticação de utilizadores (registo, login, recuperação de palavra-passe)

    Login com Google e Apple ID

    Edição de perfil (nome, fotografia, localidade, desporto favorito)

    Visualização de perfil (público e privado)

    Modo escuro/claro

    Notificações push e por email

2. Gestão de Eventos

    Criação e gestão de eventos desportivos (futebol, basquetebol, pádel, etc)

    Campos detalhados: nome, modalidade, localização (mapa integrado), data, hora, número de participantes, prémios

    Eventos abertos, por convite ou com reservas para externos

    Cancelamento e edição com notificações automáticas

    Requisitos de rank para organização de eventos ou torneios

    Criação de torneios para utilizadores experientes

3. Participação em Eventos

    Inscrição e desinscrição (com penalizações variáveis)

    Sistema de convites e aprovação pelo organizador

    Gestão da lista de participantes confirmados

    Filtros avançados para pesquisa de eventos

4. Estatísticas e Perfil

    Histórico detalhado de eventos organizados e participados

    Estatísticas financeiras e desportivas (total gasto, desporto mais praticado)

    Estatísticas visuais sobre frequência e preferências

5. Gamificação

    Sistema de Pontuação e Rank com progressão por ações e penalizações

    Leaderboards semanais e globais por desporto e localidade

    Sistema de Badges com conquistas permanentes e temporárias

    Desafios Semanais automáticos com recompensas em pontos

    Loja de Recompensas para troca de pontos por funcionalidades e personalização

6. Sistema de Reports e Moderação

    Reports por não comparência, atraso e má conduta

    Penalizações automáticas e sistema anti-abuso de reports

    Notificações à administração para casos suspeitos

7. Multi-Plataforma

    Aplicação desenvolvida em React Native + Expo

    Suporte iOS, Android e Web

    Interface responsiva adaptada a cada plataforma

    Partilha de eventos via URL para redes sociais e mensagens

⚙️ Tecnologias Utilizadas

    Frontend: React Native com Expo (monorepo para mobile e web)

    Backend: Node.js com Express ou Firebase Functions

    Base de Dados: PostgreSQL ou Firebase Firestore

    Autenticação: Firebase Auth ou Auth0 (incluindo login Google e Apple ID)

    Notificações: Firebase Cloud Messaging e Email (ex: SendGrid)

    Armazenamento: Firebase Storage ou Amazon S3 (imagens, badges)

🚀 Instruções de Instalação
1. Instalar dependências

npm install

⚠️ Nota: A pasta node_modules não está incluída no repositório por questões de espaço.
2. Backend

cd backend
npm install
npm start

3. Frontend

cd frontend
npm install
npx expo start

4. Configurações adicionais

    Configurar variáveis de ambiente para Firebase/Auth0, base de dados e serviços de notificação.

    Para envio de emails, configurar SendGrid ou serviço equivalente.

    Para armazenamento de imagens, configurar Firebase Storage ou Amazon S3.

📄 Licença

Este projeto está licenciado sob a licença MIT.
