const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AUPP LMS API is running successfully!");
});

app.get("/api/courses", (req, res) => {
  res.json({
    message: "AUPP LMS Courses API",
    courses: ["Cloud DevOps", "Web Development", "Database Systems"]
  });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'AUPP LMS API'
    });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AUPP LMS API running on port ${PORT}`);
});