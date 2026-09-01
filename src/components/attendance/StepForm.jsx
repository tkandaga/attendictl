import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import ParticipantCombobox from '@/components/attendance/ParticipantCombobox';
import { useSettings } from '@/lib/SettingsContext';

export default function StepForm({ onNext }) {
  const settings = useSettings();
  const [participants, setParticipants] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Participant.list('-created_date', 1000)
      .then(setParticipants)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const p = participants.find((x) => x.id === selectedId);
    if (!p) return;
    onNext({ nama: p.nama, instansi: p.instansi || '', role: p.role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src={settings.logo_url}
            alt="Logo"
            className="h-12 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-purple-900">Daftar Hadir</h1>
          <p className="text-gray-500 text-sm mt-1">{settings.conference_name} · {settings.conference_subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-gray-700 font-medium">Pilih Nama Anda</Label>
            {loading ? (
              <p className="text-sm text-gray-400 mt-2">Memuat daftar peserta...</p>
            ) : participants.length === 0 ? (
              <p className="text-sm text-red-500 mt-2">
                Belum ada daftar peserta. Hubungi panitia.
              </p>
            ) : (
              <div className="mt-1">
                <ParticipantCombobox
                  participants={participants}
                  value={selectedId}
                  onSelect={(p) => setSelectedId(p.id)}
                />
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={!selectedId}
            className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 text-base disabled:opacity-50"
          >
            Lanjut — Ambil Foto <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}