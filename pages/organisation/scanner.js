import { useState, useEffect } from "react";
import { useSession , signIn } from "next-auth/react";
import dynamic from "next/dynamic";

const QrScanner = dynamic(
  () => import("react-qr-scanner"),
  { ssr: false }
);

export default function OrganisationScanner() {
  const { data: session, status } = useSession();
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState("");
  const [isCameraAvailable, setIsCameraAvailable] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (status === "loading") return; 
    if (!session || session.user.email !== "pritamsaha1603@gmail.com") {
      setAccessDenied(true); 
    }

    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function") {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          setIsCameraAvailable(true);
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          setIsCameraAvailable(false);
          setMessage("Camera access denied. Please allow camera permissions in your browser settings.");
        });
    } else {
      setIsCameraAvailable(false);
      setMessage("Camera not supported on this device.");
    }
  }, [session, status]);

  const handleScan = (data) => {
    if (data) {
      setScanResult(data.text);
      fetch(`/api/validate-ticket?id=${data.text}`)
        .then((res) => res.json())
        .then((result) => {
          setMessage(result.message);
        })
        .catch(() => setMessage("Error validating ticket."));
    }
  };

  const handleError = (err) => {
    console.error(err);
    setMessage("Camera access is required for scanning.");
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      {accessDenied && (
        <div className="bg-white p-6 shadow-md rounded-md text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>You must be signed in with an authorized email.</p>
          <button
            onClick={() => signIn("google")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Sign In
          </button>
        </div>
      )}
      {!accessDenied && (
        <div className="bg-white p-6 shadow-md rounded-md text-center">
          <h1 className="text-2xl font-bold">Scan Ticket QR</h1>
          {isCameraAvailable === null ? (
            <p className="mt-4 text-blue-600">Checking camera availability...</p>
          ) : isCameraAvailable ? (
            <QrScanner delay={300} onError={handleError} onScan={handleScan} className="mt-4 mx-auto" />
          ) : (
            <p className="mt-4 text-red-600">{message}</p>
          )}
          {scanResult && <p className="mt-4 text-lg text-gray-800">Scanned Ticket ID: {scanResult}</p>}
          {message && (
            <p className={`mt-4 text-lg ${message.includes("Access granted") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
