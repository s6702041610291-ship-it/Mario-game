import React, { useState } from 'react';
import {
  Sparkles,
  Edit3,
  Check,
  Award,
  X,
  User,
  GraduationCap,
} from 'lucide-react';
import { CHARACTERS, STUDENT_TITLES } from '../data/characters';
import { CharacterId, PlayerProfile } from '../types';

interface ProfileModalProps {
  initialProfile?: PlayerProfile | null;
  isCreatingNew: boolean;
  onSave: (profile: PlayerProfile, isNew: boolean) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  initialProfile,
  isCreatingNew,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(
    initialProfile && !isCreatingNew ? initialProfile.name : ''
  );
  const [classroom, setClassroom] = useState(
    initialProfile && !isCreatingNew ? initialProfile.classroom || 'ป.3/1' : 'ป.3/1'
  );
  const [title, setTitle] = useState(
    initialProfile && !isCreatingNew ? initialProfile.title : STUDENT_TITLES[0]
  );
  const [characterId, setCharacterId] = useState<CharacterId>(
    initialProfile ? initialProfile.characterId : 'adventurer'
  );
  const [errorMsg, setErrorMsg] = useState('');

  const chosenChar =
    CHARACTERS.find((c) => c.id === characterId) || CHARACTERS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMsg('กรุณาพิมพ์ชื่อผู้เล่นหรือนักเรียนก่อนนะจ๊ะ!');
      return;
    }

    const savedProfile: PlayerProfile = {
      id:
        isCreatingNew || !initialProfile?.id
          ? 'profile_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)
          : initialProfile.id,
      name: trimmedName,
      classroom: classroom.trim() || 'ป.3/1',
      title,
      characterId,
      highScore: isCreatingNew ? 0 : initialProfile?.highScore || 0,
      unlockedStage: isCreatingNew ? 1 : initialProfile?.unlockedStage || 1,
      totalCoins: isCreatingNew ? 0 : initialProfile?.totalCoins || 0,
      lastPlayedAt: new Date().toISOString(),
    };

    onSave(savedProfile, isCreatingNew);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white border-4 border-amber-400 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col max-h-[92vh] text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-xs">
              {isCreatingNew ? '🌟' : '🎨'}
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-amber-950 flex items-center gap-1.5">
                <span>{isCreatingNew ? 'สร้างโปรไฟล์นักเรียนใหม่' : 'เปลี่ยนตัวละคร & แก้ไขโปรไฟล์'}</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 font-semibold">
                  ป.3 ภาษาไทย
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isCreatingNew
                  ? 'สร้างโปรไฟล์ของคุณเพื่อบันทึกประวัติการเล่นและคะแนน'
                  : 'เลือกสกินตัวละครที่ชื่นชอบและฉายาสุดเท่'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold active:scale-95 transition-all"
            title="ปิด"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-xl font-medium animate-shake">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Student Info Card */}
          <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-3.5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                  <span>ชื่อผู้เล่น / นักเรียน:</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="พิมพ์ชื่อหรือชื่อเล่นที่นี่..."
                  className="w-full px-3 py-2 text-sm bg-white border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 font-semibold text-slate-800 shadow-inner"
                  autoFocus={isCreatingNew}
                />
              </div>

              {/* Classroom / No. */}
              <div>
                <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                  <span>ชั้นเรียน / เลขที่:</span>
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  placeholder="เช่น ป.3/1"
                  className="w-full px-3 py-2 text-sm bg-white border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 font-semibold text-slate-800 shadow-inner"
                />
              </div>
            </div>

            {/* Quick Name Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-[11px] text-slate-500 font-medium">ชื่อเล่นแนะนำ:</span>
              {['น้องกล้า', 'น้องขวัญข้าว', 'เด็กชายสายฟ้า', 'น้องมุกดา', 'ยอดนักสืบ'].map(
                (nameOption) => (
                  <button
                    key={nameOption}
                    type="button"
                    onClick={() => {
                      setName(nameOption);
                      if (errorMsg) setErrorMsg('');
                    }}
                    className="bg-white hover:bg-amber-200 text-slate-700 hover:text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 text-[11px] transition-colors"
                  >
                    {nameOption}
                  </button>
                )
              )}
            </div>

            {/* Title Badges */}
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>เลือกฉายาประจำตัว:</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STUDENT_TITLES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTitle(t)}
                    className={`text-xs px-2.5 py-1 rounded-xl font-medium border transition-all ${
                      title === t
                        ? 'bg-amber-500 text-white border-amber-600 font-bold shadow-xs scale-105'
                        : 'bg-white hover:bg-amber-100 text-slate-700 border-amber-200'
                    }`}
                  >
                    {title === t && '✓ '}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Character Skins Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>เลือกสกินตัวละครพิกเซล (5 แบบ):</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                เปลี่ยนร่างในเกมได้ทันที
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CHARACTERS.map((char) => {
                const isSelected = characterId === char.id;
                return (
                  <div
                    key={char.id}
                    onClick={() => setCharacterId(char.id)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400/40 scale-[1.01]'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-300 shadow-xs'
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {char.avatarEmoji}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-800">
                          {char.name}
                        </span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                          {char.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-amber-700 mb-0.5">
                        {char.nickname}
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {char.description}
                      </p>
                    </div>

                    {/* Checkmark */}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-orange-100 border-2 border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl animate-bounce">{chosenChar.avatarEmoji}</span>
              <div>
                <div className="text-[11px] text-amber-800 font-bold">
                  ตัวละครที่คุณเลือก:
                </div>
                <div className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <span>{chosenChar.name}</span>
                  <span className="text-xs text-amber-700 font-normal">
                    ({chosenChar.nickname})
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500">ชื่อที่จะแสดงในเกม:</div>
              <div className="text-xs font-bold text-slate-800">
                {name.trim() || 'ผู้กล้าตัวน้อย'} {classroom ? `(${classroom})` : ''} • {title}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-between gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs md:text-sm border border-slate-300 active:translate-y-0.5"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2.5 px-4 rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 flex items-center justify-center gap-2 text-xs md:text-sm arcade-btn shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isCreatingNew
                  ? '🚀 สร้างโปรไฟล์ & เริ่มลุยเกมทันที!'
                  : '✓ บันทึกการเปลี่ยนแปลง!'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
