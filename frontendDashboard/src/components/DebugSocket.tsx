// src/components/SocketLogger.jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function SocketLogger() {
  const [logs, setLogs] = useState([]);

  useEffect(() => { 
    const socket = io('http://localhost:5000'); // change this if your backend runs on another host/port

    const log = (msg) => setLogs((prev) => [...prev, msg]);

    socket.on('connect', () => log('✅ Connected'));
    socket.on('auth_response', (data) => log(`📥 auth_response: ${JSON.stringify(data, null, 2)}`));
    socket.on('swap_initiated', (data) => log(`📥 swap_initiated: ${JSON.stringify(data, null, 2)}`));
    socket.on('swap_result', (data) => log(`📥 swap_result: ${JSON.stringify(data, null, 2)}`));
    socket.on('disconnect', () => log('⚠️ Disconnected'));
    socket.on('connect_error', (err) => log(`❌ Connection error: ${err.message}`));

    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ background: '#111', color: '#0f0', padding: '1rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      <h2>Socket.IO Debug Logs</h2>
      {logs.map((log, index) => <div key={index}>{log}</div>)}
    </div>
  );
}

