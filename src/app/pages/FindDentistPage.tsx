import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function FindDentistPage() {
  const { user } = useAuth();

  const [zip, setZip] = useState(user?.zipCode || "");
  const [insurance, setInsurance] = useState(user?.insurance || "");

  const dentists = [
    {
      name: "Dr. Sarah Chen",
      specialty: "General Dentistry",
      distance: "0.8 miles",
      rating: 4.9,
    },
    {
      name: "Dr. Michael Rodriguez",
      specialty: "Cosmetic Dentistry",
      distance: "1.2 miles",
      rating: 4.8,
    },
    {
      name: "Dr. Emily Thompson",
      specialty: "Pediatric Dentistry",
      distance: "1.5 miles",
      rating: 4.9,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-semibold text-gray-900 mb-2">
              Find a Dentist
            </h1>
            <p className="text-gray-600 text-lg">
              Search for dentists near you based on your location and insurance.
            </p>
          </div>

          {/* Search Card */}
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
                className="bg-primary text-white rounded-xl px-6 py-3 font-medium hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {dentists.map((dentist, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {dentist.name}
                    </h2>
                    <p className="text-gray-600">
                      {dentist.specialty}
                    </p>
                    <p className="text-sm text-gray-500">
                      {dentist.distance}
                    </p>
                  </div>

                  <div className="text-yellow-500 font-medium">
                    ⭐ {dentist.rating}
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3">
                  Insurance not verified — confirm with office
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}