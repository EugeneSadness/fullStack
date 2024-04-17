import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import "./Chat.css";


const socket = io("http://localhost:4000");

function Chat() {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem('token');

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);


    const { username, userid } = location.state;



    const[theme, setTheme] = useState("light");

    const switchTheme = ()=>{
        setTheme((cur)=>(cur === "light"?"dark":"light"))
    }


    if (token) {
        Axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        navigate("/", { replace: true });
        console.log("No token provided!");
    }



    const sendMessageAndPicture = () => {
        const messageData = { content: message, senderId: userid };
        socket.emit('chatMessage', messageData);
        setMessages(prevMessages => [...prevMessages, { content: message, senderId: userid}]);
        setMessage('');

    };


    const handleLogOut = () =>{
        localStorage.removeItem('token');
        navigate('/', {replace: true})
    }
    
    useEffect(() => {
        socket.on("chat message", async (data) => {
            const isMessageAlreadyPresent = messages.some(
                (msg) => msg.content === data.content && msg.senderId === data.senderId
            );
    
            if (!isMessageAlreadyPresent) {
                setMessages((prevMessages) => [...prevMessages, data]);
            }
        });
        return () => socket.off('chat message');
    }, [messages, socket]);


    return (
        <div className="UserForm" id={theme}>
            <button className="log-out-button" onClick={handleLogOut}>Log out</button>
            <input onChange={switchTheme} type="checkbox" id="toggle-btn"/>
            <label htmlFor="toggle-btn" className="toggle-label"></label>
            <h2 style={{color: theme === "light" ? "black" : "yellow"}} className="heading">
                User: {username}
            </h2>
            <h1 style={{color: theme === "light" ? "black" : "blue"}}>
                Chat
            </h1>

            {/*Messages*/}
            <div className="chat-container">
                <div style={{color: theme === "light" ? "black" : "yellow"}} className="messages">
                    <ul>
                        {messages.map((msg, index) => (
                            <li
                                key={index}
                                className={`${msg.senderId === userid ? "sent" : "received"}`}
                            >
                                {`${msg.senderId}: ${msg.content}`}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="input">
                <input
                    className="messages"
                    placeholder="Message..."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                />
                <button onClick={sendMessageAndPicture}>Send message</button>


            </div>

        </div>
    );

}

export default Chat;