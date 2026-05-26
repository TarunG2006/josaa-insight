import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Compare from './pages/Compare';
import AIChat from './pages/AIChat';
import Trends from './pages/Trends';
import Favorites from './pages/Favorites';

export default function App() {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (item) => {
    const key = `${item.institute}|${item.program}|${item.category}`;
    setFavorites(prev => {
      const exists = prev.find(f => `${f.institute}|${f.program}|${f.category}` === key);
      return exists
        ? prev.filter(f => `${f.institute}|${f.program}|${f.category}` !== key)
        : [...prev, item];
    });
  };

  const removeFavorite = (item) => {
    const key = `${item.institute}|${item.program}|${item.category}`;
    setFavorites(prev => prev.filter(f => `${f.institute}|${f.program}|${f.category}` !== key));
  };

  const isFavorite = (item) => {
    const key = `${item.institute}|${item.program}|${item.category}`;
    return favorites.some(f => `${f.institute}|${f.program}|${f.category}` === key);
  };

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={
          <Dashboard
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            isFavorite={isFavorite}
          />
        } />
        <Route path="/compare" element={<Compare />} />
        <Route path="/ai-chat" element={<AIChat />} />
        <Route path="/trends" element={<Trends />} />
        <Route path="/favorites" element={
          <Favorites favorites={favorites} onRemove={removeFavorite} />
        } />
      </Routes>
    </BrowserRouter>
  );
}