"use client";
import { useEffect, useState } from "react";

export default function Me() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      location.href = "/login";
      return;
    }

    fetch("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("accessToken");
        location.href = "/login";
      });
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="animate-pulse text-purple-400 text-lg tracking-widest">
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg">
        {/* Glow */}
        <div className="absolute inset-0 bg-purple-600 opacity-20 blur-3xl rounded-3xl"></div>

        {/* Card */}
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-4">
              {user.username?.[0]?.toUpperCase()}
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight">
              {user.username}
            </h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            {[
              { label: "ID", value: user.id },
              { label: "Age", value: user.age },
              { label: "Gender", value: user.gender || "Not set" },
              { label: "City", value: user.city || "Unknown" },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition"
              >
                <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                <div className="text-white font-medium">{item.value}</div>
              </div>
            ))}
          </div>

          {/* Interests */}
          <div className="mb-6">
            <div className="text-gray-400 text-xs mb-2">Interests</div>
            <div className="flex flex-wrap gap-2">
              {user.interests?.length ? (
                user.interests.map((interest, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  >
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-gray-500 text-sm">None</span>
              )}
            </div>
          </div>

          {/* Created */}
          <div className="text-xs text-gray-500 mb-6">
            Created: {new Date(user.createdAt).toLocaleString()}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem("accessToken");
              location.href = "/login";
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:scale-[1.02] hover:shadow-purple-500/30 active:scale-[0.98] transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
