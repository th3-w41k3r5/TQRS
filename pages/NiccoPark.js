import { useState } from "react";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import { IoClose } from "react-icons/io5";

export default function NiccoPark() {
  const router = useRouter();
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);

  const handleBookTicket = () => {
    if (session) {
      router.push("/NiccoPark/book");
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-poppins p-6">
      <div className="bg-white p-6 shadow-md rounded-md">
        <img src="/images/nicco-park.jpg" alt="Nicco Park" className="w-full h-64 object-cover rounded-md" />
        <h1 className="text-2xl font-bold mt-4">Nicco Park</h1>
        <p className="mt-2">Enjoy thrilling rides and endless fun at Nicco Park, Kolkata’s favorite amusement park!</p>
        <p className="mt-2"><strong>Timing:</strong> 10:30 AM - 6:45 PM</p>
        <p className="mt-2"><strong>Entry Fee:</strong> Rs 100 per person</p>
        <button
          onClick={handleBookTicket}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700 transition duration-300"
        >
          Book Ticket
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center relative">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
            >
              <IoClose size={24} />
            </button>

            <h2 className="text-xl font-semibold text-red-600">Sign In Required !</h2>
            <p className="mt-2 text-gray-600">Please sign in with Google</p>
            <p className="text-gray-600">to book a ticket.</p>

            <button
              onClick={() => signIn("google")}
              className="mt-4 bg-yellow-400 px-6 py-2 rounded-lg text-lg font-semibold shadow-md hover:bg-yellow-500 transition duration-300 text-white"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
