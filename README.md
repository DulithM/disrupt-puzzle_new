# Disrupt Puzzle - Backend Integration

This is a collaborative jigsaw puzzle game that integrates with the backend API to provide real-time puzzle solving.

## Features

- **Real-time Collaboration**: Multiple players can work on the same puzzle simultaneously
- **Backend Integration**: Connects to the puzzle API for live updates
- **QR Code System**: Each puzzle piece has a QR code for easy access
- **Mini-Game Challenge**: Players must complete a mini-puzzle to place pieces
- **Auto-progression**: Automatically moves to the next puzzle when complete

## Backend API Integration

The application integrates with the following endpoints:

### GET `/puzzel/image`
Fetches the current puzzle state:
```json
{
  "current_image": 1,
  "image_link": "/puzzles/image1.png",
  "status": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
}
```

### POST `/puzzel/image/update`
Updates a puzzle piece state:
```json
{
  "piece_index": 5,
  "state": 1
}
```

## Environment Configuration

Set the following environment variable:
```
NEXT_PUBLIC_API_BASE_URL=https://online.generationalpha.site
```

## How It Works

1. **Puzzle Loading**: The app fetches the current puzzle from the backend API
2. **Real-time Updates**: Polls the API every second for live updates
3. **Piece Placement**: When a player completes a mini-game, they can place a piece
4. **Collaboration**: All players see updates in real-time
5. **Auto-progression**: When all pieces are placed, the app automatically moves to the next puzzle

## Game Flow

1. Player scans QR code on a puzzle piece
2. Player completes the mini-puzzle challenge
3. Player enters their name and places the piece
4. The piece is updated on the backend
5. All players see the update in real-time
6. When puzzle is complete, automatically loads next puzzle

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

- **Frontend**: Next.js with TypeScript
- **State Management**: Custom hooks and real-time polling
- **UI Components**: shadcn/ui components
- **Backend Integration**: REST API with polling for real-time updates
- **QR Codes**: For easy piece access

