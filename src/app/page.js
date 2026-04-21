"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const elements = document.querySelectorAll(".fade");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
  }, []);

  return (
    <main className="bg-[#0b0b0f] text-white font-sans">
      {/* HERO */}
      <section className="text-center px-6 py-28 md:py-40 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          ВМЕСТЕ — найди свою компанию
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-zinc-400 mb-10 leading-relaxed">
          Пространство, где люди находят друг друга по интересам, собираются в
          компании и перестают быть одни
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:scale-105 transition shadow-[0_0_20px_#7c3aed]"
          >
            Начать
          </button>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="px-6 py-20 max-w-6xl mx-auto fade  translate-y-10 transition duration-700">
        <h2 className="text-3xl md:text-4xl font-semibold mb-10 text-center">
          😶 Знакомо?
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "🎮 Нет тиммейтов",
              text: "Хочешь поиграть, но не с кем. Случайные люди — не вариант.",
            },
            {
              title: "🎉 Нет компании",
              text: "Есть идея провести вечер, но собрать людей сложно.",
            },
            {
              title: "🤝 Трудно знакомиться",
              text: "Начать разговор — самое сложное. Особенно в онлайне.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:scale-105 hover:shadow-[0_0_20px_#7c3aed55] transition"
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-zinc-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20 max-w-6xl mx-auto fade translate-y-10 transition duration-700">
        <h2 className="text-3xl md:text-4xl font-semibold mb-10 text-center">
          🚀 Возможности
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "🔍 Поиск",
              text: "Находи людей по интересам — игры, фильмы, спорт.",
            },
            {
              title: "🎉 Пати",
              text: "Создавай события за секунды и собирай людей.",
            },
            {
              title: "🤝 Инвайты",
              text: "Зови людей или присоединяйся к другим.",
            },
            {
              title: "💬 Общение",
              text: "Чаты, знакомства и живое взаимодействие.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:scale-105 hover:shadow-[0_0_25px_#9333ea55] transition"
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-zinc-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center fade  translate-y-10 transition duration-700">
        <h2 className="text-3xl md:text-4xl font-semibold mb-10">
          ❤️ Для кого это
        </h2>

        <div className="flex flex-wrap justify-center gap-3">
          {[
            "🎮 геймеры",
            "🤫 интроверты",
            "👥 волонтеры",
            "🌙 ночные люди",
            "💬 экстраверты",
            "✨ романтики",
          ].map((tag, i) => (
            <span
              key={i}
              className="px-4 py-2 border border-purple-500 rounded-full text-sm hover:shadow-[0_0_15px_#7c3aed] transition"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="text-center px-6 py-28 fade opacity-0 translate-y-10 transition duration-700">
        <p className="text-xl md:text-2xl text-zinc-400 mb-4">
          Мы создаём пространство, где одиночество исчезает.
        </p>
        <p className="text-xl md:text-2xl text-zinc-400 mb-6">
          Где каждый может найти своих людей.
        </p>

        <h3 className="text-3xl md:text-5xl font-bold text-purple-500 drop-shadow-[0_0_20px_#7c3aed]">
          “Я не один — мы ВМЕСТЕ.”
        </h3>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 max-w-4xl mx-auto fade opacity-0 translate-y-10 transition duration-700">
        <div className="p-8 md:p-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            🚀 Готов начать?
          </h2>

          <p className="text-zinc-400 mb-6 text-lg">
            Присоединяйся и найди свою компанию уже сегодня
          </p>

          <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:scale-105 transition shadow-[0_0_25px_#7c3aed]">
            Начать сейчас
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-10 text-zinc-500 text-sm">
        ВМЕСТЕ © 2026 <br />
        Сделано, чтобы объединять людей
      </footer>
    </main>
  );
}
