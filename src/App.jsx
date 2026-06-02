import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import PipelineStatus from './pages/PipelineStatus';
import VideoPlayer from './pages/VideoPlayer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateProject />} />
            <Route path="/processing" element={<PipelineStatus />} />
            <Route path="/video/:id" element={<VideoPlayer />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
