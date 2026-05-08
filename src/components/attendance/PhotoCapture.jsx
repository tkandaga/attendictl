import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, RotateCcw, ArrowRight } from 'lucide-react';

export default function PhotoCapture({ onNext, onBack }) {
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [mode, setMode] = useState('choose'); // choose | camera | preview
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'user' }, 
      audio: false 
    });
    streamRef.current = s;
    setMode('camera');
  };

  // Callback ref: dipanggil saat elemen video muncul di DOM
  const videoCallbackRef = (videoEl) => {
    if (videoEl && streamRef.current) {
      videoEl.srcObject = streamRef.current;
      videoEl.play().catch(() => {});
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    const video = document.querySelector('video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    canvas.getContext('2d').drawImage(video, 0, 0);
    setPhotoDataUrl(canvas.toDataURL('image/jpeg', 0.9));
    stopCamera();
    setMode('preview');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoDataUrl(ev.target.result);
      setMode('preview');
    };
    reader.readAsDataURL(file);
  };

  const reset = () => {
    stopCamera();
    setPhotoDataUrl(null);
    setMode('choose');
  };

  const handleNext = () => {
    stopCamera();
    onNext(photoDataUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-purple-900 text-center mb-6">Foto Peserta</h2>

        {mode === 'choose' && (
          <div className="space-y-4">
            <p className="text-center text-gray-500 text-sm mb-6">Pilih cara mengambil foto</p>
            <Button onClick={startCamera} className="w-full bg-purple-700 hover:bg-purple-800 text-white py-4 text-base">
              <Camera className="mr-2 w-5 h-5" /> Buka Kamera
            </Button>
            <Button onClick={() => fileInputRef.current.click()} variant="outline" className="w-full py-4 text-base border-purple-300 text-purple-700">
              <Upload className="mr-2 w-5 h-5" /> Upload Foto
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </div>
        )}

        {mode === 'camera' && (
          <div className="space-y-4">
            <video 
              ref={videoCallbackRef}
              autoPlay 
              playsInline 
              muted
              className="w-full rounded-xl aspect-square object-cover bg-gray-900" 
            />
            <div className="flex gap-3">
              <Button onClick={reset} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 w-4 h-4" /> Batal
              </Button>
              <Button onClick={capturePhoto} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">
                <Camera className="mr-2 w-4 h-4" /> Ambil Foto
              </Button>
            </div>
          </div>
        )}

        {mode === 'preview' && (
          <div className="space-y-4">
            <img src={photoDataUrl} alt="preview" className="w-full rounded-xl aspect-square object-cover" />
            <div className="flex gap-3">
              <Button onClick={reset} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 w-4 h-4" /> Ulangi
              </Button>
              <Button onClick={handleNext} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">
                Lanjut <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <Button onClick={onBack} variant="ghost" className="w-full mt-3 text-gray-400">
          ← Kembali
        </Button>
      </div>
    </div>
  );
}