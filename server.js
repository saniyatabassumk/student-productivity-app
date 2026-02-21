const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // serve index.html

// ==================
// MongoDB Connection
// ==================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// ==================
// USER MODEL
// ==================
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", userSchema);

// ==================
// STUDENT MODEL
// ==================
const studentSchema = new mongoose.Schema({
  name: String,
  attendance: Number
});

const Student = mongoose.model("Student", studentSchema);

// ==================
// ROUTES
// ==================

// Home route
app.get("/", (req, res) => {
  res.send("SmartTrack Backend Running 🚀");
});

// ------------------
// REGISTER
// ------------------
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.json({ message: "User registered successfully ✅" });

  } catch (error) {
    res.status(500).json({ error: "Registration failed ❌" });
  }
});

// ------------------
// LOGIN
// ------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password ❌" });
    }

    res.json({ message: "Login successful ✅" });

  } catch (error) {
    res.status(500).json({ error: "Login failed ❌" });
  }
});

// ------------------
// ADD STUDENT
// ------------------
app.post("/add", async (req, res) => {
  try {
    const { name, attendance } = req.body;

    const newStudent = new Student({
      name,
      attendance
    });

    await newStudent.save();

    res.json({ message: "Student added successfully ✅" });

  } catch (error) {
    res.status(500).json({ error: "Failed to add student ❌" });
  }
});

// ------------------
// GET ALL STUDENTS
// ------------------
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students ❌" });
  }
});

// ------------------
// DELETE STUDENT
// ------------------
app.delete("/delete/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted ✅" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

// ==================
// SERVER
// ==================
app.listen(5000, () => {
  console.log("🚀 Server started on port 5000");
});