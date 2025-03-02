import dbConnect from "@/mongodb";
import Ticket from "@/models/Ticket";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const { id } = req.query;

    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Ticket ID" });
      }

      const ticket = await Ticket.findById(id);
      if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

      const today = new Date();
      const ticketDate = new Date(ticket.date);

      // Automatically mark expired if past event date
      if (ticketDate < today) {
        ticket.status = "Expired";
        await ticket.save();
        return res.status(400).json({ success: false, message: "Ticket expired" });
      }

      // If already used, deny access
      if (ticket.status === "Expired") {
        return res.status(400).json({ success: false, message: "Ticket already used" });
      }

      // Mark ticket as Expired after scan
      ticket.status = "Expired";
      await ticket.save();

      return res.status(200).json({ success: true, message: "Access granted. Ticket validated.", ticket });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
