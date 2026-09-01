import { Button } from '@/components/ui/button';
import { Download, CheckCircle, RotateCcw } from 'lucide-react';
import { useSettings } from '@/lib/SettingsContext';

export default function NametageResult({ compositeDataUrl, nama, onExit }) {
  const settings = useSettings();
  const confTag = (settings.conference_name || 'ICTL2026').replace(/\s+/g, '');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `nametag-${confTag.toLowerCase()}-${nama.replace(/\s+/g, '-')}.png`;
    link.href = compositeDataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CheckCircle className="w-7 h-7 text-green-500" />
          <h2 className="text-2xl font-bold text-purple-900">Berhasil Daftar!</h2>
        </div>
        <p className="text-gray-500 text-sm mb-5">Data kamu telah tersimpan. Berikut nametag {settings.conference_name} milikmu:</p>

        <img
          src={compositeDataUrl}
          alt="Nametag"
          className="w-full rounded-xl shadow-lg border border-gray-100 mb-5"
        />

        <Button
          onClick={handleDownload}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 text-base"
        >
          <Download className="mr-2 w-5 h-5" /> Download Nametag
        </Button>
        <Button
          onClick={onExit}
          variant="outline"
          className="w-full mt-2 py-3 text-base"
        >
          <RotateCcw className="mr-2 w-5 h-5" /> Keluar ke Dashboard
        </Button>
        <p className="text-xs text-gray-400 mt-3">
          Bagikan nametag ini di media sosialmu! #{confTag}
        </p>
      </div>
    </div>
  );
}