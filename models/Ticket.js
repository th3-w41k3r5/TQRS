const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      match: /.+\@.+\..+/
    },
    phone: { 
      type: String, 
      required: true, 
      match: /^\+91\d{10}$/
    },
    date: { type: Date, required: true },
    tickets: { 
      type: Number, 
      required: true, 
      min: 1 
    },
    totalAmount: { 
      type: Number, 
      required: true, 
      min: 0
    },
    event: { type: String, required: true },
    qrCode: { type: String }, 
    status: { type: String, default: "Valid" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
