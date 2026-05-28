"use client";
import { useEffect, useState } from "react";

export default function Parties() {
  const [data, setData] = useState(null);
  const [partyName, setPartyName] = useState("");
  const [partyGame, setPartyGame] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "";

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (partyName || partyGame || keywords) searchParties();
      else fetchParties();
    }, 400);

    return () => clearTimeout(timeout);
  }, [partyName, partyGame, keywords]);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/parties?limit=20&offset=0`);
      const json = await res.json();
      setData(json);
    } catch {
      setData({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const searchParties = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      if (partyName) params.append("partyName", partyName);
      if (partyGame) params.append("partyGame", partyGame);

      if (keywords) {
        keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
          .forEach((k) => params.append("keyword", k));
      }

      params.append("limit", "20");
      params.append("offset", "0");

      const res = await fetch(
        `${API_BASE}/api/parties/search?${params.toString()}`
      );

      const json = await res.json();
      setData(json);
    } catch {
      setData({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPartyName("");
    setPartyGame("");
    setKeywords("");
    fetchParties();
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "closed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-zinc-500/20 text-zinc-300 border-zinc-500/30";
    }
  };

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-purple-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Пати ✨</h1>

          <a
            href="/parties/create"
            className="px-5 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 transition shadow-lg"
          >
            + Создать
          </a>
        </div>

        {/* SEARCH */}
        <div className="mb-10 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Название"
              className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500"
            />
            <input
              value={partyGame}
              onChange={(e) => setPartyGame(e.target.value)}
              placeholder="Игра"
              className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500"
            />
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="keywords"
              className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-purple-500"
            />
          </div>

          <div className="flex gap-3 mt-5">
            <button
              onClick={searchParties}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500"
            >
              Найти
            </button>
            <button
              onClick={reset}
              className="px-5 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600"
            >
              Сброс
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center text-purple-400 animate-pulse mb-6">
            Поиск...
          </div>
        )}

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.items.map((p) => (
            <a
              key={p.id}
              href={`/parties/${p.id}`}
              className="group rounded-2xl p-5 bg-gradient-to-br from-zinc-900 to-black border border-white/5 hover:border-purple-500/40 transition shadow-lg hover:shadow-purple-900/30"
            >
              {/* TITLE */}
              <div className="flex justify-between items-start gap-2">
                <h2 className="text-lg font-semibold group-hover:text-purple-400">
                  {p.partyName || "Без названия"}
                </h2>

                <span
                  className={`text-xs px-2 py-1 rounded-full border ${statusColor(
                    p.status
                  )}`}
                >
                  {p.status}
                </span>
              </div>

              {/* GAME */}
              <div className="text-sm text-zinc-400 mt-1">
                🎮 {p.partyGame || "—"}
              </div>

              {/* META */}
              <div className="mt-3 text-xs text-zinc-500 space-y-1">
                <div>👤 {p.ownerUsername || "unknown"}</div>
                <div>📅 {formatDate(p.createdAt)}</div>
                <div>
                  👥 {p.currentMembers}/{p.totalMembers}
                </div>
                {p.address && <div>📍 {p.address}</div>}
              </div>

              {/* DESCRIPTION */}
              {p.description && (
                <p className="text-xs text-zinc-400 mt-3 line-clamp-2">
                  {p.description}
                </p>
              )}

              {/* KEYWORDS */}
              {p.keywords?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.keywords.map((k, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10"
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              )}

              {/* ID (optional subtle debug/info) */}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
