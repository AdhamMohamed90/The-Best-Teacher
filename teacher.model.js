const db = require("../config/database");

function createTeacherProfile(user_id,bio,teachingmode){
    return db.prepare(`
        INSERT INTO teacher_profiles (user_id,bio,teachingmode)
        VALUES (?,?,?)`).run(
            user_id,
            bio ?? null,
            teachingmode
        );
}

function findTeacherProfileByUserId(user_id){
    return db.prepare(`
        SELECT * FROM teacher_profiles WHERE user_id =?`
    ).get(user_id);
}

function updateTeacherProfile(user_id,bio,teachingmode){
    return db.prepare(`
        UPDATE teacher_profiles
        SET bio = ? , teachingmode = ? 
        WHERE user_id = ?
    `).run(
         bio ?? null,
         teachingmode,
         user_id
        )
}

function deleteTeacherProfile(user_id) {

    db.exec("BEGIN TRANSACTION");

    try {

        db.prepare(`
            DELETE FROM reviews
            WHERE teacher_id = ?
        `).run(user_id);

        db.prepare(`
            DELETE FROM student_groups
            WHERE group_id IN (
                SELECT id
                FROM groups
                WHERE teacher_id = ?
            )
        `).run(user_id);

        db.prepare(`
            DELETE FROM teacher_subjects
            WHERE teacher_id = ?
        `).run(user_id);

        db.prepare(`
            DELETE FROM teacher_cities
            WHERE teacher_id = ?
        `).run(user_id);

        db.prepare(`
            DELETE FROM teacher_availability
            WHERE teacher_id = ?
        `).run(user_id);

        db.prepare(`
            DELETE FROM groups
            WHERE teacher_id = ?
        `).run(user_id);

        db.prepare(`
            DELETE FROM bookings
            WHERE teacher_id = ?
        `).run(user_id);

        db.prepare(`
            DELETE FROM teacher_profiles
            WHERE user_id = ?
        `).run(user_id);

        db.prepare(`
            DELETE FROM users
            WHERE id = ?
            AND role = 'teacher'
        `).run(user_id);


        db.exec("COMMIT");

        return true;

    } catch (error) {

        db.exec("ROLLBACK");

        throw error;
    }
}

function searchTeachers(filters){
    let query = `
    SELECT DISTINCT
        users.id,
        users.name,
        users.email,
        teacher_profiles.bio,
        teacher_profiles.teachingmode
    FROM users

    JOIN teacher_profiles
    ON users.id = teacher_profiles.user_id

    JOIN teacher_subjects
    ON users.id = teacher_subjects.teacher_id

    LEFT JOIN teacher_cities
    ON users.id = teacher_cities.teacher_id

    WHERE users.role = 'teacher'
    `

    const params = [];

    if(filters.subject_id){
        query += ` AND teacher_subjects.subject_id = ?`;
        params.push(filters.subject_id);
    }

    if(filters.grade_id){
        query += ` AND teacher_subjects.grade_id = ?`;
        params.push(filters.grade_id);
    }

    if (filters.city_id){
        query+= ` AND teacher_cities.city_id = ?`;
        params.push(filters.city_id);
    }

    if(filters.teachingmode){
        if(filters.teachingmode === "online"){
            query += `
            AND teacher_profiles.teachingmode IN ('online' , 'both')
            `;
        }
        else if(filters.teachingmode === "offline"){
            query += `
            AND teacher_profiles.teachingmode IN ('offline' , 'both')
            `;
        }
        else{
            query += `
            AND teacher_profiles.teachingmode = ?
            `;
            params.push(filters.teachingmode);
        }
    }

    return db.prepare(query).all(...params);
}


function getTeacherDetails(teacher_id){
    return db.prepare(`
        SELECT 
            users.id,
            users.name,
            users.email,
            teacher_profiles.bio,
            teacher_profiles.teachingmode
        FROM users

        JOIN teacher_profiles
        ON users.id = teacher_profiles.user_id

        WHERE users.id = ?
        AND users.role = 'teacher'
        `).get(teacher_id);
}

function getTeacherCities(teacher_id){
    return db.prepare(`
        SELECT 
            teacher_cities.city_id,
            cities.name AS city
        FROM teacher_cities

        JOIN cities 
        ON teacher_cities.city_id = cities.id
        WHERE teacher_cities.teacher_id = ?
        `).all(teacher_id);
}

module.exports= {
    createTeacherProfile,
    findTeacherProfileByUserId,
    updateTeacherProfile,
    deleteTeacherProfile,
    searchTeachers,
    getTeacherDetails,
    getTeacherCities
}