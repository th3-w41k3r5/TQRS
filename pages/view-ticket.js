import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ViewTicket() {
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchTickets(session.user.email);
    }
  }, [status, session]);

  const fetchTickets = (email) => {
    fetch(`/api/ticket?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tickets.length > 0) {
          // Sort tickets by date (latest first)
          const sortedTickets = data.tickets.sort((a, b) => new Date(b.date) - new Date(a.date));
          setTickets(sortedTickets);
          setMessage("");
        } else {
          setTickets([]);
          setMessage("No tickets found.");
        }
      })
      .catch(() => setMessage("Error fetching tickets."));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-md rounded-md max-w-lg mx-auto">
        <h1 className="text-2xl font-bold">Your Booked Tickets</h1>

        {status === "loading" ? (
          <p className="mt-4 text-gray-600">Loading...</p>
        ) : status === "unauthenticated" ? (
          <p className="mt-4 text-red-600">Please sign in to view your tickets.</p>
        ) : (
          <>
            {message && <p className="mt-4 text-red-600">{message}</p>}

            {tickets.length > 0 && (
              <div className="mt-6">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="border p-4 my-2 rounded-lg shadow-md bg-gray-50">
                    <p><strong>Event:</strong> {ticket.event}</p>
                    <p><strong>Date:</strong> {new Date(ticket.date).toLocaleDateString()}</p>
                    <p><strong>Tickets:</strong> {ticket.tickets}</p>
                    <p>
                      <strong>Status:</strong>
                      <span className={
                        ticket.status === "Valid" ? "text-green-600 font-bold" : "text-red-600 font-bold"
                      }> {ticket.status}
                      </span>
                    </p>
                    {ticket.qrCode && <img src={ticket.qrCode} alt="QR Code" className="mt-4 mx-auto w-32" />}
                    <p className="text-sm text-gray-600">Show this QR Code at the entrance</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
