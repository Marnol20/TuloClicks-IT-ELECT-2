import React, { useState } from 'react';
import axios from 'axios';

const Support = () => {
  const [formData, setFormData] = useState({
    subject: '',
    issue_type: 'technical',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Kuhaa ang token gikan sa localStorage
    // Siguroha nga 'token' ang key name nga imong gigamit pag-save sa login
    const token = localStorage.getItem('token'); 

    try {
      // 2. I-pasa ang token sa headers para sa authMiddleware
      await axios.post('http://localhost:5000/api/support', formData, { 
        headers: {
          Authorization: `Bearer ${token}` 
        },
        withCredentials: true 
      });

      alert('Success: Your ticket has been submitted!');
      setFormData({ subject: '', issue_type: 'technical', description: '' });
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        alert('Error: Unauthorized. Please logout and login again.');
      } else {
        alert('Error: Could not send ticket.');
      }
    }
  };

  return (
    <div className="support-container" style={{ padding: '20px', color: 'white' }}>
      <h2>Contact Support</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '500px', marginTop: '20px' }}>
        
        <input 
          type="text" 
          placeholder="Subject" 
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }}
          required 
        />

        <select 
          value={formData.issue_type}
          onChange={(e) => setFormData({...formData, issue_type: e.target.value})}
          style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }}
        >
          <option value="technical">Technical Issue</option>
          <option value="refund">Refund</option>
          <option value="complaint">Complaint</option>
          <option value="other">Other</option>
        </select>

        <textarea 
          placeholder="Describe your issue..." 
          rows="5"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          style={{ padding: '10px', borderRadius: '5px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155' }}
          required
        ></textarea>

        <button 
          type="submit" 
          style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
};

export default Support;