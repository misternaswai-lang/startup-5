"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuth(!!token);
  }, []);

  const linkClass = (path) =>
    `cursor-pointer transition px-3 py-2 rounded-lg ${
      pathname === path
        ? "text-purple-400 bg-purple-900/20"
        : "text-zinc-300 hover:text-purple-400 hover:bg-zinc-800"
    }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur border-b border-zinc-800 bg-black/70">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => router.push("/")}
          className="text-lg sm:text-2xl font-bold text-purple-400 tracking-wide cursor-pointer hover:opacity-80 transition"
        >
          🎮 ВМЕСТЕ
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2 text-sm">
          <button onClick={() => router.push("/")} className={linkClass("/")}>
            Главная
          </button>

          <button
            onClick={() => router.push("/parties")}
            className={linkClass("/parties")}
          >
            Пати
          </button>

          {isAuth ? (
            <button
              onClick={() => router.push("/me")}
              className={linkClass("/me")}
            >
              Профиль
            </button>
          ) : (
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition"
              >
                Войти
              </button>

              <button
                onClick={() => router.push("/register")}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition shadow-md shadow-purple-900/30"
              >
                Регистрация
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
