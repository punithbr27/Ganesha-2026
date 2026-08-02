import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Collections from './pages/Collections';
import Expenses from './pages/Expenses';
import Login from './pages/Login';
import Setup from './pages/Setup';

const AppLayout = ({ children }) => {
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/members" element={<AppLayout><Members /></AppLayout>} />
        <Route path="/collections" element={<AppLayout><Collections /></AppLayout>} />
        <Route path="/expenses" element={<AppLayout><Expenses /></AppLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
