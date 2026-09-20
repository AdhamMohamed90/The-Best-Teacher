const express = require("express");
const router = express.Router();
const {search, getTeacher} = require("../controllers/teacher_search.controller");

router.get("/teachers/search",search);
router.get("/teachers/:id", getTeacher);

module.exports = router;