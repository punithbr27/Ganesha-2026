import { useState, useEffect } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', expense_date: new Date().toISOString().split('T')[0], amount: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchExpenses = async () => {
    try {
      const data = await api.get('/expenses');
      setExpenses(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/expenses/${editingId}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      setIsModalOpen(false);
      setFormData({ title: '', expense_date: new Date().toISOString().split('T')[0], amount: '', description: '' });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEdit = (e) => {
    setFormData({
      title: e.title,
      expense_date: new Date(e.expense_date).toISOString().split('T')[0],
      amount: e.amount,
      description: e.description || ''
    });
    setEditingId(e.id);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h1>Expenses</h1>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setFormData({ title: '', expense_date: new Date().toISOString().split('T')[0], amount: '', description: '' });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          style={{ display: window.innerWidth > 768 ? 'inline-flex' : 'none' }}
        >
          <MdAdd /> Add Expense
        </button>
      </div>

      <div className="card table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id}>
                <td>{new Date(e.expense_date).toLocaleDateString()}</td>
                <td style={{ fontWeight: '500' }}>{e.title}</td>
                <td style={{ color: 'var(--danger-color)', fontWeight: '600' }}>-₹ {e.amount}</td>
                <td>{e.description || '-'}</td>
                <td>
                  <button onClick={() => handleEdit(e)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px' }}><MdEdit size={18} /></button>
                  <button onClick={() => handleDelete(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}><MdDelete size={18} /></button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No expenses found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button 
        className="fab" 
        onClick={() => {
          setFormData({ title: '', expense_date: new Date().toISOString().split('T')[0], amount: '', description: '' });
          setEditingId(null);
          setIsModalOpen(true);
        }}
        style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
      >
        <MdAdd />
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Expense Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input 
              type="date" 
              className="form-control" 
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
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
            <label className="form-label">Description (Optional)</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save</button>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
