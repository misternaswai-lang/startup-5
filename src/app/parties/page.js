"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function Parties() {
  const [data, setData] = useState(null);
  const [partyName, setPartyName] = useState("");
  const [partyGame, setPartyGame] = useState("");
  const [loading, setLoading] = useState(false);

  // первоначальная загрузка
  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = () => {
    setLoading(true);
    apiFetch("/parties?limit=20&offset=0")
      .then(setData)
      .finally(() => setLoading(false));
  };

  const searchParties = () => {
    if (!partyName && !partyGame) return;

    setLoading(true);

    const params = new URLSearchParams();

    if (partyName) params.append("partyName", partyName);
    if (partyGame) params.append("partyGame", partyGame);
    params.append("limit", "20");
    params.append("offset", "0");

    apiFetch(`/parties/search?${params.toString()}`)
      .then(setData)
      .finally(() => setLoading(false));
  };

  if (!data || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-purple-400">
        <div className="animate-pulse text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-purple-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Пати
          </h1>

          <a
            href="/parties/create"
            className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 transition shadow-lg shadow-purple-900/40"
          >
            + Создать
          </a>
        </div>

        {/* 🔍 Поиск */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            value={partyName}
            onChange={(e) => setPartyName(e.target.value)}
            placeholder="Название пати"
            className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-purple-500 outline-none"
          />

          <input
            value={partyGame}
            onChange={(e) => setPartyGame(e.target.value)}
            placeholder="Игра"
            className="flex-1 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 focus:border-purple-500 outline-none"
          />

          <button
            onClick={searchParties}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 transition"
          >
            Найти
          </button>

          <button
            onClick={fetchParties}
            className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 transition"
          >
            Сброс
          </button>
        </div>

        {/* Grid */}
        {data.items.length === 0 ? (
          <div className="text-center text-zinc-400">Ничего не найдено</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((p) => (
              <a
                key={p.id}
                href={`/parties/${p.id}`}
                className="group rounded-2xl p-5 bg-zinc-900/70 backdrop-blur border border-zinc-800 hover:border-purple-500 transition-all shadow-lg hover:shadow-purple-900/30 hover:-translate-y-1"
              >
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold group-hover:text-purple-400 transition">
                    {p.partyName}
                  </h2>

                  <div className="text-sm text-zinc-400">
                    🎮{" "}
                    {p.partyGame.length > 99
                      ? p.partyGame.slice(0, 100) + "..."
                      : p.partyGame}
                  </div>

                  <div className="text-xs text-zinc-500">
                    {p.currentMembers}/{p.totalMembers} участников
                  </div>
                </div>

                <div className="mt-4 h-1 w-0 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
