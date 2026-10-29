require("dotenv").config();
const express = require("express");
const pool = require("./db");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

 
app.post("/api/projects/:projectId/tasks", async (req, res) => {
    try {
        const { projectId } = req.params;
        const { title, description } = req.body;

        const result = await pool.query(
            `INSERT INTO tasks (project_id, title, description, created_by)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [projectId, title, description || null, 1]
        );

        res.status(201).json({
            message: "Task created successfully",
            task: result.rows[0]
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Failed to create task"
        });
    }
});


app.get("/api/projects/:projectId/tasks", (req, res) => {
   res.json(tasks);           
});
app.post("/api/projects/:projectId/tasks", (req, res) => {
    const newTask = {
        id: tasks.length + 1,
        Title: req.body.Title,
        Description: req.body.Description,
        Status: "Not Started Yet"
    };

    tasks.push(newTask);

    res.status(201).json({
        message: "Task created successfully",
        task: newTask
    });
});

app.put("/api/projects/:projectId/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    task.Title = req.body.Title;
    task.Description = req.body.Description;
    task.Status = req.body.Status;

    res.json({
        message: "Task updated successfully",
        task
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
