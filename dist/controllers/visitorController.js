"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitorCounts = exports.addVisitor = void 0;
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const Visitor_1 = require("../models/Visitor");
const db_1 = __importDefault(require("../config/db"));
const addVisitor = async (req, res) => {
    try {
        // ✅ Ensure DB connection (serverless-safe)
        await (0, db_1.default)();
        // 🔹 Get real IP (Vercel / proxy compatible)
        const rawIp = req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.headers["cf-connecting-ip"] ||
            req.socket.remoteAddress ||
            "";
        const ip = rawIp.replace("::ffff:", "");
        // 🔹 Today as YYYY-MM-DD
        const today = new Date().toISOString().slice(0, 10);
        // 🔹 Detect country safely
        let country = "Unknown";
        try {
            const geo = geoip_lite_1.default.lookup(ip);
            if (geo?.country)
                country = geo.country;
        }
        catch (e) {
            console.error("GeoIP failed:", e);
        }
        // 🔹 Create visitor (unique index handles duplicates)
        await Visitor_1.Visitor.create({ ip, country, date: today });
        return res.status(201).json({ counted: true });
    }
    catch (err) {
        // Duplicate visitor for today
        if (err.code === 11000) {
            return res.json({ counted: false });
        }
        console.error("Visitor error:", err);
        return res.status(500).json({
            message: "Server Error",
            counted: false,
        });
    }
};
exports.addVisitor = addVisitor;
const getVisitorCounts = async (req, res) => {
    try {
        // ✅ Always connect in serverless
        await (0, db_1.default)();
        const today = new Date().toISOString().slice(0, 10);
        const total = await Visitor_1.Visitor.countDocuments();
        const todayCount = await Visitor_1.Visitor.countDocuments({ date: today });
        const countryWise = await Visitor_1.Visitor.aggregate([
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const countryCountAgg = await Visitor_1.Visitor.aggregate([
            { $group: { _id: "$country" } },
            { $count: "totalCountries" },
        ]);
        const countryCount = countryCountAgg[0]?.totalCountries || 0;
        return res.json({
            total,
            today: todayCount,
            countryCount,
            countryWise,
        });
    }
    catch (err) {
        console.error("Stats error:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};
exports.getVisitorCounts = getVisitorCounts;
