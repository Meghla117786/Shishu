"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitorCounts = exports.addVisitor = void 0;
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const Visitor_1 = require("../models/Visitor");
/**
 * Add a visitor (daily unique by IP)
 */
const addVisitor = async (req, res) => {
    try {
        // 🔹 Get real IP (supports proxy)
        const ip = req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress ||
            "unknown";
        // 🔹 Normalize date → start of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // 🔹 Detect country from IP
        const geo = geoip_lite_1.default.lookup(ip);
        const country = geo?.country || "Unknown";
        // 🔹 Create visitor (MongoDB unique index prevents duplicates)
        await Visitor_1.Visitor.create({
            ip,
            country,
            date: today
        });
        res.status(201).json({ counted: true });
    }
    catch (err) {
        // Duplicate key → already counted today
        if (err.code === 11000) {
            return res.json({ counted: false });
        }
        console.error("Visitor error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.addVisitor = addVisitor;
/**
 * Get visitor statistics
 */
const getVisitorCounts = async (req, res) => {
    try {
        // 🔹 Today (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // 🔹 Total visitors
        const total = await Visitor_1.Visitor.countDocuments();
        // 🔹 Today's visitors
        const todayCount = await Visitor_1.Visitor.countDocuments({ date: today });
        // 🔹 Country-wise count
        const countryWise = await Visitor_1.Visitor.aggregate([
            {
                $group: {
                    _id: "$country",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        // 🔹 ✅ UNIQUE COUNTRY COUNT (NEW)
        const countryCountAgg = await Visitor_1.Visitor.aggregate([
            {
                $group: {
                    _id: "$country"
                }
            },
            {
                $count: "totalCountries"
            }
        ]);
        console.log(countryCountAgg);
        const countryCount = countryCountAgg[0]?.totalCountries || 0;
        res.json({
            total,
            today: todayCount,
            countryCount, // ✅ added
            countryWise
        });
    }
    catch (err) {
        console.error("Stats error:", err);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getVisitorCounts = getVisitorCounts;
