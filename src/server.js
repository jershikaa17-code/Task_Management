require("dotenv").config();
const express = require("express");
const pool = require("./db");
const app = express();
app.use(express.json());
const PORT = 3000;


const JWT_SECRET = process.env.JWT_SECRET;
const users = [
  { id: 1, username: 'Ananya', password: 'Hello', role: 'user' }
];
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }
  try {

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

app.get('/profile', authenticateJWT, (req, res) => {
  res.json({ message: 'Profile accessed', user: req.user });
});


app.get('/admin', authenticateJWT, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: admin role required' });
  }

  res.json({ message: 'Admin panel accessed' });
});


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
