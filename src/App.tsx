import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bird, Play, Gift, PartyPopper, ListChecks,
  CheckCircle2, AlertCircle, HelpCircle, RefreshCw
} from "lucide-react";

// SVG en composants (assure-toi que fill="currentColor" dans les .svg)
import Banner from "./assets/photo-1.3.svg?react";
import Badge  from "./assets/photo-1.2.svg?react";
import introVideo from "./assets/intro.mp4";
import giftVideo  from "./assets/gift.mp4";


type QuizQuestion = { id: string; text: string; options: string[]; correctIndex: number; };
type QuizAnswers  = Record<string, number>;
type Result = { correct: number; total: number; allGood: boolean };

const TOTAL_DUCKS = 100;
const DUCKS = Array.from({ length: TOTAL_DUCKS }, (_, i) => i + 1);
const LS_COLLECT = "duck_collect_v1";

const QUIZ: QuizQuestion[] = [
  {
    id: "q38",
    text: "De quelle couleur est le canard #38 ?",
    options: ["Bleu", "Vert", "Rose", "Jaune"],
    correctIndex: 1, // Vert
  },
  {
    id: "q52",
    text: "De quelle couleur est le canard #52 ?",
    options: ["Bleu", "Rose", "Vert", "Orange"],
    correctIndex: 1, // Rose
  },
  {
    id: "q96",
    text: "Le canard #96 est-il bleu ?",
    options: ["Vrai", "Faux"],
    correctIndex: 0, // Vrai
  },
];



const GIFT = { text: "🎁 Bravo ! Montrez ce message à bah Alex  pour Obtenir la recompense ." };

function useLocalStorage<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) as T) : initial; }
    catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, value]);
  return [value, setValue];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

//function useSounds() {
 // const [enabled, setEnabled] = useState(false);
  //const arm = () => { if (!enabled) setEnabled(true); };
  //const play = (name: string) => {
   // if (!enabled) return;
   // const el = new Audio(`/sounds/${name}.mp3`);
   // el.volume = 0.7;
  //  el.play().catch(() => {});
//  };
//  return { play, arm };
//}

function useSounds() {
  return {
    play: (_: string) => {},
    arm: () => {},
  };
}


/* --- UI sur fond bleu canard --- */
function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2.5 bg-white/25 rounded-full overflow-hidden">
      <div className="h-full bg-white transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

function NumberBadge({ n, checked, onToggle }: { n: number; checked: boolean; onToggle: (n: number) => void }) {
  return (
    <button
      onClick={() => onToggle(n)}
      className={`w-10 h-10 rounded-full text-sm font-semibold border flex items-center justify-center transition-colors
        ${checked
          ? "bg-yellow-400 text-duck border-yellow-400"
          : "bg-white/10 text-white border-white/30 hover:bg-white/20"}`}
      title={`Canard #${n}`}
    >
      {checked ? "✓" : n}
    </button>
  );
}

