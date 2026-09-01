import { useState } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminPanel from '@/components/admin/AdminPanel';

const AUTH_KEY = 'ictl_admin_auth';

export default function Admin() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem(AUTH_KEY) === 'yes'
  );

  if (!authed) {
    return (
      <AdminLogin
        onSuccess={() => {
          sessionStorage.setItem(AUTH_KEY, 'yes');
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <AdminPanel
      onLogout={() => {
        sessionStorage.removeItem(AUTH_KEY);
        setAuthed(false);
      }}
    />
  );
}