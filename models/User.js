import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  provider: { type: String, required: true },
  credits: { type: Number, default: 100 },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
