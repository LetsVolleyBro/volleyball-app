# Volley Rio ⚡

A volleyball match coordination app for Rio de Janeiro built with React Native + Expo.

## 🎯 Features

- **🗺️ Map View** — See all active volleyball matches on a map of Rio
- **📋 List View** — Browse available matches with player counts
- **➕ Create Matches** — Post new matches for other players to join
- **👥 Join Matches** — Real-time player tracking
- **⚙️ Backend Integration** — All data synced with backend API

## 🚀 Quick Start

### Frontend (Snack)

1. Go to [Snack Expo](https://snack.expo.dev)
2. Import this repo: `LetsVolleyBro/volleyball-app`
3. Scan QR code with your phone (Expo Go app)
4. Start playing!

### Backend (Node.js)

Backend runs separately on port 5000:

```bash
cd ../volley-backend
npm install
npm start
```

Server runs at: `http://localhost:5000/api`

## 📁 Project Structure

```
volleyball-app/          # Frontend (React Native + Expo)
├── app.js              # Main app component
├── api.js              # API client functions
├── package.json        # Dependencies
└── assets/            # Images/static files

../volley-backend/      # Backend API (Node.js + SQLite)
├── server.js          # Express server
├── package.json       # Dependencies
└── volleyball.db      # SQLite database
```

## 🔌 API Endpoints

- `GET /api/health` — Server status
- `GET /api/matches` — Get all matches
- `POST /api/matches` — Create match
- `POST /api/matches/:id/join` — Join match
- `POST /api/users` — Create/get user

## 🛠️ Tech Stack

- **Frontend:** React Native, Expo, React Native Maps
- **Backend:** Node.js, Express, SQLite
- **Animations:** React Native Animated API
- **State:** React Hooks + AsyncStorage

## 📲 How It Works

1. **User Setup** — App generates unique device ID on first launch
2. **Load Matches** — Fetches all matches from backend on startup
3. **Create Match** — Posts to backend, saves to database, refreshes list
4. **Join Match** — Adds user to match_players table, increments count
5. **Real-time** — Map and list update instantly after actions

## ⚠️ Important

- Backend must be running for app to work
- On mobile (real device), change `localhost` to your computer's IP in `api.js`
- Matches are stored in SQLite database (survives app restarts)

## 🎮 Next Steps

- [ ] User authentication (email/phone)
- [ ] Match chat
- [ ] Player ratings/reviews
- [ ] Push notifications
- [ ] Deploy backend to cloud
- [ ] Production database

---

Built with ⚡ for Rio volleyball players!
