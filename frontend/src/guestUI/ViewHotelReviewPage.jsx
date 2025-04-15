import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import styles from './ViewHotelReviewPage.module.css';
import Header from './Header';
import Footer from './Footer';

const ViewHotelReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get hotel details from router state
    const location = useLocation();
    const hotelId = location.state?.hotelId;
    const hotelName = location.state?.hotelName;
    const roomType = location.state?.roomType;
    const hotelLocation = location.state?.location;

    useEffect(() => {
        // Fetch reviews from Firestore where hotelId matches
        const fetchReviews = async () => {
            try {
                setLoading(true);

                const reviewsQuery = query(
                    collection(db, 'reviewed_hotels'),
                    where('hotelId', '==', hotelId)
                );

                const querySnapshot = await getDocs(reviewsQuery);
                const reviewsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setReviews(reviewsData);
                setError(null);
            } catch (err) {
                console.error('Error fetching hotel reviews:', err);
                setError('Failed to load reviews. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if hotelId exists
        if (hotelId) {
            fetchReviews();
        } else {
            setError('No hotel ID provided');
            setLoading(false);
        }
    }, [hotelId]);

    // Helper function to render star ratings
    const renderStars = (rating) => {
        if (!rating) return null;
        const [ratingValue, maxRating] = rating.split('/').map(Number);

        return (
            <div className={styles.starsContainer}>
                {[...Array(maxRating)].map((_, index) => (
                    <span
                        key={index}
                        className={`${styles.star} ${index < ratingValue ? styles.filled : ''}`}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Header />
            <div className={styles.content}>
                <h1 className={styles.title}>Hotel Reviews</h1>

                {/* Display hotel details if provided */}
                {hotelName && (
                    <div className={styles.itemDetails}>
                        <h2>{hotelName}</h2>
                        <p><strong>Location:</strong> {hotelLocation}</p>
                        <p><strong>Room Type:</strong> {roomType}</p>
                    </div>
                )}

                {/* Conditional rendering for loading, error, no data, and reviews */}
                {loading ? (
                    <div className={styles.loading}>Loading reviews...</div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : reviews.length === 0 ? (
                    <div className={styles.noReviews}>No reviews available for this hotel.</div>
                ) : (
                    <div className={styles.reviewsContainer}>
                        {reviews.map(review => (
                            <div key={review.id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <div className={styles.ratingContainer}>
                                        {review.rating && renderStars(review.rating)}
                                    </div>
                                </div>
                                <div className={styles.reviewBody}>
                                    <p className={styles.reviewText}>
                                        {review.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default ViewHotelReviewPage;
