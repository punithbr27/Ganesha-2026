import { useState, useEffect } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ member_name: '', phone_number: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchMembers = async () => {
    try {
      const data = await api.get('/members');
      setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/members/${editingId}`, formData);
      } else {
        await api.post('/members', formData);
      }
      setIsModalOpen(false);
      setFormData({ member_name: '', phone_number: '' });
      setEditingId(null);
      fetchMembers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (m) => {
    setFormData({ member_name: m.member_name, phone_number: m.phone_number || '' });
    setEditingId(m.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member? All their collections will also be deleted.')) {
      try {
        await api.delete(`/members/${id}`);
        fetchMembers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const filteredMembers = members.filter(m => 
    m.member_name.toLowerCase().includes(search.toLowerCase()) || 
    m.id.toString().includes(search)
  );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1>Members</h1>
        {user && (
          <button 
            className="btn btn-primary d-none-mobile" 
            onClick={() => {
              setFormData({ member_name: '', phone_number: '' });
              setEditingId(null);
              setIsModalOpen(true);
            }}
            style={{ display: window.innerWidth > 768 ? 'inline-flex' : 'none' }}
          >
            <MdAdd /> Add Member
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex items-center gap-2" style={{ background: 'var(--accent-color)', padding: '12px', borderRadius: '8px' }}>
          <MdSearch size={20} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search by Name or ID..." 
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredMembers.map(m => (
          <div key={m.id} className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  background: 'var(--secondary-color)', 
                  color: 'white', 
                  borderRadius: '50%', 
                  width: '32px', height: '32px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  {m.id}
                </span>
                {m.member_name}
              </h3>
              {user && (
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(m)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <MdEdit size={20} />
                  </button>
                  <button onClick={() => handleDelete(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}>
                    <MdDelete size={20} />
                  </button>
                </div>
              )}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              <p>Phone: {m.phone_number || 'N/A'}</p>
              <p>Total Collected: <strong style={{ color: 'var(--text-primary)' }}>₹ {m.total_collected}</strong></p>
              <p>Last Collection: {m.last_collection ? new Date(m.last_collection).toLocaleDateString() : 'Never'}</p>
            </div>
          </div>
        ))}
      </div>

      {user && (
        <button 
          className="fab" 
          onClick={() => {
            setFormData({ member_name: '', phone_number: '' });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
        >
          <MdAdd />
        </button>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Member' : 'Add Member'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Member Name</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.member_name}
              onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number (Optional)</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Save
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Members;
