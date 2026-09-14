const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/auth.middleware");
const {
     addCity, getCities,
     deleteCity, updateCity
    } = require("../controllers/teacher_city.controller");

router.post("/teacher/cities",authMiddleware, addCity);
router.get("/teacher/cities", authMiddleware, getCities);
router.delete("/teacher/cities/:city_id", authMiddleware,deleteCity);
router.put("/teacher/cities/:city_id", authMiddleware, updateCity)

module.exports = router;