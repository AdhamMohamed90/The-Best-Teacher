const db = require("../config/database");

function createBooking(
    student_id, teacher_id,
    grade_id, subject_id,
    city_id, booking_date,
    start_time, end_time, mode
){

    return db.prepare(`
        INSERT INTO bookings(
        student_id, teacher_id, grade_id,
        subject_id, city_id, booking_date, 
        start_time, end_time, mode
        )
        VALUES(?,?,?,?,?,?,?,?,?)
        `).run(
            student_id, teacher_id, grade_id,
            subject_id, city_id, booking_date,
            start_time, end_time, mode
        );
}

function getBookingById(id){

    return db.prepare(`
        SELECT  
            bookings.id,
            bookings.student_id,
            students.name AS student_name,
            bookings.teacher_id,
            teachers.name AS teacher_name,
            bookings.grade_id,
            grades.stage,
            grades.grade_number,
            bookings.subject_id,
            subjects.name AS subjects,
            bookings.city_id,
            cities.name AS city,
            bookings.booking_date,
            bookings.start_time,
            bookings.end_time,
            bookings.mode,
            bookings.created_at

        FROM bookings 

        JOIN users AS students
            ON bookings.student_id = students.id

        JOIN users AS teachers  
            ON bookings.teacher_id = teachers.id

        JOIN grades
            ON bookings.grade_id = grades.id

        JOIN subjects
            ON bookings.subject_id = subjects.id

        LEFT JOIN cities
            ON bookings.city_id = cities.id

        WHERE bookings.id = ?
    `).get(id);
}

function getStudentBookings(student_id){
    return db.prepare(`
        SELECT 
            bookings.id,
            bookings.teacher_id,
            teachers.name AS teacher_name,
            bookings.subject_id,
            subjects.name AS subject,
            bookings.grade_id,
            grades.stage,
            grades.grade_number,
            cities.name AS city,
            bookings.booking_date,
            bookings.start_time,
            bookings.end_time,
            bookings.mode,
            bookings.created_at

        FROM bookings

        JOIN users AS teachers
            ON bookings.teacher_id = teachers.id

        JOIN subjects
            ON bookings.subject_id = subjects.id

        JOIN grades
            ON bookings.grade_id = grades.id

        LEFT JOIN cities
            ON bookings.city_id = cities.id

        WHERE bookings.student_id = ?

        ORDER BY 
            bookings.booking_date,
            bookings.start_time
        `).all(student_id);
}

function getTeacherBookings(teacher_id){
    return db.prepare(`
        SELECT
            bookings.id,
            students.name AS student_name,
            subjects.name AS subject,
            grades.stage,
            grades.grade_number,
            cities.name AS city,
            bookings.booking_date,
            bookings.start_time,
            bookings.end_time,
            bookings.mode,
            bookings.created_at

        FROM bookings

         JOIN users AS students
            ON bookings.student_id = students.id

        JOIN subjects
            ON bookings.subject_id = subjects.id

        JOIN grades
            ON bookings.grade_id = grades.id

        LEFT JOIN cities
            ON bookings.city_id = cities.id

        WHERE bookings.teacher_id = ?

        ORDER BY
            bookings.booking_date,
            bookings.start_time
        `).all(teacher_id);
}

function updateBooking(
    id,
    student_id,
    grade_id,
    subject_id,
    city_id,
    booking_date,
    start_time,
    end_time,
    mode
) {
    return db.prepare(`
        UPDATE bookings
        SET
            grade_id = ?,
            subject_id = ?,
            city_id = ?,
            booking_date = ?,
            start_time = ?,
            end_time = ?,
            mode = ?
        WHERE id = ?
        AND student_id = ?
    `).run(
        grade_id,
        subject_id,
        city_id,
        booking_date,
        start_time,
        end_time,
        mode,
        id,
        student_id
    );
}

function deleteBooking(id, student_id) {

    return db.prepare(`
        DELETE FROM bookings
        WHERE id = ?
        AND student_id = ?
    `).run(
        id,
        student_id
    );
}

module.exports = {
    createBooking,
    getBookingById,
    getStudentBookings,
    getTeacherBookings,
    updateBooking,
    deleteBooking
};