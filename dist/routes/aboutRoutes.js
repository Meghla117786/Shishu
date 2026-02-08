"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aboutController_1 = require("../controllers/aboutController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: "uploads/" }); // temp folder
const router = express_1.default.Router();
router.get("/", aboutController_1.getAbout);
router.post("/", authMiddleware_1.protect, upload.single("image"), aboutController_1.updateAbout);
exports.default = router;
