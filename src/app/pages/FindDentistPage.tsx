import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Clock, LocateFixed, MapPin, Navigation, Phone, ShieldCheck, Star, Users } from "lucide-react";
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
  userRatings?: number;
  distanceMiles?: number;
  openNow?: boolean;
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
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [acceptingPatientsOnly, setAcceptingPatientsOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [searchLabel, setSearchLabel] = useState(zipFromURL || user?.zipCode || "your area");
  const [specialty, setSpecialty] = useState<SpecialtyValue>("best-match");

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const searchOriginRef = useRef<{ lat: number; lng: number } | null>(null);
  const latestSymptoms = symptomHistory?.[0]?.symptoms || [];

  const sampleDentists = [
    { name: "Smile Shack", rating: "4.8", note: "General dentist" },
    { name: "Suffolk Pediatric Dentistry", rating: "4.7", note: "Pediatric dentist" },
    { name: "Family Dental Care", rating: "4.6", note: "Preventive care" },
  ];

  const getSuggestedKeyword = () => {
    const symptoms = latestSymptoms.join(" ").toLowerCase();

    if (symptoms.includes("child") || symptoms.includes("baby")) {
      return "pediatric dentist";
    }

    if (
      (symptoms.includes("sharp pain") || symptoms.includes("throbbing pain")) &&
      (symptoms.includes("cold") || symptoms.includes("heat"))
    ) {
      return "endodontist";
    }

    if (symptoms.includes("bleeding gums") || symptoms.includes("gums")) {
      return "periodontist";
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
      return "prosthodontist";
    }

    return "dentist";
  };

  const getSelectedSpecialty = () => {
    return specialtyOptions.find((option) => option.value === specialty) || specialtyOptions[0];
  };

  const getDentistKeyword = () => {
    if (emergencyOnly) return "emergency dentist";
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

    if (keyword === "endodontist") {
      return "Matched based on sharp pain or temperature sensitivity";
    }

    if (keyword === "periodontist") {
      return "Matched based on gum-related symptoms";
    }

    if (keyword === "prosthodontist") {
      return "Matched based on restorative treatment needs";
    }

    return "General dental match";
  };

  const getSymptomInsight = () => {
    const keyword = getDentistKeyword();
    const symptoms = latestSymptoms.join(", ");

    if (!latestSymptoms.length) {
      return {
        title: "Recommended based on your search",
        detail: "Choose Best match after saving symptom history, or pick a specialty manually.",
        specialty: getSpecialtyLabel(keyword),
      };
    }

    if (keyword === "endodontist") {
      return {
        title: "Recommended based on your symptoms",
        detail: `${symptoms} may point to pulp irritation or nerve-related pain.`,
        specialty: "Endodontist",
      };
    }

    if (keyword === "periodontist") {
      return {
        title: "Recommended based on your symptoms",
        detail: `${symptoms} may point to gum inflammation or periodontal concerns.`,
        specialty: "Periodontist",
      };
    }

    return {
      title: "Recommended based on your symptoms",
      detail: `Your latest symptoms: ${symptoms}`,
      specialty: getSpecialtyLabel(keyword),
    };
  };

  const getCoordinate = (locationValue: any) => {
    return {
      lat: typeof locationValue.lat === "function" ? locationValue.lat() : locationValue.lat,
      lng: typeof locationValue.lng === "function" ? locationValue.lng() : locationValue.lng,
    };
  };

  const getDistanceMiles = (from: { lat: number; lng: number }, to: any) => {
    const destination = getCoordinate(to);
    const earthRadiusMiles = 3958.8;
    const latDiff = ((destination.lat - from.lat) * Math.PI) / 180;
    const lngDiff = ((destination.lng - from.lng) * Math.PI) / 180;
    const fromLat = (from.lat * Math.PI) / 180;
    const toLat = (destination.lat * Math.PI) / 180;
    const a =
      Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
      Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDiff / 2) * Math.sin(lngDiff / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(earthRadiusMiles * c * 10) / 10;
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
    searchOriginRef.current = getCoordinate(origin.location);

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

      let keyword = getDentistKeyword();
      if (acceptingPatientsOnly) keyword = `${keyword} accepting new patients`;
      if (weekendOnly) keyword = `${keyword} weekend appointments`;

      placesServiceRef.current.nearbySearch(
        {
          location: origin.location,
          radius: 8000,
          keyword,
          openNow: openNowOnly || undefined,
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
                specialty: getSpecialtyLabel(getDentistKeyword()),
                rating: place.rating || "N/A",
                userRatings: place.user_ratings_total,
                distanceMiles: place.geometry?.location && searchOriginRef.current
                  ? getDistanceMiles(searchOriginRef.current, place.geometry.location)
                  : undefined,
                openNow: place.opening_hours?.open_now,
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
  const symptomInsight = getSymptomInsight();

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
                Find nearby dentists based on your location, insurance, and symptoms.
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
                {loading ? "Searching..." : "Find Dentists"}
              </button>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <label htmlFor="ratingOnly" className="flex items-center gap-3 text-sm text-gray-600">
                <input
                  id="ratingOnly"
                  type="checkbox"
                  checked={ratingOnly}
                  onChange={(e) => setRatingOnly(e.target.checked)}
                />
                Show only dentists rated 4.5+
              </label>

              <label htmlFor="openNowOnly" className="flex items-center gap-3 text-sm text-gray-600">
                <input
                  id="openNowOnly"
                  type="checkbox"
                  checked={openNowOnly}
                  onChange={(e) => setOpenNowOnly(e.target.checked)}
                />
                Open now
              </label>

              <label htmlFor="acceptingPatientsOnly" className="flex items-center gap-3 text-sm text-gray-600">
                <input
                  id="acceptingPatientsOnly"
                  type="checkbox"
                  checked={acceptingPatientsOnly}
                  onChange={(e) => setAcceptingPatientsOnly(e.target.checked)}
                />
                Accepting new patients
              </label>

              <label htmlFor="emergencyOnly" className="flex items-center gap-3 text-sm text-gray-600">
                <input
                  id="emergencyOnly"
                  type="checkbox"
                  checked={emergencyOnly}
                  onChange={(e) => setEmergencyOnly(e.target.checked)}
                />
                Emergency visits
              </label>

              <label htmlFor="weekendOnly" className="flex items-center gap-3 text-sm text-gray-600">
                <input
                  id="weekendOnly"
                  type="checkbox"
                  checked={weekendOnly}
                  onChange={(e) => setWeekendOnly(e.target.checked)}
                />
                Weekend appointments
              </label>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Specialty: {getSelectedSpecialty().label} - {getSelectedSpecialty().hint}. Confirm insurance and availability with the office.
            </p>

            {statusMessage && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                {statusMessage}
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                <div
                  ref={mapRef}
                  className="h-[520px] w-full bg-blue-50"
                />

                {!searched && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
                    <div className="w-full max-w-xl rounded-2xl border border-white bg-white/90 p-6 shadow-lg">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-3 text-primary">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">Dentists will appear here</p>
                          <p className="text-sm text-gray-500">Use your location or ZIP code to load a draggable Google Map.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {sampleDentists.map((dentist) => (
                          <div key={dentist.name} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{dentist.name}</p>
                              <p className="text-sm text-gray-500">{dentist.note}</p>
                            </div>
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-yellow-600">
                              <Star className="h-4 w-4 fill-current" />
                              {dentist.rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

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
                        </div>

                        <div className="inline-flex items-center gap-1 text-yellow-500 font-medium whitespace-nowrap">
                          <Star className="h-4 w-4 fill-current" />
                          {dentist.rating}
                          {dentist.userRatings ? (
                            <span className="text-xs text-gray-400">({dentist.userRatings})</span>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2 lg:grid-cols-4">
                        {dentist.distanceMiles !== undefined && (
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {dentist.distanceMiles} miles away
                          </span>
                        )}
                        <span className="inline-flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          {insurance ? `Confirm ${insurance}` : "Confirm insurance"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          {dentist.openNow === true ? "Open now" : "Hours unavailable"}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          {acceptingPatientsOnly ? "New patients filter" : "Call to confirm"}
                        </span>
                      </div>

                      {dentist.matchReason && (
                        <p className="mt-4 rounded-xl bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700">
                          {dentist.matchReason}
                        </p>
                      )}

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
                            Call
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(dentist);
                          }}
                          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition"
                        >
                          {isSaved ? "Saved" : "Save"}
                        </button>
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

            <div className="space-y-4">
              <div className="rounded-2xl border border-purple-100 bg-purple-50 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-full bg-white p-2 text-purple-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-purple-900">{symptomInsight.title}</p>
                    <p className="text-lg font-semibold text-gray-900">{symptomInsight.specialty}</p>
                  </div>
                </div>
                <p className="text-sm text-purple-800">{symptomInsight.detail}</p>
                <p className="mt-3 text-sm font-medium text-purple-900">
                  We prioritized offices that commonly treat these issues.
                </p>
              </div>

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
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-current text-yellow-500" />
                              {dentist.rating}
                            </span>
                            {dentist.distanceMiles !== undefined && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                {dentist.distanceMiles} miles
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                              {insurance ? `${insurance} likely` : "Insurance check"}
                            </span>
                          </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
