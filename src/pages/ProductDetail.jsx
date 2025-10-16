import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById, getReviewsByProductId, createReview } from "../services/Api";
import { useAuth } from "../context/AuthContext";
import ReviewList from "../components/ReviewList";

export default function ProductDetail() {
    const { id } = useParams();
    const { user, isAuthenticated, isBuyer } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchProductAndReviews = async () => {
            try {
                const productResponse = await getProductById(id);
                setProduct(productResponse.data);

                const reviewsResponse = await getReviewsByProductId(id);
                setReviews(reviewsResponse.data);
            } catch (err) {
                console.error("Error fetching product or reviews:", err);
                setError("Failed to load product details or reviews.");
            } finally {
                setLoading(false);
            }
        };
        fetchProductAndReviews();
    }, [id]);

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setNewReview((prev) => ({ ...prev, [name]: value }));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated() || !isBuyer()) {
            alert("You must be logged in as a buyer to submit a review.");
            return;
        }
        if (newReview.rating === 0 || newReview.comment.trim() === "") {
            alert("Please provide a rating and a comment.");
            return;
        }

        setSubmittingReview(true);
        try {
            const reviewData = {
                rating: parseInt(newReview.rating),
                comment: newReview.comment,
                productId: id,
                buyerId: user.id, // Assuming user.id is available from AuthContext
            };
            const response = await createReview(reviewData);
            setReviews((prev) => [...prev, response.data]);
            setNewReview({ rating: 0, comment: "" }); // Clear form
            alert("Review submitted successfully!");
        } catch (err) {
            console.error("Error submitting review:", err);
            alert("Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <p>Loading product details...</p>;
    if (error) return <p>{error}</p>;
    if (!product) return <p>Product not found.</p>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    <img src={product.imageURL} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-md" />
                </div>
                <div className="md:w-1/2">
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                    <p className="text-2xl text-gray-700 mb-4">R{product.price}</p>
                    <p className="text-gray-600 mb-6">{product.description}</p>
                    {/* Add to cart button or other actions */}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
                {isAuthenticated() && isBuyer() && (
                    <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h3 className="text-xl font-semibold mb-4">Submit Your Review</h3>
                        <div className="mb-4">
                            <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-2">Rating:</label>
                            <select
                                id="rating"
                                name="rating"
                                value={newReview.rating}
                                onChange={handleReviewChange}
                                className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            >
                                <option value="0">Select a rating</option>
                                <option value="1">1 Star</option>
                                <option value="2">2 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="5">5 Stars</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="comment" className="block text-gray-700 text-sm font-bold mb-2">Comment:</label>
                            <textarea
                                id="comment"
                                name="comment"
                                value={newReview.comment}
                                onChange={handleReviewChange}
                                rows="4"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Share your thoughts on this product..."
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={submittingReview}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                )}
                <ReviewList reviews={reviews} />
            </div>
        </div>
    );
}