import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, ArrowRight } from 'lucide-react';

export default function SignaturePad({ onNext, onBack }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    setIsEmpty(false);
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    e.preventDefault();
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleNext = () => {
    onNext(canvasRef.current.toDataURL('image/png'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-purple-900 text-center mb-2">Tanda Tangan</h2>
        <p className="text-center text-gray-500 text-sm mb-4">Tanda tangan di area bawah ini</p>

        <div className="border-2 border-dashed border-purple-300 rounded-xl overflow-hidden">
          <canvas
            ref={canvasRef}
            width={460}
            height={200}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>
        <p className="text-xs text-center text-gray-400 mt-2">Tanda tangan akan disimpan ke Google Sheet</p>

        <Button onClick={clear} variant="outline" className="w-full mt-3 border-red-200 text-red-500 hover:bg-red-50">
          <Trash2 className="mr-2 w-4 h-4" /> Hapus Tanda Tangan
        </Button>

        <div className="flex gap-3 mt-3">
          <Button onClick={onBack} variant="outline" className="flex-1">← Kembali</Button>
          <Button onClick={handleNext} disabled={isEmpty} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white disabled:opacity-50">
            Submit <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}