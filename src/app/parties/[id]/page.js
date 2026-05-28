"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PartyClient() {
  const params = useParams();
  const partyId = params.id;

  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const API_BASE = "";

  // Load current user
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      location.href = "/login";
      return;
    }

    fetch(`${API_BASE}/api/users/me`, {
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

  // Load party
  const loadParty = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/api/parties/${partyId}`);

      if (!res.ok) throw new Error("Failed to load party");

      const data = await res.json();
      setParty(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (partyId) loadParty();
  }, [partyId]);

  const joinParty = async () => {
    const token = localStorage.getItem("accessToken");

    await fetch(`${API_BASE}/api/parties/${partyId}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadParty();
  };

  const leaveParty = async () => {
    const token = localStorage.getItem("accessToken");

    await fetch(`${API_BASE}/api/parties/${partyId}/leave`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    loadParty();
  };

  if (loading || !party || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-purple-400 text-xl">
        Loading party...
      </div>
    );
  }

  const isMember = party.members?.some((m) => m.id === user.id);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1a0125,_#000)] text-white p-6 flex justify-center">
      <div className="w-full max-w-5xl space-y-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl p-6 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* glow */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-600/30 blur-3xl rounded-full" />

          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            {party.partyName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            <span className="flex items-center gap-1">
              🎮 {party.partyGame}
            </span>
            <span className="flex items-center gap-1">📍 {party.address}</span>
            <span>
              📅{" "}
              {new Date(party.createdAt).toLocaleString("ru-RU", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>

            <span
              className={`px-2 py-1 rounded-full text-xs ${
                party.status === "open"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {party.status}
            </span>
          </div>
        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="md:col-span-2 space-y-6">
            {/* DESCRIPTION */}
            <div className="p-5 rounded-2xl min-h-[115px] bg-white/5 backdrop-blur border border-white/10">
              <h2 className="text-purple-300  font-semibold mb-2">Описание</h2>
              <p className="text-zinc-300 leading-relaxed">
                {party.description || "Нет описания"}
              </p>
            </div>

            {/* MEMBERS */}
            <div className="p-5 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <h2 className="text-purple-300 font-semibold mb-4">Участники</h2>

              <div className="space-y-2">
                {party.members?.map((m) => (
                  <div
                    key={m.id}
                    className="flex justify-between items-center px-4 py-3 rounded-xl bg-black/40 hover:bg-black/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">
                        {(m.username || m.email)[0].toUpperCase()}
                      </div>

                      <span>{m.username || m.email}</span>
                    </div>

                    <span className="text-xs text-purple-400">
                      {m.id === user.id
                        ? "Вы"
                        : m.id === party.owner?.id
                        ? "owner"
                        : "online"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">
            {/* STATS */}
            <div className="p-5 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <h2 className="text-purple-300 font-semibold mb-3">Участники</h2>

              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Заполнено</span>
                <span>
                  {party.currentMembers}/{party.totalMembers}
                </span>
              </div>

              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{
                    width: `${
                      party.totalMembers
                        ? (party.currentMembers / party.totalMembers) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* OWNER */}
            <div className="p-5 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
              <h2 className="text-purple-300 font-semibold mb-2">Создатель</h2>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                  {(party.owner?.username ||
                    party.owner?.email)[0].toUpperCase()}
                </div>

                <div>
                  <div>{party.owner?.username || party.owner?.email}</div>
                  <div className="text-xs text-purple-400">owner</div>
                </div>
              </div>
            </div>

            {/* KEYWORDS */}
            {party.keywords?.length > 0 && (
              <div className="p-5 rounded-2xl bg-white/5 backdrop-blur border border-white/10">
                <h2 className="text-purple-300 font-semibold mb-3">Теги</h2>

                <div className="flex flex-wrap gap-2">
                  {party.keywords.map((k, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm rounded-full bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 transition"
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="space-y-3">
              {!isMember && (
                <button
                  onClick={joinParty}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:scale-[1.02] transition font-semibold shadow-lg shadow-purple-900/40"
                >
                  🚀 Присоединиться
                </button>
              )}

              {isMember && (
                <button
                  onClick={leaveParty}
                  className="w-full p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition font-semibold border border-white/10"
                >
                  Выйти
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
