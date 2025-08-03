import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
const app = express();
const server = createServer(app);
import dotenv from 'dotenv';
dotenv.config();

const ORIGIN = process.env.CLIENT_URL || "http://localhost:5173"; // Default origin if not set in .env

const io = new Server(server, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active sessions
const sessions = new Map();

// Generate unique session ID and return it
app.post('/api/create-session', (req, res) => {
  const sessionId = uuidv4();
  sessions.set(sessionId, {
    sharerLocation: null,
    viewerLocation: null,
    sharerSocketId: null,
    viewerSocketId: null,
    createdAt: new Date()
  });
  
  res.json({ sessionId });
});

// Get session info
app.get('/api/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({ sessionId, exists: true });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a location sharing session
  socket.on('join-session', (data) => {
    const { sessionId, role } = data; // role: 'sharer' or 'viewer'
    const session = sessions.get(sessionId);
    
    if (!session) {
      socket.emit('error', 'Session not found');
      return;
    }

    socket.join(sessionId);
    
    if (role === 'sharer') {
      session.sharerSocketId = socket.id;
      // Send current viewer location to sharer if available
      if (session.viewerLocation) {
        socket.emit('location-update', {
          location: session.viewerLocation,
          role: 'viewer'
        });
      }
    } else if (role === 'viewer') {
      session.viewerSocketId = socket.id;
      // Send current sharer location to viewer if available
      if (session.sharerLocation) {
        socket.emit('location-update', {
          location: session.sharerLocation,
          role: 'sharer'
        });
      }
    }

    sessions.set(sessionId, session);
    console.log(`${role} joined session ${sessionId}`);
  });

  // Update location
  socket.on('update-location', (data) => {
    const { sessionId, location, role } = data;
    const session = sessions.get(sessionId);
    
    if (!session) {
      socket.emit('error', 'Session not found');
      return;
    }

    // Update location in session
    if (role === 'sharer') {
      session.sharerLocation = location;
    } else if (role === 'viewer') {
      session.viewerLocation = location;
    }

    sessions.set(sessionId, session);

    // Broadcast location to other user in the session
    socket.to(sessionId).emit('location-update', {
      location,
      role
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up sessions where this socket was involved
    for (const [sessionId, session] of sessions.entries()) {
      if (session.sharerSocketId === socket.id) {
        session.sharerSocketId = null;
        session.sharerLocation = null;
      } else if (session.viewerSocketId === socket.id) {
        session.viewerSocketId = null;
        session.viewerLocation = null;
      }
      
      // Remove session if both users have disconnected
      if (!session.sharerSocketId && !session.viewerSocketId) {
        sessions.delete(sessionId);
        console.log(`Session ${sessionId} removed`);
      } else {
        sessions.set(sessionId, session);
      }
    }
  });
});

// Clean up old sessions (older than 24 hours)
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    const hoursDiff = (now - session.createdAt) / (1000 * 60 * 60);
    if (hoursDiff > 24) {
      sessions.delete(sessionId);
      console.log(`Cleaned up old session: ${sessionId}`);
    }
  }
}, 60000); // Check every minute

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});