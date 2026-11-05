const http = require("http");
const fs = require("fs");
const path = require("path");
const root = __dirname;
const allowed = new Set(["index.html", "app.js", "exam-questions.js", "styles.css", "admin.css", "course-cards.css", "exam-timer.css", "login-schedule.css"]);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mp4": "video/mp4" };
http.createServer((req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\//, "") || "index.html"; }
  catch { res.writeHead(400); res.end("Bad request"); return; }
  const file = path.resolve(root, name);
  const inRoot = file.startsWith(root + path.sep);
  if (!inRoot || (!allowed.has(name) && !/^videos\/lesson-\d{2}\.mp4$/.test(name))) {
    res.writeHead(404); res.end("Not found"); return;
  }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
}).listen(8081, "127.0.0.1", () => console.log("http://127.0.0.1:8081"));
