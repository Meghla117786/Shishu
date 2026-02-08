import { Request, Response } from "express";
import About from "../models/About";
import connectDB from "../config/db";

export const getAbout = async (req: Request, res: Response) => {
    try {
        console.log("Connecting to DB...");
        await connectDB();
        console.log("Connected! Fetching about...");

        const about = await About.findOne();
        console.log("About found:", about);

        return res.json(about || {
            name: "",
            degree: "",
            description: "",
            image: "",
            highlights: [],
        });
    } catch (err) {
        console.error("Full error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err instanceof Error ? err.message : "Unknown error"
        });
    }
};
export const about = async (req: Request, res: Response) => {
    res.send("test")
};

export const updateAbout = async (req: Request, res: Response) => {
    try {
        await connectDB(); // 🔴 REQUIRED

        let about = await About.findOne();
        const payload: any = { ...req.body };

        // Parse highlights if string
        if (payload.highlights && typeof payload.highlights === "string") {
            try {
                payload.highlights = JSON.parse(payload.highlights);
            } catch {
                return res.status(400).json({ message: "Invalid highlights format" });
            }
        }

        if (!Array.isArray(payload.highlights)) {
            payload.highlights = [];
        }

        if (!about) {
            about = await About.create(payload);
            return res.status(201).json(about);
        }

        Object.assign(about, payload);
        await about.save();

        return res.json(about);
    } catch (err) {
        console.error("Update About error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
