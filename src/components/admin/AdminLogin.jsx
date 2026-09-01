import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';

export default function AdminLogin({ onSuccess }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (u === 'admin' && p === 'admin123') {
      setErr('');
      onSuccess();
    } else {
      setErr('Username atau password salah');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-purple-700" />
          </div>
          <h1 className="text-xl font-bold text-purple-900">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">ICTL 2026 · Panel Admin</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="u" className="text-gray-700 font-medium">Username</Label>
            <Input
              id="u"
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="admin"
              className="mt-1"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="p" className="text-gray-700 font-medium">Password</Label>
            <Input
              id="p"
              type="password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              placeholder="•••••••"
              className="mt-1"
            />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white">
            Masuk
          </Button>
        </form>
      </div>
    </div>
  );
}