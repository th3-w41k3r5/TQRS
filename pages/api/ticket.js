import dbConnect from "@/mongodb";
import Ticket from "@/models/Ticket";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const { id, email } = req.query;

    try {
      let tickets = [];

      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ success: false, message: "Invalid Ticket ID" });
        }
        const ticket = await Ticket.findById(id);
        if (ticket) tickets.push(ticket);
      } else if (email) {
        tickets = await Ticket.find({ email: email });
      }

      if (tickets.length === 0) return res.status(404).json({ success: false, message: "No tickets found" });

      return res.status(200).json({ success: true, tickets });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  return res.status(405).json({ success: false, message: "Method Not Allowed" });
}
