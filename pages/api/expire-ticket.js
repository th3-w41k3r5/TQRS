import dbConnect from "@/lib/dbConnect";
import Ticket from "@/models/Ticket";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    await dbConnect();

    const currentIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const todayIST = new Date(currentIST);
    todayIST.setHours(23, 59, 59, 999);

    console.log("🕛 Running Ticket Expiry Check at:", todayIST);

    const result = await Ticket.updateMany(
      { date: { $lt: todayIST }, status: "Valid" },
      { $set: { status: "Expired" } } 
    );

    console.log(`✅ Expired ${result.modifiedCount} tickets.`);
    return res.status(200).json({ success: true, message: `Expired ${result.modifiedCount} tickets.` });

  } catch (error) {
    console.error("❌ Error updating tickets:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
