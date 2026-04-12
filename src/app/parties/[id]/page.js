"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";

export default function PartyClient() {
  const params = useParams();
  const partyId = params.id;

  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // store user info

  // Load current user
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

  // Load party data
  const loadParty = async () => {
    setLoading(true);
    const data = await apiFetch(`/parties/${partyId}`);
    setParty(data);
    setLoading(false);
  };

  useEffect(() => {
    if (partyId) loadParty();
  }, [partyId]);

  const joinParty = async () => {
    const token = localStorage.getItem("accessToken");
    await apiFetch(`/parties/${partyId}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadParty();
  };

  const leaveParty = async () => {
    const token = localStorage.getItem("accessToken");
    await apiFetch(`/parties/${partyId}/leave`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
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

  const isMember = party.members.some((m) => m.id === user.id);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-700 p-6 rounded-3xl shadow-xl border border-purple-800">
          <h1 className="text-4xl font-bold mb-2">{party.partyName}</h1>
          <p className="text-purple-200 text-lg">Game: {party.partyGame}</p>
        </div>

        {/* Stats */}
        <div className="bg-zinc-900 rounded-2xl p-5 shadow-md border border-purple-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-purple-300 font-medium">Members</span>
            <span className="text-lg font-semibold">
              {party.currentMembers}/{party.totalMembers}
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-500"
              style={{
                width: `${(party.currentMembers / party.totalMembers) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {!isMember && (
            <button
              onClick={joinParty}
              className="flex-1 bg-purple-600 hover:bg-purple-500 transition-all p-3 rounded-xl font-semibold shadow-lg"
            >
              Join Party
            </button>
          )}
          {isMember && (
            <button
              onClick={leaveParty}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 transition-all p-3 rounded-xl font-semibold border border-purple-700"
            >
              Leave Party
            </button>
          )}
        </div>

        {/* Members list */}
        <div className="bg-zinc-900 rounded-2xl p-5 shadow-md border border-purple-800">
          <h2 className="text-xl font-semibold mb-4 text-purple-300">
            Members
          </h2>
          <div className="space-y-2">
            {party.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between bg-zinc-800 px-4 py-2 rounded-lg hover:bg-zinc-700 transition"
              >
                <span>{m.username}</span>
                <span className="text-purple-400 text-sm">
                  {m.id === user.id ? "You" : "online"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
