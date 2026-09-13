const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 5000;
const FRONTEND_DIR = path.join(__dirname, "frontend");

const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === "/") pathname = "/index.html";

    const filePath = path.join(FRONTEND_DIR, pathname);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "text/plain";

    fs.readFile(filePath, (err, data) => {
        if (err) {
            fs.readFile(path.join(FRONTEND_DIR, "index.html"), (e, d) => {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end(d);
            });
        } else {
            res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-cache, no-store, must-revalidate", "Pragma": "no-cache", "Expires": "0" });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log("Frontend running at http://localhost:" + PORT);
});
