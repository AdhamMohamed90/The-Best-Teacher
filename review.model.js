const db = require("../config/database");


function createReview(
    student_id,
    teacher_id,
    booking_id,
    rating,
    comment
) {

    return db.prepare(`
        INSERT INTO reviews(
            student_id,
            teacher_id,
            booking_id,
            rating,
            comment
        )
        VALUES(?,?,?,?,?)
    `).run(
        student_id,
        teacher_id,
        booking_id,
        rating,
        comment
    );
}

function getReviewByBooking(
    student_id,
    booking_id
) {

    return db.prepare(`
        SELECT *
        FROM reviews
        WHERE student_id = ?
        AND booking_id = ?
    `).get(
        student_id,
        booking_id
    );
}

function getTeacherReviews(teacher_id) {

    return db.prepare(`
        SELECT
            reviews.id,
            reviews.rating,
            reviews.comment,
            reviews.created_at,

            students.name AS student_name

        FROM reviews

        JOIN users AS students
            ON reviews.student_id = students.id

        WHERE reviews.teacher_id = ?

        ORDER BY reviews.created_at DESC
    `).all(teacher_id);
}

function getTeacherRating(teacher_id) {

    return db.prepare(`
        SELECT
            ROUND(AVG(rating), 2) AS average_rating,
            COUNT(*) AS total_reviews

        FROM reviews

        WHERE teacher_id = ?
    `).get(teacher_id);
}

module.exports = {
    createReview,
    getReviewByBooking,
    getTeacherReviews,
    getTeacherRating
};