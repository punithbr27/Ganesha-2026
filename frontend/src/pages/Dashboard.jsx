import { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashData, contributorsData] = await Promise.all([
          api.get('/reports/dashboard'),
          api.get('/reports/top-contributors')
        ]);
        setStats(dashData);
        setTopContributors(contributorsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  const barData = {
    labels: topContributors.map(c => c.name),
    datasets: [
      {
        label: 'Top Members Collection',
        data: topContributors.map(c => c.total),
        backgroundColor: '#111111',
      }
    ]
  };

  return (
    <div className="animate-fade-in">
      <h1>Dashboard</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px', 
        marginBottom: '40px' 
      }}>
        <div className="card">
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Collection</h4>
          <h2>₹ {stats?.totalCollection || 0}</h2>
        </div>
        <div className="card">
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Expenses</h4>
          <h2>₹ {stats?.totalExpenses || 0}</h2>
        </div>
        <div className="card" style={{ borderBottom: '4px solid var(--secondary-color)' }}>
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Current Balance</h4>
          <h2>₹ {stats?.currentBalance || 0}</h2>
        </div>
        <div className="card">
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Members</h4>
          <h2>{stats?.totalMembers || 0}</h2>
        </div>
        <div className="card">
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Today's Collection</h4>
          <h2>₹ {stats?.todaysCollection || 0}</h2>
        </div>
        <div className="card">
          <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Today's Expenses</h4>
          <h2>₹ {stats?.todaysExpenses || 0}</h2>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Top Contributors</h3>
          <Bar data={barData} options={{ responsive: true }} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
