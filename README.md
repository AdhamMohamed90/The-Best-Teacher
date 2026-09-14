# 🎓 Teacher Finder

A full-stack web-based platform that helps students **find the best teachers for their courses based on their location, subjects, availability, and preferences**.

This project was developed as the **final project of the IEEE Web Development Course**, with the goal of creating a practical solution that connects students with suitable teachers in a simple, convenient, and personalized way.

---

## 📌 About The Project

Finding the right teacher can sometimes be difficult, especially when students have specific requirements regarding the **course, location, availability, and learning preferences**.

**Teacher Finder** aims to solve this problem by providing a platform where students can search for teachers and explore their information based on their needs.

The system supports different functionalities for both **students and teachers**, including teacher searching, teacher profiles, bookings, groups, availability, subjects, cities, and reviews.

The project was developed as a **full-stack web application**, connecting the front-end with a **Node.js and Express.js back-end** and an **SQLite database**.

---

## ✨ Features

### 👨‍🎓 Student Features

- 🔎 Search for teachers
- 📍 Search teachers based on location
- 📚 Search by subject
- 👨‍🏫 View teacher profiles
- 📅 Book teachers
- 👥 Join and manage groups
- ⭐ Review teachers
- 📊 Student dashboard
- 🔐 Student registration and authentication

### 👨‍🏫 Teacher Features

- 👤 Manage teacher profile
- 📍 Manage teaching cities
- 📚 Manage teaching subjects
- 🕐 Manage availability
- 📅 Manage bookings
- 👥 Manage groups
- 📊 Teacher dashboard

### 🔐 System Features

- 🔐 User authentication and authorization
- 👨‍🎓 Student and teacher roles
- 🛡️ Protected routes and authentication middleware
- 🔗 RESTful APIs
- 🔄 CRUD operations
- 🗄️ SQLite database
- 🔌 Front-end and back-end integration
- 📍 Location-based teacher searching
- ⭐ Teacher reviews and ratings
- 📅 Booking management
- 👥 Group management
- 🎨 Responsive user interface
- 🌓 Theme support

---

## 🛠️ Technologies Used

### Front-End

- **HTML5**
- **CSS3**
- **JavaScript**

### Back-End

- **Node.js**
- **Express.js**

### Database

- **SQLite**

### Development Concepts

- RESTful APIs
- MVC Architecture
- CRUD Operations
- Authentication & Authorization
- Middleware
- Fetch API
- JSON
- npm

---

## 🏗️ Project Structure

Teacher-Finder/
│
├── config/
│   └── database.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── booking.controller.js
│   ├── group.controller.js
│   ├── profile.controller.js
│   ├── review.controller.js
│   ├── student_group.controller.js
│   ├── teacher_availability.controller.js
│   ├── teacher_city.controller.js
│   ├── teacher_search.controller.js
│   └── teacher_subject.controller.js
│
├── database/
│   └── FinalProject.db
│
├── frontend/
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── helpers.js
│       ├── index.js
│       ├── login.js
│       ├── register.js
│       └── theme.js
│
├── student/
│   │
│   ├── js/
│   │   ├── bookings.js
│   │   ├── dashboard.js
│   │   ├── groups.js
│   │   ├── search.js
│   │   └── teacher.js
│   │
│   ├── bookings.html
│   ├── dashboard.html
│   ├── groups.html
│   ├── search.html
│   └── teacher.html
│
├── teacher/
│   │
│   ├── js/
│   │   ├── ...
│   │
│   ├── availability.html
│   ├── bookings.html
│   ├── cities.html
│   ├── dashboard.html
│   ├── groups.html
│   ├── profile.html
│   └── subjects.html
│
├── middleware/
│   └── auth.middleware.js
│
├── models/
│   ├── booking.model.js
│   ├── group.model.js
│   ├── review.model.js
│   ├── student_group.model.js
│   ├── teacher_availability.model.js
│   ├── teacher_city.model.js
│   ├── teacher_subject.model.js
│   ├── teacher.model.js
│   └── user.model.js
│
├── routes/
│   ├── auth.routes.js
│   ├── booking.routes.js
│   ├── group.routes.js
│   ├── profile.routes.js
│   ├── review.routes.js
│   ├── student_group.routes.js
│   ├── teacher_availability.routes.js
│   ├── teacher_city.routes.js
│   ├── teacher_search.routes.js
│   └── teacher_subject.routes.js
│
├── utils/
│   └── transaction.js
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── serve.js
├── server.js
└── README.md

---
📄 License

This project was created for educational purposes as part of the IEEE Web Development Course.

---
⭐ Support

If you find this project interesting or useful, consider giving the repository a ⭐.

Thank you for visiting Teacher Finder! 🚀
