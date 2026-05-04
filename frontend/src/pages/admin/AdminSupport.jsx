import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/support/admin/all', { 
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true 
      });
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/support/${id}/status`, 
        { status: newStatus },
        { 
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true 
        }
      );
      fetchTickets();
      alert('Ticket status updated successfully!');
    } catch (err) {
      console.error("Failed to update status", err);
      alert('Error updating status');
    }
  };

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2>Support Tickets Management</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#1e293b', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>User</th>
            <th style={{ padding: '12px' }}>Subject</th>
            <th style={{ padding: '12px' }}>Type</th>
            <th style={{ padding: '12px' }}>Status</th>
            <th style={{ padding: '12px' }}>Date</th>
            <th style={{ padding: '12px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id} style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '12px' }}>{ticket.user_name}</td>
              <td style={{ padding: '12px' }}>{ticket.subject}</td>
              <td style={{ padding: '12px' }}>{ticket.issue_type}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  backgroundColor: ticket.status === 'open' ? '#ef4444' : '#22c55e',
                  fontSize: '12px'
                }}>
                  {ticket.status}
                </span>
              </td>
              <td style={{ padding: '12px' }}>{new Date(ticket.created_at).toLocaleDateString()}</td>
              <td style={{ padding: '12px' }}>
                <select 
                  value={ticket.status}
                  onChange={(e) => updateStatus(ticket.id, e.target.value)}
                  style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '5px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {tickets.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#9ca3af' }}>No support tickets available.</p>
      )}
    </div>
  );
};

export default AdminSupport;