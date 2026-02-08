"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const visitorRoutes_1 = __importDefault(require("./routes/visitorRoutes"));
const aboutRoutes_1 = __importDefault(require("./routes/aboutRoutes"));
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
/**
 * 🔴 VERY IMPORTANT
 * Real client IP পাওয়ার জন্য
 * (Vercel / Nginx / Proxy / Cloudflare)
 */
app.set("trust proxy", true);
// CORS Configuration
const allowedOrigins = [
    "http://localhost:3000", // Local development 
    "https://shishu-doctor.vercel.app", // Deployed frontend
    "https://shishudoctorbackend-trga.vercel.app", // Allow requests from backend itself
];
// Use CORS middleware with proper configuration
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes("*")) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
// Handle preflight requests
// app.options('*', cors());
// Middleware
app.use(express_1.default.json());
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/visitors", visitorRoutes_1.default);
app.use("/api/about", aboutRoutes_1.default);
// Health check
app.get("/", (_req, res) => {
    res.send("API running successfully 🚀");
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
exports.default = app;
