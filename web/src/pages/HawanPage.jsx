import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  ListChecks,
  MessageCircleMore,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import { SectionTitle } from "../components/SectionTitle";
import { hawanPurposes } from "../data/hawanGuides";

function formatTimer(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getAssistantReply(prompt, purpose, step) {
  const normalizedPrompt = prompt.toLowerCase();

  if (normalizedPrompt.includes("kitni")) {
    return `Is ${purpose.title} hawan ke ${step.title} step me mantra ko kam se kam ${step.repeatCount} baar dhyan se repeat kijiye. Agar pandit guide kar rahe hon to unki ginti ko priority dijiye.`;
  }

  if (normalizedPrompt.includes("sankalp")) {
    return `Sankalp me apna naam, jagah, tithi, aur ${purpose.title.toLowerCase()} ka uddeshya boliye. Agar gotra pata ho to include kariye, warna shraddha aur spasht intention kaafi hai.`;
  }

  if (normalizedPrompt.includes("aahuti")) {
    return `Aahuti chhoti aur niyantrit rakhiye. Har offering ke saath mantra ka antim bhaag aur "swaha" clear boliye, phir samagri ko dheere se agni me chhodiye.`;
  }

  if (normalizedPrompt.includes("pace") || normalizedPrompt.includes("speed")) {
    return `Mantra ka pace steady rakhiye, jaldi nahi. Har line ko saaf ucharan ke saath bolna is hawan me quantity se zyada important hai.`;
  }

  return `Is step me focus ${step.title.toLowerCase()} par rakhiye. Agar confusion ho to mantra ki pronunciation follow karke stable rhythm me agla action lijiye.`;
}

export default function HawanPage() {
  const [selectedPurposeId, setSelectedPurposeId] = useState(hawanPurposes[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checkedItems, setCheckedItems] = useState([]);
  const [completedSteps, setCompletedSteps] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(hawanPurposes[0].steps[0].timerSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isMantraPlaying, setIsMantraPlaying] = useState(false);
  const [loopMantra, setLoopMantra] = useState(false);
  const [assistantDraft, setAssistantDraft] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: "helper-welcome",
      role: "assistant",
      content: "Namaste. Main is hawan flow ke saath chalne wali helper guide hoon. Aap step-specific sawal quick prompts se pooch sakte hain.",
    },
  ]);
  const mantraLoopStepRef = useRef("");
  const mantraLoopingRef = useRef(false);

  const selectedPurpose = useMemo(
    () => hawanPurposes.find((purpose) => purpose.id === selectedPurposeId) || hawanPurposes[0],
    [selectedPurposeId]
  );
  const currentStep = selectedPurpose.steps[currentStepIndex];
  const checklistProgress = Math.round((checkedItems.length / selectedPurpose.samagri.length) * 100);
  const stepProgress = Math.round((Object.keys(completedSteps).length / selectedPurpose.steps.length) * 100);

  const stopMantra = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsMantraPlaying(false);
  };

  const playCurrentMantra = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    stopMantra();
    mantraLoopStepRef.current = currentStep.id;

    const utterance = new SpeechSynthesisUtterance(`${currentStep.mantra}. ${currentStep.pronunciation}.`);
    utterance.lang = "hi-IN";
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (mantraLoopingRef.current && mantraLoopStepRef.current === currentStep.id) {
        playCurrentMantra();
        return;
      }

      setIsMantraPlaying(false);
    };

    setIsMantraPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const toggleChecklistItem = (item) => {
    setCheckedItems((current) =>
      current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]
    );
  };

  const goToStep = (index) => {
    setCompletedSteps((current) => ({
      ...current,
      [currentStep.id]: true,
    }));
    setCurrentStepIndex(index);
  };

  const handleNextStep = () => {
    if (currentStepIndex < selectedPurpose.steps.length - 1) {
      goToStep(currentStepIndex + 1);
    }
  };

  const handlePrompt = (prompt) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedPrompt,
    };
    const assistantMessage = {
      id: `assistant-${Date.now() + 1}`,
      role: "assistant",
      content: getAssistantReply(trimmedPrompt, selectedPurpose, currentStep),
    };

    setAssistantMessages((current) => [...current, userMessage, assistantMessage]);
    setAssistantDraft("");
  };

  useEffect(() => {
    mantraLoopingRef.current = loopMantra;
  }, [loopMantra]);

  useEffect(() => {
    setCurrentStepIndex(0);
    setCheckedItems([]);
    setCompletedSteps({});
    setIsTimerRunning(false);
    setRemainingSeconds(selectedPurpose.steps[0].timerSeconds);
    stopMantra();
    setAssistantMessages([
      {
        id: "helper-welcome",
        role: "assistant",
        content: `Namaste. ${selectedPurpose.title} flow loaded hai. Current step ke hisaab se quick guidance ke liye prompts use kijiye.`,
      },
    ]);
  }, [selectedPurposeId]);

  useEffect(() => {
    setIsTimerRunning(false);
    setRemainingSeconds(currentStep.timerSeconds);
    stopMantra();
  }, [currentStepIndex]);

  useEffect(() => {
    if (!isTimerRunning) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setIsTimerRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isTimerRunning]);

  useEffect(
    () => () => {
      stopMantra();
    },
    []
  );

  return (
    <div className="pb-20">
      <section className="bg-hero-pattern">
        <div className="container-shell grid gap-10 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <div className="space-y-7">
            
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-bold leading-tight text-brand-ink md:text-6xl">
                A ritual-by-ritual hawan experience with mantra, timer, checklist, and contextual help.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-brand-ink/72">
                Pick your intention first, then move through a structured five-step flow designed to feel guided instead of static.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {hawanPurposes.map((purpose) => (
                <button
                  key={purpose.id}
                  type="button"
                  onClick={() => setSelectedPurposeId(purpose.id)}
                  className={`rounded-[28px] p-5 text-left shadow-soft ${
                    selectedPurposeId === purpose.id ? "bg-brand-maroon text-white" : "bg-white text-brand-ink"
                  }`}
                >
                  <p className="text-sm font-bold uppercase tracking-[0.18em] opacity-75">{purpose.subtitle}</p>
                  <h2 className="mt-3 text-2xl font-bold">{purpose.title}</h2>
                  <p className={`mt-3 text-sm leading-7 ${selectedPurposeId === purpose.id ? "text-white/78" : "text-brand-ink/72"}`}>
                    {purpose.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[38px] bg-white/92 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-brand-clay">Selected Hawan</p>
                <h2 className="mt-2 text-3xl font-bold text-brand-ink">{selectedPurpose.title}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-brand-ink/72">{selectedPurpose.description}</p>
              </div>
              <div className="rounded-[24px] bg-brand-cream px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-clay">Overall Progress</p>
                <p className="mt-2 text-2xl font-bold text-brand-ink">{stepProgress}%</p>
              </div>
            </div>

            <div className="mt-8 rounded-[26px] bg-brand-ink p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Current Step</p>
                  <p className="mt-2 text-2xl font-bold">{currentStep.title}</p>
                </div>
                <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80">
                  Step {currentStepIndex + 1} / {selectedPurpose.steps.length}
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-brand-gold" style={{ width: `${((currentStepIndex + 1) / selectedPurpose.steps.length) * 100}%` }} />
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/pandits?category=PUJA">
                  <Button>Book a Pandit</Button>
                </Link>
                <Link to="/store">
                  <Button variant="secondary">View Samagri Store</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-16">
        <SectionTitle
          eyebrow="Step Flow"
          title="Move one ritual block at a time"
          description="The flow below keeps the intent, mantra, timer, and step-specific support in one place."
        />

        <div className="mt-10 grid gap-6 xl:grid-cols-[0.8fr_1.2fr_0.85fr]">
          <div className="rounded-[32px] bg-white p-6 shadow-soft">
            <h3 className="text-2xl font-bold text-brand-ink">Ritual Steps</h3>
            <div className="mt-5 space-y-3">
              {selectedPurpose.steps.map((step, index) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStepIndex(index)}
                  className={`flex w-full items-center gap-3 rounded-[24px] px-4 py-4 text-left ${
                    currentStepIndex === index ? "bg-brand-maroon text-white" : "bg-brand-cream/70 text-brand-ink"
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${completedSteps[step.id] ? "bg-brand-gold text-brand-ink" : currentStepIndex === index ? "bg-white/15 text-white" : "bg-white text-brand-ink"}`}>
                    {completedSteps[step.id] ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] opacity-75">Step {index + 1}</p>
                    <p className="mt-1 text-base font-semibold">{step.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] bg-white p-6 shadow-soft sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.26em] text-brand-clay">{selectedPurpose.title}</p>
                  <h3 className="mt-2 text-3xl font-bold text-brand-ink">{currentStep.title}</h3>
                  <p className="mt-4 text-sm leading-8 text-brand-ink/74">{currentStep.description}</p>
                </div>
                <div className="rounded-full bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-ink">
                  {formatTimer(remainingSeconds)}
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[26px] bg-brand-cream/70 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">Sanskrit Mantra</p>
                  <p className="mt-3 text-xl font-semibold leading-9 text-brand-ink">{currentStep.mantra}</p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-brand-clay">Hinglish Pronunciation</p>
                  <p className="mt-2 text-base leading-8 text-brand-ink/74">{currentStep.pronunciation}</p>
                </div>

                <div className="rounded-[26px] bg-brand-ink p-5 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">Controls</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isMantraPlaying) {
                          stopMantra();
                          return;
                        }

                        playCurrentMantra();
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-brand-ink"
                    >
                      {isMantraPlaying ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                      {isMantraPlaying ? "Stop Mantra" : "Play Mantra"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoopMantra((current) => !current)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold ${
                        loopMantra ? "bg-brand-gold text-brand-ink" : "bg-white/10 text-white"
                      }`}
                    >
                      <RotateCcw className="h-4 w-4" />
                      {loopMantra ? "Loop On" : "Loop Off"}
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning((current) => !current)}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                    >
                      {isTimerRunning ? <PauseCircle className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                      {isTimerRunning ? "Pause Timer" : "Start Timer"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsTimerRunning(false);
                        setRemainingSeconds(currentStep.timerSeconds);
                      }}
                      className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-semibold text-white"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset Timer
                    </button>
                  </div>
                </div>
              </div>

              {currentStep.id === "samagri" ? (
                <div className="mt-8 rounded-[28px] border border-brand-sand/70 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">Smart Samagri Checklist</p>
                      <h4 className="mt-2 text-2xl font-bold text-brand-ink">Preparation progress</h4>
                    </div>
                    <div className="rounded-full bg-brand-cream px-4 py-2 text-sm font-semibold text-brand-ink">
                      {checklistProgress}%
                    </div>
                  </div>

                  <div className="mt-5 h-2 rounded-full bg-brand-cream">
                    <div className="h-full rounded-full bg-brand-maroon" style={{ width: `${checklistProgress}%` }} />
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {selectedPurpose.samagri.map((item) => {
                      const checked = checkedItems.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleChecklistItem(item)}
                          className={`flex items-start gap-3 rounded-[22px] p-4 text-left ${
                            checked ? "bg-brand-maroon text-white" : "bg-brand-cream/70 text-brand-ink"
                          }`}
                        >
                          <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${checked ? "bg-white text-brand-maroon" : "bg-white text-brand-ink"}`}>
                            {checked ? <CheckCircle2 className="h-4 w-4" /> : <ListChecks className="h-4 w-4" />}
                          </div>
                          <span className="text-sm font-medium leading-7">{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-8 rounded-[28px] border border-dashed border-brand-sand p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-cream text-brand-maroon">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">Instructional Video</p>
                    <p className="mt-1 text-lg font-semibold text-brand-ink">{currentStep.videoLabel}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-brand-ink/70">
                  Video slot is ready for a short visual walkthrough for this step. You can wire a real clip later without changing the flow structure.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex((current) => Math.max(0, current - 1))}
                  disabled={currentStepIndex === 0}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-cream px-4 py-3 text-sm font-semibold text-brand-ink disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Step
                </button>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCompletedSteps((current) => ({
                        ...current,
                        [currentStep.id]: !current[currentStep.id],
                      }))
                    }
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold ${
                      completedSteps[currentStep.id] ? "bg-brand-gold text-brand-ink" : "bg-brand-cream text-brand-ink"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completedSteps[currentStep.id] ? "Marked Done" : "Mark as Done"}
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={currentStepIndex === selectedPurpose.steps.length - 1}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-maroon px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-maroon text-white">
                <MessageCircleMore className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-clay">Context Helper</p>
                <h3 className="mt-1 text-2xl font-bold text-brand-ink">Ask during the ritual</h3>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {selectedPurpose.assistantPrompts.map((prompt) => (
                <button
                  key={`${selectedPurpose.id}-${prompt}`}
                  type="button"
                  onClick={() => handlePrompt(prompt)}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-cream px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-sand"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand-clay" />
                  {prompt}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {assistantMessages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[92%] rounded-[22px] px-4 py-3 text-sm leading-7 ${
                    message.role === "assistant"
                      ? "bg-brand-cream/75 text-brand-ink"
                      : "ml-auto bg-brand-maroon text-white"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-brand-sand pt-5">
              <div className="flex items-end gap-3">
                <textarea
                  rows={3}
                  value={assistantDraft}
                  onChange={(event) => setAssistantDraft(event.target.value)}
                  placeholder="Sawal likhiye (jaise: aahuti kitni baar deni hai, mantra kitni repetitions?)"
                  className="min-h-[88px] flex-1 resize-none rounded-[22px] border border-brand-sand px-4 py-3 text-sm outline-none focus:border-brand-clay"
                />
                <button
                  type="button"
                  onClick={() => handlePrompt(assistantDraft)}
                  disabled={!assistantDraft.trim()}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-maroon text-white shadow-soft disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
