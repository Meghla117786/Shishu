"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const highlightSchema = new mongoose_1.default.Schema({
    title: { type: String, required: true },
    items: [{ type: String }],
});
const aboutSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    degree: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    highlights: [highlightSchema],
});
const About = mongoose_1.default.model("About", aboutSchema);
exports.default = About;
