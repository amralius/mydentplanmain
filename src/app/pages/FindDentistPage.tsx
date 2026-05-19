import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { LocateFixed, MapPin, Navigation, Phone, Star } from "lucide-react";
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
  position?: any;
};

type SearchOrigin = {
  label: string;
  location: any;
};

type SpecialtyValue =
  | "best-match"
  | "general dentist"
  | "emergency dentist"
  | "pediatric dentist"
  | "orthodontist"
  | "oral surgeon"
  | "endodontist"
  | "periodontist"
  | "prosthodontist";

const specialtyOptions: { value: SpecialtyValue; label: string; hint: string }[] = [
  { value: "best-match", label: "Best match", hint: "Uses your symptom history" },
  { value: "general dentist", label: "General Dentist", hint: "Cleanings, exams, fillings" },
  { value: "emergency dentist", label: "Emergency Dentist", hint: "Pain, swelling, urgent visits" },
  { value: "pediatric dentist", label: "Pediatric Dentist", hint: "Children and teens" },
  { value: "orthodontist", label: "Orthodontist", hint: "Braces and aligners" },
  { value: "oral surgeon", label: "Oral Surgeon", hint: "Extractions and surgery" },
  { value: "endodontist", label: "Endodontist", hint: "Root canals" },
  { value: "periodontist", label: "Periodontist", hint: "Gums and implants" },
  { value: "prosthodontist", label: "Prosthodontist", hint: "Crowns, dentures, implants" },
];

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
  const [locating, setLocating] = useState(false);
  const [ratingOnly, setRatingOnly] = useState(false);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchLabel, setSearchLabel] = useState(zipFromURL || user?.zipCode || "your area");
  const [specialty, setSpecialty] = useState<SpecialtyValue>("best-match");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const latestSymptoms = symptomHistory?.[0]?.symptoms || [];

  const getSuggestedKeyword = () => {
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

  const getSelectedSpecialty = () => {
    return specialtyOptions.find((option) => option.value === specialty) || specialtyOptions[0];
  };

  const getDentistKeyword = () => {
    return specialty === "best-match" ? getSuggestedKeyword() : specialty;
  };

  const getSpecialtyLabel = (keyword: string) => {
    if (keyword === "dentist") return "Dental Office";
    return specialtyOptions.find((option) => option.value === keyword)?.label || keyword;
  };

  const getMatchReason = () => {
    const keyword = getDentistKeyword();

    if (specialty !== "best-match") {
      return `Matched to selected specialty: ${getSpecialtyLabel(keyword)}`;
    }

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
      if (window.google?.maps?.places) {
        resolve();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

      if (!apiKey) {
        reject("Missing Google Maps API key");
        return;
      }

      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src*="maps.googleapis.com/maps/api/js"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener("error", () => reject("Google Maps failed to load"), { once: true });
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

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  };

  const openDentistMarker = (dentist: DentistResult, marker?: any) => {
    if (!dentist.position || !mapInstanceRef.current || !infoWindowRef.current) return;

    setActivePlaceId(dentist.placeId);
    mapInstanceRef.current.panTo(dentist.position);
    mapInstanceRef.current.setZoom(Math.max(mapInstanceRef.current.getZoom() || 13, 14));

    infoWindowRef.current.setContent(`
      <div style="max-width:240px">
        <strong>${dentist.name}</strong>
        <div style="margin-top:4px;color:#4b5563">${dentist.address}</div>
        <a href="${dentist.mapsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:8px;color:#2563eb;font-weight:600">Open in Google Maps</a>
      </div>
    `);
    infoWindowRef.current.open({
      map: mapInstanceRef.current,
      anchor: marker,
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

  const searchDentistsNear = async (origin: SearchOrigin) => {
    setLoading(true);
    setSearched(true);
    setStatusMessage("");
    setSearchLabel(origin.label);
    clearMarkers();

    try {
      await loadGoogleMaps();

      const map = new window.google.maps.Map(mapRef.current, {
        center: origin.location,
        zoom: 13,
        gestureHandling: "greedy",
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;
      placesServiceRef.current = new window.google.maps.places.PlacesService(map);
      infoWindowRef.current = new window.google.maps.InfoWindow();

      const searchAreaMarker = new window.google.maps.Marker({
        position: origin.location,
        map,
        title: "Your search area",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#2563EB",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 3,
        },
      });
      markersRef.current.push(searchAreaMarker);

      const keyword = getDentistKeyword();

      placesServiceRef.current.nearbySearch(
        {
          location: origin.location,
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
            setStatusMessage("No dentist offices found nearby. Try another ZIP code or search again from your current location.");
            return;
          }

          const formatted = await Promise.all(
            places.slice(0, 10).map(async (place) => {
              const phone = place.place_id
                ? await fetchPhoneNumber(placesServiceRef.current, place.place_id)
                : undefined;

              return {
                name: place.name,
                specialty: getSpecialtyLabel(keyword),
                rating: place.rating || "N/A",
                address: place.vicinity || "Address unavailable",
                phone,
                placeId: place.place_id,
                position: place.geometry?.location,
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

          formatted.forEach((dentist) => {
            if (!dentist.position) return;

            const marker = new window.google.maps.Marker({
              position: dentist.position,
              map,
              title: dentist.name,
            });

            marker.addListener("click", () => openDentistMarker(dentist, marker));
            markersRef.current.push(marker);
          });

          setResults(formatted);
          setActivePlaceId(formatted[0]?.placeId || null);
          setLoading(false);

          if (formatted[0]) {
            setTimeout(() => openDentistMarker(formatted[0]), 0);
          }
        }
      );
    } catch (err) {
      console.error(err);
      setStatusMessage("Google Maps could not load. Check that the Maps API key is set up in Vercel.");
      setLoading(false);
    }
  };

  const handleZipSearch = async () => {
    if (!zip.trim()) {
      setStatusMessage("Enter a ZIP code or use your current location.");
      return;
    }

    setLoading(true);
    setStatusMessage("");

    try {
      await loadGoogleMaps();

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: zip }, (geoResults: any, geoStatus: string) => {
        if (geoStatus !== "OK" || !geoResults[0]) {
          setStatusMessage("Could not find that ZIP code. Try another one.");
          setLoading(false);
          return;
        }

        searchDentistsNear({
          label: zip,
          location: geoResults[0].geometry.location,
        });
      });
    } catch (err) {
      console.error(err);
      setStatusMessage("Google Maps could not load. Check that the Maps API key is set up in Vercel.");
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setStatusMessage("Your browser does not support location lookup. Enter a ZIP code instead.");
      return;
    }

    setLocating(true);
    setStatusMessage("Allow location access to search dentists near you.");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await loadGoogleMaps();
          const currentLocation = new window.google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );

          setLocating(false);
          setStatusMessage("");
          searchDentistsNear({
            label: "your current location",
            location: currentLocation,
          });
        } catch (err) {
          console.error(err);
          setLocating(false);
          setStatusMessage("Google Maps could not load. Check that the Maps API key is set up in Vercel.");
        }
      },
      () => {
        setLocating(false);
        setStatusMessage("Location access was not allowed. You can still search by ZIP code.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  useEffect(() => {
    if (zipFromURL) {
      setTimeout(() => {
        handleZipSearch();
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
      <div className="pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="text-5xl font-semibold text-gray-900 mb-3">
                Find a Dentist
              </h1>
              <p className="text-gray-600 text-lg max-w-3xl">
                Use your location or ZIP code to pull up nearby dental offices on an interactive Google Map.
              </p>
            </div>
            <button
              onClick={handleUseCurrentLocation}
              disabled={locating || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:bg-gray-300"
            >
              <LocateFixed className="h-5 w-5" />
              {locating ? "Locating..." : "Use My Location"}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.1fr_auto]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">ZIP Code</label>
                <input
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  placeholder="10001"
                  maxLength={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Insurance</label>
                <input
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Specialty</label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value as SpecialtyValue)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {specialtyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleZipSearch}
                disabled={loading || locating}
                className="self-end bg-gray-900 text-white rounded-xl px-6 py-3 font-medium hover:bg-gray-800 transition disabled:bg-gray-300"
              >
                {loading ? "Searching..." : "Search ZIP"}
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor="ratingOnly" className="flex items-center gap-3 text-sm text-gray-600">
                <input
                  id="ratingOnly"
                  type="checkbox"
                  checked={ratingOnly}
                  onChange={(e) => setRatingOnly(e.target.checked)}
                />
                Show only dentists rated 4.5+
              </label>

              <p className="text-sm text-gray-500">
                Specialty: {getSelectedSpecialty().label} · {getSelectedSpecialty().hint}
              </p>
            </div>

            {statusMessage && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                {statusMessage}
              </div>
            )}
          </div>

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

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
              <div
                ref={mapRef}
                className="h-[520px] w-full bg-blue-50"
              />
            </div>

            <div className="space-y-4">
              {searched && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Showing {getSpecialtyLabel(getDentistKeyword()).toLowerCase()} results near {searchLabel}
                      </p>
                      <p className="text-sm text-gray-500">
                        {insurance ? `Insurance not verified. Confirm ${insurance} with the office.` : "Insurance not verified. Confirm coverage with the office."}
                      </p>
                    </div>
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                </div>
              )}

              {favorites.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Saved Dentists
                  </h2>

                  <div className="space-y-3">
                    {favorites.map((dentist) => (
                      <div
                        key={dentist.placeId}
                        className="flex items-center justify-between gap-4 border border-gray-100 rounded-xl p-4"
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
                {visibleResults.map((dentist) => {
                  const isSaved = favorites.some(
                    (fav) => fav.placeId === dentist.placeId
                  );
                  const isActive = activePlaceId === dentist.placeId;

                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      key={dentist.placeId}
                      onClick={() => openDentistMarker(dentist)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          openDentistMarker(dentist);
                        }
                      }}
                      className={`w-full bg-white p-5 rounded-2xl text-left shadow-sm transition hover:shadow-md border ${
                        isActive ? "border-primary ring-2 ring-primary/10" : "border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">{dentist.name}</h2>
                          <p className="text-gray-600">{dentist.specialty}</p>
                          <p className="text-sm text-gray-500">{dentist.address}</p>

                          {dentist.matchReason && (
                            <p className="text-xs text-purple-600 mt-2 font-medium">
                              {dentist.matchReason}
                            </p>
                          )}

                          <p className="text-xs text-gray-400 mt-3">
                            Insurance not verified - confirm with office
                          </p>
                        </div>

                        <div className="inline-flex items-center gap-1 text-yellow-500 font-medium whitespace-nowrap">
                          <Star className="h-4 w-4 fill-current" />
                          {dentist.rating}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-4">
                        <a
                          href={dentist.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        >
                          View on Maps
                        </a>

                        <a
                          href={dentist.directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          <Navigation className="h-4 w-4" />
                          Directions
                        </a>

                        {dentist.phone && (
                          <a
                            href={`tel:${dentist.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition"
                          >
                            <Phone className="h-4 w-4" />
                            Call Office
                          </a>
                        )}

                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(dentist);
                          }}
                          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition"
                        >
                          {isSaved ? "Saved" : "Save"}
                        </span>
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
      </div>
    </div>
  );
}
