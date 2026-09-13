const path = require("path");
const { DatabaseSync } = require("node:sqlite");

console.log(
    "DATABASE PATH:",
    path.resolve("./database/FinalProject.db")
);

const db = new DatabaseSync("./database/FinalProject.db");

db.exec("PRAGMA foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN('student', 'teacher'))
    )
`);


db.exec(`
    CREATE TABLE IF NOT EXISTS grades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stage TEXT NOT NULL,
        grade_number INTEGER NOT NULL,
        UNIQUE(stage, grade_number)
    )
`);

db.exec(`
    INSERT OR IGNORE INTO grades (stage, grade_number)
    VALUES
        ('primary', 1),
        ('primary', 2),
        ('primary', 3),
        ('primary', 4),
        ('primary', 5),
        ('primary', 6),
        ('secondry', 1),
        ('secondry', 2),
        ('secondry', 3)
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        bio TEXT,
        teachingmode TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
`);


db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )
`);

db.exec(`
    INSERT OR IGNORE INTO subjects (name)
    VALUES
        ('Arabic'),
        ('English'),
        ('Math'),
        ('Science'),
        ('Social Studies')
`);


db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_subjects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        grade_id INTEGER NOT NULL,

        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (grade_id) REFERENCES grades(id),

        UNIQUE (teacher_id, subject_id, grade_id)
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )
`);

const cities = [
    "مصر الجديدة",
    "النزهة",
    "عين شمس",
    "مدينة نصر",
    "السلام",
    "المطرية",
    "المرج",
    "الزيتون",
    "الأميرية",
    "شبرا",
    "الزاوية الحمراء",
    "حدائق القبة",
    "روض الفرج",
    "الشرابية",
    "الساحل",
    "العباسية",
    "منشية ناصر",
    "وسط البلد",
    "بولاق",
    "عابدين",
    "الأزبكية",
    "الموسكي",
    "باب الشعرية",
    "الزمالك",
    "الجمالية",
    "الحسين",
    "الأزهر",
    "الدرب الأحمر",
    "السيدة زينب",
    "مصر القديمة",
    "المنيل",
    "المقطم",
    "البساتين",
    "دار السلام",
    "المعادي",
    "طرة",
    "حلوان",
    "المعصرة",
    "التبين",
    "15 مايو",
    "القاهرة الجديدة",
    "التجمع الأول",
    "التجمع الثالث",
    "التجمع الخامس",
    "النرجس",
    "البنفسج",
    "اللوتس",
    "المستثمرين الشمالية",
    "المستثمرين الجنوبية",
    "الرحاب",
    "مدينتي",
    "الشروق",
    "بدر",
    "جسر السويس",
    "الجيزة",
    "الدقي",
    "العجوزة",
    "المهندسين",
    "ميت عقبة",
    "إمبابة",
    "الوراق",
    "بولاق الدكرور",
    "صفط اللبن",
    "أرض اللواء",
    "المنيرة الغربية",
    "العمرانية",
    "الطالبية",
    "الهرم",
    "فيصل",
    "المريوطية",
    "كفر طهرمس",
    "منشأة البكاري",
    "حدائق الأهرام",
    "الرماية",
    "أبو النمرس",
    "الحوامدية",
    "البدرشين",
    "6 أكتوبر",
    "الشيخ زايد",
    "حدائق أكتوبر",
    "أكتوبر الجديدة",
    "كرداسة",
    "أوسيم",
    "شبرا الخيمة",
    "بهتيم",
    "مسطرد",
    "قليوب",
    "الخصوص",
    "العبور",
    "الخانكة",
    "القناطر الخيرية"
];

const insertCity = db.prepare(`
    INSERT OR IGNORE INTO cities (name)
    VALUES (?)
`);

for (const city of cities) {
    insertCity.run(city);
}

db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        grade_id INTEGER NOT NULL,
        mode TEXT NOT NULL,
        city_id INTEGER,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        price REAL NOT NULL,

        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (grade_id) REFERENCES grades(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (city_id) REFERENCES cities(id)
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS student_groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        student_id INTEGER NOT NULL,

        FOREIGN KEY (group_id) REFERENCES groups(id),
        FOREIGN KEY (student_id) REFERENCES users(id),

        UNIQUE(group_id, student_id)
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        teacher_id INTEGER NOT NULL,
        grade_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        city_id INTEGER,
        booking_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        mode TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (grade_id) REFERENCES grades(id),
        FOREIGN KEY (subject_id) REFERENCES subjects(id),
        FOREIGN KEY (city_id) REFERENCES cities(id)
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        teacher_id INTEGER NOT NULL,
        booking_id INTEGER,
        group_id INTEGER,
        rating REAL NOT NULL CHECK(rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (student_id) REFERENCES users(id),
        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (booking_id) REFERENCES bookings(id),
        FOREIGN KEY (group_id) REFERENCES groups(id)
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL,
        city_id INTEGER NOT NULL,

        FOREIGN KEY (teacher_id) REFERENCES users(id),
        FOREIGN KEY (city_id) REFERENCES cities(id),

        UNIQUE (teacher_id, city_id)
    )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS teacher_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL,
        day_of_week TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,

        FOREIGN KEY (teacher_id) REFERENCES users(id),

        UNIQUE (
            teacher_id,
            day_of_week,
            start_time,
            end_time
        )
    )
`);

module.exports = db;