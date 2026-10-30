require("dotenv").config();
const express = require("express");
const pool = require("./db");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;


app.get("/api/projects/:projectId/tasks", async (req, res) => {
    const { projectId } = req.params;

    const result = await pool.query(
        "SELECT * FROM tasks WHERE project_id = $1",
        [projectId]
    );
    res.json(result.rows);
});          

app.post("/api/projects/:projectId/tasks", async (req, res) => {
    const { projectId } = req.params;
    const { Title, Description } = req.body;

    const result = await pool.query(
        "INSERT INTO tasks (project_id, title, description) VALUES ($1, $2, $3) RETURNING *",
        [projectId, Title, Description]
    );

    res.status(201).json({
        message: "Task created successfully",
        task: result.rows[0]
    });
});

app.put("/api/projects/:projectId/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
 const { Title, Description, status } = req.body;

    const result = pool.query(
        "UPDATE tasks SET Title = $1, Description = $2, status = $3 WHERE id = $4 RETURNING *",
        [Title, Description, status, id]
    );
    const task = result.rows[0];

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
