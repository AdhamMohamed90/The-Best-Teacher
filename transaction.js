const db = require("../config/database");

function transaction(callback){
    db.exec("BEGIN");
    try{
        const result = callback();

        db.exec("COMMIT");

        return result;
    }catch(error){
        db.exec("ROLLBACK");
        throw error;
    }
}
module.exports ={ transaction};