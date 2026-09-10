"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const COLORS = {
  pinkSoft: "#FFD9E9",
  white: "#FFFFFF",
  pink: "#FFC0D9",
  black: "#000000",
  pinkStrong: "#FF7BAF",
  burgundy: "#6A4252",
};

function PeopleIcon({ size = 28, stroke = COLORS.black }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="24" cy="16" r="6" stroke={stroke} strokeWidth="3.2" />
      <path
        d="M13 36c0-6.075 4.925-11 11-11s11 4.925 11 11"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M9 27.5c-3.314 1.73-5.5 5.184-5.5 9.5M39 27.5c3.314 1.73 5.5 5.184 5.5 9.5"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M15 14.5a6 6 0 0 0-9.5 4.86M33 14.5a6 6 0 0 1 9.5 4.86"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.8 14.1 9l6.1 2.1-6.1 2.1L12 19.4l-2.1-6.2-6.1-2.1L9.9 9 12 2.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const problems = [
  {
    number: "01",
    title: "Нет тиммейтов",
    text: "Хочешь поиграть, но рядом нет своих. Случайные люди редко совпадают по вайбу.",
  },
  {
    number: "02",
    title: "Нет компании",
    text: "Есть идея для вечера, но собрать людей сложнее, чем придумать сам план.",
  },
  {
    number: "03",
    title: "Сложно знакомиться",
    text: "Первый шаг всегда самый неловкий. Здесь повод для разговора уже есть.",
  },
];

const features = [
  {
    icon: <SearchIcon />,
    title: "Поиск по интересам",
    text: "Находи людей, которым нравятся те же игры, фильмы, спорт и хобби.",
  },
  {
    icon: <PeopleIcon size={24} />,
    title: "Пати и события",
    text: "Создавай компанию за пару минут и приглашай тех, кто подходит.",
  },
  {
    icon: <ArrowIcon />,
    title: "Инвайты",
    text: "Присоединяйся к чужим планам или зови людей в свои.",
  },
  {
    icon: <SparkIcon />,
    title: "Живое общение",
    text: "От первого сообщения до настоящей компании — без лишнего шума.",
  },
];

const audience = [
  "геймеры",
  "интроверты",
  "волонтёры",
  "ночные люди",
  "экстраверты",
  "романтики",
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const elements = document.querySelectorAll(".fade");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className={`${montserrat.className} site`}>
      <style jsx global>{`
        :root {
          --pink-soft: ${COLORS.pinkSoft};
          --white: ${COLORS.white};
          --pink: ${COLORS.pink};
          --black: ${COLORS.black};
          --pink-strong: ${COLORS.pinkStrong};
          --burgundy: ${COLORS.burgundy};
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--white);
          color: var(--black);
        }

        button,
        a {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .site {
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 8% 12%, rgba(255, 217, 233, 0.78), transparent 22rem),
            radial-gradient(circle at 92% 25%, rgba(255, 192, 217, 0.62), transparent 25rem),
            var(--white);
        }

        .container {
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid rgba(106, 66, 82, 0.12);
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(18px);
        }

        .nav-inner {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: var(--black);
          text-decoration: none;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .brand-mark {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: var(--pink);
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.05);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
        }

        .nav-links a {
          color: var(--burgundy);
          text-decoration: none;
          font-size: 13px;
          font-weight: 650;
          transition: color .2s ease;
        }

        .nav-links a:hover {
          color: var(--black);
        }

        .nav-button {
          border: 0;
          border-radius: 999px;
          padding: 12px 18px;
          background: var(--black);
          color: var(--white);
          font-size: 13px;
          font-weight: 700;
          transition: transform .2s ease, background .2s ease;
        }

        .nav-button:hover {
          transform: translateY(-2px);
          background: var(--burgundy);
        }

        .hero {
          position: relative;
          padding: 92px 0 78px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.02fr .98fr;
          align-items: center;
          gap: 70px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 12px;
          border-radius: 999px;
          background: var(--pink-soft);
          color: var(--burgundy);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .eyebrow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--pink-strong);
          box-shadow: 0 0 0 4px rgba(255, 123, 175, .16);
        }

        .hero h1 {
          max-width: 760px;
          margin: 22px 0 22px;
          font-size: clamp(48px, 7vw, 86px);
          line-height: .98;
          letter-spacing: -.065em;
          font-weight: 800;
        }

        .hero h1 span {
          color: var(--pink-strong);
        }

        .hero-copy {
          max-width: 630px;
          margin: 0;
          color: var(--burgundy);
          font-size: clamp(17px, 2vw, 21px);
          line-height: 1.65;
          letter-spacing: -.025em;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 32px;
        }

        .primary,
        .secondary {
          min-height: 52px;
          padding: 0 22px;
          border-radius: 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          font-weight: 800;
          font-size: 14px;
          transition: transform .2s ease, box-shadow .2s ease, background .2s ease;
        }

        .primary {
          border: 1px solid var(--black);
          background: var(--black);
          color: var(--white);
          box-shadow: 0 14px 30px rgba(0,0,0,.13);
        }

        .primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 18px 38px rgba(0,0,0,.18);
        }

        .secondary {
          border: 1px solid rgba(106,66,82,.18);
          background: rgba(255,255,255,.76);
          color: var(--black);
        }

        .secondary:hover {
          transform: translateY(-3px);
          border-color: var(--pink-strong);
          background: var(--pink-soft);
        }

        .hero-proof {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 28px;
          color: var(--burgundy);
          font-size: 12px;
          font-weight: 650;
        }

        .avatar-stack {
          display: flex;
          padding-left: 7px;
        }

        .avatar {
          width: 31px;
          height: 31px;
          margin-left: -7px;
          display: grid;
          place-items: center;
          border: 2px solid var(--white);
          border-radius: 50%;
          background: var(--pink-soft);
          color: var(--black);
          font-size: 10px;
          font-weight: 800;
        }

        .avatar:nth-child(2) { background: var(--pink); }
        .avatar:nth-child(3) { background: var(--pink-strong); }
        .avatar:nth-child(4) { background: var(--burgundy); color: var(--white); }
        .avatar:nth-child(5) { background: var(--black); color: var(--white); }

        .hero-art {
          position: relative;
          min-height: 520px;
        }

        .art-card {
          position: absolute;
          border: 1px solid rgba(106,66,82,.12);
          background: rgba(255,255,255,.78);
          backdrop-filter: blur(15px);
          box-shadow: 0 28px 70px rgba(106,66,82,.14);
        }

        .main-card {
          inset: 40px 30px 30px 30px;
          padding: 22px;
          border-radius: 32px;
          transform: rotate(2deg);
        }

        .main-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .tiny-label {
          color: var(--burgundy);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .live-pill {
          padding: 6px 9px;
          border-radius: 999px;
          background: var(--pink-soft);
          color: var(--burgundy);
          font-size: 9px;
          font-weight: 800;
        }

        .profile {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 15px;
          margin-bottom: 10px;
          border: 1px solid rgba(106,66,82,.09);
          border-radius: 18px;
          background: var(--white);
        }

        .profile-avatar {
          width: 47px;
          height: 47px;
          flex: 0 0 auto;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: var(--pink);
          color: var(--black);
          font-size: 16px;
          font-weight: 850;
        }

        .profile:nth-child(3) .profile-avatar { background: var(--pink-strong); }
        .profile:nth-child(4) .profile-avatar { background: var(--burgundy); color: var(--white); }

        .profile-name {
          margin: 0 0 4px;
          font-size: 13px;
          font-weight: 800;
        }

        .profile-meta {
          margin: 0;
          color: var(--burgundy);
          font-size: 10px;
          line-height: 1.45;
        }

        .join {
          margin-left: auto;
          padding: 8px 11px;
          border: 0;
          border-radius: 10px;
          background: var(--black);
          color: var(--white);
          font-size: 9px;
          font-weight: 800;
        }

        .floating {
          padding: 16px;
          border-radius: 20px;
        }

        .floating.one {
          top: 8px;
          right: -8px;
          width: 170px;
          transform: rotate(7deg);
        }

        .floating.two {
          left: -5px;
          bottom: 5px;
          width: 190px;
          transform: rotate(-7deg);
          background: var(--black);
          color: var(--white);
          border-color: var(--black);
        }

        .floating h4 {
          margin: 0 0 7px;
          font-size: 12px;
        }

        .floating p {
          margin: 0;
          color: var(--burgundy);
          font-size: 10px;
          line-height: 1.5;
        }

        .floating.two p {
          color: var(--pink-soft);
        }

        .floating-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          margin-bottom: 12px;
          border-radius: 11px;
          background: var(--pink);
          color: var(--black);
        }

        .section {
          padding: 105px 0;
        }

        .section-soft {
          background:
            linear-gradient(180deg, transparent, rgba(255,217,233,.48) 15%, rgba(255,217,233,.48) 85%, transparent);
        }

        .section-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 30px;
          margin-bottom: 42px;
        }

        .section-heading h2 {
          max-width: 700px;
          margin: 12px 0 0;
          font-size: clamp(34px, 5vw, 58px);
          line-height: 1.02;
          letter-spacing: -.055em;
          font-weight: 800;
        }

        .section-heading p {
          max-width: 410px;
          margin: 0;
          color: var(--burgundy);
          font-size: 14px;
          line-height: 1.65;
        }

        .cards-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .problem-card {
          min-height: 275px;
          padding: 26px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(106,66,82,.13);
          border-radius: 25px;
          background: rgba(255,255,255,.78);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }

        .problem-card:hover {
          transform: translateY(-7px);
          border-color: var(--pink-strong);
          box-shadow: 0 22px 50px rgba(106,66,82,.11);
        }

        .problem-card::after {
          content: "";
          position: absolute;
          width: 130px;
          height: 130px;
          right: -60px;
          bottom: -65px;
          border-radius: 50%;
          background: var(--pink-soft);
        }

        .number {
          color: var(--pink-strong);
          font-size: 12px;
          font-weight: 850;
          letter-spacing: .08em;
        }

        .problem-card h3 {
          margin: 65px 0 11px;
          font-size: 22px;
          letter-spacing: -.035em;
        }

        .problem-card p {
          max-width: 320px;
          margin: 0;
          color: var(--burgundy);
          font-size: 13px;
          line-height: 1.65;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
        }

        .feature {
          padding: 24px;
          border-radius: 22px;
          background: var(--white);
          border: 1px solid rgba(106,66,82,.12);
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .feature:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 45px rgba(106,66,82,.10);
        }

        .feature-icon {
          width: 47px;
          height: 47px;
          display: grid;
          place-items: center;
          margin-bottom: 27px;
          border-radius: 14px;
          background: var(--pink-soft);
          color: var(--black);
        }

        .feature:nth-child(2) .feature-icon { background: var(--pink); }
        .feature:nth-child(3) .feature-icon { background: var(--pink-strong); }
        .feature:nth-child(4) .feature-icon { background: var(--burgundy); color: var(--white); }

        .feature h3 {
          margin: 0 0 10px;
          font-size: 16px;
          letter-spacing: -.025em;
        }

        .feature p {
          margin: 0;
          color: var(--burgundy);
          font-size: 12px;
          line-height: 1.65;
        }

        .audience {
          display: grid;
          grid-template-columns: .75fr 1.25fr;
          gap: 70px;
          align-items: center;
        }

        .audience-copy h2 {
          margin: 12px 0 17px;
          font-size: clamp(35px, 5vw, 57px);
          line-height: 1.03;
          letter-spacing: -.055em;
        }

        .audience-copy p {
          max-width: 500px;
          margin: 0;
          color: var(--burgundy);
          font-size: 14px;
          line-height: 1.7;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .tag {
          padding: 13px 17px;
          border: 1px solid rgba(106,66,82,.18);
          border-radius: 999px;
          background: var(--white);
          color: var(--black);
          font-size: 13px;
          font-weight: 750;
          transition: all .2s ease;
        }

        .tag:nth-child(2n) { background: var(--pink-soft); }
        .tag:nth-child(3n) { background: var(--pink); }

        .tag:hover {
          transform: translateY(-3px);
          border-color: var(--pink-strong);
          box-shadow: 0 10px 22px rgba(255,123,175,.18);
        }

        .manifesto {
          padding: 120px 0;
          background: var(--black);
          color: var(--white);
          position: relative;
          isolation: isolate;
        }

        .manifesto::before {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          left: -150px;
          top: -210px;
          border-radius: 50%;
          background: var(--pink-strong);
          filter: blur(100px);
          opacity: .35;
          z-index: -1;
        }

        .manifesto-inner {
          text-align: center;
        }

        .manifesto-label {
          color: var(--pink);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .manifesto p {
          max-width: 820px;
          margin: 22px auto 28px;
          font-size: clamp(27px, 4.3vw, 52px);
          line-height: 1.12;
          letter-spacing: -.055em;
          font-weight: 750;
        }

        .manifesto strong {
          color: var(--pink-strong);
        }

        .quote {
          margin: 0 auto;
          color: var(--pink-soft);
          font-size: 14px;
          font-weight: 650;
        }

        .cta {
          padding: 115px 0;
        }

        .cta-box {
          position: relative;
          overflow: hidden;
          padding: 70px 40px;
          border-radius: 35px;
          background: var(--pink);
          border: 1px solid rgba(0,0,0,.08);
          text-align: center;
        }

        .cta-box::before,
        .cta-box::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .cta-box::before {
          width: 240px;
          height: 240px;
          left: -120px;
          top: -120px;
          background: var(--pink-strong);
          opacity: .32;
        }

        .cta-box::after {
          width: 300px;
          height: 300px;
          right: -140px;
          bottom: -170px;
          background: var(--pink-soft);
        }

        .cta-box > * {
          position: relative;
          z-index: 1;
        }

        .cta-box h2 {
          margin: 10px auto 14px;
          max-width: 700px;
          font-size: clamp(37px, 6vw, 66px);
          line-height: 1;
          letter-spacing: -.06em;
        }

        .cta-box p {
          max-width: 540px;
          margin: 0 auto 27px;
          color: var(--burgundy);
          font-size: 14px;
          line-height: 1.6;
        }

        .footer {
          border-top: 1px solid rgba(106,66,82,.13);
          padding: 32px 0;
        }

        .footer-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          color: var(--burgundy);
          font-size: 11px;
          font-weight: 600;
        }

        .fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .75s ease, transform .75s cubic-bezier(.2,.7,.2,1);
        }

        .fade.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 900px) {
          .hero-grid,
          .audience {
            grid-template-columns: 1fr;
          }

          .hero-art {
            min-height: 500px;
            max-width: 620px;
            width: 100%;
            margin: 0 auto;
          }

          .cards-3 {
            grid-template-columns: 1fr;
          }

          .features {
            grid-template-columns: repeat(2, 1fr);
          }

          .section-heading {
            align-items: start;
            flex-direction: column;
          }
        }

        @media (max-width: 650px) {
          .container {
            width: min(100% - 28px, 1180px);
          }

          .nav-links {
            display: none;
          }

          .nav-inner {
            min-height: 68px;
          }

          .hero {
            padding: 60px 0 45px;
          }

          .hero h1 {
            font-size: clamp(43px, 14vw, 68px);
          }

          .hero-art {
            min-height: 430px;
          }

          .main-card {
            inset: 35px 4px 25px 4px;
            padding: 15px;
            border-radius: 24px;
          }

          .floating.one {
            right: -2px;
            width: 140px;
          }

          .floating.two {
            left: -3px;
            width: 155px;
          }

          .section {
            padding: 75px 0;
          }

          .features {
            grid-template-columns: 1fr;
          }

          .cta {
            padding: 75px 0;
          }

          .cta-box {
            padding: 55px 22px;
            border-radius: 26px;
          }

          .footer-inner {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }

          .fade {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>

      <nav className="nav">
        <div className="container nav-inner">
          <a href="#" className="brand" aria-label="ВМЕСТЕ — на главную">
            <span className="brand-mark">
              <PeopleIcon size={25} />
            </span>
            ВМЕСТЕ
          </a>

          <div className="nav-links">
            <a href="#problem">Почему мы</a>
            <a href="#features">Возможности</a>
            <a href="#audience">Для кого</a>
          </div>

          <button className="nav-button" onClick={() => router.push("/register")}>
            Начать
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="container hero-grid">
          <div className="fade is-visible">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              люди • интересы • компания
            </div>

            <h1>
              Найди своих.
              <br />
              Будьте <span>ВМЕСТЕ.</span>
            </h1>

            <p className="hero-copy">
              Пространство, где люди находят друг друга по интересам,
              собираются в компании и превращают «не с кем» в «давайте вместе».
            </p>

            <div className="hero-actions">
              <button className="primary" onClick={() => router.push("/register")}>
                Найти свою компанию
                <ArrowIcon size={17} />
              </button>
              <a className="secondary" href="#features">
                Как это работает
              </a>
            </div>

            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span className="avatar">А</span>
                <span className="avatar">М</span>
                <span className="avatar">К</span>
                <span className="avatar">И</span>
                <span className="avatar">+</span>
              </div>
              Уже есть люди, которые ищут своих
            </div>
          </div>

          <div className="hero-art fade is-visible" aria-hidden="true">
            <div className="art-card floating one">
              <div className="floating-icon">
                <SparkIcon size={18} />
              </div>
              <h4>Совпали по вайбу</h4>
              <p>Интересы уже есть. Осталось познакомиться.</p>
            </div>

            <div className="art-card main-card">
              <div className="main-card-head">
                <span className="tiny-label">Рядом с тобой</span>
                <span className="live-pill">онлайн сейчас</span>
              </div>

              <div className="profile">
                <div className="profile-avatar">А</div>
                <div>
                  <p className="profile-name">Алина</p>
                  <p className="profile-meta">Valorant · кино · кофе</p>
                </div>
                <button className="join">Звать</button>
              </div>

              <div className="profile">
                <div className="profile-avatar">М</div>
                <div>
                  <p className="profile-name">Макс</p>
                  <p className="profile-meta">спорт · музыка · ночные прогулки</p>
                </div>
                <button className="join">Звать</button>
              </div>

              <div className="profile">
                <div className="profile-avatar">К</div>
                <div>
                  <p className="profile-name">Катя</p>
                  <p className="profile-meta">настолки · сериалы · арт</p>
                </div>
                <button className="join">Звать</button>
              </div>
            </div>

            <div className="art-card floating two">
              <div className="floating-icon">
                <PeopleIcon size={19} />
              </div>
              <h4>Новая компания</h4>
              <p>«Кто на вечернюю прогулку? Нас уже 4»</p>
            </div>
          </div>
        </div>
      </section>

      <section id="problem" className="section section-soft">
        <div className="container">
          <div className="section-heading fade">
            <div>
              <div className="eyebrow">Знакомо?</div>
              <h2>Одиночество часто начинается с одного простого «не с кем».</h2>
            </div>
            <p>
              ВМЕСТЕ убирает неловкий первый шаг и делает знакомство естественным:
              через общие интересы, планы и реальные поводы быть рядом.
            </p>
          </div>

          <div className="cards-3">
            {problems.map((item) => (
              <article className="problem-card fade" key={item.number}>
                <span className="number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="container">
          <div className="section-heading fade">
            <div>
              <div className="eyebrow">Возможности</div>
              <h2>Всё, чтобы знакомиться было проще.</h2>
            </div>
            <p>
              Никакой перегруженности. Только инструменты, которые помогают
              перейти от интереса к настоящей компании.
            </p>
          </div>

          <div className="features">
            {features.map((feature) => (
              <article className="feature fade" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="audience" className="section section-soft">
        <div className="container audience">
          <div className="audience-copy fade">
            <div className="eyebrow">Для кого</div>
            <h2>Для тех, кто хочет быть не один.</h2>
            <p>
              Неважно, ты любишь шумные компании или предпочитаешь одного
              близкого человека. ВМЕСТЕ начинается с интереса, а заканчивается
              ощущением «я среди своих».
            </p>
          </div>

          <div className="tags fade">
            {audience.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="manifesto">
        <div className="container manifesto-inner fade">
          <div className="manifesto-label">Наша идея</div>
          <p>
            Мы создаём пространство, где одиночество исчезает, а каждый может
            найти <strong>своих людей.</strong>
          </p>
          <div className="quote">«Я не один — мы ВМЕСТЕ.»</div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-box fade">
            <div className="eyebrow">Твой следующий шаг</div>
            <h2>Давай найдём твою компанию.</h2>
            <p>
              Присоединяйся к ВМЕСТЕ и начни с простого: расскажи, что тебе
              нравится. Дальше всё станет намного интереснее.
            </p>
            <button className="primary" onClick={() => router.push("/register")}>
              Начать сейчас
              <ArrowIcon size={17} />
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <span>ВМЕСТЕ © 2026</span>
          <span>Сделано, чтобы объединять людей</span>
        </div>
      </footer>
    </main>
  );
}
