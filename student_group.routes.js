const express = require("express");

const router = express.Router();

const {
    joinGroupController,
    getMyGroups,
    getStudentsInGroup,
    removeFromGroup
} = require("../controllers/student_group.controller");

const {
    authMiddleware
} = require("../middleware/auth.middleware");


router.post(
    "/groups/:group_id/join",
    authMiddleware,
    joinGroupController
);

router.get(
    "/student/groups",
    authMiddleware,
    getMyGroups
);

router.get(
    "/groups/:group_id/students",
    authMiddleware,
    getStudentsInGroup
);

router.delete(
    "/groups/:group_id/leave",
    authMiddleware,
    removeFromGroup
);

module.exports = router;