import dbConnect from "@/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { email, amount } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      user.credits += amount; 
      await user.save();

      return res.status(200).json({ success: true, message: "Credits added successfully", credits: user.credits });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
