// src/routes/visitorRoutes.ts
import express from "express";
import { addVisitor, getVisitorCounts } from "../controllers/visitorController";

const router = express.Router();

router.post("/", addVisitor);       // Call this when someone visits
router.get("/counts", getVisitorCounts);

export default router;
