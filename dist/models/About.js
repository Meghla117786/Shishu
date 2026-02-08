"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const highlightSchema = new mongoose_1.default.Schema({
    title: { type: String },
    items: [{ type: String }],
});
const aboutSchema = new mongoose_1.default.Schema({
    name: String,
    degree: String,
    description: String,
    image: String,
    highlights: [highlightSchema],
});
const About = mongoose_1.default.models.About || mongoose_1.default.model("About", aboutSchema);
exports.default = About;
