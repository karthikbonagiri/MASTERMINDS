// src/app/admin/login/layout.tsx
// ============================================================
// The login page must NOT be wrapped by the admin layout
// (which includes AdminGuard + sidebar). This standalone layout
// ensures the login page renders cleanly without protection.
// ============================================================

export const metadata = {
  title: 'Admin Login – MasterMinds',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  // No guard, no sidebar — just the plain page
  return <>{children}</>;
}
