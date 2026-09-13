require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/database.js")
const app = express();
const authRoutes = require("./routes/auth.routes.js");
const profileRoutes = require("./routes/profile.routes.js");
const teacherSubjectRoutes = require("./routes/teacher_subject.routes.js");
const teacherSearchRoutes = require("./routes/teacher_search.routes.js");
const teacherCityRoutes = require("./routes/teacher_city.routes.js");
const teacherAvailabilityRoutes = require("./routes/teacher_availability.routes.js");
const groupRoutes = require("./routes/group.routes.js");
const bookingRoutes = require("./routes/booking.routes.js");
const studentGroupRoutes = require("./routes/student_group.routes");
const reviewRoutes = require("./routes/review.routes");

app.use(cors());
app.use(express.json())

app.use("/api/auth",authRoutes);
app.use("/api",profileRoutes);
app.use("/api",teacherSubjectRoutes);
app.use("/api",teacherSearchRoutes);
app.use("/api",teacherCityRoutes);
app.use("/api",teacherAvailabilityRoutes);
app.use("/api", groupRoutes);
app.use("/api",bookingRoutes);
app.use("/api", studentGroupRoutes);
app.use("/api", reviewRoutes);

const port = 3000;

app.listen(port,()=>{
    console.log("SERVER Is Running On Port 3000")
})