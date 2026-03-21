// src/app/admin/page.tsx
export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
export default function AdminIndexPage() {
  redirect('/admin/dashboard');
}
