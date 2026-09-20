const {
    createBooking,
    getBookingById,
    getStudentBookings,
    getTeacherBookings,
    updateBooking,
    deleteBooking
} = require("../models/booking.model");

const db = require("../config/database");

function timeToMinutes(time) {

    if (!/^\d{2}:\d{2}$/.test(time)) {
        return null;
    }

    const [hours, minutes] = time
        .split(":")
        .map(Number);

    if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    return hours * 60 + minutes;
}

function getDayOfWeek(date) {

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const dateObject = new Date(date + "T00:00:00");

    if (isNaN(dateObject.getTime())) {
        return null;
    }

    return days[dateObject.getDay()];
}

function getTeacher(teacher_id) {

    return db.prepare(`
        SELECT id, name
        FROM users
        WHERE id = ?
        AND role = 'teacher'
    `).get(teacher_id);
}

function teacherTeachesSubjectAndGrade(
    teacher_id,
    subject_id,
    grade_id
) {

    return db.prepare(`
        SELECT *
        FROM teacher_subjects
        WHERE teacher_id = ?
        AND subject_id = ?
        AND grade_id = ?
    `).get(
        teacher_id,
        subject_id,
        grade_id
    );
}

function getTeacherProfile(teacher_id) {

    return db.prepare(`
        SELECT teachingmode
        FROM teacher_profiles
        WHERE user_id = ?
    `).get(teacher_id);
}

function teacherTeachesInCity(
    teacher_id,
    city_id
) {

    return db.prepare(`
        SELECT *
        FROM teacher_cities
        WHERE teacher_id = ?
        AND city_id = ?
    `).get(
        teacher_id,
        city_id
    );
}

function checkTeacherAvailability(
    teacher_id,
    day_of_week,
    start_time,
    end_time
) {

    return db.prepare(`
        SELECT *
        FROM teacher_availability
        WHERE teacher_id = ?
        AND day_of_week = ?
        AND start_time <= ?
        AND end_time >= ?
    `).get(
        teacher_id,
        day_of_week,
        start_time,
        end_time
    );
}

