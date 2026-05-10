import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const USERS_FILE = path.join(__dirname, "users.json");

  app.use(express.json());

  // Auth Endpoints
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      const users = JSON.parse(data);
      const user = users.find((u: any) => u.username === username && u.password === password);

      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
      } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    const { username, password, displayName } = req.body;
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      const users = JSON.parse(data);

      if (users.find((u: any) => u.username === username)) {
        return res.status(400).json({ success: false, message: "Username already exists" });
      }

      const newUser = {
        id: Date.now().toString(),
        username,
        password,
        displayName: displayName || username,
        avatar: (displayName || username).charAt(0).toUpperCase()
      };

      users.push(newUser);
      await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ success: true, user: userWithoutPassword });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
