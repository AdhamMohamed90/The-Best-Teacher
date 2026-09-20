const db = require("../config/database");

function createGroup(
    teacher_id, subject_id, grade_id, 
    mode, city_id, day_of_week,
    start_time, end_time, 
    capacity, price,
) {
    return db.prepare(`
        INSERT INTO groups(
        teacher_id, subject_id, grade_id,
        mode, city_id, day_of_week,
        start_time, end_time,
        capacity, price
        )
        VALUES (?,?,?,?,?,?,?,?,?,?)
        `).run(
            teacher_id, subject_id, grade_id,
            mode, city_id, day_of_week,
            start_time, end_time,
            capacity,price 
        );
}

function getGroupById(id){
    return db.prepare(`
        SELECT
            groups.id,
            groups.teacher_id,
            users.name AS teacher_name,
            groups.subject_id,
            grades.stage,
            grades.grade_number,
            groups.mode,
            groups.city_id,
            cities.name AS city,
            groups.day_of_week,
            groups.start_time,
            groups.end_time,
            groups.capacity,
            groups.price
        FROM groups

        JOIN users
            ON groups.teacher_id = users.id

        JOIN subjects
            ON groups.subject_id = subjects.id

        JOIN grades
            ON groups.grade_id = grades.id
        
        LEFT JOIN cities
            ON groups.city_id = cities.id

        WHERE groups.id = ?
        `).get(id);
}

function getTeacherGroups(teacher_id){
    return db.prepare(`
        SELECT 
            groups.id,
            groups.subject_id,
            subjects.name AS subject,
            groups.grade_id,
            grades.stage,
            grades.grade_number,
            groups.mode,
            groups.city_id,
            cities.name AS city,
            groups.day_of_week,
            groups.start_time,
            groups.end_time,
            groups.capacity,
            groups.price
        FROM groups

        JOIN subjects
            ON groups.subject_id = subjects.id

        JOIN grades
            ON groups.grade_id = grades.id

        LEFT JOIN cities 
            ON groups.city_id = cities.id
        
        WHERE groups.teacher_id = ?

        ORDER BY groups.day_of_week, groups.start_time
        `).all(teacher_id);
}

function updateGroup(
    id, teacher_id, subject_id,
    grade_id, mode, city_id,
    day_of_week, start_time,
    end_time, capacity, price
    ){
    return db.prepare(`
        UPDATE groups
        SET
            subject_id = ?,
            grade_id = ?,
            mode = ?,
            city_id = ?,
            day_of_week = ?,
            start_time = ?,
            end_time = ?,
            capacity = ?,
            price = ?
        WHERE id = ? AND teacher_id = ?
    `).run(
        subject_id, grade_id, mode,
        city_id, day_of_week,
        start_time, end_time,
        capacity, price, id,
        teacher_id   
    );
}

function deleteGroup(id, teacher_id){
    return db.prepare(`
        DELETE FROM groups
        WHERE id = ?
        AND teacher_id = ?
        `).run(id,teacher_id);
}

function countGroupStudents(group_id){
    return db.prepare(`
        SELECT COUNT(*) AS count
        FROM student_groups
        WHERE group_id = ?
        `).get(group_id);
}

function addStudentGroup(group_id, student_id){
    return db.prepare(`
        INSERT INTO student_groups(
        group_id,
        student_id
        )
        VALUES (?,?)
        `).run(
            group_id,
            student_id
        );
}

function findStudentInGroup(group_id, student_id){
    return db.prepare(`
        SELECT *
        FROM student_groups
        WHERE group_id = ? AND student_id = ?
        `).get(
            group_id, student_id
        );
}

function getAllGroups(){
    return db.prepare(`
        SELECT 
            groups.id,
            groups.teacher_id,
            users.name AS teacher_name,
            groups.subject_id,
            subjects.name AS subject,
            groups.grade_id,
            grades.stage,
            grades.grade_number,
            groups.mode,
            groups.city_id,
            cities.name AS city,
            groups.day_of_week,
            groups.start_time,
            groups.end_time,
            groups.capacity,
            groups.price,
            (SELECT COUNT(*) FROM student_groups WHERE student_groups.group_id = groups.id) AS enrolled
        FROM groups
        JOIN users ON groups.teacher_id = users.id
        JOIN subjects ON groups.subject_id = subjects.id
        JOIN grades ON groups.grade_id = grades.id
        LEFT JOIN cities ON groups.city_id = cities.id
        ORDER BY groups.day_of_week, groups.start_time
    `).all();
}

module.exports = {
    createGroup, getGroupById, 
    getTeacherGroups, updateGroup, 
    deleteGroup, countGroupStudents,
    addStudentGroup, findStudentInGroup,
    getAllGroups
};


