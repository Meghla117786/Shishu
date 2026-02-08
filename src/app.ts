import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import visitorRoutes from "./routes/visitorRoutes";
import aboutRoutes from "./routes/aboutRoutes";

dotenv.config();

const app = express();

app.set("trust proxy", true);

const allowedOrigins = [
    "http://localhost:3000",
    "https://shishu-doctor.vercel.app",
    "https://shishudoctorbackend-trga.vercel.app",
];

app.use(
    cors({
        origin(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/about", aboutRoutes);

app.get("/", (_req, res) => {
    res.send("API running successfully 🚀");
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong!" });
});

app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});

export default app;
