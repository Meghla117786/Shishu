"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const visitorRoutes_1 = __importDefault(require("./routes/visitorRoutes"));
const aboutRoutes_1 = __importDefault(require("./routes/aboutRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set("trust proxy", true);
const allowedOrigins = [
    "http://localhost:3000",
    "https://shishu-doctor.vercel.app",
    "https://shishudoctorbackend-trga.vercel.app",
];
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use("/api/auth", authRoutes_1.default);
app.use("/api/visitors", visitorRoutes_1.default);
app.use("/api/about", aboutRoutes_1.default);
app.get("/", (_req, res) => {
    res.send("API running successfully 🚀");
});
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Something went wrong!" });
});
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});
exports.default = app;
