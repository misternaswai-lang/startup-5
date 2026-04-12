"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsAuth(!!token);
  }, []);

  return (
    <header className="border-b border-purple-800 bg-gradient-to-r from-black via-zinc-900 to-black">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xs sm:text-2xl font-bold text-purple-400 tracking-wide">
          🎮 ВМЕСТЕ
        </div>

        <nav className="flex items-center gap-6 h-full text-sm">
          <a className="hover:text-purple-400 transition" href="/">
            Главная
          </a>
          <a className="hover:text-purple-400 transition" href="/parties">
            Пати
          </a>

          {isAuth ? (
            <a className="hover:text-purple-400 transition" href="/me">
              Профиль
            </a>
          ) : (
            <div className="flex gap-3">
              <a
                href="/login"
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition border border-purple-700 text-sm"
              >
                Войти
              </a>
              <a
                href="/register"
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition text-sm font-semibold"
              >
                Регистрация
              </a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
