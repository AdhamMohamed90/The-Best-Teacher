const {
    createGroup, getGroupById,
    getTeacherGroups, updateGroup,
    deleteGroup, getAllGroups
} = require("../models/group.model");

const db = require("../config/database");

const DAYS = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday"
];

const MIN_GROUP_DURATION = 60;

function capitalizeDay(day) {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

function timeToMinutes(time) {

    if (!/^\d{2}:\d{2}$/.test(time)) {
        return null;
    }

    const [hours, minutes] = time
        .split(":")
        .map(Number);

    if (
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    return hours * 60 + minutes;
}

function teacherTeachesSubjectAndGrade(teacher_id, subject_id, grade_id){
    return db.prepare(`
        SELECT * 
        FROM teacher_subjects
        WHERE teacher_id = ?
        AND subject_id = ?
        AND grade_id = ?
        `).get(teacher_id, subject_id, grade_id);
}

function createNewGroup(req,res){
    try{
        const teacher_id = req.user.user_id;

        const{
            subject_id, grade_id,
            mode, city_id,
            day_of_week, start_time,
            end_time, capacity, price
        } = req.body;

        if(!subject_id || !grade_id ||
            !mode || !day_of_week || !start_time||
            !end_time || capacity === undefined ||
            price === undefined
        ){
            return res.status(400).json({
                message : "All Required Feild Must be Provided"
            }); 
        }

        const subjectId = Number(subject_id);
        const gradeId = Number(grade_id);
        const capacityNumber = Number(capacity);
        const priceNumber = Number(price);

        if(
            !Number.isInteger(subjectId) ||
            subjectId <= 0
        ){
            return res.status(400).json({
                message : "Invalid Subject ID"
            });
        }

        if(
            !Number.isInteger(gradeId) || gradeId <= 0
        ){
            return res.status(400).json({
                message : "Invalid Grade ID"
            });
        }

        if(
            !Number.isInteger(capacityNumber) || capacityNumber < 2
        ){
            return res.status(400).json({
                message : "Capacity Cannot Be less Than 2 Students"
            });
        }

        if(
            !Number.isFinite(priceNumber) || priceNumber < 0
        ){
            return res.status(400).json({
                message : "Invalid Price"
            });
        }

        const normalizedMode = mode.toLowerCase();

        if(
            normalizedMode !== "online" &&
            normalizedMode !== "offline"
        ){
            return res.status(400).json({
                message : "Mode Must be online or offline"
            });
        }

        let cityId = null;

        if(normalizedMode === "offline"){
            if (!city_id){
                return res.status(400).json({
                    message : "City is Required for offline Groups"
                });
            }

            cityId = Number(city_id);

            if(!Number.isInteger(cityId) || cityId <= 0){
                return res.status(400).json({
                    message : "Invalid City ID"
                });
        }}

        if(normalizedMode === "online"){
            cityId = null;
        }

        const normalizedDay = capitalizeDay(day_of_week);

        if(!DAYS.includes(normalizedDay)){
            return res.status(400).json({
                message : "Invalid Day of Week"
            });
        }
        
        const start = timeToMinutes(start_time);
        const end = timeToMinutes(end_time);

        if(
            start === null ||
            end === null
        ){
            return res.status(400).json({
                message : "Invalid Time Format. User HH:MM"
            });       
        }

        if(end <= start){
            return res.status(400).json({
                message : "End time must be after start time"
            })
        }

        if(end - start < MIN_GROUP_DURATION){
            return res.status(400).json({
                message : "Group duration must be at least 60 minutes"
            });
        }

        const teacherSubject = teacherTeachesSubjectAndGrade(
            teacher_id, subjectId, gradeId
        );

        if(!teacherSubject){
            return res.status(403).json({
                message : "You are not registered to teach this subject for this grade"
            });
        }

        createGroup(
            teacher_id, subjectId, gradeId,
            normalizedMode, cityId, 
            normalizedDay,start_time,
            end_time, capacityNumber,
            priceNumber
        );

        return res.status(201).json({
            message : "Group created successfully"
        });

        
    }catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        });
    }
}


function getMyGroups(req,res){
    try{
        const teacher_id = req.user.user_id;
        const groups = getTeacherGroups(teacher_id);

        return res.status(200).json(groups);

    } catch(error){
        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        });
    }
}

function getOneGroup(req,res){
    try{
        const id = Number(req.params.id);

        if(
            !Number.isInteger(id) || id <= 0
        ){
            return res.status(400).json({
                message : "Invalid Group ID"
            });
        }

        const group = getGroupById(id);

        if(!group){
            return res.status(404).json({
                message : "Group not found"
            });
        }

        return res.status(200).json(group);
    } catch(error){

        console.error(error);
        return res.status(500).json({
            message : "Internal Server Error"
        });


    }
}

