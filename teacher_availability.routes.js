const express = require("express");
const router = express.Router();

const{
    createAvailability,
    getAvailability,
    editAvailability,
    removeAvailability
} = require("../controllers/teacher_availability.controller");

const {authMiddleware} = require("../middleware/auth.middleware");

router.post("/teacher/availability", authMiddleware, createAvailability);
router.get("/teachers/:teacher_id/availability", getAvailability);
router.put("/teacher/availability/:id", authMiddleware, editAvailability);
router.delete("/teacher/availability/:id", authMiddleware, removeAvailability);

module.exports = router;