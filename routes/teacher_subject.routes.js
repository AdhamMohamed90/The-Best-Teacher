const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/auth.middleware");
const {addSubject, getSubjects, deleteSubject, updateSubject} = require("../controllers/teacher_subject.controller");

router.post("/teacher/subjects",authMiddleware,addSubject);
router.get("/teacher/subjects",authMiddleware,getSubjects);
router.delete("/teacher/subjects/:id", authMiddleware,deleteSubject);
router.put("/teacher/subjects/:id", authMiddleware,updateSubject )

module.exports = router;