import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FactCheckPage from './pages/FactCheckPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/check" element={<FactCheckPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
