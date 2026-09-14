const express = require("express");
const router = express.Router();

const{
    createNewBooking,
    getOneBooking,
    getMyBookings,
    getTeacherMyBookings,
    editBooking,
    removeBooking
} = require("../controllers/booking.controller");

const {authMiddleware} = require("../middleware/auth.middleware");

router.post("/bookings",authMiddleware, createNewBooking);
router.get("/bookings/:id", authMiddleware, getOneBooking);
router.get("/student/bookings", authMiddleware, getMyBookings);
router.get("/teacher/bookings", authMiddleware, getTeacherMyBookings);
router.put("/bookings/:id",authMiddleware,editBooking );
router.delete("/bookings/:id", authMiddleware, removeBooking);

module.exports = router;