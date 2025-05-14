import React from 'react';

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  content: string;
}

export interface ReviewListProps {
  reviews: Review[];
  onFilter?: () => void;
  onSort?: () => void;
  emptyMessage?: string;
}

/**
 * ReviewList displays a list of traveler reviews with filter/sort controls and empty state.
 * @example <ReviewList reviews={[]} onFilter={...} onSort={...} />
 */
export function ReviewList({
  reviews,
  onFilter,
  onSort,
  emptyMessage = 'No reviews found.',
}: ReviewListProps) {
  return (
    <div className="rounded-2xl bg-gray-50 p-6 shadow min-w-[320px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">traveler reviews</h3>
        <div className="flex gap-2">
          <button
            className="border px-3 py-1 rounded-lg text-blue-600 border-blue-300 hover:bg-blue-50"
            onClick={onFilter}
          >
            Filter
          </button>
          <button
            className="border px-3 py-1 rounded-lg text-blue-600 border-blue-300 hover:bg-blue-50"
            onClick={onSort}
          >
            Sort
          </button>
        </div>
      </div>
      {reviews.length === 0 ? (
        <div className="text-gray-400 text-center py-8">{emptyMessage}</div>
      ) : (
        <ul className="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{review.author}</span>
                <span className="text-xs text-gray-400">{review.date}</span>
                <span className="ml-auto text-yellow-500">{'★'.repeat(review.rating)}</span>
              </div>
              <div className="text-gray-700 text-sm">{review.content}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ReviewList;
