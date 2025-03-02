import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";

export default function BookAliporeTicket() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [tickets, setTickets] = useState(0);
  const [userCredits, setUserCredits] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", date: "" });
  const [message, setMessage] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [event, setEvent] = useState("Alipore Zoo");
  const [loading, setLoading] = useState(false);
  const basePrice = 50;
  const totalAmount = tickets * basePrice;

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));

      fetch(`/api/credits?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setUserCredits(data.credits);
        });
    }
  }, [session]);

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone) => /^[0-9]{10}$/.test(phone);
  const isFormValid =
    formData.name.trim() !== "" &&
    isEmailValid(formData.email) &&
    isPhoneValid(formData.phone) &&
    formData.date !== "" &&
    tickets > 0;

  const handleBooking = async () => {
    if (!session) return setMessage("Please sign in to book tickets.");
    if (!isFormValid) return setMessage("Please fill all fields correctly.");
    if (userCredits < totalAmount) return setMessage("Not enough credits.");

    setLoading(true);

    try {
      const res = await fetch("/api/book-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, ...formData, tickets, event, basePrice }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Booking successful! Redirecting...");
        setUserCredits(data.remainingCredits);
        setQrCode(data.ticket?.qrCode || "");
        setTickets(0);
        setTimeout(() => router.push(`/ticket/${data.ticketId}`), 2000);
      } else {
        setMessage(data.message || "Booking failed.");
      }
    } catch (error) {
      setMessage("Error processing booking. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-poppins p-6 flex flex-col items-center py-10">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-lg mt-4">
        <h1 className="text-2xl font-bold text-center">Book Tickets for</h1>
        <h1 className="text-2xl font-bold text-center">{event}</h1>

        {status === "loading" ? (
          <p className="mt-4 text-gray-600 text-center">Loading...</p>
        ) : !session ? (
          <div className="mt-4 text-center">
            <p className="text-red-600">You must sign in to book a ticket.</p>
            <button onClick={() => signIn("google")} className="mt-2 bg-yellow-400 px-4 py-2 rounded-lg text-lg font-semibold text-white">
              Sign In with Google
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-gray-600 text-center">
              Available Credits: <span className="font-bold">{userCredits}</span>
            </p>

            <input type="text" placeholder="Name" className="block mt-4 border p-2 w-full rounded-lg"
              value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

            <input type="email" placeholder="Email" className="block mt-4 border p-2 w-full rounded-lg"
              value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled />
            {!isEmailValid(formData.email) && formData.email.length > 0 && (
              <p className="text-red-600 text-sm">Enter a valid email</p>
            )}

            <input type="tel" placeholder="Phone" className="block mt-4 border p-2 w-full rounded-lg"
              value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            {!isPhoneValid(formData.phone) && formData.phone.length > 0 && (
              <p className="text-red-600 text-sm">Enter a valid 10-digit phone number</p>
            )}

            <input type="date" className="block mt-4 border p-2 w-full rounded-lg"
              value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />

            <div className="flex items-center mt-4 justify-center">
              <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={() => setTickets(Math.max(0, tickets - 1))}>-</button>
              <span className="mx-4 font-bold text-lg">{tickets}</span>
              <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={() => setTickets(tickets + 1)}>+</button>
            </div>

            <p className="mt-4 text-center">Total: <span className="font-bold">{totalAmount} Credits</span></p>

            <button onClick={handleBooking} className={`mt-4 px-4 py-2 w-full rounded-lg text-white font-semibold flex items-center justify-center gap-2 ${isFormValid && userCredits >= totalAmount ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"}`} disabled={!isFormValid || userCredits < totalAmount || loading}>
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                `Pay ${totalAmount} Credits`
              )}
            </button>

            {message && <p className="mt-4 text-red-600 text-center">{message}</p>}

            {qrCode && (
              <div className="mt-6 text-center">
                <h2 className="text-xl font-bold">Your QR Code</h2>
                <img src={qrCode} alt="Ticket QR Code" className="mt-4 mx-auto" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
