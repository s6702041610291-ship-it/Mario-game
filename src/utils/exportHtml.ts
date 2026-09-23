// Helper to generate and download a self-contained Single-File HTML game version
import { QUESTIONS_DATA } from '../data/questions';
import { LESSON_CARDS } from '../data/lessons';

export function exportSingleFileHtml() {
  const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>เกมผจญภัยตะลุยคำมาตรา กน - Single File Edition</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Press+Start+2P&display=swap" rel="stylesheet">
  <style>
    * { font-family: 'Chakra Petch', sans-serif; }
    .font-pixel { font-family: 'Press Start 2P', monospace; }
    .pixelated {
      image-rendering: -moz-crisp-edges;
      image-rendering: -webkit-crisp-edges;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  </style>
</head>
<body class="bg-gradient-to-b from-sky-100 via-amber-50 to-emerald-100 text-slate-800 select-none overflow-hidden flex flex-col items-center justify-center min-h-screen p-4">
  <div id="game-container" class="relative w-full max-w-5xl aspect-[16/9] border-4 border-amber-400 rounded-3xl overflow-hidden bg-sky-200 shadow-2xl">
    <canvas id="game-canvas" width="960" height="540" class="w-full h-full pixelated"></canvas>
    <div class="absolute top-3 left-3 bg-white/95 border-2 border-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 shadow-sm">
      🎮 เกมผจญภัยภาษาไทย ป.3: มาตรา กน (Single File Edition)
    </div>
  </div>
  <p class="text-xs text-slate-600 font-semibold mt-3">ควบคุม: ลูกศรซ้าย/ขวา หรือ A/D (เดิน) | Spacebar หรือ W หรือ ลูกศรขึ้น (กระโดด)</p>
  <script>
    console.log("Single-File HTML Game Initialized with 15 questions and Web Audio synthesizer.");
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mae-kon-pixel-platformer.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
