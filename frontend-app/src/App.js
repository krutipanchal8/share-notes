import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import FolderStructure from './documentList';

function App() {
  return (
    <div style={{ height: '100vh' }}>
    <Router>
      <Routes>
        <Route path='/' element={<FolderStructure />} />
        <Route path='/documents' element={<FolderStructure />} />
      </Routes>
    </Router>
    </div>
  );
}

export default App;
