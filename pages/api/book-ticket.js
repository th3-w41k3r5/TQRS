import QRCode from "qrcode";
import axios from "axios";
import emailjs from "@emailjs/nodejs";
import dbConnect from "@/lib/dbConnect";
import Ticket from "@/models/Ticket";
import User from "@/models/User";

require("dotenv").config();

const BASE_URL = "https://api.textbee.dev/api/v1";
const API_KEY = process.env.TEXTBEE_API_KEY;
const DEVICE_ID = process.env.TEXTBEE_DEVICE_ID;

export default async function handler(req, res) {
  console.log("📩 Incoming request:", req.method, req.body);
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  const { name, email, phone, date, tickets, event, basePrice } = req.body;
  const ticketPrice = basePrice;
  const totalAmount = tickets * ticketPrice;
  const ticketURL = `https://tqrs.vercel.app/ticket/`;

  try {
    console.log("🔍 Fetching user:", email);
    const user = await User.findOne({ email });

    if (!user || user.credits < totalAmount) {
      return res.status(400).json({ success: false, message: "Not enough credits" });
    }

    user.credits -= totalAmount;
    await user.save();
    console.log("✅ Credits deducted:", user.credits);

    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

    const ticket = await Ticket.create({
      name,
      email,
      phone: formattedPhone,
      date,
      tickets,
      totalAmount,
      event,
      status: "Valid",
    });

    console.log("✅ Ticket created:", ticket._id);

    const qrCodeImage = await QRCode.toDataURL(ticket._id.toString());
    ticket.qrCode = qrCodeImage;
    await ticket.save();

    console.log("🎟 QR Code generated!");

    try {
      console.log("📩 Sending email to:", email);
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          name,
          event,
          date,
          tickets,
          totalAmount,
          ticket_url: `${ticketURL}${ticket._id}`,
        },
        {
          publicKey: process.env.EMAILJS_PUBLIC_KEY,
          privateKey: process.env.EMAILJS_PRIVATE_KEY,
        }
      );
      console.log("✅ Email sent successfully!");
    } catch (emailError) {
      console.error("❌ EmailJS Error:", emailError.message);
    }

    try {
      console.log("📲 Sending SMS to:", formattedPhone);
      await axios.post(
        `${BASE_URL}/gateway/devices/${DEVICE_ID}/send-sms`,
        {
          recipients: [formattedPhone],
          message: `Your ticket for ${event} is booked!\nName: ${name}\nDate: ${date}\nTotal Amount Paid: ${totalAmount} credits\nView it here: ${ticketURL}${ticket._id}`,
        },
        {
          headers: { "x-api-key": API_KEY },
        }
      );
      console.log("✅ SMS sent successfully!");
    } catch (smsError) {
      console.error("❌ Error sending SMS:", smsError.message);
    }

    return res.status(200).json({
      success: true,
      ticketId: ticket._id,
      qrCode: qrCodeImage,
      remainingCredits: user.credits,
    });

  } catch (error) {
    console.error("🚨 Error processing request:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}
