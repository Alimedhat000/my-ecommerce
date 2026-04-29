// src/index.ts
import express from "express";
var app = express();
var PORT = process.env.PORT || 3001;
app.use(express.json());
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
