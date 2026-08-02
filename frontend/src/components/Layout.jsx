import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MdDashboard, 
  MdPeople, 
  MdAttachMoney, 
  MdReceipt, 
  MdLogout 
} from 'react-icons/md';
import './Layout.css';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <MdDashboard /> },
    { name: 'Members', path: '/members', icon: <MdPeople /> },
    { name: 'Collections', path: '/collections', icon: <MdAttachMoney /> },
    { name: 'Expenses', path: '/expenses', icon: <MdReceipt /> },
  ];

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Ganesha</h2>
          <p>Collection Manager</p>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-link logout-btn" onClick={logout}>
            <MdLogout />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`bottom-nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
