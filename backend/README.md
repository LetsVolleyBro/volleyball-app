# Volley Rio Backend 🏐

Simple Express.js + SQLite backend for the Volley Rio app.

## Setup

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /api/health` — Server status

### Matches
- `GET /api/matches` — Get all matches
- `GET /api/matches/:id` — Get single match
- `POST /api/matches` — Create new match
- `POST /api/matches/:matchId/join` — Join match
- `POST /api/matches/:matchId/leave` — Leave match

### Users
- `POST /api/users` — Create or get user by deviceId

## Database

Uses SQLite with three tables:
- `matches` — Volleyball matches
- `users` — App users (device-based)
- `match_players` — Match participants

Auto-creates `volleyball.db` on first run.

## Example Request

```bash
curl -X POST http://localhost:5000/api/matches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "3vs3",
    "location": "Copacabana Beach",
    "lat": -23.5505,
    "lng": -46.4244,
    "time": "10:00 AM",
    "date": "Apr 25",
    "maxPlayers": 6,
    "creatorId": "user-123"
  }'
```

## Next Steps

- Integrate with React Native frontend
- Add match filtering/search
- Add user profiles
- Deploy to cloud (Railway, Heroku, etc.)
