import React from "react";

export default function ReviewList({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>;
    }

    return (
        <div className="mt-8">
            {reviews.map((review) => (
                <div key={review.reviewId} className="bg-gray-100 p-4 rounded-lg shadow-sm mb-4">
                    <div className="flex items-center mb-2">
                        <span className="font-bold text-lg mr-2">{"⭐".repeat(review.rating)}</span>
                        <span className="text-gray-700">by {review.buyer?.firstName || "Anonymous"} on {new Date(review.reviewDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-800">{review.comment}</p>
                </div>
            ))}
        </div>
    );
}
