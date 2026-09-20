const db = require("../config/database");

function addTeacherCity(teacher_id, city_id){
    return db.prepare(`
        INSERT INTO teacher_cities (teacher_id, city_id)
        VALUES (?,?)`
    ).run(teacher_id, city_id);
}

function getTeacherCities(teacher_id){
    return db.prepare(`
        SELECT teacher_cities.id, cities.name AS city
        FROM teacher_cities

        JOIN cities 
        ON teacher_cities.city_id = cities.id

        WHERE teacher_cities.teacher_id = ?
        `).all(teacher_id);
}

function deleteTeacherCities(teacher_id, city_id){
    return db.prepare(`
        DELETE FROM teacher_cities WHERE
        teacher_id = ? AND city_id = ?`
    ).run(teacher_id, city_id)
}

function updateTeacherCity(new_city, teacher_id, city_id){
    return db.prepare(`
        UPDATE teacher_cities SET city_id = ? 
        WHERE teacher_id = ? AND city_id = ?`
    ).run(new_city, teacher_id, city_id);
}

function getTeacherCity(teacher_id, city_id){
    return db.prepare(`
        SELECT teacher_cities.id , cities.name AS city FROM teacher_cities
        
        JOIN cities 
        ON teacher_cities.city_id = cities.id

        WHERE teacher_cities.teacher_id = ? AND teacher_cities.city_id = ?
        `).get(teacher_id, city_id);
}

module.exports = {
    addTeacherCity, getTeacherCities,
    deleteTeacherCities, updateTeacherCity, getTeacherCity}