const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.static(__dirname));
app.use(express.json());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ Database Connected"))
.catch((err) => console.log("❌ DB Error:", err));

const studentSchema = new mongoose.Schema({
  name: String,
  attendance: Number
});

const Student = mongoose.model("Student", studentSchema);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

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
    res.status(500).json({ error: "Something went wrong ❌" });
  }
});

app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.get("/testadd", async (req, res) => {
  const newStudent = new Student({
    name: "Test",
    attendance: 80
  });

  await newStudent.save();
  res.send("Test student added");
});

app.delete("/delete/:id", async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted ✅" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed ❌" });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});