import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Timeline from './pages/Timeline';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import TeachingVideo from './pages/TeachingVideo';
import Quantitative from './pages/Quantitative';
import SnakeGame from './components/SnakeGame';

function App() {
  const [posts, setPosts] = useState([]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/blog" element={<Blog posts={posts} setPosts={setPosts} />} />
        <Route path="/blog/:id" element={<BlogPost posts={posts} />} />
        <Route path="/teaching-video" element={<TeachingVideo />} />
        <Route path="/quantitative" element={<Quantitative />} />
        <Route path="/snake" element={<SnakeGame />} />
      </Routes>
    </Router>
  );
}

export default App;