const {addTeacherSubject, getTeacherSubjects, 
    deleteTeacherSubjects, updateTeacherSubject,
    getTeacherSubject
} = require("../models/teacher_subject.model");
const db = require("../config/database");

function addSubject(req,res){
    try{
        console.log("REQ.USER IN CONTROLLER:", req.user);

        const teacher_id = req.user.user_id;
        const {subject_id, grade_id} = req.body;

        if (!subject_id || !grade_id){
            return res.status(400).json({
                message : " Subject and Grade are Required!"
            });
        }

        const subject = db.prepare(`
            SELECT id FROM subjects WHERE id = ?`
        ).get(subject_id);

        if(!subject){
            return res.status(404).json({
                message : "Subject Not Found!"
            });
        }

        const grade = db.prepare(`
            SELECT id FROM grades WHERE id =?`
        ).get(grade_id);

        if(!grade){
            return res.status(404).json({
                message : "Grade Not Found"
            });
        }

        addTeacherSubject(teacher_id,subject_id,grade_id);
        return res.status(201).json({
            message : "Subject Added Successfully"
        })
    }catch(error){
        console.error(error)
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                message: "This subject is already assigned to this teacher for this grade"
            });
        }
        return res.status(500).json({
            message : "Internal Server Error"
        });
    }
}

function getSubjects(req,res){
    try{
        const teacher_id = req.user.user_id;
        const subjects = getTeacherSubjects(teacher_id);

        if(req.user.role !== "teacher"){
            return res.status(403).json({
                message : "Only Teachers Can Access Their Subjects"
            });
        }

        return res.status(200).json(subjects);

    }catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Internal Server Error"
        });
    }
}

function deleteSubject(req,res){
    try{
        const teacher_id = req.user.user_id;
        const subject_id = req.params.id;

        const result = deleteTeacherSubjects(teacher_id, subject_id);

        if(result.changes === 0){
            return res.status(404).json({
                message : "Subject Not Found"
            })
        }

        return res.status(200).json({
            message : "Subject Deleted Successfully"
        });
    }catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Internal Server Error"
        });
    }
}

function updateSubject(req,res){
    try{
        const teacher_id = req.user.user_id;
        const id = req.params.id;
        const {subject_id, grade_id} = req.body;

        if(!subject_id || !grade_id){
            return res.status(400).json({
                message : "Subject and Grade Are Required!"
            });
        }

        const subject = db.prepare(`
            SELECT id FROM subjects
            WHERE id =?`
        ).get(subject_id);

        if(!subject){
            return res.status(404).json({
                message : "Subject Not Found!"
            });
        }

        const grade = db.prepare(`
            SELECT id FROM grades
            WHERE id = ?`
        ).get(grade_id)

        if(!grade){
            return res.status(404).json({
                message : "Grade Not Found"
            });
        }

        const result = updateTeacherSubject(subject_id, grade_id, id, teacher_id)

        if(result.changes === 0){
            return res.status(404).json({
                message : "Teacher Subject Not Found"
            });
        }

        const updatedSubject = getTeacherSubject(id, teacher_id);
        return res.status(200).json({
            message : "Subject Updated Successfully",
            subject : updatedSubject
        })

    }catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Internal Server Error"
        });
    }
}

module.exports = {addSubject, getSubjects, deleteSubject, updateSubject};