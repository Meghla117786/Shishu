"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAbout = exports.getAbout = void 0;
const About_1 = __importDefault(require("../models/About"));
const getAbout = async (req, res) => {
    try {
        const about = await About_1.default.findOne();
        res.json(about || {});
    }
    catch (err) {
        console.error("Get About error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAbout = getAbout;
const updateAbout = async (req, res) => {
    try {
        let about = await About_1.default.findOne();
        // Handle uploaded file
        if (req.file) {
            req.body.image = `/uploads/${req.file.filename}`;
        }
        // Parse highlights if sent as JSON string
        if (req.body.highlights && typeof req.body.highlights === "string") {
            try {
                req.body.highlights = JSON.parse(req.body.highlights);
            }
            catch (err) {
                console.error("Invalid highlights JSON:", err);
                return res.status(400).json({ message: "Invalid highlights format" });
            }
        }
        // Create new About if not exists
        if (!about) {
            about = await About_1.default.create(req.body);
            return res.status(201).json(about);
        }
        // Update existing document
        Object.assign(about, req.body);
        await about.save();
        res.json(about);
    }
    catch (err) {
        console.error("Update About error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateAbout = updateAbout;
