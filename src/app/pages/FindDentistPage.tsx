import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

declare global {
  interface Window {
    google: any;
  }
}

type DentistResult = {
  name: string;
  specialty: string;
  rating: number | "N/A";
  address: string;
  phone?: string;
  placeId: string;
  mapsUrl: string;
  directionsUrl: string;
  matchReason?: string;
};

export default function FindDentistPage() {
  const { user, symptomHistory } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const zipFromURL = params.get("zip");

  const [zip, setZip] = useState(zipFromURL || user?.zipCode || "");
  const [insurance, setInsurance] = useState(user?.insurance || "");
  const [results, setResults] = useState<DentistResult[]>([]);
  const [favorites, setFavorites] = useState<DentistResult[]>(() => {
    const saved = localStorage.getItem("savedDentists");
    return saved ? JSON.parse(saved) : [];
  });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ratingOnly, setRatingOnly] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const latestSymptoms = symptomHistory?.[0]?.symptoms || [];

  const getDentistKeyword = () => {
    const symptoms = latestSymptoms.join(" ").toLowerCase();

    if (symptoms.includes("child") || symptoms.includes("baby")) {
      return "pediatric dentist";
    }

    if (
      symptoms.includes("pain") ||
      symptoms.includes("swelling") ||
      symptoms.includes("emergency")
    ) {
      return "emergency dentist";
    }

    if (
      symptoms.includes("implant") ||
      symptoms.includes("missing tooth") ||
      symptoms.includes("crown")
    ) {
      return "prosthodontist dentist";
    }

    return "dentist";
  };

  const getMatchReason = () => {
    const keyword = getDentistKeyword();

    if (keyword === "pediatric dentist") {
      return "Matched based on pediatric-related symptoms";
    }

    if (keyword === "emergency dentist") {
      return "Matched based on urgent symptoms";
    }

    if (keyword === "prosthodontist dentist") {
      return "Matched based on restorative treatment needs";
    }

    return "General dental match";
  };

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

  const fetchPhoneNumber = (
    service: any,
    placeId: string
  ): Promise<string | undefined> => {
    return new Promise((resolve) => {
      service.getDetails(
        {
          placeId,
          fields: ["formatted_phone_number"],
        },
        (place: any, status: string) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place?.formatted_phone_number
          ) {
            resolve(place.formatted_phone_number);
          } else {
            resolve(undefined);
          }
        }
      );
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

      geocoder.geocode({ address: zip }, async (geoResults: any, geoStatus: string) => {
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
        const keyword = getDentistKeyword();

        service.nearbySearch(
          {
            location,
            radius: 8000,
            keyword,
          },
          async (places: any[], status: string) => {
            if (
              status !== window.google.maps.places.PlacesServiceStatus.OK ||
              !places
            ) {
              setResults([]);
              setLoading(false);
              return;
            }

            const formatted = await Promise.all(
              places.slice(0, 8).map(async (place) => {
                if (place.geometry?.location) {
                  new window.google.maps.Marker({
                    position: place.geometry.location,
                    map,
                    title: place.name,
                  });
                }

                const phone = place.place_id
                  ? await fetchPhoneNumber(service, place.place_id)
                  : undefined;

                return {
                  name: place.name,
                  specialty: keyword === "dentist" ? "Dental Office" : keyword,
                  rating: place.rating || "N/A",
                  address: place.vicinity || "Address unavailable",
                  phone,
                  placeId: place.place_id,
                  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    place.name
                  )}&query_place_id=${place.place_id}`,
                  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    place.vicinity || place.name
                  )}`,
                  matchReason: getMatchReason(),
                };
              })
            );

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

  useEffect(() => {
    if (zipFromURL) {
      setTimeout(() => {
        handleSearch();
      }, 500);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedDentists", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (dentist: DentistResult) => {
    const alreadySaved = favorites.some((fav) => fav.placeId === dentist.placeId);

    if (alreadySaved) {
      setFavorites(favorites.filter((fav) => fav.placeId !== dentist.placeId));
    } else {
      setFavorites([...favorites, dentist]);
    }
  };

  const visibleResults = ratingOnly
    ? results.filter((dentist) =>
        typeof dentist.rating === "number" ? dentist.rating >= 4.5 : false
      )
    : results;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-5xl font-semibold text-gray-900 mb-2">
              Find a Dentist
            </h1>
            <p className="text-gray-600 text-lg">
              Search for dentists near you based on your ZIP code, insurance, and symptoms.
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

            <div className="flex items-center gap-3 mt-4">
              <input
                id="ratingOnly"
                type="checkbox"
                checked={ratingOnly}
                onChange={(e) => setRatingOnly(e.target.checked)}
              />
              <label htmlFor="ratingOnly" className="text-sm text-gray-600">
                Show only dentists rated 4.5+
              </label>
            </div>
          </div>

          {searched && (
            <p className="text-sm text-gray-500 mb-4">
              Showing dentists near {zip || "your area"}
              {insurance ? ` who may accept ${insurance}` : ""}.
            </p>
          )}

          {latestSymptoms.length > 0 && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-6">
              <p className="text-sm text-purple-700 font-medium">
                Smart match based on your latest symptom check:
              </p>
              <p className="text-sm text-purple-700 mt-1">
                {latestSymptoms.join(", ")}
              </p>
            </div>
          )}

          <div
            ref={mapRef}
            className="w-full h-96 rounded-2xl shadow-lg border border-gray-200 mb-8 bg-white"
          />

          {favorites.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Saved Dentists
              </h2>

              <div className="space-y-3">
                {favorites.map((dentist) => (
                  <div
                    key={dentist.placeId}
                    className="flex items-center justify-between border border-gray-100 rounded-xl p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{dentist.name}</p>
                      <p className="text-sm text-gray-500">{dentist.address}</p>
                    </div>

                    <button
                      onClick={() => toggleFavorite(dentist)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {visibleResults.map((dentist, i) => {
              const isSaved = favorites.some(
                (fav) => fav.placeId === dentist.placeId
              );

              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div>
                      <h2 className="text-lg font-semibold">{dentist.name}</h2>
                      <p className="text-gray-600">{dentist.specialty}</p>
                      <p className="text-sm text-gray-500">{dentist.address}</p>

                      {dentist.matchReason && (
                        <p className="text-xs text-purple-600 mt-2 font-medium">
                          {dentist.matchReason}
                        </p>
                      )}

                      <p className="text-xs text-gray-400 mt-3">
                        Insurance not verified — confirm with office
                      </p>

                      <div className="flex flex-wrap gap-3 mt-4">
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

                        {dentist.phone && (
                          <a
                            href={`tel:${dentist.phone}`}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition"
                          >
                            Call Office
                          </a>
                        )}

                        <button
                          onClick={() => toggleFavorite(dentist)}
                          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition"
                        >
                          {isSaved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>

                    <div className="text-yellow-500 font-medium whitespace-nowrap">
                      ⭐ {dentist.rating}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {searched && !loading && visibleResults.length === 0 && (
            <p className="text-gray-500 mt-6">
              No dentists found. Try another ZIP code or turn off the 4.5+ filter.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}