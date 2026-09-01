import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, LogOut, Trash2, Image as ImageIcon, Users, Search } from 'lucide-react';

export default function AdminPanel({ onLogout }) {
  const { toast } = useToast();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [twibbonUrl, setTwibbonUrl] = useState('');
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [uploadingTwibbon, setUploadingTwibbon] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Participant.list('-created_date', 1000);
      setParticipants(list);
      const settings = await base44.entities.Setting.filter({ key: 'twibbon_url' });
      if (settings.length) setTwibbonUrl(settings[0].value);
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingExcel(true);
    try {
      const up = await base44.integrations.Core.UploadFile({ file });
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: up.file_url,
        json_schema: {
          type: 'object',
          properties: {
            nama: { type: 'string' },
            instansi: { type: 'string' },
            role: {
              type: 'string',
              enum: ['Participant', 'Presenter', 'Speaker', 'Panitia', 'VIP']
            }
          }
        }
      });
      if (res.status === 'success' && Array.isArray(res.output)) {
        const validRoles = ['Participant', 'Presenter', 'Speaker', 'Panitia', 'VIP'];
        const rows = res.output
          .filter((r) => r && r.nama)
          .map((r) => ({
            nama: String(r.nama).trim(),
            instansi: String(r.instansi || '').trim(),
            role: validRoles.includes(r.role) ? r.role : 'Participant'
          }));
        if (!rows.length) {
          toast({ title: 'Gagal', description: 'Tidak ada baris valid ditemukan', variant: 'destructive' });
        } else {
          await base44.entities.Participant.bulkCreate(rows);
          toast({ title: 'Berhasil', description: `${rows.length} peserta diimpor` });
          load();
        }
      } else {
        toast({
          title: 'Gagal',
          description: res.details || 'Format tidak dikenali',
          variant: 'destructive'
        });
      }
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setUploadingExcel(false);
      e.target.value = '';
    }
  };

  const handleTwibbon = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingTwibbon(true);
    try {
      const up = await base44.integrations.Core.UploadFile({ file });
      const existing = await base44.entities.Setting.filter({ key: 'twibbon_url' });
      if (existing.length) {
        await base44.entities.Setting.update(existing[0].id, { value: up.file_url });
      } else {
        await base44.entities.Setting.create({ key: 'twibbon_url', value: up.file_url });
      }
      setTwibbonUrl(up.file_url);
      toast({ title: 'Berhasil', description: 'Twibbon diperbarui' });
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setUploadingTwibbon(false);
      e.target.value = '';
    }
  };

  const handleDeleteOne = async (id) => {
    try {
      await base44.entities.Participant.delete(id);
      setParticipants((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Hapus SEMUA peserta? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      await base44.entities.Participant.deleteMany({});
      setParticipants([]);
      toast({ title: 'Berhasil', description: 'Semua peserta dihapus' });
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const filtered = participants.filter(
    (p) =>
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      (p.instansi || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.role || '').toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = {
    Participant: 'bg-blue-100 text-blue-700',
    Presenter: 'bg-green-100 text-green-700',
    Speaker: 'bg-purple-100 text-purple-700',
    Panitia: 'bg-amber-100 text-amber-700',
    VIP: 'bg-rose-100 text-rose-700'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow">
        <div className="flex items-center gap-3">
          <img
            src="https://media.base44.com/images/public/69fdae0983a85702d2227a8c/a107637de_1UT-ICTL_logo_blue-1024x211.webp"
            alt="ICTL"
            className="h-8 object-contain bg-white/95 rounded px-2 py-1"
          />
          <span className="font-semibold hidden sm:inline">Admin Panel</span>
        </div>
        <Button onClick={onLogout} variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">
          <LogOut className="w-4 h-4 mr-2" /> Keluar
        </Button>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Twibbon upload */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-5 h-5 text-purple-700" />
            <h2 className="font-semibold text-gray-800">Desain Twibbon</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-32 h-32 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center shrink-0">
              {twibbonUrl ? (
                <img src={twibbonUrl} alt="twibbon" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400 text-center px-2">Belum ada twibbon</span>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="twib" className="text-gray-700 font-medium">Upload PNG twibbon (500×500)</Label>
              <Input
                id="twib"
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleTwibbon}
                disabled={uploadingTwibbon}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-2">
            {uploadingTwibbon ? 'Mengunggah...' : 'PNG dengan transparansi direkomendasikan. Akan langsung dipakai di halaman daftar hadir.'}
              </p>
            </div>
          </div>
        </section>

        {/* Excel upload */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-5 h-5 text-purple-700" />
            <h2 className="font-semibold text-gray-800">Import Data Peserta (Excel)</h2>
          </div>
          <Label htmlFor="excel" className="text-gray-700 font-medium">File .xlsx</Label>
          <Input
            id="excel"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcel}
            disabled={uploadingExcel}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-2">
            {uploadingExcel
              ? 'Memproses...'
              : 'Kolom yang dikenali: nama, instansi, role. Role: Participant, Presenter, Speaker, Panitia, VIP.'}
          </p>
        </section>

        {/* Participants list */}
        <section className="bg-white rounded-xl shadow-sm border p-5">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-700" />
              <h2 className="font-semibold text-gray-800">
                Daftar Peserta ({participants.length})
              </h2>
            </div>
            {participants.length > 0 && (
              <Button onClick={handleDeleteAll} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-1" /> Hapus Semua
              </Button>
            )}
          </div>

          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Cari nama / instansi / role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 py-6 text-center">Memuat...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              {participants.length === 0 ? 'Belum ada peserta. Upload Excel untuk mulai.' : 'Tidak ada yang cocok.'}
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Nama</th>
                    <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Instansi</th>
                    <th className="text-left px-3 py-2 font-medium">Role</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-800">{p.nama}</td>
                      <td className="px-3 py-2 text-gray-600 hidden sm:table-cell">{p.instansi || '-'}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[p.role] || 'bg-gray-100 text-gray-700'}`}>
                          {p.role}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleDeleteOne(p.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}