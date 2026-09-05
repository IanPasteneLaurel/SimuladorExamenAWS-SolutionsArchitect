import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ExamMode from './pages/ExamMode';
import FlashMode from './pages/FlashMode';
import Progress from './pages/Progress';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/exam" element={<ExamMode />} />
      <Route path="/exam/:examId" element={<ExamMode />} />
      <Route path="/flash" element={<FlashMode />} />
      <Route path="/flash/:count" element={<FlashMode />} />
      <Route path="/progress" element={<Progress />} />
    </Routes>
  );
}
