
<p align="center"> <img src="https://github.com/user-attachments/assets/028618f8-5eb4-410a-922b-a269f0ff7fa3" alt="Zenit Logo" width="480" /> </p>

Your gateway to organizing and competing in real-world sports events. Powered by gamification and social connection.

| [Contact Us](https://martimlourenco.github.io/zenit/)

🧠 What is Zenit?

Zenit is a cross-platform app that redefines how sports enthusiasts organize, join, and compete in real-world events. Through social features, gamification, and automated moderation, Zenit brings structure, competition, and community to local sports.
<p align="center"> <img src="https://github.com/user-attachments/assets/e89c10cb-3176-4446-bc4a-0589ff2a2a2e" alt="Zenit Poster" width="500" /> </p>

Whether you're hosting a casual 5-a-side game or a competitive padel tournament — Zenit has you covered.

✨ Key Features

✅ General

    Full user authentication: sign-up, login, password reset

    Login with Google and Apple ID

    Profile editing (photo, location, favorite sport)

    Dark/light theme support

    Push and email notifications

🏟️ Events

    Create and manage sports events (football, basketball, padel, etc.)

    Event fields: name, location (map), sport, date/time, participants, price

    Event types: public, invite-only, external-only

    Rank-based access to organize events

    Tournament mode for advanced users

    Automatic notifications for changes/cancellations

🙋 Participation

    Join/leave events (penalties for late exit optional)

    Approval workflow for organizers

    Invite registered or external participants

    Confirmation tracking

    Event filtering system

📊 Stats & Profile

    Full history of events created/joined

    Spending and participation analytics

    Visual dashboards and graphs

🕹️ Gamification

    Rank progression system

    Weekly and global leaderboards (by sport & region)

    Badge system (seasonal + permanent)

    Weekly challenges with XP rewards

    Reward store (features, cosmetics, etc.)

🛡️ Moderation

    Report system: no-show, lateness, misconduct

    Automatic penalties with anti-abuse checks

    Escalation process for edge cases
⚙️ Tech Stack

| **Layer**         | **Technology**                             |
| ----------------- | ------------------------------------------ |
| **Frontend**      | React Native + Expo (Web & Mobile)         |
| **Backend**       | Node.js with Express or Firebase Functions |
| **Database**      | PostgreSQL or Firebase Firestore           |
| **Auth**          | Firebase Auth / Auth0 (Google & Apple ID)  |
| **Media**         | Firebase Storage / Amazon S3               |
| **Notifications** | Firebase Cloud Messaging, SendGrid         |

🚀 Getting Started

1. Clone & install dependencies
```
git clone https://github.com/your-username/zenit.git
cd zenit
npm install
```
2. Run backend
```
cd backend
npm install
npm start
```
3. Run frontend
```
cd frontend
npm install
npx expo start
```
🔐 Configuration

You’ll need to set environment variables for:

    Firebase/Auth0 credentials

    PostgreSQL or Firestore connection strings

    SendGrid API key (email service)

    Firebase Storage or AWS S3 keys (media uploads)

    ⚠️ node_modules are excluded from version control.

💡 Vision


Zenit aims to become the default platform for sports coordination in the real world. From casual games to structured competitions, our goal is to make sports more accessible, engaging, and organized through smart technology.



📬 Contact


Got questions or suggestions?

Reach out via zenitsportshelp@gmail.com or open an issue.

📢 Coming Soon


    Admin Dashboard for moderation & analytics

    Calendar app integration

    Subscription model for premium features

    Public API for third-party integrations

🧑‍💼 Project Scope


Zenit was built to be production-ready, with modular architecture, and a strong focus on scalability, performance, and user engagement. Designed for real-world use by sports communities, local organizers, and competitive players
