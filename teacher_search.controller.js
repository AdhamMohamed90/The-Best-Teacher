const {
        searchTeachers,
        getTeacherDetails,
        getTeacherCities
    } = require("../models/teacher.model");

const {getTeacherSubjects} = require("../models/teacher_subject.model");

function search(req,res){
    try{
        const {subject_id, grade_id, city_id, teachingmode} = req.query;
        const filters = {};

        if(subject_id){

            const subjectId = Number(subject_id);

            if(!Number.isInteger(subjectId) || subjectId <= 0){
                return res.status(400).json({
                    message : "Invalid Subject ID!"
                });
            }
            filters.subject_id = subjectId;
        }

        if(grade_id){

            const gradeId = Number(grade_id);

            if(!Number.isInteger(gradeId) || gradeId <= 0){
                return res.status(400).json({
                    message : "Invalid Grade ID!"
                });
            }

            filters.grade_id = gradeId;
        }

        if(city_id){

            const cityId = Number(city_id);

            if(!Number.isInteger(cityId) || cityId <= 0){
                return res.status(400).json({
                    message : "Invalid City ID!"
                });
            }

            filters.city_id = cityId;
        }

        if(teachingmode){
            const normalizedteachingmode = teachingmode.toLowerCase();

            if(!["online","offline","both"].includes(normalizedteachingmode)){
                return res.status(400).json({
                    message : "Teaching Mode Must be Offline, Online , or Both"
                });
            }

            filters.teachingmode = normalizedteachingmode;
        }

        const teachers = searchTeachers(filters);
        
        return res.status(200).json(teachers);
    }catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Internal Server Error"
        });
    }
}

function getTeacher(req,res){

try{
    const teacher_id = Number(req.params.id);

    if(!Number.isInteger(teacher_id) || teacher_id <= 0){
        return res.status(400).json({
            message : "Invalid Teacher ID"
        });
    }

    const teacher = getTeacherDetails(teacher_id);

    if(!teacher){
        return res.status(404).json({
            message : "Teacher Not Found!"
        });
    }

    const subjects = getTeacherSubjects(teacher_id);
    const cities =  getTeacherCities(teacher_id);

    return res.status(200).json({
        ...teacher,
        subjects,
        cities})

}catch(error){
    console.error(error);

    return res.status(500).json({
        error: "Internal Server Error"
    });
}
}


module.exports = {search, getTeacher};