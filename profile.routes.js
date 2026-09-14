const express = require("express");
const router = express.Router();
const {authMiddleware} = require("../middleware/auth.middleware");
const {getProfile, updateProfile, deleteProfile} = require("../controllers/profile.controller");

router.get("/profile",authMiddleware,getProfile);
router.put("/profile",authMiddleware,updateProfile);
router.delete("/profile",authMiddleware,deleteProfile);

module.exports = router;