import express from "express";
import { getAbout, updateAbout } from "../controllers/aboutController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", getAbout);
router.post("/", protect, updateAbout);

export default router;
