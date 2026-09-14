const db = require("../config/database");

function findUserByEmail(email){
    return db.prepare(`
        SELECT * FROM users 
        WHERE email = ?`).get(email);
}

function findUserById(id){
    return db.prepare(`
        SELECT * FROM users
        WHERE id = ?`).get(id);
}

function createUser(name,email,password,role){
    return db.prepare(`
        INSERT INTO users (name,email,password,role) 
        VALUES (?,?,?,?)`).run(
            name,email,password,role
        );
}

module.exports ={
    findUserByEmail,
    findUserById,
    createUser
}
