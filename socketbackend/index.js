const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const axios = require('axios');
const app = express();
const cors = require('cors');

app.use(cors());
const server = http.Server(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const API_KEY = 'sk_4f16181b779d4d52a224a532d65243b7'; // Get your API key from IEX Cloud
// Allow cross-origin requests (you can restrict this to your frontend's domain)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected');
  // Subscribe to a stock symbol
  socket.on('subscribe', (symbol) => {
    const stockData = {
      symbol,
      price: 0, // Initialize with a placeholder price
    };
    socket.emit('stockData', stockData);
    // Fetch and update real-time stock data at regular intervals
    const updateInterval = setInterval(async () => {
      try {
        const response = await axios.get(`https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${API_KEY}`);
        stockData.price = response.data.latestPrice;
        socket.emit('stockData', stockData);
      } catch (error) {
        console.error(error);
      }
    }, 2000); // Update every 5 seconds (adjust as needed)
    // Unsubscribe from the stock symbol
    socket.on('unsubscribe', () => {
      clearInterval(updateInterval);
    });
  });
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.get('/', (req, res) => {
    res.send('Hello, world!');
} );
// Start the server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});