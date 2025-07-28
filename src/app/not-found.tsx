'use client';

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';
import '@/i18n';

export default function NotFound() {
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    // Remove all console.error statements
  }, [pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">{t('errors.404.title')}</h1>
        <p className="text-xl text-gray-600 mb-4">{t('errors.404.message')}</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          {t('errors.404.backToHome')}
        </a>
      </div>
    </div>
  );
} 