import { useState, useEffect } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ member_id: '', collection_date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    try {
      const [colls, mems] = await Promise.all([
        api.get('/collections'),
        api.get('/members')
      ]);
      setCollections(colls);
      setMembers(mems);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/collections/${editingId}`, formData);
      } else {
        await api.post('/collections', formData);
      }
      setIsModalOpen(false);
      setFormData({ member_id: '', collection_date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this collection?')) {
      try {
        await api.delete(`/collections/${id}`);
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEdit = (c) => {
    setFormData({
      member_id: c.member_id,
      collection_date: new Date(c.collection_date).toISOString().split('T')[0],
      amount: c.amount,
      remarks: c.remarks || ''
    });
    setEditingId(c.id);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1>Daily Collections</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setFormData({ member_id: '', collection_date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          style={{ display: window.innerWidth > 768 ? 'inline-flex' : 'none' }}
        >
          <MdAdd /> Add Collection
        </button>
      </div>

      <div className="card table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Member</th>
              <th>Amount</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map(c => (
              <tr key={c.id}>
                <td>{new Date(c.collection_date).toLocaleDateString()}</td>
                <td>{c.member?.member_name} ({c.member_id})</td>
                <td style={{ fontWeight: '600' }}>₹ {c.amount}</td>
                <td>{c.remarks || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px' }}><MdEdit size={18} /></button>
                  <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}><MdDelete size={18} /></button>
                </td>
              </tr>
            ))}
            {collections.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No collections found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button 
        className="fab" 
        onClick={() => {
          setFormData({ member_id: '', collection_date: new Date().toISOString().split('T')[0], amount: '', remarks: '' });
          setEditingId(null);
          setIsModalOpen(true);
        }}
        style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
      >
        <MdAdd />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Collection' : 'Add Collection'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Member</label>
            <select 
              className="form-control" 
              value={formData.member_id}
              onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
              required
            >
              <option value="">Select Member</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.id} - {m.member_name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={formData.collection_date}
              onChange={(e) => setFormData({ ...formData, collection_date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input 
              type="number" 
              className="form-control" 
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Remarks (Optional)</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save</button>
        </form>
      </Modal>
    </div>
  );
};

export default Collections;
