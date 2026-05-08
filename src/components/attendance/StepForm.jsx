import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';

export default function StepForm({ onNext, isLoading }) {
  const [nama, setNama] = useState('');
  const [instansi, setInstansi] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama.trim() || !instansi.trim()) return;
    onNext({ nama: nama.trim(), instansi: instansi.trim() });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="https://media.base44.com/images/public/69fdae0983a85702d2227a8c/a107637de_1UT-ICTL_logo_blue-1024x211.webp"
            alt="ICTL Logo"
            className="h-12 mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-bold text-purple-900">Daftar Hadir</h1>
          <p className="text-gray-500 text-sm mt-1">ICTL 2026 — International Conference on Teaching and Learning</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="nama" className="text-gray-700 font-medium">Nama Lengkap</Label>
            <Input
              id="nama"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="instansi" className="text-gray-700 font-medium">Instansi / Universitas</Label>
            <Input
              id="instansi"
              value={instansi}
              onChange={e => setInstansi(e.target.value)}
              placeholder="Masukkan nama instansi Anda"
              className="mt-1"
              required
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 text-base disabled:opacity-60">
            {isLoading ? 'Memeriksa...' : <> Lanjut — Ambil Foto <ArrowRight className="ml-2 w-4 h-4" /></>}
          </Button>
        </form>
      </div>
    </div>
  );
}