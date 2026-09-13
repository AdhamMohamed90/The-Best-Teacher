const {
    joinGroup,
    getStudentGroup,
    getStudentGroups,
    getGroupStudents,
    leaveGroup
} = require("../models/student_group.model");

const db = require("../config/database");

function joinGroupController(req, res) {

    try {

        const student_id = req.user.user_id;
        const group_id = Number(req.params.group_id);

        if (
            !Number.isInteger(group_id) ||
            group_id <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Group ID"
            });

        }

        if (req.user.role !== "student") {

            return res.status(403).json({
                message: "Only students can join groups"
            });

        }

        const group = db.prepare(`
            SELECT id
            FROM groups
            WHERE id = ?
        `).get(group_id);


        if (!group) {

            return res.status(404).json({
                message: "Group not found"
            });

        }

        const existingGroup = getStudentGroup(
            group_id,
            student_id
        );

        if (existingGroup) {

            return res.status(409).json({
                message: "You already joined this group"
            });

        }

        const result = joinGroup(
            group_id,
            student_id
        );

        return res.status(201).json({
            message: "Joined group successfully",
            student_group_id: Number(result.lastInsertRowid)
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function getMyGroups(req, res) {

    try {

        const student_id = req.user.user_id;

        const groups = getStudentGroups(student_id);

        return res.status(200).json(groups);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function getStudentsInGroup(req, res) {

    try {

        const group_id = Number(req.params.group_id);


        if (
            !Number.isInteger(group_id) ||
            group_id <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Group ID"
            });

        }

        const group = db.prepare(`
            SELECT id
            FROM groups
            WHERE id = ?
        `).get(group_id);


        if (!group) {

            return res.status(404).json({
                message: "Group not found"
            });

        }

        const students = getGroupStudents(group_id);

        return res.status(200).json(students);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

function removeFromGroup(req, res) {

    try {

        const student_id = req.user.user_id;
        const group_id = Number(req.params.group_id);


        if (
            !Number.isInteger(group_id) ||
            group_id <= 0
        ) {

            return res.status(400).json({
                message: "Invalid Group ID"
            });

        }

        const membership = getStudentGroup(
            group_id,
            student_id
        );


        if (!membership) {

            return res.status(404).json({
                message: "You are not a member of this group"
            });

        }

        leaveGroup(
            group_id,
            student_id
        );

        return res.status(200).json({
            message: "Left group successfully"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
}

module.exports = {
    joinGroupController,
    getMyGroups,
    getStudentsInGroup,
    removeFromGroup
};