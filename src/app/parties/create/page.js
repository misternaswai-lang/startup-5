"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MapPicker from "@/app/MapPicker";

export default function CreateParty() {
  const router = useRouter();

  const [form, setForm] = useState({
    partyName: "",
    partyGame: "",
    totalMembers: 2,
    description: "",
    address: "",
    keywords: "",
  });

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Вы должны войти в аккаунт");
      return;
    }

    try {
      setLoading(true);

      const parsedKeywords = form.keywords
        ? form.keywords
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : null;

      const body = {
        partyName: form.partyName,
        partyGame: form.partyGame,
        totalMembers: form.totalMembers,
        location,

        ...(form.description ? { description: form.description } : {}),
        ...(form.address ? { address: form.address } : {}),
        ...(parsedKeywords?.length ? { keywords: parsedKeywords } : {}),
      };

      const res = await fetch("/api/parties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("Failed to create party");
      }

      const data = await res.json();

      router.push(`/parties/${data.id}`);
    } catch (error) {
      console.error("Failed to create party:", error);
      alert("Ошибка создания пати");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center px-4">
      <div className="w-full max-w-[70%] bg-zinc-900/80 backdrop-blur border border-purple-800 rounded-2xl p-6 shadow-2xl">
        <h1 className="text-3xl font-bold text-purple-400 mb-2 text-center">
          🎮 Создать пати
        </h1>

        <p className="text-zinc-400 text-sm text-center mb-6">
          Найди игроков и собери команду для совместной игры
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Название */}
          <input
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            placeholder="Название пати"
            value={form.partyName}
            onChange={(e) => setForm({ ...form, partyName: e.target.value })}
          />

          {/* Игра */}
          <input
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            placeholder="Игра"
            value={form.partyGame}
            onChange={(e) => setForm({ ...form, partyGame: e.target.value })}
          />

          {/* Количество */}
          <input
            type="number"
            min={2}
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            value={form.totalMembers}
            onChange={(e) =>
              setForm({ ...form, totalMembers: Number(e.target.value) })
            }
          />

          {/* Keywords */}
          <input
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700"
            placeholder="keywords"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
          />

          {/* Description */}
          <textarea
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 md:col-span-2"
            placeholder="Описание"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Address */}
          <input
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 md:col-span-2"
            placeholder="Адрес"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />

          {/* Map */}

          {/* Button */}
          <button
            onClick={submit}
            disabled={loading}
            className="md:col-span-2 w-full bg-purple-600 hover:bg-purple-500 transition p-3 rounded-xl font-semibold"
          >
            {loading ? "Создание..." : "Создать пати"}
          </button>
        </div>
      </div>
    </div>
  );
}
