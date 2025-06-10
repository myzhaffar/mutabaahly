import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.students': 'Students',
    'nav.profile': 'Profile',
    
    // Home Page
    'home.title': 'Mutabaahly',
    'home.subtitle': 'Monitoring Student Progress in Quran Memorization & Tilawati Reciting',
    'home.description': 'A comprehensive platform designed to help teachers track and monitor their students\' progress in Al-Quran memorization and Tilawati recitation. Built with Islamic values and modern technology.',
    'home.features.title': 'Key Features',
    'home.features.tracking': 'Progress Tracking',
    'home.features.tracking.desc': 'Monitor memorization and recitation progress',
    'home.features.dashboard': 'Teacher Dashboard',
    'home.features.dashboard.desc': 'Comprehensive overview of all students',
    'home.features.responsive': 'Responsive Design',
    'home.features.responsive.desc': 'Works on all devices and screen sizes',
    'home.features.secure': 'Secure Access',
    'home.features.secure.desc': 'Role-based access for teachers and parents',
    
    // Buttons
    'button.getStarted': 'Get Started',
    'button.viewDetails': 'View Details',
    'button.updateProgress': 'Update Progress',
    
    // Progress
    'progress.memorization': 'Memorization',
    'progress.tilawati': 'Tilawati',
    'progress.completed': 'Completed',
    'progress.inProgress': 'In Progress',
    'progress.notStarted': 'Not Started',
    
    // Common
    'common.students': 'Students',
    'common.grade': 'Grade',
    'common.class': 'Class',
    'common.group': 'Study Group',
  },
  id: {
    // Navigation
    'nav.home': 'Beranda',
    'nav.dashboard': 'Dashboard',
    'nav.students': 'Siswa',
    'nav.profile': 'Profil',
    
    // Home Page
    'home.title': 'Mutabaahly',
    'home.subtitle': 'Memantau Kemajuan Siswa dalam Hafalan Al-Quran & Tilawati',
    'home.description': 'Platform komprehensif yang dirancang untuk membantu guru melacak dan memantau kemajuan siswa dalam hafalan Al-Quran dan tilawati. Dibangun dengan nilai-nilai Islam dan teknologi modern.',
    'home.features.title': 'Fitur Utama',
    'home.features.tracking': 'Pelacakan Progres',
    'home.features.tracking.desc': 'Pantau kemajuan hafalan dan tilawati',
    'home.features.dashboard': 'Dashboard Guru',
    'home.features.dashboard.desc': 'Gambaran menyeluruh semua siswa',
    'home.features.responsive': 'Desain Responsif',
    'home.features.responsive.desc': 'Bekerja di semua perangkat dan ukuran layar',
    'home.features.secure': 'Akses Aman',
    'home.features.secure.desc': 'Akses berbasis peran untuk guru dan orang tua',
    
    // Buttons
    'button.getStarted': 'Mulai',
    'button.viewDetails': 'Lihat Detail',
    'button.updateProgress': 'Perbarui Progres',
    
    // Progress
    'progress.memorization': 'Hafalan',
    'progress.tilawati': 'Tilawati',
    'progress.completed': 'Selesai',
    'progress.inProgress': 'Sedang Berlangsung',
    'progress.notStarted': 'Belum Dimulai',
    
    // Common
    'common.students': 'Siswa',
    'common.grade': 'Kelas',
    'common.class': 'Kelas',
    'common.group': 'Kelompok Belajar',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
