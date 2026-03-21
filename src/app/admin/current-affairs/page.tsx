'use client';
export const dynamic = 'force-dynamic';
// src/app/admin/current-affairs/page.tsx
// Current Affairs is stored in the same `articlePosts` collection
// as Education Info. This page is a filtered view of the articles list.
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCurrentAffairsPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to articles page – admin manages both from one place
    router.replace('/admin/articles?cat=Current+Affairs');
  }, [router]);
  return null;
}
