"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";
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
        ...(parsedKeywords && parsedKeywords.length
          ? { keywords: parsedKeywords }
          : {}),
      };

      const data = await apiFetch("/parties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

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
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Название пати
            </label>
            <input
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-purple-500 outline-none"
              placeholder="Например: Вечерний рейд"
              value={form.partyName}
              onChange={(e) => setForm({ ...form, partyName: e.target.value })}
            />
          </div>

          {/* Игра */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Игра</label>
            <input
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-purple-500 outline-none"
              placeholder="Например: Valorant, CS2, Dota 2"
              value={form.partyGame}
              onChange={(e) => setForm({ ...form, partyGame: e.target.value })}
            />
          </div>

          {/* Количество */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Количество игроков
            </label>
            <input
              type="number"
              min={2}
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-purple-500 outline-none"
              value={form.totalMembers}
              onChange={(e) =>
                setForm({
                  ...form,
                  totalMembers: Number(e.target.value),
                })
              }
            />
          </div>

          {/* Ключевые слова */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">
              Ключевые слова
            </label>
            <input
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-purple-500 outline-none"
              placeholder="ranked, casual, mic, EU"
              value={form.keywords}
              onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            />
          </div>

          {/* Описание */}
          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-1">Описание</label>
            <textarea
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-purple-500 outline-none"
              placeholder="Опиши стиль игры, требования или цели"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Адрес */}
          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-1">Адрес</label>
            <input
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-purple-500 outline-none"
              placeholder="Например: Helsinki, Finland"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          {/* Карта */}
          <div className="md:col-span-2">
            <label className="block text-sm text-zinc-400 mb-2">Локация</label>
            <div className="h-64 rounded-xl overflow-hidden border border-zinc-700">
              <MapPicker onSelect={(loc) => setLocation(loc)} />
            </div>
          </div>

          {/* Кнопка */}
          <div className="md:col-span-2">
            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 transition p-3 rounded-xl font-semibold shadow-lg"
            >
              {loading ? "Создание..." : "Создать пати"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
