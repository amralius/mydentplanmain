import { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    google: any;
  }
}

export default function FindDentistPage() {
  const { user } = useAuth();
const location = useLocation();
const params = new URLSearchParams(location.search);
const zipFromURL = params.get("zip");

  const [zip, setZip] = useState(zipFromURL || user?.zipCode || "");
  const [insurance, setInsurance] = useState(user?.insurance || "");
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);

  const loadGoogleMaps = () => {
    return new Promise<void>((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        reject("Missing Google Maps API key");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject("Google Maps failed to load");
      document.body.appendChild(script);
    });
  };

  const handleSearch = async () => {
    if (!zip.trim()) {
      alert("Please enter a ZIP code");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      await loadGoogleMaps();

      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode({ address: zip }, (geoResults: any, geoStatus: string) => {
        if (geoStatus !== "OK" || !geoResults[0]) {
          alert("Could not find that ZIP code");
          setLoading(false);
          return;
        }

        const location = geoResults[0].geometry.location;

        const map = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 12,
        });

        new window.google.maps.Marker({
          position: location,
          map,
          title: "Search area",
        });

        const service = new window.google.maps.places.PlacesService(map);

        service.nearbySearch(
          {
            location,
            radius: 8000,
            keyword: "dentist",
          },
          (places: any[], status: string) => {
            if (status !== window.google.maps.places.PlacesServiceStatus.OK || !places) {
              setResults([]);
              setLoading(false);
              return;
            }

            const formatted = places.slice(0, 8).map((place) => {
              if (place.geometry?.location) {
                new window.google.maps.Marker({
                  position: place.geometry.location,
                  map,
                  title: place.name,
                });
              }

              return {
                name: place.name,
                specialty: "Dental Office",
                rating: place.rating || "N/A",
                address: place.vicinity || "Address unavailable",
                placeId: place.place_id,
                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  place.name
                )}&query_place_id=${place.place_id}`,
                directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  place.vicinity || place.name
                )}`,
              };
            });

            setResults(formatted);
            setLoading(false);
          }
        );
      });
    } catch (err) {
      console.error(err);
      alert("Google Maps could not load");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-5xl font-semibold text-gray-900 mb-2">
              Find a Dentist
            </h1>
            <p className="text-gray-600 text-lg">
              Search for dentists near you based on your location and insurance.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="ZIP Code"
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                placeholder="Insurance (optional)"
                className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-primary text-white rounded-xl px-6 py-3 font-medium hover:bg-blue-700 transition disabled:bg-gray-300"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {searched && (
            <p className="text-sm text-gray-500 mb-4">
              Showing dentists near {zip || "your area"}
              {insurance ? ` who may accept ${insurance}` : ""}.
            </p>
          )}

          <div
            ref={mapRef}
            className="w-full h-96 rounded-2xl shadow-lg border border-gray-200 mb-8 bg-white"
          />

          <div className="space-y-4">
            {results.map((dentist, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-6">
                  <div>
                    <h2 className="text-lg font-semibold">{dentist.name}</h2>
                    <p className="text-gray-600">{dentist.specialty}</p>
                    <p className="text-sm text-gray-500">{dentist.address}</p>

                    <p className="text-xs text-gray-400 mt-3">
                      Insurance not verified — confirm with office
                    </p>

                    <div className="flex gap-3 mt-4">
                      <a
                        href={dentist.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                      >
                        View on Maps
                      </a>

                      <a
                        href={dentist.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        Directions
                      </a>
                    </div>
                  </div>

                  <div className="text-yellow-500 font-medium whitespace-nowrap">
                    ⭐ {dentist.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {searched && !loading && results.length === 0 && (
            <p className="text-gray-500 mt-6">
              No dentists found. Try another ZIP code.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}