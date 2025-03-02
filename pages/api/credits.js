import dbConnect from "@/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "Missing email" });

    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      return res.status(200).json({ success: true, credits: user.credits });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  if (req.method === "POST") {
    const { userId, amount } = req.body;
    if (!userId || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid request parameters" });
    }

    try {
      const user = await User.findOne({ userId });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      user.credits += amount;
      await user.save();

      return res.status(200).json({ success: true, credits: user.credits });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
