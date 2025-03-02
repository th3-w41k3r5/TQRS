import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function TicketPage() {
  const router = useRouter();
  const { id } = router.query;
  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`/api/showTicket?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTicket(data.ticket);
        else setMessage("Ticket not found.");
      })
      .catch(() => setMessage("Error fetching ticket."));
  }, [id]);

  if (!ticket) return <p className="text-center mt-6">{message || "Loading ticket..."}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-md rounded-md text-center">
        <h1 className="text-2xl font-bold">Your Ticket</h1>
        <p className="mt-2 text-gray-600">{ticket.event}</p>
        <p><strong>Date:</strong> {new Date(ticket.date).toLocaleDateString()}</p>
        <p><strong>Name:</strong> {ticket.name}</p>
        <p><strong>Phone:</strong> {ticket.phone}</p>
        <p><strong>Tickets:</strong> {ticket.tickets}</p>
        <p><strong>Total Amount:</strong> ₹{ticket.totalAmount}</p>
        <p>
          <strong>Status:</strong>
          <span className={ticket.status === "Valid" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {" "}{ticket.status}
          </span>
        </p>
        {ticket.qrCode && (
          <>
            <img src={ticket.qrCode} alt="QR Code" className="mt-4 mx-auto w-32" />
            <p className="text-sm text-gray-600">Show this QR Code at the entrance</p>
          </>
        )}
      </div>
    </div>
  );
}
