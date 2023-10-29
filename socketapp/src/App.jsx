import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Use the correct server URL and port

function App() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState({ symbol: '', price: 0 });
  const handleSubscribe = () => {
    socket.emit('subscribe', symbol); // emit the subscribe event with the symbol state
  };
  const handleUnsubscribe = () => {
    socket.emit('unsubscribe');
    setStockData({ symbol: '', price: 0 });
  };
  useEffect(() => {
    socket.on('stockData', (data) => {
      console.log('data-------------->', data);
      setStockData(data); // update the stockData state with the received data
    });
    return () => {
      socket.off('stockData');
    };
  }, []);
  return (
    <div className="App">
      <h1>Real-Time Stock Market Tracker</h1>
      <div>
        <input
          type="text"
          placeholder="Enter Stock Symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <button onClick={handleSubscribe}>Subscribe</button>
        <button onClick={handleUnsubscribe}>Unsubscribe</button>
      </div>
      <div>
        {stockData.symbol && (
          <div>
            <h2>Symbol: {stockData.symbol}</h2>
            <h2>Price: ${stockData.price.toFixed(2)}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
export default App