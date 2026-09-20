const express = require("express");

const router = express.Router();

const {
    createNewReview,
    getTeacherReviewsController,
    getTeacherRatingController
} = require("../controllers/review.controller");

const {
    authMiddleware
} = require("../middleware/auth.middleware");


router.post(
    "/reviews",
    authMiddleware,
    createNewReview
);


router.get(
    "/teachers/:teacher_id/reviews",
    getTeacherReviewsController
);

router.get(
    "/teachers/:teacher_id/rating",
    getTeacherRatingController
);


module.exports = router;