import mongoose, { Document } from "mongoose";

interface Highlight {
    title: string;
    items: string[];
}

export interface IAbout extends Document {
    name?: string;
    degree?: string;
    description?: string;
    image?: string;
    highlights: Highlight[];
}

const highlightSchema = new mongoose.Schema({
    title: { type: String },
    items: [{ type: String }],
});

const aboutSchema = new mongoose.Schema<IAbout>({
    name: String,
    degree: String,
    description: String,
    image: String,
    highlights: [highlightSchema],
});

const About = mongoose.models.About || mongoose.model<IAbout>("About", aboutSchema);
export default About;
