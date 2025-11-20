import { useState, useEffect } from 'react'
import io, { Socket } from 'socket.io-client'
import './App.css'

const params = new URLSearchParams(window.location.search);
const serverUrl = params.get("server") || import.meta.env.VITE_SERVER_URL || "http://localhost:3001";
const socket: Socket = io(serverUrl);

interface Message {
    room: string;
    author: string;
    message: string;
    time: string;
}

interface User {
    id: string;
    username: string;
    room: string;
}



function App() {
    const [username, setUsername] = useState("");
    const [room, setRoom] = useState(params.get("room") || "");
    const [showChat, setShowChat] = useState(false);
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    const joinRoom = () => {
        if (username !== "") {
            let roomToJoin = room;
            if (roomToJoin === "") {
                roomToJoin = Math.random().toString(36).substring(2, 7);
                setRoom(roomToJoin);
            }
            socket.emit("join_room", { room: roomToJoin, username });
            setShowChat(true);
        }
    };

    const copyInviteLink = () => {
        const inviteLink = `${window.location.origin}/?room=${room}&server=${encodeURIComponent(serverUrl)}`;
        navigator.clipboard.writeText(inviteLink);
        alert("Invite link copied to clipboard!");
    };

    const sendMessage = async () => {
        if (currentMessage !== "") {
            const messageData: Message = {
                room: room,
                author: username,
                message: currentMessage,
                time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
            };

            await socket.emit("send_message", messageData);
            setMessageList((list) => [...list, messageData]);
            setCurrentMessage("");
        }
    };

    useEffect(() => {
        const handleReceiveMessage = (data: Message) => {
            setMessageList((list) => [...list, data]);
        };

        const handleChatroomUsers = (data: User[]) => {
            setUsers(data);
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("chatroom_users", handleChatroomUsers);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("chatroom_users", handleChatroomUsers);
        };
    }, []);

    return (
        <div className="App">
            {!showChat ? (
                <div className="join-container">
                    <h3>Join A Chat</h3>
                    <input
                        type="text"
                        placeholder="John..."
                        onChange={(event) => {
                            setUsername(event.target.value);
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Room ID (leave empty for new)"
                        value={room}
                        onChange={(event) => {
                            setRoom(event.target.value);
                        }}
                    />
                    <button onClick={joinRoom}>Join A Room</button>
                </div>
            ) : (
                <div className="chat-container">
                    <div className="brand-header">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h3>Brand Logo</h3>
                            <div className="user-list">
                                {users.map((user) => (
                                    <div key={user.id} className="user-item">
                                        <img src="/avatar.png" alt="User Avatar" className="user-avatar" />
                                        <span className="user-name">{user.username}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="chat-header">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p>Live Chat - Room {room}</p>
                            <button onClick={copyInviteLink} style={{ padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>Copy Link</button>
                        </div>
                    </div>
                    <div className="chat-messages">
                        {messageList.map((messageContent, index) => {
                            return (
                                <div
                                    key={index}
                                    className={`message-container ${username === messageContent.author ? "sent" : "received"}`}
                                >
                                    <div className="message-meta">
                                        <p>{messageContent.author} · {messageContent.time}</p>
                                    </div>
                                    <div className="message-bubble">
                                        <p>{messageContent.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            value={currentMessage}
                            placeholder="Type a message..."
                            onChange={(event) => {
                                setCurrentMessage(event.target.value);
                            }}
                            onKeyPress={(event) => {
                                event.key === "Enter" && sendMessage();
                            }}
                        />
                        <button onClick={sendMessage}>&#9658;</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App
