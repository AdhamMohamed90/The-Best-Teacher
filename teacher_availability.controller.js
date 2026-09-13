const {
    addAvailability,
    getTeacherAvailability,
    getAvailabilityById,
    updateAvailability,
    deleteAvailability
} = require("../models/teacher_availability.model");

const DAYS = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
];

function capitalizeDay(day){
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

const MIN_AVAILABILITY_DURATION = 60;

function createAvailability(req,res){
    try{
        const teacher_id = req.user.user_id;
        const {day_of_week, start_time, end_time} = req.body

        if(!start_time || !day_of_week || !end_time){
            return res.status(400).json({
                message : "Day of Week, Start Time and End Time Are Required"
            })
        }

        const normalizedDay = capitalizeDay(day_of_week);

        if(!DAYS.includes(normalizedDay)){
            return res.status(400).json({
                message : "Invalid Day"
            })
        }

        const start = timeToMinutes(start_time);
        const end = timeToMinutes(end_time);

        if(start === null || end === null){
            return res.status(400).json({
                message : "Invalid Time Format. usee HH:MM"
            });
        }

        if(end <= start){
            return res.status(400).json({
                message : "Start Time Must be Before End Time"
            });
        }

        if(end - start <MIN_AVAILABILITY_DURATION){
            return res.status(400).json({
                message : "Availlability Must be At Least 60 Minutes"
            })
        }

        const result = addAvailability(teacher_id, normalizedDay, start_time, end_time)

        return res.status(201).json({
            message : "Availability Added Successfully"
        });

    }catch(error){

        if(error.code === "ERR_SQLITE_ERROR"){
            return res.status(409).json({
                message : "Availability Already Exists"
            })
        }

        console.error(error);

        return res.status(500).json({
            message : "internal Server Error"
        });
    }
}

function getAvailability(req,res){
    try{
        const teacher_id = Number(req.params.teacher_id);

        if(!Number.isInteger(teacher_id) || teacher_id <= 0){
            return res.status(400).json({
                message : "Invalid Teacher ID"
            });
        }

        const availability = getTeacherAvailability(teacher_id);
        
        return res.status(200).json(availability);
    }catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Internal Server Error"
        })
    }
}

function editAvailability(req,res){
    try{
        const teacher_id = req.user.user_id;
        const id = Number(req.params.id);
        const {day_of_week, start_time, end_time} = req.body;

        if(!Number.isInteger(id) || id <= 0){
            return res.status(400).json({
                message : "Invalid Availability ID"
            });
        }

        if(!day_of_week || !start_time || !end_time){
            return res.status(400).json({
                message : "Day, Start Time and End Time Are Required"
            });
        }

        const normalizedDay = capitalizeDay(day_of_week);

        if(!DAYS.includes(normalizedDay)){
            return res.status(400).json({
                message : "Invalid Day of Week"
            });
        }

        const start = timeToMinutes(start_time);
        const end = timeToMinutes(end_time);

                if (start === null || end === null) {
            return res.status(400).json({
                message: "Invalid time format. Use HH:MM"
            });
        }


        if (end <= start) {
            return res.status(400).json({
                message: "End time must be after start time"
            });
        }


        if (end - start < MIN_AVAILABILITY_DURATION) {
            return res.status(400).json({
                message: "Availability must be at least 60 minutes"
            });
        }

        const availability = getAvailabilityById(id, teacher_id)

        if(!availability){
            return res.status(404).json({
                message : "Availability Not Found"
            });
        }

        updateAvailability(id, teacher_id, normalizedDay, start_time, end_time);

        return res.status(200).json({
            message : "Availability Updated Successfully"
        });

    }catch(error){

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                message: "This availability already exists"
            });
        }

        console.error(error);

        return res.status(500).json({
            error: "Internal Server Error"
        });
    
    }
}

function removeAvailability(req,res){
    try{
        const teacher_id = req.user.user_id;
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid Availability ID"
            });
        }

        const availability = getAvailabilityById(id, teacher_id);

        if(!availability){
            return res.status(404).json({
                message : "Not Found"
            });
        }

        deleteAvailability(id, teacher_id);

        return res.status(200).json({
            message : "Availability Deleted Successfully"
        });

    }catch(error){
        console.error(error);

        return res.status(500).json({
            error : "Internal Server Error"
        });
    }
}

function timeToMinutes(time){
    if(!/^\d{2}:\d{2}$/.test(time)){
        return null
    }

    const[hours, minutes] = time
        .split(":")
        .map(Number);

    if(
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ){
        return null
    }
    return hours * 60 + minutes
}

module.exports = {
    createAvailability,
    getAvailability,
    editAvailability,
    removeAvailability
}