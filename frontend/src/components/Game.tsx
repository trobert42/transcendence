import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

export interface Message {
  content: string;
  destination: string;
}

const GamePage: React.FC = () => {
  const [postedMessages, setPostedMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const accessToken = document.cookie.replace(
      /(?:(?:^|.*;\s*)accessToken\s*=\s*([^;]*).*$)|^.*$/,
      '$1',
    );

    const io = require('socket.io-client');
    const socket = io(process.env.REACT_APP_SITE_URL + ':3333/', {
      withCredentials: true,
      transports: ['websocket'],
      query: {
        token: accessToken,
      },
    });

    socket.on('connect', () => {
      console.log('websocket with server opened.');
      socket.connect();
    });

    socket.on('disconnect', () => {
      console.log('websocket with server closed.');
      socket.disconnect();
    });

    socket.on('message', (message: Message) => {
      setPostedMessages((prevMessages: any) => [...prevMessages, message]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      const msg: Message = { content: inputMessage, destination: 'boobs' };
      console.log('Socket datas : ', socket);
      socket?.emit('message', msg);
      console.log('Message sent.');
      setInputMessage('');
    }
  };

  return (
    <div>
      <div>
        <ul>
          {postedMessages.map((msg, index) => (
            <li key={index}>{msg.content}</li>
          ))}
        </ul>
      </div>
      <div>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default GamePage;
