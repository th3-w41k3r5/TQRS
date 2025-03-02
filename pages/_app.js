import { useState, useEffect } from "react";
import "@/styles/globals.css";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoArrowBack } from "react-icons/io5";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
      <MainApp Component={Component} pageProps={pageProps} />
    </SessionProvider>
  );
}

function MainApp({ Component, pageProps }) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      fetch(`/api/credits?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setCredits(data.credits);
        });
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>TQRS - Ticket QR Service</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/icons/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#007bff" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <header className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <button onClick={() => router.back()} className="text-white text-2xl">
          <IoArrowBack />
        </button>

        <a href="/" className="text-xl md:text-2xl font-bold transition-all duration-300 ease-in-out hover:scale-105">
          TQRS - <span className="text-yellow-300">Ticket QR</span> Service
        </a>
  

        {session && (
          <div className="hidden md:flex items-center space-x-2">
            <p className="text-lg font-semibold">Hi, {session.user.name} 👋</p>
            <p className="text-lg">
              | Your Credits: <span className="font-bold">{credits}</span>
            </p>
          </div>
        )}

        <div className="hidden md:flex space-x-4 text-sm items-center">
          {session ? (
            <>
              <a href="/buy-credits" className="hover:underline">
                Buy Credits
              </a>
              <a href="/view-ticket" className="hover:underline">
                View Ticket
              </a>
              <button
                onClick={() => signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-yellow-400 px-4 py-2 rounded"
            >
              Sign In with Google
            </button>
          )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <GiHamburgerMenu size={24} />
          </button>
        </div>
      </header>

      {isOpen && session && (
        <div className="absolute top-16 right-4 w-48 bg-white shadow-lg rounded-lg mt-2 p-4 text-black md:hidden">
          <a href="/buy-credits" className="block py-2 hover:bg-gray-100 px-4 rounded">
            Buy Credits
          </a>
          <a href="/view-ticket" className="block py-2 hover:bg-gray-100 px-4 rounded">
            View Ticket
          </a>
          <button
            onClick={() => signOut()}
            className="block w-full py-2 text-left text-red-600 hover:bg-gray-100 px-4 rounded"
          >
            Sign Out
          </button>
        </div>
      )}

      <div className="block md:hidden text-center bg-white py-4 shadow-md">
        {session ? (
          <>
            <p className="text-lg font-semibold">Hi, {session.user.name} 👋</p>
            <p className="text-lg">
              Your Credits: <span className="font-bold">{credits}</span>
            </p>
          </>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="bg-yellow-400 px-6 py-2 rounded text-lg font-semibold text-white"
          >
            Sign In with Google
          </button>
        )}
      </div>

      <main className="container mx-auto p-4">
        <Component {...pageProps} />
      </main>
    </>
  );
}
