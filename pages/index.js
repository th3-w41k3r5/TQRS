import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const places = [
    {
      name: "Alipore Zoo",
      description: "Explore the amazing wildlife!",
      img: "/images/alipore-zoo.jpg",
      link: "/AliporeZoo",
    },
    {
      name: "Eco Park",
      description: "Enjoy the beauty of nature!",
      img: "/images/eco-park.jpg",
      link: "/EcoPark",
    },
    {
      name: "Victoria Memorial",
      description: "Explore the amazing history!",
      img: "/images/victoria-memorial.jpg",
      link: "/VictoriaMemorial",
    },
    {
      name: "Nicco Park",
      description: "Enjoy the thrilling rides!",
      img: "/images/nicco-park.jpg",
      link: "/NiccoPark",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
        Available Destinations
      </h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {places.map((place, index) => (
          <Link key={index} href={place.link} passHref>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex items-center p-4 cursor-pointer transition duration-300 hover:shadow-xl hover:scale-105">
              <div className="w-16 h-16 relative">
                <Image
                  src={place.img}
                  alt={place.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">{place.name}</h3>
                <p className="text-gray-600">{place.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
