import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../common/ToastContext';
import '../../styles/EventReviews.css';

const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map(n => {
        const active = n <= (hovered || value);
        return (
          <button
            key={n}
            type="button"
            className={`star-btn${active ? ' active' : ''}${hovered >= n ? ' hovered' : ''}`}
            onMouseEnter={() => setHovered(n)}
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

const EventReviews = ({ eventId }) => {
  const { addToast } = useToast();
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
      setRating(5);
      fetchReviews();
      addToast('Salamat sa feedback, dol!', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Review is only allowed after attending the event.', 'error');
    }
  };

  return (
    <div className="reviews-section">
      <h3 className="reviews-title">Community Feedback</h3>

      <form onSubmit={handleSubmit} className="reviews-form">
        <div className="reviews-form-group">
          <label className="reviews-label">Your Rating</label>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <div className="reviews-form-group">
          <label className="reviews-label">Your Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="reviews-textarea"
            placeholder="Share your experience..."
            required
          />
        </div>
        <button type="submit" className="reviews-submit-btn">
          Post Review
        </button>
      </form>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="reviews-empty">No reviews yet for this event.</p>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="review-item">
              <div className="review-item-header">
                <span className="review-author">{r.user_name}</span>
                <span className="review-stars">{'★'.repeat(r.rating)}</span>
              </div>
              <p className="review-comment">{r.comment}</p>
              <span className="review-date">
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
