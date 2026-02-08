"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAbout = exports.about = exports.getAbout = void 0;
const About_1 = __importDefault(require("../models/About"));
const db_1 = __importDefault(require("../config/db"));
const getAbout = async (req, res) => {
    try {
        console.log("Connecting to DB...");
        await (0, db_1.default)();
        console.log("Connected! Fetching about...");
        const about = await About_1.default.findOne();
        console.log("About found:", about);
        return res.json(about || {
            name: "",
            degree: "",
            description: "",
            image: "",
            highlights: [],
        });
    }
    catch (err) {
        console.error("Full error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
exports.getAbout = getAbout;
const about = async (req, res) => {
    const about = await About_1.default.findOne({});
    res.send({ data: about });
};
exports.about = about;
const updateAbout = async (req, res) => {
    try {
        await (0, db_1.default)(); // 🔴 REQUIRED
        let about = await About_1.default.findOne();
        const payload = { ...req.body };
        // Parse highlights if string
        if (payload.highlights && typeof payload.highlights === "string") {
            try {
                payload.highlights = JSON.parse(payload.highlights);
            }
            catch {
                return res.status(400).json({ message: "Invalid highlights format" });
            }
        }
        if (!Array.isArray(payload.highlights)) {
            payload.highlights = [];
        }
        if (!about) {
            about = await About_1.default.create(payload);
            return res.status(201).json(about);
        }
        Object.assign(about, payload);
        await about.save();
        return res.json(about);
    }
    catch (err) {
        console.error("Update About error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.updateAbout = updateAbout;
