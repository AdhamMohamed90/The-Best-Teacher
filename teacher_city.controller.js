const db = require("../config/database");
 const {
     addTeacherCity, getTeacherCities,
     deleteTeacherCities, updateTeacherCity, getTeacherCity
    } = require("../models/teacher_city.model");

function addCity(req, res){
    try{
        const teacher_id = req.user.user_id;
        const {city_id} = req.body;
        // console.log("BODY:",req.body);
        // console.log("CITY_ID", city_id)
        console.log("ADD CITY CONTROLLER REACHED");
        if(!city_id){
            return res.status(400).json({
                message : "City is Required"
            });
        }

        const city = db.prepare(`
            SELECT id FROM cities WHERE id = ?`
        ).get(city_id);

        if(!city){
            return res.status(404).json({
                message : "City Not Found!"
            })
        }

        addTeacherCity(teacher_id, city_id);
        console.log("CITY ADDED");
        return res.status(201).json({
            message : "City Added Successfully"
        });
    }catch(error){
        console.error("ERROR:", error);
        console.error("ERROR CODE:", error.code);
        console.error("ERROR MESSAGE:", error.message);
        console.log("CATCH REACHED");


        if(error.message === "UNIQUE constraint failed: teacher_cities.teacher_id, teacher_cities.city_id"){
            return res.status(409).json({
                message : "This Teacher Is already Assigned to This City "
            });
        }

        return res.status(500).json({
            error : "Internal Server Error"
        });
    }
}

function getCities(req, res){
    try{
        const teacher_id = req.user.user_id;
        const cities = getTeacherCities(teacher_id);

        console.log(cities)
        return res.status(200).json(cities);
    }catch(error){
        return res.status(500).json({
            error : "Internal Server Error"
        })
    }
}

function deleteCity(req, res){
    try{
        const teacher_id = req.user.user_id;
        const {city_id} = req.params

        const city = db.prepare(`
            SELECT city_id FROM teacher_cities WHERE city_id = ?`
        ).get(city_id);

        if(!city){
            return res.status(400).json({
                message : "This City Not Assignes to This Teacher Already!"
            });
        }
        deleteTeacherCities(teacher_id, city_id);

        return res.status(200).json({
            message : "City Deleted Successfully"
        });

    }catch(error){
        console.log(error)
        return res.status(500).json({
            error : "Internal Server Error!"
        });
    }
}

function updateCity(req, res){
    try{
        const teacher_id = req.user.user_id;
        const {city_id} = req.params;
        const {new_city} = req.body;


        const city = db.prepare(`
            SELECT city_id FROM teacher_cities 
            WHERE city_id = ?`
        ).get(city_id);

        if(!city){
            return res.status(404).json({
                message : "This City Not Assignes to This Teacher"
            });
        }

        if (!new_city){
            return res.status(404).json({
                message : "New City is Required!"
            });
        }

        const checkNewCity = db.prepare(`
            SELECT id FROM cities WHERE id = ?`
        ).get(new_city);

        if(!checkNewCity){
            return res.status(404).json({
                message : "New City Not Found!"
            });
        }

        updateTeacherCity(new_city, teacher_id, city_id);

        const updatedCity = getTeacherCity(teacher_id, new_city );

        return res.status(200).json({
            message : "City Updated Successfully",
            city : updatedCity
        })

    }catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Internal Server Error"
        })
    }
}

module.exports = {addCity, getCities, deleteCity, updateCity}