function createNewBooking(req, res) {

    try {

        const student_id = req.user.user_id;

        const {
            teacher_id,
            grade_id,
            subject_id,
            city_id,
            booking_date,
            start_time,
            end_time,
            mode
        } = req.body;

        if (
            !teacher_id ||
            !grade_id ||
            !subject_id ||
            !booking_date ||
            !start_time ||
            !end_time ||
            !mode
        ) {

            return res.status(400).json({
                message: "All required fields must be provided"
            });

        }

        const teacherId = Number(teacher_id);
        const gradeId = Number(grade_id);
        const subjectId = Number(subject_id);

        if (
            !Number.isInteger(teacherId) ||
            teacherId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Teacher ID"
            });

        }

        if (
            !Number.isInteger(gradeId) ||
            gradeId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Grade ID"
            });

        }

        if (
            !Number.isInteger(subjectId) ||
            subjectId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Subject ID"
            });

        }

        const teacher = getTeacher(teacherId);

        if (!teacher) {

            return res.status(404).json({
                message: "Teacher not found"
            });

        }

        const teacherSubject = teacherTeachesSubjectAndGrade(
            teacherId,
            subjectId,
            gradeId
        );

        if (!teacherSubject) {

            return res.status(400).json({
                message: "Teacher does not teach this subject for this grade"
            });

        }

        const normalizedMode = mode.toLowerCase();

        if (
            normalizedMode !== "online" &&
            normalizedMode !== "offline"
        ) {

            return res.status(400).json({
                message: "Mode must be online or offline"
            });

        }

        const teacherProfile = getTeacherProfile(teacherId);

        if (!teacherProfile) {

            return res.status(404).json({
                message: "Teacher profile not found"
            });

        }


        if (
            teacherProfile.teachingmode !== "both" &&
            teacherProfile.teachingmode !== normalizedMode
        ) {

            return res.status(400).json({
                message: "Teacher does not offer this teaching mode"
            });

        }

        let cityId = null;

        if (normalizedMode === "offline") {

            if (!city_id) {

                return res.status(400).json({
                    message: "City is required for offline booking"
                });

            }

            cityId = Number(city_id);

            if (
                !Number.isInteger(cityId) ||
                cityId <= 0
            ) {

                return res.status(400).json({
                    message: "Invalid City ID"
                });

            }

            const teacherCity = teacherTeachesInCity(
                teacherId,
                cityId
            );

            if (!teacherCity) {

                return res.status(400).json({
                    message: "Teacher does not teach in this city"
                });

            }

        }

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(booking_date)
        ) {

            return res.status(400).json({
                message: "Invalid date format. Use YYYY-MM-DD"
            });

        }

        const bookingDay = getDayOfWeek(booking_date);

        if (!bookingDay) {

            return res.status(400).json({
                message: "Invalid booking date"
            });

        }

        const start = timeToMinutes(start_time);
        const end = timeToMinutes(end_time);

        if (
            start === null ||
            end === null
        ) {

            return res.status(400).json({
                message: "Invalid time format. Use HH:MM"
            });

        }

        if (end <= start) {

            return res.status(400).json({
                message: "End time must be after start time"
            });

        }

        if (end - start < 60) {

            return res.status(400).json({
                message: "Booking duration must be at least 60 minutes"
            });

        }

        const availability = checkTeacherAvailability(
            teacherId,
            bookingDay,
            start_time,
            end_time
        );

        if (!availability) {

            return res.status(400).json({
                message: "Teacher is not available at this time"
            });

        }

        const result = createBooking(
            student_id,
            teacherId,
            gradeId,
            subjectId,
            cityId,
            booking_date,
            start_time,
            end_time,
            normalizedMode
        );


        return res.status(201).json({
            message: "Booking created successfully",
            booking_id: Number(result.lastInsertRowid)
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function getOneBooking(req, res) {

    try {

        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Booking ID"
            });

        }

        const booking = getBookingById(id);

        if (!booking) {

            return res.status(404).json({
                message: "Booking not found"
            });

        }

        return res.status(200).json(booking);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function getMyBookings(req, res) {

    try {

        const student_id = req.user.user_id;

        const bookings = getStudentBookings(student_id);

        return res.status(200).json(bookings);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function getTeacherMyBookings(req, res) {

    try {

        const teacher_id = req.user.user_id;

        const bookings = getTeacherBookings(teacher_id);

        return res.status(200).json(bookings);
    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function editBooking(req, res) {

    try {

        const student_id = req.user.user_id;
        const id = Number(req.params.id);

        const {
            grade_id,
            subject_id,
            city_id,
            booking_date,
            start_time,
            end_time,
            mode
        } = req.body;

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Booking ID"
            });

        }

        const booking = getBookingById(id);

        if (!booking) {

            return res.status(404).json({
                message: "Booking not found"
            });

        }

        if (booking.student_id !== student_id) {

            return res.status(403).json({
                message: "You are not allowed to edit this booking"
            });

        }

        if (
            !grade_id ||
            !subject_id ||
            !booking_date ||
            !start_time ||
            !end_time ||
            !mode
        ) {

            return res.status(400).json({
                message: "All required fields must be provided"
            });

        }

        const gradeId = Number(grade_id);
        const subjectId = Number(subject_id);

        if (
            !Number.isInteger(gradeId) ||
            gradeId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Grade ID"
            });

        }


        if (
            !Number.isInteger(subjectId) ||
            subjectId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Subject ID"
            });

        }

        const teacherId = booking.teacher_id;

        const teacher = getTeacher(teacherId);

        if (!teacher) {

            return res.status(404).json({
                message: "Teacher not found"
            });

        }

        const teacherSubject = teacherTeachesSubjectAndGrade(
            teacherId,
            subjectId,
            gradeId
        );

        if (!teacherSubject) {

            return res.status(400).json({
                message: "Teacher does not teach this subject for this grade"
            });

        }

        const normalizedMode = mode.toLowerCase();

        if (
            normalizedMode !== "online" &&
            normalizedMode !== "offline"
        ) {

            return res.status(400).json({
                message: "Mode must be online or offline"
            });

        }


        // Check teacher mode
        const teacherProfile = getTeacherProfile(teacherId);

        if (!teacherProfile) {

            return res.status(404).json({
                message: "Teacher profile not found"
            });

        }

        if (
            teacherProfile.teachingmode !== "both" &&
            teacherProfile.teachingmode !== normalizedMode
        ) {

            return res.status(400).json({
                message: "Teacher does not offer this teaching mode"
            });

        }

        let cityId = null;

        if (normalizedMode === "offline") {

            if (!city_id) {

                return res.status(400).json({
                    message: "City is required for offline booking"
                });

            }

            cityId = Number(city_id);

            if (
                !Number.isInteger(cityId) ||
                cityId <= 0
            ) {

                return res.status(400).json({
                    message: "Invalid City ID"
                });

            }

            const teacherCity = teacherTeachesInCity(
                teacherId,
                cityId
            );

            if (!teacherCity) {

                return res.status(400).json({
                    message: "Teacher does not teach in this city"
                });

            }

        }

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(booking_date)
        ) {

            return res.status(400).json({
                message: "Invalid date format. Use YYYY-MM-DD"
            });

        }

        const bookingDay = getDayOfWeek(booking_date);

        if (!bookingDay) {

            return res.status(400).json({
                message: "Invalid booking date"
            });

        }

        const start = timeToMinutes(start_time);
        const end = timeToMinutes(end_time);

        if (
            start === null ||
            end === null
        ) {

            return res.status(400).json({
                message: "Invalid time format. Use HH:MM"
            });

        }

        if (end <= start) {

            return res.status(400).json({
                message: "End time must be after start time"
            });

        }

        if (end - start < 60) {

            return res.status(400).json({
                message: "Booking duration must be at least 60 minutes"
            });

        }

        const availability = checkTeacherAvailability(
            teacherId,
            bookingDay,
            start_time,
            end_time
        );

        if (!availability) {

            return res.status(400).json({
                message: "Teacher is not available at this time"
            });

        }

        const result = updateBooking(
            id,
            student_id,
            gradeId,
            subjectId,
            cityId,
            booking_date,
            start_time,
            end_time,
            normalizedMode
        );

        if (result.changes === 0) {

            return res.status(404).json({
                message: "Booking not found"
            });

        }

        return res.status(200).json({
            message: "Booking updated successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function removeBooking(req, res) {

    try {

        const student_id = req.user.user_id;
        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Booking ID"
            });

        }

        const booking = getBookingById(id);

        if (!booking) {

            return res.status(404).json({
                message: "Booking not found"
            });

        }

        if (booking.student_id !== student_id) {

            return res.status(403).json({
                message: "You are not allowed to delete this booking"
            });

        }

        deleteBooking(id, student_id);


        return res.status(200).json({
            message: "Booking deleted successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

module.exports = {
    createNewBooking,
    getOneBooking,
    getMyBookings,
    getTeacherMyBookings,
    editBooking,
    removeBooking
};