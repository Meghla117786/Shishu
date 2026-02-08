import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name?: string;
    email: string;
    password: string;
    role: "admin" | "user";
    resetPasswordCode?: string;
    resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },
        resetPasswordCode: {
            type: String,
            default: null,
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);