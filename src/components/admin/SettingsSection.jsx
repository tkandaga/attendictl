import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useSettings, DEFAULTS } from '@/lib/SettingsContext';
import { Save, Upload, Settings as SettingsIcon, Palette } from 'lucide-react';

export default function SettingsSection() {
  const { toast } = useToast();
  const settings = useSettings();
  const [form, setForm] = useState({
    conference_name: settings.conference_name,
    conference_subtitle: settings.conference_subtitle,
    logo_url: settings.logo_url,
    theme_color: settings.theme_color
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    setForm({
      conference_name: settings.conference_name,
      conference_subtitle: settings.conference_subtitle,
      logo_url: settings.logo_url,
      theme_color: settings.theme_color
    });
  }, [settings.conference_name, settings.conference_subtitle, settings.logo_url, settings.theme_color]);

  const upsertSetting = async (key, value) => {
    const existing = await base44.entities.Setting.filter({ key });
    if (existing.length) {
      await base44.entities.Setting.update(existing[0].id, { value });
    } else {
      await base44.entities.Setting.create({ key, value });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = [
        ['conference_name', form.conference_name || DEFAULTS.conference_name],
        ['conference_subtitle', form.conference_subtitle || DEFAULTS.conference_subtitle],
        ['theme_color', form.theme_color || DEFAULTS.theme_color],
        ['logo_url', form.logo_url || DEFAULTS.logo_url]
      ];
      for (const [key, value] of entries) {
        await upsertSetting(key, value);
      }
      document.documentElement.style.setProperty('--brand', form.theme_color);
      toast({ title: 'Tersimpan', description: 'Pengaturan diperbarui. Refresh halaman utama untuk melihat perubahan.' });
    } catch (e) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const up = await base44.integrations.Core.UploadFile({ file });
      setForm((f) => ({ ...f, logo_url: up.file_url }));
      toast({ title: 'Logo diunggah', description: 'Klik Simpan untuk menerapkan' });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center gap-2 mb-4">
        <SettingsIcon className="w-5 h-5 text-purple-700" />
        <h2 className="font-semibold text-gray-800">Pengaturan Konferensi</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-gray-700 font-medium">Nama Konferensi</Label>
          <Input
            value={form.conference_name}
            onChange={(e) => setForm({ ...form, conference_name: e.target.value })}
            className="mt-1"
            placeholder="ICTL 2026"
          />
        </div>

        <div>
          <Label className="text-gray-700 font-medium">Subtitle</Label>
          <Input
            value={form.conference_subtitle}
            onChange={(e) => setForm({ ...form, conference_subtitle: e.target.value })}
            className="mt-1"
            placeholder="International Conference on Teaching and Learning"
          />
        </div>

        <div>
          <Label className="text-gray-700 font-medium">Logo</Label>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-24 h-16 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center shrink-0">
              {form.logo_url ? (
                <img src={form.logo_url} alt="logo" className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs text-gray-400">No logo</span>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="flex-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-gray-700 font-medium flex items-center gap-1">
            <Palette className="w-3.5 h-3.5" /> Main Color (Theme)
          </Label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              value={form.theme_color}
              onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
              className="w-12 h-10 rounded border cursor-pointer p-0.5"
            />
            <Input
              value={form.theme_color}
              onChange={(e) => setForm({ ...form, theme_color: e.target.value })}
              className="flex-1"
              placeholder="#7e22ce"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Warna utama tombol, header, dan background gradient.</p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="bg-purple-700 hover:bg-purple-800 text-white">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </section>
  );
}