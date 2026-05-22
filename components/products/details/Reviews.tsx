import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { toast } from 'react-toastify';

interface Review {
  id: string;
  product_id: string;
  rating: number;
  comment: string;
  name: string;
  created_at: string;
}

interface ReviewsProps {
  productId: string;
}

export default function Reviews({ productId }: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const json = await res.json();
      setReviews(json.reviews ?? []);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !comment) {
      toast.error('Name and comment are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment, name }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success('Review submitted');
        setRating(5);
        setName('');
        setComment('');
        fetchReviews();
      } else {
        toast.error(json.error || 'Failed to submit review');
      }
    } catch (err) {
      toast.error('Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-semibold">Customer Reviews</h3>
      {/* Review List */}
      {reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((rev) => (
            <li key={rev.id} className="border-b pb-2">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium">{rev.name}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-1 mb-1">
                {/* Simple star display */}
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${i < rev.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.456a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.371-2.456a1 1 0 00-1.175 0l-3.371 2.456c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.34 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.957z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-foreground/80">{rev.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Submit Review Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="flex items-center space-x-2">
          <label className="font-medium">Rating:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border rounded p-1"
          >
            {[5, 4, 3, 2, 1].map((v) => (
              <option key={v} value={v}>
                {v} ★
              </option>
            ))}
          </select>
        </div>
        <Input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Textarea
          placeholder="Your review"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} className="bg-foreground text-background">
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
}
