const express = require("express");
const router = express.Router();

const{
    createNewGroup,
    getMyGroups,
    getOneGroup,
    editGroup,
    removeGroup,
    browseAllGroups
} = require("../controllers/group.controller");

const {authMiddleware} = require("../middleware/auth.middleware");

router.get("/groups/browse", authMiddleware, browseAllGroups);
router.post("/teacher/groups", authMiddleware, createNewGroup);
router.get("/teacher/groups", authMiddleware, getMyGroups);
router.get("/groups/:id", getOneGroup);
router.put("/teacher/groups/:id", authMiddleware, editGroup);
router.delete("/teacher/groups/:id", authMiddleware, removeGroup);

module.exports = router;