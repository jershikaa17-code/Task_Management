require("dotenv").config();
const express = require("express");
const pool = require("./db");
const app = express();
app.use(express.json());
const PORT = 3000;


app.get("/api/projects/:projectId/tasks", async (req, res) => {
    const projectId = req.params.projectId;

    const result = await pool.query(
        "SELECT * FROM tasks WHERE project_id = $1",
        [projectId]
    );
    res.json(result.rows);
});          

app.post("/api/projects/:projectId/tasks", async (req, res) => {
    const projectId = req.params.projectId;
   const title = req.body.title;
const description = req.body.description;

    const result = await pool.query(
        "INSERT INTO tasks (project_id, title, description) VALUES ($1, $2, $3) RETURNING *",
        [projectId, title, description]
    );

    res.status(201).json({
        message: "Task created successfully",
        task: result.rows[0]
    });
});

app.put("/api/projects/:projectId/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);
    const projectId = req.params.projectId;
    const title = req.body.title;
    const description = req.body.description;
    const status = req.body.status;

    const result = await pool.query(
        "UPDATE tasks SET title = $1, description = $2, status = $3 WHERE id = $4 RETURNING *",
        [title, description, status, id]
    );
    const task = result.rows[0];

    if (!task) {
        return res.status(404).json({ message: "Task not found" });
    }

    task.title = req.body.title;
    task.description = req.body.description;
    task.status = req.body.status;

    res.json({
        message: "Task updated successfully",
        task
    });
});

app.delete("/api/projects/:projectId/tasks/:id", async (req, res) => {
    const id = req.params.id;
    const result = await pool.query(
        "DELETE FROM tasks WHERE id = $1 RETURNING *",
        [id]
    );
    res.json({
        message: "Task deleted successfully"
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
