const router = require("express").Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req,res)=>{
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req,res)=>{
  try {
    const task = await Task.create({ ...req.body, userId: req.user.id });
    req.io.emit("taskUpdated");
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/toggle/:id", async (req,res)=>{
  try {
    const t = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!t) return res.status(404).json({ message: "Task not found" });
    t.completed = !t.completed;
    await t.save();
    req.io.emit("taskUpdated");
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req,res)=>{
  try {
    const t = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!t) return res.status(404).json({ message: "Task not found" });
    req.io.emit("taskUpdated");
    res.json({ msg: "deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
