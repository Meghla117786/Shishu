import { Request, Response } from "express";
import geoip from "geoip-lite";
import { Visitor } from "../models/Visitor";
import connectDB from "../config/db";

export const addVisitor = async (req: Request, res: Response) => {
    try {
        // ✅ Ensure DB connection (serverless-safe)
        await connectDB();

        // 🔹 Get real IP (Vercel / proxy compatible)
        const rawIp =
            (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
            (req.headers["cf-connecting-ip"] as string) ||
            req.socket.remoteAddress ||
            "";

        const ip = rawIp.replace("::ffff:", "");

        // 🔹 Today as YYYY-MM-DD
        const today = new Date().toISOString().slice(0, 10);

        // 🔹 Detect country safely
        let country = "Unknown";
        try {
            const geo = geoip.lookup(ip);
            if (geo?.country) country = geo.country;
        } catch (e) {
            console.error("GeoIP failed:", e);
        }

        // 🔹 Create visitor (unique index handles duplicates)
        await Visitor.create({ ip, country, date: today });

        return res.status(201).json({ counted: true });
    } catch (err: any) {
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

export const getVisitorCounts = async (req: Request, res: Response) => {
    try {
        // ✅ Always connect in serverless
        await connectDB();

        const today = new Date().toISOString().slice(0, 10);

        const total = await Visitor.countDocuments();
        const todayCount = await Visitor.countDocuments({ date: today });

        const countryWise = await Visitor.aggregate([
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        const countryCountAgg = await Visitor.aggregate([
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
    } catch (err) {
        console.error("Stats error:", err);
        return res.status(500).json({ message: "Server Error" });
    }
};
