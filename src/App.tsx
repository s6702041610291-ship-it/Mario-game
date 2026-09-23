/**
 * 2D Pixel Platformer: ผจญภัยตะลุยคำมาตรา กน (ภาษาไทย ป.3)
 * Complete educational platformer with Canvas pixel engine, Web Audio synth,
 * interactive lessons, question block gates, combo multipliers, and comprehensive answer review.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  BookOpen,
  RotateCcw,
  Sparkles,
  Trophy,
  Heart,
  Coins,
  Flame,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download,
  Award,
  Home,
} from 'lucide-react';
import { sound } from './audio';
import { QUESTIONS_DATA } from './data/questions';
import { LESSON_CARDS } from './data/lessons';
import {
  CHARACTERS,
  DEFAULT_PROFILE,
} from './data/characters';
import {
  createInitialLevel,
  updatePhysics,
  triggerGateShatter,
  LevelState,
  InputState,
} from './gameEngine';
import { CanvasPixelRenderer } from './renderer';
import { Question, QuestionGate, UserAnswerRecord, PlayerProfile } from './types';
import { exportSingleFileHtml } from './utils/exportHtml';
import { TitleScreen } from './components/TitleScreen';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  // Screen routing: 'title' (Start screen) | 'game' (Canvas Platformer)
  const [appScreen, setAppScreen] = useState<'title' | 'game'>('title');

  // Active player profile stored in localStorage
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem('maekon_player_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  // Modal dialog states
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [isCreatingNewProfile, setIsCreatingNewProfile] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<CanvasPixelRenderer | null>(null);
  const levelStateRef = useRef<LevelState>(createInitialLevel(1, profile.characterId));

  // Game UI State
  const [stage, setStage] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [coinsCount, setCoinsCount] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [combo, setCombo] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gatesCleared, setGatesCleared] = useState<number>(0);

  // Modals & Flows
  const [showLessonModal, setShowLessonModal] = useState<boolean>(false);
  const [lessonIndex, setLessonIndex] = useState<number>(0);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [activeGate, setActiveGate] = useState<QuestionGate | null>(null);
  const [quizTimer, setQuizTimer] = useState<number>(10);
  const [quizFeedback, setQuizFeedback] = useState<{
    correct: boolean;
    explanation: string;
    fastBonus: boolean;
  } | null>(null);
  const [isStageClear, setIsStageClear] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswerRecord[]>([]);

  // Input states (Keyboard & Mobile Virtual D-Pad)
  const inputsRef = useRef<InputState>({ left: false, right: false, jump: false });
  const [mobileLeft, setMobileLeft] = useState(false);
  const [mobileRight, setMobileRight] = useState(false);
  const [mobileJump, setMobileJump] = useState(false);

  // Sync virtual touch buttons to inputsRef
  useEffect(() => {
    inputsRef.current.left = mobileLeft;
    inputsRef.current.right = mobileRight;
    inputsRef.current.jump = mobileJump;
  }, [mobileLeft, mobileRight, mobileJump]);

  // Stage names
  const stageTitles: Record<number, { title: string; subtitle: string }> = {
    1: { title: 'ด่านที่ 1: ตะลุยทุ่งหญ้าแม่กน', subtitle: 'คำตรงตามมาตรา (สะกดด้วยตัว น)' },
    2: { title: 'ด่านที่ 2: ผจญภัยวิหารโบราณ', subtitle: 'คำไม่ตรงตามมาตรา (ญ, ณ, ร, ล, ฬ)' },
    3: { title: 'ด่านที่ 3: ปราสาทแห่งเวทมนตร์', subtitle: 'วิเคราะห์คำ ทายปริศนา และจำแนกมาตรา' },
  };

  // Active character
  const currentCharacter =
    CHARACTERS.find((c) => c.id === profile.characterId) || CHARACTERS[0];

  // Initialize or restart stage
  const startLevel = useCallback(
    (stageNum: number) => {
      const newState = createInitialLevel(stageNum, profile.characterId);
      levelStateRef.current = newState;
      setStage(stageNum);
      setLives(newState.lives);
      setCoinsCount(newState.coinsCount);
      setScore(newState.score);
      setTimeLeft(newState.timeLeft);
      setCombo(0);
      setGatesCleared(0);
      setIsStageClear(false);
      setIsGameOver(false);
      setActiveQuestion(null);
      setActiveGate(null);
      setQuizFeedback(null);
    },
    [profile.characterId]
  );

  // Handle start game from Title screen
  const handleStartGame = (stageNum = 1) => {
    startLevel(stageNum);
    setAppScreen('game');
    sound.playMushroom();
  };

  // Handle save profile from modal (account creation or edit)
  const handleSaveProfileFromModal = (saved: PlayerProfile) => {
    setProfile(saved);
    try {
      localStorage.setItem('maekon_player_profile', JSON.stringify(saved));
    } catch (e) {
      // ignore
    }
    if (levelStateRef.current) {
      levelStateRef.current.characterId = saved.characterId;
    }
    sound.playMushroom();
    setShowProfileModal(false);
  };

  // Question Gate Trigger Handler
  const handleOpenQuiz = useCallback((gate: QuestionGate) => {
    const q = QUESTIONS_DATA.find((item) => item.id === gate.questionId);
    if (!q) return;

    setActiveGate(gate);
    setActiveQuestion(q);
    setQuizTimer(10);
    setQuizFeedback(null);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling on space / arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputsRef.current.left = true;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputsRef.current.right = true;
      }
      if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
        inputsRef.current.jump = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        inputsRef.current.left = false;
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        inputsRef.current.right = false;
      }
      if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
        inputsRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Question 10-second timer countdown
  useEffect(() => {
    if (!activeQuestion || quizFeedback !== null) return;

    const interval = setInterval(() => {
      setQuizTimer((prev) => {
        if (prev <= 1) {
          // Time out! Treated as wrong answer
          handleOptionSelected(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeQuestion, quizFeedback]);

  // Main Canvas & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new CanvasPixelRenderer(ctx, canvas.width, canvas.height);

    let animationId: number;
    let lastTime = performance.now();
    let cameraX = 0;

    const gameLoop = (currentTime: number) => {
      const delta = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const state = levelStateRef.current;

      const isPaused =
        appScreen !== 'game' ||
        showLessonModal ||
        showProfileModal ||
        activeQuestion !== null ||
        isGameOver ||
        isStageClear ||
        isGameCompleted;

      // Update stage timer if playing
      if (!isPaused && state.timeLeft > 0) {
        state.timeLeft = Math.max(0, state.timeLeft - delta);
        if (state.timeLeft <= 0) {
          state.isGameOver = true;
        }
      }

      // Update physics if not paused by modal
      if (!isPaused) {
        updatePhysics(state, inputsRef.current, delta, handleOpenQuiz);
      }

      // Smooth camera follow player
      const targetCamX = state.player.x - canvas.width / 2.5;
      cameraX += (targetCamX - cameraX) * 0.1;
      cameraX = Math.max(0, Math.min(state.worldWidth - canvas.width, cameraX));

      // Render pixel frame
      rendererRef.current?.render(state, cameraX);

      // Synchronize UI react state (throttled to keep performance 60fps)
      setLives(state.lives);
      setCoinsCount(state.coinsCount);
      setScore(state.score);
      setTimeLeft(Math.ceil(state.timeLeft));
      setCombo(state.combo);

      const openedCount = state.gates.filter((g) => g.isOpened).length;
      setGatesCleared(openedCount);

      if (state.isGameOver && !isGameOver) {
        setIsGameOver(true);
      }
      if (state.isStageClear && !isStageClear) {
        setIsStageClear(true);
        // Persist score & unlock next stage
        setProfile((curr) => {
          const updated: PlayerProfile = {
            ...curr,
            highScore: Math.max(curr.highScore || 0, state.score),
            unlockedStage: Math.max(curr.unlockedStage || 1, stage < 3 ? stage + 1 : 3),
            totalCoins: (curr.totalCoins || 0) + state.coinsCount,
            lastPlayedAt: new Date().toISOString(),
          };
          try {
            localStorage.setItem('maekon_player_profile', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [
    appScreen,
    showLessonModal,
    showProfileModal,
    activeQuestion,
    isGameOver,
    isStageClear,
    isGameCompleted,
    handleOpenQuiz,
    stage,
  ]);

  // Answer selection handler in Question Modal
  const handleOptionSelected = (selectedIndex: number) => {
    if (!activeQuestion || !activeGate) return;

    const isCorrect = selectedIndex === activeQuestion.answerIndex;
    const timeTaken = 10 - quizTimer;
    const fastBonus = isCorrect && quizTimer >= 5;

    // Record user answer for the final review report
    setUserAnswers((prev) => [
      ...prev.filter((item) => item.questionId !== activeQuestion.id),
      {
        questionId: activeQuestion.id,
        stage: activeQuestion.stage,
        question: activeQuestion.question,
        selectedOption: selectedIndex >= 0 ? activeQuestion.options[selectedIndex] : 'หมดเวลา',
        correctOption: activeQuestion.options[activeQuestion.answerIndex],
        isCorrect,
        explanation: activeQuestion.explanation,
        categoryBadge: activeQuestion.categoryBadge,
        timeTaken,
      },
    ]);

    const state = levelStateRef.current;

    if (isCorrect) {
      // Award combo and points
      state.combo += 1;
      state.maxCombo = Math.max(state.maxCombo, state.combo);

      // Multiplier: 3 in a row = 2x, 5 in a row = 3x
      let multiplier = 1;
      if (state.combo >= 5) multiplier = 3;
      else if (state.combo >= 3) multiplier = 2;

      let gainedScore = 300 * multiplier;
      if (fastBonus) {
        gainedScore += 100;
        state.timeLeft = Math.min(99, state.timeLeft + 5);
      }

      state.score += gainedScore;
      triggerGateShatter(state, activeGate);

      setQuizFeedback({
        correct: true,
        explanation: activeQuestion.explanation,
        fastBonus,
      });

      // Resume game after 1.6s
      setTimeout(() => {
        state.activeGate = null;
        setActiveQuestion(null);
        setActiveGate(null);
        setQuizFeedback(null);
      }, 1600);
    } else {
      // Wrong answer
      state.lives -= 1;
      state.combo = 0;
      sound.playWrong();

      setQuizFeedback({
        correct: false,
        explanation: activeQuestion.explanation,
        fastBonus: false,
      });

      if (state.lives <= 0) {
        setTimeout(() => {
          setIsGameOver(true);
          setActiveQuestion(null);
          setActiveGate(null);
          setQuizFeedback(null);
        }, 1500);
      }
    }
  };

  // Advance to Next Stage or Complete Victory
  const handleNextStage = () => {
    if (stage < 3) {
      startLevel(stage + 1);
    } else {
      setIsGameCompleted(true);
      setIsStageClear(false);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Calculate Stars for stage clear
  const calculateStars = () => {
    if (timeLeft >= 45 && lives >= 2) return 3;
    if (timeLeft >= 20 || lives >= 2) return 2;
    return 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-amber-100 to-emerald-100 text-slate-800 flex flex-col items-center justify-between p-2 md:p-4 select-none">
      {/* Top Header / Arcade Marquee */}
      <header className="w-full max-w-5xl flex items-center justify-between bg-white/95 border-2 border-amber-300 rounded-2xl px-4 py-2.5 mb-2 backdrop-blur shadow-md">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center font-pixel text-slate-900 text-base shadow-md border border-amber-300 shrink-0">
            กน
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-amber-700 tracking-wide flex items-center gap-1.5">
              <span>ผจญภัยตะลุยคำมาตรา กน</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
                ป.3 ภาษาไทย
              </span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              {appScreen === 'game'
                ? `${stageTitles[stage]?.title} • ${stageTitles[stage]?.subtitle}`
                : 'เกมผจญภัยภาษาไทย ป.3: สนุก ปลอดภัย ได้ความรู้'}
            </p>
          </div>
        </div>

        {/* Action Controls: Essential and necessary buttons only */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {appScreen === 'game' && (
            <>
              {/* Back to Title Screen */}
              <button
                onClick={() => setAppScreen('title')}
                className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-300 active:translate-y-0.5 shadow-xs transition-colors"
                title="กลับสู่หน้าเริ่มเกม"
              >
                <Home className="w-3.5 h-3.5 text-slate-600" />
                <span>หน้าแรก</span>
              </button>

              {/* Restart current level */}
              <button
                onClick={() => startLevel(stage)}
                className="flex items-center gap-1.5 text-xs bg-sky-500 hover:bg-sky-600 text-white font-bold px-3 py-1.5 rounded-xl border-b-2 border-sky-700 active:translate-y-0.5 shadow-sm transition-colors"
                title="เริ่มด่านนี้ใหม่"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>เริ่มใหม่</span>
              </button>

              {/* Open Lesson Modal */}
              <button
                onClick={() => {
                  setLessonIndex(0);
                  setShowLessonModal(true);
                }}
                className="flex items-center gap-1.5 text-xs bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl border-b-2 border-indigo-700 active:translate-y-0.5 shadow-sm transition-colors"
                title="เปิดบทเรียนมาตรา กน"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">บทเรียน</span>
              </button>
            </>
          )}

          {/* Sound Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-xl border-b-2 active:translate-y-0.5 shadow-sm font-semibold transition-colors ${
              isMuted
                ? 'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200'
                : 'bg-emerald-500 text-white border-emerald-700 hover:bg-emerald-600'
            }`}
            title={isMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Screen Router: TitleScreen vs Game View */}
      {appScreen === 'title' ? (
        <TitleScreen
          profile={profile}
          onStartGame={(stageNum = 1) => handleStartGame(stageNum)}
          onOpenCustomize={() => {
            setIsCreatingNewProfile(false);
            setShowProfileModal(true);
          }}
          onOpenLesson={() => {
            setLessonIndex(0);
            setShowLessonModal(true);
          }}
          onExportHtml={exportSingleFileHtml}
        />
      ) : (
        /* Main Game Screen Container */
        <main className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center relative">
          <div className="w-full relative bg-sky-200 rounded-3xl border-4 border-amber-400 overflow-hidden shadow-2xl">
            {/* Top In-Game HUD Bar (Bright & Crisp!) */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm shadow-sm">
              {/* Player Character Avatar Chip */}
              <button
                onClick={() => {
                  setIsCreatingNewProfile(false);
                  setShowProfileModal(true);
                }}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl px-2 py-1 text-xs text-amber-900 active:scale-95 transition-all shadow-xs"
                title="คลิกเพื่อแก้ไขโปรไฟล์หรือเปลี่ยนตัวละคร"
              >
                <span className="text-base">{currentCharacter.avatarEmoji}</span>
                <span className="font-bold text-[11px] hidden sm:inline">{profile.name}</span>
              </button>

            {/* Health / Hearts */}
            <div className="flex items-center gap-1">
              <span className="text-slate-600 text-xs font-semibold mr-1 hidden sm:inline">ชีวิต:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((h) => (
                  <Heart
                    key={h}
                    className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${
                      h <= lives
                        ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-sm'
                        : 'text-slate-300 fill-slate-200 scale-90'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1.5 bg-amber-100/90 px-2.5 py-1 rounded-lg border border-amber-300">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="font-pixel text-amber-800 text-xs">x{coinsCount}</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1.5 bg-yellow-100/90 px-2.5 py-1 rounded-lg border border-yellow-300">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span className="font-pixel text-amber-900 text-xs md:text-sm">
                {score.toLocaleString()}
              </span>
            </div>

            {/* Combo Badge */}
            {combo >= 2 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-2.5 py-0.5 rounded-full font-bold text-xs animate-bounce shadow-md">
                <Flame className="w-3.5 h-3.5 text-yellow-200" />
                <span>COMBO {combo >= 5 ? '3x' : '2x'}!</span>
              </div>
            )}

            {/* Stage Gates Progress */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/90 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-slate-600 text-xs font-medium">ประตู:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((g) => (
                  <div
                    key={g}
                    className={`w-4 h-4 rounded-md flex items-center justify-center font-bold text-[10px] ${
                      g <= gatesCleared
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {g}
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-pixel text-xs border ${
                timeLeft <= 15
                  ? 'bg-rose-100 text-rose-700 border-rose-400 animate-pulse'
                  : 'bg-sky-100 text-sky-800 border-sky-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* HTML5 Canvas Rendering Viewport */}
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-auto aspect-[16/9] block pixelated bg-sky-200 cursor-pointer"
            onClick={() => {
              // Tap to jump on canvas if touch screen
              inputsRef.current.jump = true;
              setTimeout(() => {
                inputsRef.current.jump = false;
              }, 120);
            }}
          />

          {/* QUESTION GATE MODAL (Bright, Friendly, Colorful!) */}
          {activeQuestion && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-3 md:p-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-full max-w-xl bg-white border-4 border-amber-400 rounded-3xl p-4 md:p-6 shadow-2xl relative text-slate-800">
                {/* Header: Gate index & Category & Countdown */}
                <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-xs text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                      ประตูคำถามที่ {activeGate?.gateIndex !== undefined ? activeGate.gateIndex + 1 : 1}/5
                    </span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-lg border border-indigo-200">
                      {activeQuestion.categoryBadge}
                    </span>
                  </div>

                  {/* 10-Second Digital Timer */}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-pixel text-xs border ${
                      quizTimer <= 3
                        ? 'bg-rose-100 text-rose-700 border-rose-400 animate-bounce'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{quizTimer} วินาที</span>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="mb-5">
                  <h3 className="text-base md:text-lg font-bold text-slate-800 leading-relaxed">
                    {activeQuestion.question}
                  </h3>
                  {activeQuestion.hint && !quizFeedback && (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>คำใบ้: {activeQuestion.hint}</span>
                    </p>
                  )}
                </div>

                {/* 4 Choices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                  {activeQuestion.options.map((opt, idx) => {
                    const optionLabels = ['ก.', 'ข.', 'ค.', 'ง.'];
                    const isSelectedCorrect =
                      quizFeedback && idx === activeQuestion.answerIndex;
                    const isSelectedWrong =
                      quizFeedback &&
                      !quizFeedback.correct &&
                      idx !== activeQuestion.answerIndex;

                    let btnStyle =
                      'bg-amber-50/70 hover:bg-amber-100 text-slate-800 border-amber-200 hover:border-amber-400 shadow-sm';

                    if (isSelectedCorrect) {
                      btnStyle =
                        'bg-emerald-500 text-white border-emerald-600 font-bold scale-[1.02] shadow-md';
                    } else if (isSelectedWrong) {
                      btnStyle = 'bg-rose-50 text-rose-400 border-rose-200 opacity-60';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizFeedback !== null}
                        onClick={() => handleOptionSelected(idx)}
                        className={`w-full text-left p-3 rounded-2xl border-2 transition-all arcade-btn flex items-center gap-2.5 ${btnStyle}`}
                      >
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelectedCorrect ? 'bg-white text-emerald-600' : 'bg-white text-amber-700 border border-amber-200 shadow-xs'
                        }`}>
                          {optionLabels[idx]}
                        </span>
                        <span className="text-sm font-semibold">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Notification Banner */}
                {quizFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-2.5 animate-in fade-in duration-200 ${
                      quizFeedback.correct
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-md'
                        : 'bg-rose-50 border-rose-400 text-rose-900 shadow-md'
                    }`}
                  >
                    {quizFeedback.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-xs md:text-sm">
                      <p className="font-bold flex items-center gap-2">
                        {quizFeedback.correct ? 'ถูกต้องยอดเยี่ยม! ✨' : 'ยังไม่ถูกต้องนะจ๊ะ 💔'}
                        {quizFeedback.fastBonus && (
                          <span className="bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                            ⚡ ตอบไวทันใจ +5 วิ!
                          </span>
                        )}
                      </p>
                      <p className="mt-1 text-xs text-slate-700">
                        {quizFeedback.explanation}
                      </p>

                      {!quizFeedback.correct && lives > 0 && (
                        <button
                          onClick={() => {
                            setQuizTimer(10);
                            setQuizFeedback(null);
                          }}
                          className="mt-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl border-b-2 border-rose-700 active:translate-y-0.5 shadow-sm"
                        >
                          🔄 ลองตอบใหม่อีกครั้ง
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LEVEL CLEAR MODAL (Bright & Cheerful!) */}
          {isStageClear && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-full max-w-md bg-white border-4 border-emerald-400 rounded-3xl p-6 text-center shadow-2xl text-slate-800">
                <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Award className="w-9 h-9 text-emerald-600" />
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-emerald-600 font-pixel">
                  STAGE CLEAR!
                </h2>
                <p className="text-sm text-slate-600 mt-1 mb-4 font-medium">
                  ผ่าน{stageTitles[stage]?.title} สำเร็จแล้ว!
                </p>

                {/* Stars Rating */}
                <div className="flex justify-center gap-2 mb-5">
                  {[1, 2, 3].map((star) => (
                    <Sparkles
                      key={star}
                      className={`w-8 h-8 ${
                        star <= calculateStars()
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Stats Breakdown */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-xs md:text-sm space-y-2 mb-5 text-left font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-600">คะแนนสะสม:</span>
                    <span className="font-pixel text-amber-700">{score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">เหรียญที่เก็บได้:</span>
                    <span className="font-pixel text-amber-600">{coinsCount} เหรียญ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">เวลาที่เหลือ:</span>
                    <span className="font-pixel text-sky-700">{timeLeft} วินาที</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">คอมโบสูงสุด:</span>
                    <span className="font-pixel text-orange-600">
                      {levelStateRef.current.maxCombo}x
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleNextStage}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 flex items-center justify-center gap-2 text-sm md:text-base arcade-btn shadow-md"
                >
                  <span>{stage < 3 ? 'ไปยังด่านถัดไป ➔' : 'ดูผลคะแนนรวม & เฉลยละเอียด 🏆'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* GAME OVER MODAL (Bright friendly retry) */}
          {isGameOver && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="w-full max-w-md bg-white border-4 border-rose-400 rounded-3xl p-6 text-center shadow-2xl text-slate-800">
                <div className="w-16 h-16 bg-rose-100 border-2 border-rose-300 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart className="w-9 h-9 text-rose-500" />
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-rose-600 font-pixel">
                  GAME OVER
                </h2>
                <p className="text-xs md:text-sm text-slate-600 mt-1 mb-5 font-medium">
                  {timeLeft <= 0 ? 'เวลาหมดลงแล้ว!' : 'พลังชีวิตหมดลงแล้ว มาลองสู้ใหม่อีกรอบนะ!'}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={() => startLevel(stage)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-2xl border-b-4 border-amber-700 active:translate-y-1 flex items-center justify-center gap-2 text-sm arcade-btn shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>ลองใหม่อีกครั้ง</span>
                  </button>
                  <button
                    onClick={() => {
                      setLessonIndex(0);
                      setShowLessonModal(true);
                    }}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-2xl border-b-4 border-indigo-700 active:translate-y-1 flex items-center justify-center gap-2 text-sm arcade-btn shadow-sm"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>ทบทวนบทเรียน</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsGameOver(false);
                    setAppScreen('title');
                  }}
                  className="w-full mt-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl border border-slate-300 active:translate-y-0.5 flex items-center justify-center gap-1.5 text-xs shadow-xs"
                >
                  <Home className="w-3.5 h-3.5 text-slate-600" />
                  <span>🏠 กลับสู่หน้าเริ่มเกม (Title Screen)</span>
                </button>
              </div>
            </div>
          )}

          {/* FINAL VICTORY & FULL ANSWER REVIEW MODAL */}
          {isGameCompleted && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-40 flex flex-col items-center justify-center p-3 md:p-6 overflow-y-auto">
              <div className="w-full max-w-3xl bg-white border-4 border-amber-400 rounded-3xl p-4 md:p-6 shadow-2xl max-h-[90vh] flex flex-col text-slate-800">
                {/* Trophy & Congrats Header */}
                <div className="text-center mb-4 shrink-0">
                  <div className="w-16 h-16 bg-amber-100 border-2 border-amber-300 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce shadow-md">
                    <Trophy className="w-9 h-9 text-amber-500" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-amber-600 font-pixel">
                    VICTORY! ชนะเลิศสมบูรณ์
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium">
                    ยินดีด้วย! น้องผ่านการผจญภัยครบทั้ง 3 ด่าน และเป็นผู้เชี่ยวชาญ "มาตราแม่ กน" แล้ว!
                  </p>

                  {/* Certificate Badge */}
                  <div className="mt-3 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-2 border-amber-300 rounded-2xl p-3 max-w-md mx-auto shadow-xs">
                    <div className="text-[11px] text-amber-800 font-bold tracking-wide">
                      📜 เกียรติบัตรยอดนักสะกดคำ ป.3
                    </div>
                    <div className="text-sm md:text-base font-bold text-amber-950 flex items-center justify-center gap-2 mt-1">
                      <span className="text-2xl">{currentCharacter.avatarEmoji}</span>
                      <span>{profile.name}</span>
                      <span className="text-xs bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 font-semibold">
                        {profile.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      สกินตัวละคร: {currentCharacter.name} ({currentCharacter.nickname})
                    </div>
                  </div>

                  <div className="mt-2 inline-flex items-center gap-2 bg-amber-100 text-amber-800 font-bold px-4 py-1.5 rounded-full font-pixel text-xs border border-amber-300">
                    คะแนนรวมสุทธิ: {score.toLocaleString()} คะแนน
                  </div>
                </div>

                {/* 15-Question Full Answer Review Table */}
                <div className="flex-1 overflow-y-auto border border-amber-200 rounded-2xl bg-amber-50/40 p-3 mb-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    <span>ตารางสรุปเฉลยละเอียดและเสริมความรู้ (15 ข้อ):</span>
                  </h4>

                  {QUESTIONS_DATA.map((q) => {
                    const record = userAnswers.find((u) => u.questionId === q.id);
                    const isPassed = record?.isCorrect ?? true;

                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          isPassed
                            ? 'bg-white border-emerald-200 shadow-xs'
                            : 'bg-rose-50 border-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-slate-800 flex items-center gap-1">
                            <span>ข้อที่ {q.id}.</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded border border-slate-200">
                              ด่าน {q.stage} • {q.categoryBadge}
                            </span>
                          </span>

                          <span
                            className={`flex items-center gap-1 font-bold ${
                              isPassed ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPassed ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>ตอบถูก</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                <span>เคยตอบผิด</span>
                              </>
                            )}
                          </span>
                        </div>

                        <p className="text-slate-700 font-semibold mb-1.5">{q.question}</p>

                        <div className="bg-slate-50 rounded-xl p-2.5 space-y-1 text-slate-700 text-[11px] border border-slate-200">
                          <div>
                            <span className="text-emerald-700 font-bold">เฉลยที่ถูกต้อง:</span>{' '}
                            {q.options[q.answerIndex]}
                          </div>
                          <div>
                            <span className="text-amber-700 font-bold">คำอธิบายเหตุผล:</span>{' '}
                            {q.explanation}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      setIsGameCompleted(false);
                      startLevel(1);
                    }}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-2xl border-b-4 border-amber-700 active:translate-y-1 flex items-center justify-center gap-2 text-xs md:text-sm arcade-btn shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>เล่นใหม่อีกรอบ (เริ่มด่าน 1)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsGameCompleted(false);
                      setAppScreen('title');
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-4 rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 flex items-center justify-center gap-2 text-xs md:text-sm arcade-btn shadow-sm"
                  >
                    <Home className="w-4 h-4" />
                    <span>กลับสู่หน้าเริ่มเกม</span>
                  </button>

                  <button
                    onClick={exportSingleFileHtml}
                    className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-2xl border-b-4 border-indigo-700 active:translate-y-1 flex items-center justify-center gap-2 text-xs md:text-sm arcade-btn shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>บันทึกไฟล์เดี่ยว HTML ไว้ออฟไลน์</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>

        {/* Mobile & Touch Controls (Bright Candy Arcade Buttons) */}
        <div className="w-full max-w-5xl mt-3 flex items-center justify-between px-3 py-2.5 bg-white/90 border-2 border-amber-300 rounded-2xl backdrop-blur shadow-md">
          {/* D-Pad Left / Right */}
          <div className="flex items-center gap-2.5">
            <button
              onPointerDown={() => setMobileLeft(true)}
              onPointerUp={() => setMobileLeft(false)}
              onPointerLeave={() => setMobileLeft(false)}
              className={`w-14 h-12 rounded-2xl border-2 flex items-center justify-center font-bold text-xl active:translate-y-1 transition-all shadow-sm ${
                mobileLeft
                  ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-inner'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
              }`}
              title="เดินซ้าย (A / ลูกศรซ้าย)"
            >
              ◄
            </button>
            <button
              onPointerDown={() => setMobileRight(true)}
              onPointerUp={() => setMobileRight(false)}
              onPointerLeave={() => setMobileRight(false)}
              className={`w-14 h-12 rounded-2xl border-2 flex items-center justify-center font-bold text-xl active:translate-y-1 transition-all shadow-sm ${
                mobileRight
                  ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-inner'
                  : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
              }`}
              title="เดินขวา (D / ลูกศรขวา)"
            >
              ►
            </button>
          </div>

          {/* Quick Keyboard Info for PC */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-slate-800 shadow-xs">
                A / ◄
              </kbd>
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-slate-800 shadow-xs">
                D / ►
              </kbd>
              <span>เดิน</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-slate-800 shadow-xs">
                Space / W / ▲
              </kbd>
              <span>กระโดด</span>
            </span>
          </div>

          {/* Jump Button */}
          <div>
            <button
              onPointerDown={() => setMobileJump(true)}
              onPointerUp={() => setMobileJump(false)}
              onPointerLeave={() => setMobileJump(false)}
              className={`px-6 h-12 rounded-2xl border-2 flex items-center justify-center font-bold text-sm md:text-base active:translate-y-1 transition-all shadow-md ${
                mobileJump
                  ? 'bg-rose-600 text-white border-rose-700 shadow-inner'
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-rose-400'
              }`}
              title="กระโดด (Space / W / ลูกศรขึ้น)"
            >
              ▲ กระโดด (Jump)
            </button>
          </div>
        </div>
      </main>
      )}

      {/* INTERACTIVE LESSON CARDS CAROUSEL MODAL (Available in both Title and Game screen) */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white border-4 border-indigo-400 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col justify-between min-h-[440px] text-slate-800">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl drop-shadow-sm">{LESSON_CARDS[lessonIndex].emoji}</span>
                  <div>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {LESSON_CARDS[lessonIndex].badge}
                    </span>
                    <h3 className="text-base md:text-lg font-bold text-slate-800 mt-0.5">
                      {LESSON_CARDS[lessonIndex].title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setShowLessonModal(false)}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl border border-slate-300"
                >
                  ปิด (X)
                </button>
              </div>

              {/* Body Content */}
              <div className="space-y-3 text-xs md:text-sm text-slate-700 leading-relaxed font-normal">
                <p className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 font-medium">
                  {LESSON_CARDS[lessonIndex].description}
                </p>

                {/* Examples pills */}
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-1.5">ตัวอย่างคำน่ารู้:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {LESSON_CARDS[lessonIndex].examples.map((ex, i) => (
                      <span
                        key={i}
                        className="bg-amber-100/80 border border-amber-300 text-amber-900 font-semibold px-3 py-1 rounded-xl text-xs shadow-xs"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Chant / Highlight */}
                {LESSON_CARDS[lessonIndex].chant && (
                  <div className="bg-gradient-to-r from-amber-100 to-yellow-100 border-2 border-amber-300 p-3 rounded-2xl text-center shadow-xs">
                    <p className="text-xs text-amber-900 font-pixel">
                      {LESSON_CARDS[lessonIndex].chant}
                    </p>
                  </div>
                )}

                {LESSON_CARDS[lessonIndex].highlight && (
                  <p className="text-xs text-sky-900 bg-sky-50 p-2.5 rounded-xl border border-sky-200 font-medium">
                    💡 {LESSON_CARDS[lessonIndex].highlight}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Controls & Dots */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                disabled={lessonIndex === 0}
                onClick={() => setLessonIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-semibold px-3 py-2 rounded-xl border-b-2 border-slate-300 active:translate-y-0.5 arcade-btn"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>ก่อนหน้า</span>
              </button>

              {/* Indicator Dots */}
              <div className="flex gap-1.5">
                {LESSON_CARDS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setLessonIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === lessonIndex ? 'w-6 bg-indigo-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {lessonIndex < LESSON_CARDS.length - 1 ? (
                <button
                  onClick={() => setLessonIndex((prev) => prev + 1)}
                  className="flex items-center gap-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-3.5 py-2 rounded-xl border-b-2 border-indigo-700 active:translate-y-0.5 arcade-btn shadow-sm"
                >
                  <span>ถัดไป</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowLessonModal(false)}
                  className="flex items-center gap-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl border-b-2 border-emerald-700 active:translate-y-0.5 arcade-btn shadow-md"
                >
                  <span>🚀 เริ่มผจญภัย!</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}



      {/* CREATE / EDIT PROFILE MODAL */}
      {showProfileModal && (
        <ProfileModal
          initialProfile={profile}
          isCreatingNew={isCreatingNewProfile}
          onSave={handleSaveProfileFromModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Footer Instructions & Credits */}
      <footer className="w-full max-w-5xl mt-2 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between px-2 gap-2 font-medium">
        <span>🎮 2D Pixel Platformer • พัฒนาด้วย HTML5 Canvas API + Web Audio API 8-Bit Synthesizer</span>
        <span>สาระการเรียนรู้ภาษาไทย ชั้นประถมศึกษาปีที่ 3 • มาตราตัวสะกด แม่ กน</span>
      </footer>
    </div>
  );
}
