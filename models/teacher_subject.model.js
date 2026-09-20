const db = require("../config/database");

function addTeacherSubject(teacher_id, subject_id, grade_id){
    return db.prepare(`
        INSERT INTO teacher_subjects (teacher_id ,subject_id, grade_id)
        VALUES (?,?,?)`
    ).run(
        teacher_id, subject_id, grade_id);
}

function getTeacherSubjects(teacher_id){
    return db.prepare(`
        SELECT 
        teacher_subjects.id, teacher_subjects.subject_id, subjects.name AS subject, grades.stage, grades.grade_number
        FROM teacher_subjects
        JOIN subjects 
        ON teacher_subjects.subject_id = subjects.id
        JOIN grades
        ON teacher_subjects.grade_id = grades.id
        WHERE teacher_subjects.teacher_id = ? `
    ).all(teacher_id);
}

function deleteTeacherSubjects(teacher_id, subject_id){
    return db.prepare(`
        DELETE FROM teacher_subjects 
        WHERE teacher_id = ? AND id = ?`
    ).run(teacher_id, subject_id);
}

function updateTeacherSubject(subject_id, grade_id, id, teacher_id){
    return db.prepare(`
        UPDATE teacher_subjects
        SET subject_id = ?, grade_id = ?
        WHERE id = ? AND teacher_id = ? 
        `).run(subject_id, grade_id, id, teacher_id);
}

function getTeacherSubject(id, teacher_id){
    return db.prepare(`
        SELECT teacher_subjects.id,
        subjects.name AS subject,
        grades.stage,
        grades.grade_number 
        FROM teacher_subjects

        JOIN subjects
        ON teacher_subjects.subject_id = subjects.id

        JOIN grades
        ON teacher_subjects.grade_id = grades.id
        
        WHERE teacher_subjects.id = ? AND teacher_subjects.teacher_id = ?
        `
    ).get(id, teacher_id);
}

module.exports = {
    addTeacherSubject, getTeacherSubjects, 
    deleteTeacherSubjects, updateTeacherSubject, getTeacherSubject};