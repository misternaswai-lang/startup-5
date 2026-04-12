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
    console.log(token);
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

  if (!user)
    return (
      <div className="text-white bg-black min-h-screen flex items-center justify-center">
        Загрузка...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-black border border-purple-700 shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-purple-400 mb-4">Profile</h1>

        <div className="text-white text-xl mb-2">{user.username}</div>
        <div className="text-gray-400 text-sm mb-6">{user.email}</div>

        <button
          onClick={() => {
            localStorage.removeItem("accessToken");
            location.href = "/login";
          }}
          className="w-full p-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold shadow-lg"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
