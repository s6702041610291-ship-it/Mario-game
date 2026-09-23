import React, { useState } from 'react';
import {
  Play,
  BookOpen,
  Download,
  Sparkles,
  Trophy,
  Palette,
  Compass,
  Coins,
  ChevronRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { PlayerProfile } from '../types';

interface TitleScreenProps {
  profile: PlayerProfile;
  onStartGame: (stage?: number) => void;
  onOpenCustomize: () => void;
  onOpenLesson: () => void;
  onExportHtml: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  profile,
  onStartGame,
  onOpenCustomize,
  onOpenLesson,
  onExportHtml,
}) => {
  const currentCharacter =
    CHARACTERS.find((c) => c.id === profile.characterId) || CHARACTERS[0];

  const currentUnlocked = profile.unlockedStage || 1;
  const [selectedStage, setSelectedStage] = useState<number>(currentUnlocked);
  const [showStageModal, setShowStageModal] = useState<boolean>(false);

  const STAGES_INFO = [
    {
      num: 1,
      title: 'ทุ่งหญ้าคำตรงมาตรา',
      subtitle: 'ฝึกสะกดคำตรงตามมาตราด้วยตัวสะกด น',
      icon: '🌳',
      examples: 'บ้าน, ช้อน, แหวน, ฝน, จาน',
      difficulty: 'ระดับ: เริ่มต้น',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      headerBg: 'from-emerald-500 to-teal-600',
    },
    {
      num: 2,
      title: 'วิหารคำไม่ตรงมาตรา',
      subtitle: 'ผจญภัยคำไม่ตรงมาตรา ญ, ณ, ร, ล, ฬ',
      icon: '🏛️',
      examples: 'เหรียญ, คูณ, อาหาร, วาฬ, บอล',
      difficulty: 'ระดับ: ปานกลาง',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      headerBg: 'from-amber-500 to-orange-600',
    },
    {
      num: 3,
      title: 'ปราสาทมงกุฎแม่กน',
      subtitle: 'พิชิตปริศนาคำศัพท์ & รับเกียรติบัตรยอดนักสะกดคำ',
      icon: '🏰',
      examples: 'ปริศนาคำทาย & รวมมิตรคำแม่กน',
      difficulty: 'ระดับ: ท้าทาย',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      headerBg: 'from-purple-500 to-indigo-600',
    },
  ];

  const activeStageData = STAGES_INFO[selectedStage - 1] || STAGES_INFO[0];

  const handleSelectAndPlay = (stageNum: number) => {
    setSelectedStage(stageNum);
    setShowStageModal(false);
    onStartGame(stageNum);
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-4 my-auto animate-in fade-in zoom-in-95 duration-300">
      {/* Main Container Card */}
      <div className="w-full bg-white/95 border-4 border-amber-400 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur">
        {/* Background glow decorations */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Top Header & Title */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-900 font-pixel text-xs px-3.5 py-1 rounded-full shadow-sm border border-amber-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>ผจญภัยภาษาไทย ชั้น ป.3: มาตราตัวสะกด แม่ กน</span>
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 tracking-tight font-pixel mb-1 drop-shadow-xs">
              ตะลุยแดนคำแม่ กน
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              กระโดดเก็บเหรียญ หลบมอนสเตอร์ และตอบคำถามสะกดคำแม่กน 3 ด่านหรรษา
            </p>
          </div>

          {/* Player Info Banner (Compact & Clean) */}
          <div className="w-full max-w-xl bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-3.5 mb-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 to-orange-300 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-inner shrink-0">
                {currentCharacter.avatarEmoji}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-sm md:text-base text-slate-800">{profile.name}</span>
                  {profile.classroom && (
                    <span className="text-[10px] bg-white text-slate-600 font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                      {profile.classroom}
                    </span>
                  )}
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    {profile.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-0.5 font-semibold flex-wrap">
                  <span className="text-amber-800 font-medium">
                    ตัวละคร: {currentCharacter.name} ({currentCharacter.nickname})
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <Trophy className="w-3 h-3 text-amber-600" /> {(profile.highScore || 0).toLocaleString()} คะแนน
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Coins className="w-3 h-3 text-amber-500" /> {profile.totalCoins || 0} เหรียญ
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCustomize}
              className="w-full sm:w-auto text-xs bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5 active:translate-y-0.5 shrink-0"
              title="เปลี่ยนตัวละครหรือแก้ไขชื่อ"
            >
              <Palette className="w-3.5 h-3.5 text-amber-700" />
              <span>เปลี่ยนตัวละคร & แก้ไขชื่อ</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* CONSOLIDATED STAGE SELECTOR CARD / BUTTON */}
          {/* ======================================================== */}
          <div
            onClick={() => setShowStageModal(true)}
            className="w-full max-w-xl bg-gradient-to-r from-sky-50 via-indigo-50/50 to-purple-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-3.5 mb-5 cursor-pointer transition-all shadow-sm hover:shadow-md flex items-center justify-between gap-3 group active:scale-99"
            title="คลิกเพื่อเลือกด่านที่ต้องการเล่น"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border-2 border-indigo-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                {activeStageData.icon}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200">
                    ด่านที่เลือก: ด่านที่ {selectedStage} / 3
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {activeStageData.difficulty}
                  </span>
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-800 group-hover:text-indigo-700 transition-colors mt-0.5">
                  {activeStageData.title}
                </div>
                <div className="text-xs text-slate-500">
                  {activeStageData.subtitle}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-300 px-3 py-2 rounded-xl shrink-0 shadow-xs">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>เลือกด่าน</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Primary Play Button */}
          <div className="w-full max-w-xl mb-4">
            <button
              onClick={() => onStartGame(selectedStage)}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-lg md:text-xl py-4 px-6 rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 flex items-center justify-center gap-3 shadow-xl transition-transform active:scale-98 arcade-btn"
            >
              <Play className="w-6 h-6 fill-white text-white" />
              <span>▶️ เริ่มต้นผจญภัย (ด่านที่ {selectedStage})</span>
            </button>
          </div>

          {/* Secondary Utilities */}
          <div className="flex items-center justify-center gap-2 text-xs">
            <button
              onClick={onOpenLesson}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3.5 py-2 rounded-xl border border-indigo-200 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 อ่านบทเรียนแม่ กน</span>
            </button>

            <button
              onClick={onExportHtml}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2 rounded-xl border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>💾 เล่นแบบออฟไลน์ (.html)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STAGE SELECTION MODAL (เมื่อกดปุ่มเลือกด่าน) */}
      {/* ======================================================== */}
      {showStageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border-4 border-amber-400 rounded-3xl p-5 md:p-6 max-w-lg w-full shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" />
                <h2 className="text-base md:text-lg font-bold text-slate-800 font-pixel">
                  🗺️ เลือกด่านผจญภัยแม่ กน
                </h2>
              </div>
              <button
                onClick={() => setShowStageModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                title="ปิด"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stages List */}
            <div className="space-y-3 mb-4">
              {STAGES_INFO.map((stg) => {
                const isSelected = selectedStage === stg.num;
                const isCleared = currentUnlocked > stg.num;

                return (
                  <div
                    key={stg.num}
                    onClick={() => handleSelectAndPlay(stg.num)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-300'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                        {stg.icon}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${stg.badgeColor}`}>
                            ด่านที่ {stg.num}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {stg.difficulty}
                          </span>
                          {isCleared && (
                            <span className="flex items-center gap-0.5 text-[10px] text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> ผ่านแล้ว
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-sm text-slate-800 mt-0.5">
                          {stg.title}
                        </div>
                        <div className="text-xs text-slate-500 leading-snug">
                          {stg.subtitle}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">
                          <strong className="text-slate-700">ตัวอย่าง: </strong>{stg.examples}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndPlay(stg.num);
                      }}
                      className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1 active:translate-y-0.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>เล่น</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs text-slate-500 font-medium">
              💡 คลิกที่ด่านเพื่อเริ่มเล่นด่านนั้นได้ทันที!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
