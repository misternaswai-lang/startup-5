"use client";
import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    age: "",
    gender: "",
    city: "",
    interests: [],
  });

  const [interestInput, setInterestInput] = useState("");
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  const addInterest = () => {
    if (!interestInput) return;
    setForm({
      ...form,
      interests: [...form.interests, interestInput],
    });
    setInterestInput("");
  };

  const submit = async () => {
    try {
      const payload = {
        ...form,
        age: form.age === "" || form.age === null ? null : Number(form.age),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw data;
      }

      router.push("/login");
    } catch (e) {
      setError(e?.details || e?.message || "Ошибка регистрации");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-black border border-purple-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-purple-400 mb-2 text-center">
          Регистрация
        </h1>

        {/* progress */}
        <p className="text-center text-sm text-purple-300 mb-6">
          Шаг {step} из 3
        </p>

        <div className="flex flex-col gap-4">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                placeholder="Почта"
                className="p-3 rounded-lg bg-black border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                placeholder="Пароль"
                type="password"
                className="p-3 rounded-lg bg-black border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <button
                onClick={next}
                className="mt-2 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold shadow-lg active:scale-95"
              >
                Далее
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                placeholder="Имя"
                className="p-3 rounded-lg bg-black border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />

              <div className="flex gap-2">
                <button
                  onClick={back}
                  className="flex-1 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
                >
                  Назад
                </button>

                <button
                  onClick={next}
                  className="flex-1 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold"
                >
                  Далее
                </button>
              </div>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input
                placeholder="Возраст"
                type="number"
                className="p-3 rounded-lg bg-black border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />

              <select
                className="p-3 rounded-lg bg-black border border-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Пол</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>

              <input
                placeholder="Город"
                className="p-3 rounded-lg bg-black border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />

              {/* interests */}
              <div className="flex gap-2">
                <input
                  placeholder="Интерес"
                  value={interestInput}
                  className="flex-1 p-3 rounded-lg bg-black border border-purple-700 text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  onChange={(e) => setInterestInput(e.target.value)}
                />

                <button
                  onClick={addInterest}
                  className="px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition"
                >
                  +
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.interests.map((i, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-purple-700/80 text-white px-2 py-1 rounded-full border border-purple-500"
                  >
                    {i}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={back}
                  className="flex-1 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
                >
                  Назад
                </button>

                <button
                  onClick={submit}
                  className="flex-1 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 transition text-white font-semibold shadow-lg active:scale-95"
                >
                  Зарегистрироваться
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-900/40 border border-red-500 text-red-300 p-3 rounded-lg text-sm">
              <p className="break-words">
                {error?.toString().replace("П", " П")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
