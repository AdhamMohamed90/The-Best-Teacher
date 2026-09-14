const db = require("../config/database");

function addAvailability(teacher_id, day_of_week, start_time, end_time){
    return db.prepare(`
        INSERT INTO teacher_availability (
            teacher_id,
            day_of_week,
            start_time,
            end_time)
        VALUES (?,?,?,?)
        `).run(
            teacher_id,
            day_of_week,
            start_time,
            end_time
        );
}

function getTeacherAvailability(teacher_id){
    return db.prepare(`
        SELECT 
            id,
            day_of_week,
            start_time,
            end_time 
        FROM teacher_availability
        WHERE teacher_id = ?
        ORDER BY
        CASE day_of_week
            WHEN 'Saturday' THEN 1
            WHEN 'Sunday' THEN 2
            WHEN 'Monday' THEN 3
            WHEN 'Tuesday' THEN 4
            WHEN 'Wednesday' THEN 5
            WHEN 'Thursday' THEN 6
            WHEN 'Friday' THEN 7
        END,
        start_time
        `).all(teacher_id);
}

function getAvailabilityById(id, teacher_id){
    return db.prepare(`
        SELECT * FROM teacher_availability
        WHERE id = ? AND teacher_id = ?
        `).get(id, teacher_id)
}

function updateAvailability(id, teacher_id, day_of_week, start_time, end_time){
    return db.prepare(
        `UPDATE teacher_availability SET
        day_of_week = ?, start_time = ?, end_time = ?
        WHERE id = ? AND teacher_id = ?
        `).run(day_of_week, start_time, end_time, id, teacher_id )
}

function deleteAvailability(id, teacher_id){
    return db.prepare(`
        DELETE FROM teacher_availability
        WHERE id = ? AND teacher_id = ?
        `).run(id, teacher_id)
}

module.exports = {
    addAvailability,
    getTeacherAvailability,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability

}