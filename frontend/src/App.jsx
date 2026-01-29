import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/Register';
import Submit from './pages/Submit';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="register" element={<Register />} />
        <Route path="submit" element={<Submit />} />
      </Route>
    </Routes>
  );
}

export default App;
