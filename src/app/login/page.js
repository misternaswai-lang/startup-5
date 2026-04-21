"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const router = useRouter();

  const submit = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw data;
      }

      // save tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // optional user info
      if (data.user) {
        localStorage.setItem("name", data.user.username);
        localStorage.setItem("userId", data.user.id);
      }

      router.push("/me");
    } catch (e) {
      if (e?.error === "Invalid email or password") {
        setError("Неверная почта или пароль");
      } else {
        setError(e?.error || "Ошибка входа");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-black border border-purple-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-purple-400 mb-6 text-center">
          Вход
        </h1>

        <div className="flex flex-col gap-4">
          <input
            className="p-3 rounded-lg bg-black border border-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Почта"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            className="p-3 rounded-lg bg-black border border-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Пароль"
            type="password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <button
            onClick={submit}
            className="mt-4 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold shadow-lg"
          >
            Войти
          </button>

          {error && (
            <div className="bg-red-900/40 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
