import { useState } from "react";
import { useSession } from "next-auth/react";

export default function BuyCredits() {
  const { data: session } = useSession();
  const [amount, setAmount] = useState(""); // Initially empty
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const email = session?.user?.email;
  const isValidAmount = amount >= 10 && amount <= 10000;

  const handleBuyCredits = async () => {
    if (!email) {
      setMessage("❌ Error: You must be logged in to buy credits.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/buy-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`✅ Credits added! New balance: ${data.credits}`);
        setAmount(""); // Reset input after successful transaction
      } else {
        setMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("❌ Error adding credits. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center flex-col py-10">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-lg mt-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Buy Credits</h1>

        <input
          type="number"
          placeholder="Enter amount"
          className="block mt-4 border p-2 w-full rounded-lg text-center text-lg font-semibold"
          value={amount}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value) : "";
            setAmount(val);
          }}
          min={10}
          max={10000}
          disabled={loading} // Disable input while loading
        />

        <p className="text-gray-600 text-sm mt-2">
          Minimum: <span className="font-semibold">10</span>, Maximum: <span className="font-semibold">10,000</span>
        </p>

        <button
          onClick={handleBuyCredits}
          className={`mt-4 w-full px-4 py-2 rounded-lg text-white text-lg font-semibold shadow-md transition flex justify-center items-center gap-2 ${
            isValidAmount && !loading ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!isValidAmount || loading}
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-4 border-white border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            `Add ${amount || 0} Credits`
          )}
        </button>

        {message && (
          <p className={`mt-4 text-lg font-semibold ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
