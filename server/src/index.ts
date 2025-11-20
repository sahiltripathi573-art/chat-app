import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for now, update for production
        methods: ["GET", "POST"]
    }
});

let onlineUsers: { id: string; username: string; room: string }[] = [];

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Chat Server is running');
});

app.get('/admin', (req, res) => {
    // Group users by room
    const roomStats: { [key: string]: { users: typeof onlineUsers; count: number } } = {};

    onlineUsers.forEach(user => {
        if (!roomStats[user.room]) {
            roomStats[user.room] = { users: [], count: 0 };
        }
        roomStats[user.room].users.push(user);
        roomStats[user.room].count++;
    });

    const totalRooms = Object.keys(roomStats).length;
    const totalUsers = onlineUsers.length;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Server Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 2rem;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        h1 {
            color: white;
            text-align: center;
            margin-bottom: 2rem;
            font-size: 2.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        .stat-card {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-number {
            font-size: 3rem;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 0.5rem;
        }
        .stat-label {
            color: #666;
            font-size: 1.1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .rooms-container {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .room-card {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
        }
        .room-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .room-id {
            font-size: 1.3rem;
            font-weight: bold;
            color: #333;
        }
        .user-count {
            background: #667eea;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-weight: bold;
        }
        .users-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .user-tag {
            background: white;
            border: 2px solid #667eea;
            color: #667eea;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        .empty-state {
            text-align: center;
            padding: 3rem;
            color: #999;
            font-size: 1.2rem;
        }
        .refresh-btn {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: white;
            color: #667eea;
            border: none;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.2s;
        }
        .refresh-btn:hover {
            transform: scale(1.05);
        }
        .timestamp {
            text-align: center;
            color: white;
            margin-top: 2rem;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Chat Server Dashboard</h1>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${totalRooms}</div>
                <div class="stat-label">Active Rooms</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalUsers}</div>
                <div class="stat-label">Online Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${totalUsers > 0 ? (totalUsers / Math.max(totalRooms, 1)).toFixed(1) : 0}</div>
                <div class="stat-label">Avg Users/Room</div>
            </div>
        </div>

        <div class="rooms-container">
            <h2 style="margin-bottom: 1.5rem; color: #333;">Active Rooms</h2>
            ${totalRooms === 0 ?
            '<div class="empty-state">No active rooms at the moment</div>' :
            Object.entries(roomStats).map(([roomId, data]) => `
                    <div class="room-card">
                        <div class="room-header">
                            <div class="room-id">Room: ${roomId}</div>
                            <div class="user-count">${data.count} ${data.count === 1 ? 'user' : 'users'}</div>
                        </div>
                        <div class="users-list">
                            ${data.users.map(user => `
                                <div class="user-tag">${user.username}</div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')
        }
        </div>

        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
        
        <div class="timestamp">
            Last updated: ${new Date().toLocaleString()}
        </div>
    </div>

    <script>
        // Auto-refresh every 5 seconds
        setTimeout(() => location.reload(), 5000);
    </script>
</body>
</html>
    `;

    res.send(html);
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_room', (data) => {
        const { username, room } = data;
        socket.join(room);
        console.log(`User ${username} (${socket.id}) joined room: ${room}`);

        // Add to online users if not already there
        const existingUser = onlineUsers.find((u) => u.id === socket.id);
        if (!existingUser) {
            onlineUsers.push({ id: socket.id, username, room });
        }

        // Get all users in this room
        const roomUsers = onlineUsers.filter((user) => user.room === room);
        io.to(room).emit('chatroom_users', roomUsers);
    });

    socket.on('send_message', (data) => {
        console.log('Message received:', data);
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        const userToRemove = onlineUsers.find((user) => user.id === socket.id);

        if (userToRemove) {
            onlineUsers = onlineUsers.filter((user) => user.id !== socket.id);
            const roomUsers = onlineUsers.filter((user) => user.room === userToRemove.room);
            io.to(userToRemove.room).emit('chatroom_users', roomUsers);
        }
    });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
