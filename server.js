require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.json());
const PORT = 3000;

 const tasks= [
           {id:1, Title : "Nodejs", Description: "This is your first task", Status : "Completed"},
           {id:2, Title : "Task management API", Description: "This is your second task", Status : "In-progress"},
           {id:3, Title : "Nextjs", Description: "This is your third task", Status : "Not Started Yet"}
    ];

app.get("/api/Tasks", (req, res) => {
   res.json(tasks);           
});
app.post("/api/Tasks", (req, res) => {
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

app.put("/api/Tasks/:id", (req, res) => {
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
