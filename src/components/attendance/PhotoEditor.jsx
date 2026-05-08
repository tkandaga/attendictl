import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, ZoomIn, ZoomOut, Move } from 'lucide-react';

const TWIBBON_URL = 'https://media.base44.com/images/public/69fdae0983a85702d2227a8c/d9e29f14b_twibbone-ictl2026.png';

// Template portrait: canvas 500x500, kotak abu di kiri bawah
// ~x=3%, y=79%, w=42%, h=10% dari canvas 500px
const BOX = { x: 15, y: 395, w: 210, h: 75, pad: 12 };

export default function PhotoEditor({ photoDataUrl, nama, instansi, onNext, onBack }) {
  const canvasRef = useRef(null);
  const [photoPos, setPhotoPos] = useState({ x: 0, y: 0 });
  const [photoScale, setPhotoScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const twibbonImg = useRef(null);
  const photoImg = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const CANVAS_W = 500;
  const CANVAS_H = 500;

  useEffect(() => {
    let loadedCount = 0;
    const checkLoaded = () => { loadedCount++; if (loadedCount === 2) setLoaded(true); };

    const twib = new Image();
    twib.crossOrigin = 'anonymous';
    twib.onload = checkLoaded;
    twib.src = TWIBBON_URL;
    twibbonImg.current = twib;

    const photo = new Image();
    photo.onload = () => {
      // Init photo centered, filling canvas
      const scale = Math.max(CANVAS_W / photo.width, CANVAS_H / photo.height);
      setPhotoScale(scale);
      setPhotoPos({
        x: (CANVAS_W - photo.width * scale) / 2,
        y: (CANVAS_H - photo.height * scale) / 2,
      });
      checkLoaded();
    };
    photo.src = photoDataUrl;
    photoImg.current = photo;
  }, [photoDataUrl]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Draw photo behind twibbon
    const p = photoImg.current;
    ctx.drawImage(p, photoPos.x, photoPos.y, p.width * photoScale, p.height * photoScale);

    // Draw twibbon on top (PNG with transparency)
    ctx.drawImage(twibbonImg.current, 0, 0, CANVAS_W, CANVAS_H);

    // Gambar teks nama & instansi di dalam kotak abu-abu
    ctx.save();
    ctx.beginPath();
    ctx.rect(BOX.x, BOX.y, BOX.w, BOX.h);
    ctx.clip();

    const maxW = BOX.w - BOX.pad * 2;
    const centerX = BOX.x + BOX.w / 2;

    // Potong max 15 karakter
    const namaText = nama.length > 15 ? nama.slice(0, 15) : nama;
    const instansiText = instansi.length > 15 ? instansi.slice(0, 15) : instansi;

    // Helper: cari ukuran font terbesar yg muat dalam maxW
    const fitFontSize = (text, fontStyle, maxSize, minSize) => {
      for (let size = maxSize; size >= minSize; size--) {
        ctx.font = `${fontStyle} ${size}px Arial`;
        if (ctx.measureText(text).width <= maxW) return size;
      }
      return minSize;
    };

    // Nama - putih, centered, auto shrink 18px→8px
    const namaSize = fitFontSize(namaText, 'bold', 18, 8);
    ctx.font = `bold ${namaSize}px Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(namaText, centerX, BOX.y + BOX.pad + namaSize + 8);

    // Instansi - kuning bold, centered, auto shrink 14px→7px
    const instansiSize = fitFontSize(instansiText, 'bold', 14, 7);
    ctx.font = `bold ${instansiSize}px Arial`;
    ctx.fillStyle = '#f0b429';
    ctx.fillText(instansiText, centerX, BOX.y + BOX.pad + namaSize + instansiSize + 18);

    ctx.restore();
  }, [loaded, photoPos, photoScale, nama, instansi]);

  useEffect(() => { draw(); }, [draw]);

  // Pointer events for drag
  const onPointerDown = (e) => {
    setIsDragging(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    dragStart.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      posX: photoPos.x,
      posY: photoPos.y,
    };
    e.preventDefault();
  };

  const onPointerMove = useCallback((e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const dx = ((e.clientX - rect.left) * scaleX) - dragStart.current.x;
    const dy = ((e.clientY - rect.top) * scaleY) - dragStart.current.y;
    setPhotoPos({ x: dragStart.current.posX + dx, y: dragStart.current.posY + dy });
    e.preventDefault();
  }, [isDragging]);

  const onPointerUp = () => setIsDragging(false);

  // Touch support
  const onTouchStart = (e) => {
    const touch = e.touches[0];
    onPointerDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
  };
  const onTouchMove = (e) => {
    const touch = e.touches[0];
    onPointerMove({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => e.preventDefault() });
  };

  const handleNext = () => {
    const canvas = canvasRef.current;
    onNext(canvas.toDataURL('image/png'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-purple-900 text-center mb-2">Atur Posisi Foto</h2>
        <p className="text-center text-gray-500 text-sm mb-4">
          <Move className="inline w-4 h-4 mr-1" />Geser foto, atur zoom agar wajah terlihat jelas
        </p>

        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full rounded-xl cursor-grab active:cursor-grabbing border border-gray-200 touch-none"
          onMouseDown={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseUp={onPointerUp}
          onMouseLeave={onPointerUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onPointerUp}
        />

        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-gray-400 shrink-0" />
            <Slider
              min={0.3}
              max={3}
              step={0.05}
              value={[photoScale]}
              onValueChange={([v]) => setPhotoScale(v)}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-gray-400 shrink-0" />
          </div>
          <p className="text-xs text-center text-gray-400">Zoom: {Math.round(photoScale * 100)}%</p>
        </div>

        <div className="flex gap-3 mt-5">
          <Button onClick={onBack} variant="outline" className="flex-1">← Kembali</Button>
          <Button onClick={handleNext} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">
            Lanjut — TTD <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}