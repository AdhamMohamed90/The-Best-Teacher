const db = require("../config/database");

function joinGroup(group_id, student_id) {

    return db.prepare(`
        INSERT INTO student_groups(
            group_id,
            student_id
        )
        VALUES(?, ?)
    `).run(
        group_id,
        student_id
    );
}

function getStudentGroup(group_id, student_id) {

    return db.prepare(`
        SELECT
            student_groups.id,
            student_groups.group_id,
            student_groups.student_id
        FROM student_groups
        WHERE group_id = ?
        AND student_id = ?
    `).get(
        group_id,
        student_id
    );
}

function getStudentGroups(student_id) {

    return db.prepare(`
        SELECT
            student_groups.id,
            student_groups.group_id
        FROM student_groups
        WHERE student_groups.student_id = ?
    `).all(student_id);
}

function getGroupStudents(group_id) {

    return db.prepare(`
        SELECT
            student_groups.id,
            student_groups.student_id,
            users.name AS student_name,
            users.email AS student_email
        FROM student_groups
        JOIN users
            ON student_groups.student_id = users.id
        WHERE student_groups.group_id = ?
    `).all(group_id);
}

function leaveGroup(group_id, student_id) {

    return db.prepare(`
        DELETE FROM student_groups
        WHERE group_id = ?
        AND student_id = ?
    `).run(
        group_id,
        student_id
    );
}


module.exports = {
    joinGroup,
    getStudentGroup,
    getStudentGroups,
    getGroupStudents,
    leaveGroup
};