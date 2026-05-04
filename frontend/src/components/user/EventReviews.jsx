import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const EventReviews = ({ eventId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/event/${eventId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  useEffect(() => { 
    if (eventId) fetchReviews(); 
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { event_id: eventId, rating, comment });
      setComment('');
      fetchReviews();
      alert("Salamat sa feedback, dol!");
    } catch (err) {
      alert(err.response?.data?.error || "Review is only allowed after attending the event.");
    }
  };

  return (
    <div className="reviews-wrapper mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Community Feedback</h3>
      
      {/* Review Form */}
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-50 rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Your Rating</label>
          <select 
            value={rating} 
            onChange={(e) => setRating(e.target.value)}
            className="w-full p-2 border rounded bg-white"
          >
            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Your Comment</label>
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border rounded h-24"
            placeholder="Share your experience..."
            required
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 transition">
          Post Review
        </button>
      </form>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-400 italic text-center py-4">No reviews yet for this event.</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="pb-4 border-b last:border-0">
              <div className="flex justify-between mb-1">
                <span className="font-bold text-gray-700">{r.user_name}</span>
                <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{r.comment}</p>
              <span className="text-xs text-gray-400 mt-2 block">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventReviews;