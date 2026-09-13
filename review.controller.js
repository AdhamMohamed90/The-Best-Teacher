const {
    createReview,
    getReviewByBooking,
    getTeacherReviews,
    getTeacherRating
} = require("../models/review.model");

const db = require("../config/database");

function createNewReview(req, res) {

    try {

        const student_id = req.user.user_id;

        const {
            booking_id,
            rating,
            comment
        } = req.body;

        if (!booking_id) {

            return res.status(400).json({
                message: "Booking ID is required"
            });

        }

        const bookingId = Number(booking_id);

        if (
            !Number.isInteger(bookingId) ||
            bookingId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Booking ID"
            });

        }

        const reviewRating = Number(rating);

        if (
            !Number.isInteger(reviewRating) ||
            reviewRating < 1 ||
            reviewRating > 5
        ) {

            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });

        }

        const booking = db.prepare(`
            SELECT
                id,
                student_id,
                teacher_id,
                booking_date,
                start_time,
                end_time

            FROM bookings

            WHERE id = ?
        `).get(bookingId);


        if (!booking) {

            return res.status(404).json({
                message: "Booking not found"
            });

        }

        if (booking.student_id !== student_id) {

            return res.status(403).json({
                message: "You are not allowed to review this booking"
            });

        }

        const finished = db.prepare(`
            SELECT 1

            FROM bookings

            WHERE id = ?

            AND datetime(
                booking_date || ' ' || end_time
            ) < datetime('now', 'localtime')
        `).get(bookingId);


        if (!finished) {

            return res.status(400).json({
                message: "You can only review a completed booking"
            });

        }

        const existingReview = getReviewByBooking(
            student_id,
            bookingId
        );


        if (existingReview) {

            return res.status(409).json({
                message: "You already reviewed this booking"
            });

        }

        const result = createReview(
            student_id,
            booking.teacher_id,
            bookingId,
            reviewRating,
            comment || null
        );

        return res.status(201).json({

            message: "Review added successfully",

            review_id: Number(
                result.lastInsertRowid
            )

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function getTeacherReviewsController(req, res) {

    try {

        const teacher_id = Number(
            req.params.teacher_id
        );


        if (
            !Number.isInteger(teacher_id) ||
            teacher_id <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Teacher ID"
            });

        }

        const reviews = getTeacherReviews(
            teacher_id
        );


        return res.status(200).json(reviews);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function getTeacherRatingController(req, res) {

    try {

        const teacher_id = Number(
            req.params.teacher_id
        );


        if (
            !Number.isInteger(teacher_id) ||
            teacher_id <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Teacher ID"
            });

        }

        const rating = getTeacherRating(
            teacher_id
        );


        return res.status(200).json(rating);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

module.exports = {
    createNewReview,
    getTeacherReviewsController,
    getTeacherRatingController
};