function editGroup(req,res){
    try{
        const teacher_id = req.user.user_id;
        const id = Number(req.params.id);

        const{
            subject_id, grade_id, mode,
            city_id, day_of_week,
            start_time, end_time,
            capacity, price
        } = req.body;

        if(!Number.isInteger(id) || id <= 0){
            return res.status(400).json({
                message : "Invalid Group ID"
            });
        }

        if (
            !subject_id ||
            !grade_id ||
            !mode ||
            !day_of_week ||
            !start_time ||
            !end_time ||
            capacity === undefined ||
            price === undefined
        ) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }

        const subjectId = Number(subject_id);
        const gradeId = Number(grade_id);
        const capacityNumber = Number(capacity);
        const priceNumber = Number(price);

        if(!Number.isInteger(subjectId) || subjectId <= 0){
            return res.status(400).json({
                message : "Invalid Subject ID"
            });
        }

         if (
            !Number.isInteger(gradeId) ||
            gradeId <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Grade ID"
            });

        }

        if (
            !Number.isInteger(capacityNumber) ||
            capacityNumber < 2
        ) {

            return res.status(400).json({
                message: "Capacity must be a positive integer"
            });

        }

        if (
            !Number.isFinite(priceNumber) ||
            priceNumber < 0
        ) {

            return res.status(400).json({
                message: "Invalid Price"
            });

        }

        const normalizedMode = mode.toLowerCase();

        if (
            normalizedMode !== "online" &&
            normalizedMode !== "offline"
        ) {

            return res.status(400).json({
                message: "Mode must be online or offline"
            });

        }

        let cityId = null;

        if (normalizedMode === "offline") {

            if (!city_id) {

                return res.status(400).json({
                    message: "City is required for offline groups"
                });

            }

            cityId = Number(city_id);

            if (
                !Number.isInteger(cityId) ||
                cityId <= 0
            ) {

                return res.status(400).json({
                    message: "Invalid City ID"
                });

            }

        }

        const normalizedDay = capitalizeDay(day_of_week);

        if (!DAYS.includes(normalizedDay)) {

            return res.status(400).json({
                message: "Invalid Day of Week"
            });

        }

        const start = timeToMinutes(start_time);
        const end = timeToMinutes(end_time);

        if (
            start === null ||
            end === null
        ) {

            return res.status(400).json({
                message: "Invalid time format. Use HH:MM"
            });

        }


        if (end <= start) {

            return res.status(400).json({
                message: "End time must be after start time"
            });

        }


        if (
            end - start < MIN_GROUP_DURATION
        ) {

            return res.status(400).json({
                message: "Group duration must be at least 60 minutes"
            });

        }

        const teacherSubject = teacherTeachesSubjectAndGrade(
            teacher_id,
            subjectId,
            gradeId
        );

        if (!teacherSubject) {

            return res.status(403).json({
                message: "You are not registered to teach this subject for this grade"
            });

        }

        const group = getGroupById(id);

        if (!group) {

            return res.status(404).json({
                message: "Group not found"
            });

        }

        if (group.teacher_id !== teacher_id) {

            return res.status(403).json({
                message: "You are not allowed to edit this group"
            });

        }

        const result = updateGroup(
            id,
            teacher_id,
            subjectId,
            gradeId,
            normalizedMode,
            cityId,
            normalizedDay,
            start_time,
            end_time,
            capacityNumber,
            priceNumber
        );


        if (result.changes === 0) {

            return res.status(404).json({
                message: "Group not found"
            });

        }


        return res.status(200).json({
            message: "Group updated successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function removeGroup(req,res){

    try{

        const teacher_id = req.user.user_id;
        const id = Number(req.params.id);

        if(
            !Number.isInteger(id) ||
            id <= 0
        ){
            return res.status(400).json({
                message : "Invalid Group ID"
            });
        }

        const group = getGroupById(id);

        if(!group){

            return res.status(404).json({
                message : "Group Not Found"
            });
        }

        if(group.teacher_id !== teacher_id){

            return res.status(403).json({
                message : "You Are Not Allowed To Delete This Group"
            });
        }

        deleteGroup(id, teacher_id);

        return res.status(200).json({
            message : "Group Deleted Successfully"
        });
    } catch(error){

        console.error(error);

        return res.status(500).json({
            message : "Internal Server Error"
        });
    }
}

function browseAllGroups(req, res) {
    try {
        const groups = getAllGroups();
        return res.status(200).json(groups);
    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    createNewGroup, getMyGroups,
    getOneGroup, editGroup,
    removeGroup, browseAllGroups
}