function QuizRun({
  quiz,
  onSubmit,
  onAnswerChange,
}: {
  quiz: QuizQuestion[];
  onSubmit: (answers: QuizAnswers) => void;
  /** callback optionnel pour compter les changements de réponses (anti-triche) */
  onAnswerChange?: () => void;
}) {
  const [answers, setAnswers] = useState<QuizAnswers>({});

  // toutes les questions ont-elles une réponse ?
  const allAnswered = quiz.every((q) => Number.isInteger(answers[q.id]));

  // setter unique pour centraliser le comptage des changements
  const setAns = (qid: string, idx: number) => {
    setAnswers((prev) => {
      // si on change de valeur, on notifie
      const prevVal = prev[qid];
      const next = { ...prev, [qid]: idx };
      if (prevVal !== idx) onAnswerChange?.();
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {quiz.map((q, i) => (
        <div key={q.id} className="rounded-lg border border-white/20 p-4 bg-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-1 rounded-md bg-white/15 text-white">
              Q{i + 1}
            </span>
            <h3 className="font-medium text-white">{q.text}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {q.options.map((opt, idx) => {
              const selected = answers[q.id] === idx;
              return (
                <label
                  key={idx}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition
                    ${selected
                      ? "bg-white text-duck border-white"
                      : "bg-white/10 text-white border-white/20 hover:bg-white/15"}`}
                >
                  <input
                    className="accent-white"
                    type="radio"
                    name={`run-${q.id}`}
                    checked={selected}
                    onChange={() => setAns(q.id, idx)}
                  />
                  <span>{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <button
        disabled={!allAnswered}
        onClick={() => onSubmit(answers)}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-duck text-sm font-semibold transition
          ${allAnswered ? "bg-yellow-400 hover:bg-yellow-300" : "bg-yellow-400/50 cursor-not-allowed"}`}
      >
        <ListChecks className="w-4 h-4" /> Valider mes réponses
      </button>
    </div>
  );
}



export default function App() {
  const [collected, setCollected] = useLocalStorage<number[]>(LS_COLLECT, []);
  const collectedSet = useMemo(() => new Set(collected), [collected]);
  const collectedCount = collected.length;
  const progress = Math.round((collectedCount / TOTAL_DUCKS) * 100);
  const [scrolled, setScrolled] = useState(false);
  const [phase, setPhase] = useState<"intro" | "collect" | "quiz" | "result">("intro");
  const [result, setResult] = useState<Result>({ correct: 0, total: QUIZ.length, allGood: false });
  const [quizReady, setQuizReady] = useState<QuizQuestion[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<"success" | "error" | null>(null);
  const [quizAttempts, setQuizAttempts] = useState(0);          // nb de soumissions ratées
  const [answerChangeCount, setAnswerChangeCount] = useState(0); // nb de changements de réponses
  const [antiCheatMsg, setAntiCheatMsg] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true); // joue au démarrage (phase intro)
  const [showAntiCheat, setShowAntiCheat] = useState(false);




  const { play, arm } = useSounds();

  useEffect(() => { setCollected((p) => Array.from(new Set(p)).sort((a, b) => a - b)); }, []);

  useEffect(() => {
  if (!showIntro || phase !== "intro") return;
  const id = setTimeout(() => setShowIntro(false), 5200);
  return () => clearTimeout(id);
}, [showIntro, phase]);

useEffect(() => {
  if (!antiCheatMsg) return;
  setShowAntiCheat(true);
  const id = setTimeout(() => setShowAntiCheat(false), 6000);
  return () => clearTimeout(id);
}, [antiCheatMsg]);


    useEffect(() => {
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60); // déclenche à ~60px
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll(); // init
      return () => window.removeEventListener("scroll", onScroll);
    }, []);


  function toggle(n: number) {
    setCollected((prev) => {
      const s = new Set(prev);
      let action: "add" | "remove";
      if (s.has(n)) { s.delete(n); action = "remove"; }
      else { s.add(n); action = "add"; }
      const arr = Array.from(s).sort((a, b) => a - b);
      if (action === "add") play("tick");
      if (arr.length === TOTAL_DUCKS) play("success");
      return arr;
    });
  }

  function clearAll() {
    if (!confirm("Réinitialiser la collecte ?")) return;
    setCollected([]);
    play("reset");
  }

function submitQuiz(answers: QuizAnswers) {
  const source = quizReady.length ? quizReady : QUIZ;

  // 1) Calcul du score
  let correct = 0;
  for (const q of source) {
    if (answers[q.id] === q.correctIndex) correct++;
  }
  const allGood = correct === source.length && source.length > 0;

  // 2) Si une seule réponse est fausse → pénalité immédiate
  if (!allGood) {
    // Associe l’ID des questions au numéro des canards concernés
    const mapIdToDuck: Record<string, number> = { q38: 38, q52: 52, q96: 96 };

    // On détermine dynamiquement les canards à retirer d'après les questions actives
    const penalised = new Set<number>();
    for (const q of source) {
      const duckNum = mapIdToDuck[q.id];
      if (typeof duckNum === "number") penalised.add(duckNum);
    }

    // Message + retrait des badges
    setAntiCheatMsg("😅 Oups ! Une ou plusieurs réponses sont incorrectes… Les canards #38, #52 et #96 retournent se cacher !");
    setCollected((prev) => prev.filter((n) => !penalised.has(n)));

    // Reset et retour au tableau de chasse
    setQuizAttempts(0);
    setAnswerChangeCount(0);
    setPhase("collect");
    return; // on ne montre PAS l’écran de résultat
  }

  // 3) Cas parfait → on affiche le résultat (cadeau)
  setResult({ correct, total: source.length, allGood, allGod: allGood }); // allGod pour compat éventuelle
  setQuizFeedback("success");
  setPhase("result");

  // Reset du compteur de changements pour la prochaine tentative
  setAnswerChangeCount(0);
}


  useEffect(() => {
    if (phase === "quiz") {
      const mixed = shuffleArray(QUIZ).map(q => {
        const opts = shuffleArray(q.options);
        const correctLabel = q.options[q.correctIndex];
        const newCorrectIndex = opts.findIndex(o => o === correctLabel);
        return { ...q, options: opts, correctIndex: newCorrectIndex };
      });
      setQuizReady(mixed);
      setQuizFeedback(null);
    }
  }, [phase]);

  return (
    <div className="min-h-screen bg-duck text-white">
          {showIntro && phase === "intro" && (
            <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center">
              <video
                src={introVideo}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                onEnded={() => setShowIntro(false)}
              />
              <button
                onClick={() => setShowIntro(false)}
                className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-white text-duck font-semibold hover:bg-white/90"
                aria-label="Passer l’intro"
              >
                Passer
              </button>
            </div>
          )}

   <header className="sticky top-0 z-30 bg-duck/95 backdrop-blur border-b border-white/10">
        <div
          className={`max-w-6xl mx-auto px-4 flex items-center justify-between gap-4 transition-[padding] duration-300 ${
            scrolled ? "py-2.5" : "py-3.5"
          }`}
          aria-label="Barre d’en-tête"
        >
          <div className="flex items-center gap-3">
            <div className={`origin-left transition-transform duration-300 ${scrolled ? "scale-80" : "scale-100"}`}>
              <Banner className="w-[clamp(200px,30vw,420px)] h-auto text-white" />
            </div>

            {/* Titre : réduit de ~20% */}
            <h1
              className={`font-extrabold tracking-tight text-white transition-[font-size,transform] duration-300 ${
                scrolled ? "text-2xl" : "text-3xl md:text-4xl"
              }`}
            >
              Chasse aux Canards — Kidnap’Party
            </h1>
          </div>

          <span className="inline-block text-sm px-2 py-1 rounded-lg bg-white/20">
            {collectedCount}/{TOTAL_DUCKS}
          </span>
        </div>
      </header>
        {antiCheatMsg && showAntiCheat && (
          <div
            role="status"
            aria-live="polite"
            className="sticky top-0 z-40"
          >
            <div className="bg-yellow-400 text-duck font-semibold">
              <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <span>{antiCheatMsg}</span>
                <button
                  onClick={() => setShowAntiCheat(false)}
                  className="px-3 py-1 rounded-md bg-duck text-white hover:bg-duck/90 text-sm"
                  aria-label="Fermer l’avertissement"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {phase === "intro" && (
        <section className="space-y-3">
         <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-white">Brief rapide</h2>
          </div>

<p className="leading-relaxed text-white/90">
  Des canards en plastique ont été cachés un peu partout — dans l’appartement et même à l'extérieur. 
  À vous de les retrouver, de les ramasser et de cocher leur numéro ici.
  <strong className="text-white"> Kidnapper (gentiment)</strong>, pas de photo, pas d’indices, et aucune aide fournie.
  Bonne chasse !
</p>


          <ul className="list-disc list-outside pl-6 space-y-1 text-white/90 marker:text-white">
            <li>Respectez l’appart : ne cassez rien.</li>
            <li>Ne déplacez pas les meubles.</li>
            <li>Cochez le numéro dès qu’un canard est récupéré.</li>
          </ul>

      

    <button
      onClick={() => { arm(); setPhase("collect"); }}
      className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg 
                bg-yellow-400 text-duck font-semibold 
                hover:bg-yellow-300 transition"
    >
      <Play className="w-5 h-5" /> Démarrer l’opération
    </button>

        </section>
      )}


        {phase === "collect" && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-xl font-semibold text-white">Tableau de chasse (coche en kidnappant)</h2>
              <div className="sm:ml-auto flex items-center gap-3">
                <button
                  onClick={clearAll}
                  className="px-3 py-2 rounded-lg border border-white/30 text-white inline-flex items-center gap-2 text-sm bg-white/10 hover:bg-white/15"
                >
                  <RefreshCw className="w-4 h-4" /> Réinitialiser
                </button>
                <div className="text-sm text-white/80">Progression : {progress}%</div>
              </div>
            </div>

            <div className="mt-3"><ProgressBar value={progress} /></div>

            <div className="mt-4 grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 gap-2 justify-items-center">
              {DUCKS.map((n) => (
                <NumberBadge key={n} n={n} checked={collectedSet.has(n)} onToggle={toggle} />
              ))}
            </div>

            <div className="mt-6">
            <button
              disabled={collectedCount !== TOTAL_DUCKS}
              onClick={() => setPhase("quiz")}
              className={`px-5 py-2.5 rounded-lg font-semibold transition inline-flex items-center justify-center
                ${collectedCount === TOTAL_DUCKS
                  ? "bg-yellow-400 text-duck hover:bg-yellow-300"
                  : "bg-yellow-400/50 text-duck/70 cursor-not-allowed"}`}
              >
              {collectedCount === TOTAL_DUCKS ? "Passer au QCM final" : "QCM verrouillé"}
            </button>
          </div>
          </section>
        )}

       {phase === "quiz" && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">QCM final</h2>
         <QuizRun
          quiz={quizReady.length ? quizReady : QUIZ}
          onSubmit={submitQuiz}
          onAnswerChange={() => setAnswerChangeCount((c) => c + 1)}
        />
        </section>
      )}

        {phase === "result" && (
          <section>
            {(() => {
              const isPerfect = result.allGood || result.allGod === true;

              return (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    {isPerfect ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-200" />
                    )}
                    <h3 className="text-xl font-bold text-white">
                      Score : {result.correct}/{result.total}
                    </h3>
                  </div>

                  {isPerfect ? (
                    <div className="space-y-4">
                      {/* Message cadeau */}
                      <p className="text-white/90">{GIFT.text}</p>

                      {/* Vidéo cadeau : lecture infinie sous le message */}
                      <div className="rounded-xl overflow-hidden border border-white/20 bg-white/5">
                        <video
                          src={giftVideo}
                          className="w-full max-h-[360px] object-cover"
                          autoPlay
                          muted
                          playsInline
                          loop
                        />
                      </div>

                      {/* Petit effet “youpi” */}
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-white"
                        >
                          <PartyPopper className="w-5 h-5 text-white" /> Cadeau débloqué !
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-white/90">
                        Ce n’est pas encore parfait. Refaites le QCM si nécessaire.
                      </p>
                      <button
                        onClick={() => setPhase("quiz")}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/30 text-white bg-white/10 hover:bg-white/15"
                      >
                        Refaire le QCM
                      </button>
                    </div>
                  )}
                </>
              );
            })()}
          </section>
        )}

        {quizFeedback === "error" && (
          <div className="mb-2 px-4 py-2 rounded-lg bg-red-500/20 text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Quelques réponses sont fausses — retente !
          </div>
        )}
        {quizFeedback === "success" && (
          <div className="mb-2 px-4 py-2 rounded-lg bg-green-500/20 text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Parfait, 100% !
          </div>
        )}
      </main>

      {/* FOOTER minimal */}
      <footer className="py-10">
        <div className="max-w-6xl mx-auto px-4 flex justify-center">
          <Badge className="w-[clamp(120px,20vw,220px)] h-auto text-white/50" />
        </div>
      </footer>
    </div>
  );
}
