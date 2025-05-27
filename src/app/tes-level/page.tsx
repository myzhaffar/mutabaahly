"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Assuming you have this
// import Navigation from '@/components/Navigation'; // If parents have a specific nav

const ParentTestTrackingPage = () => {
  const { profile } = useAuth(); // Or however you get user role

  if (profile?.role !== 'parent') {
    // Or redirect, or show an unauthorized message
    // This is a basic client-side check, proper routing/middleware is better
    return <p>Unauthorized</p>; 
  }

  return (
    <div>
      {/* <Navigation />  // If Navigation is reused or a specific parent nav exists */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Riwayat Tes Level Tilawati Anak</h1>
        <p className="mb-4">
          Di sini Anda dapat melihat jadwal tes kenaikan level Tilawati untuk anak Anda serta hasil tes yang telah dilaksanakan.
        </p>
        {/* Placeholder for TestTracking component */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Jadwal & Hasil Tes</h2>
          <p>Data tes akan ditampilkan di sini.</p>
          {/* Example structure - to be replaced by TestTracking component */}
          <div className="mt-4 border rounded-lg p-4">
            <p><strong>Nama Anak:</strong> [Nama Anak]</p>
            <p><strong>Jilid Saat Ini:</strong> [Jilid]</p>
            <p><strong>Tes Berikutnya:</strong></p>
            <ul className="list-disc list-inside ml-4">
              <li>Target Jilid: [Target Jilid Berikutnya]</li>
              <li>Tanggal Tes: [Tanggal]</li>
              <li>Penguji: [Nama Penguji]</li>
              <li>Status: [Status Tes]</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentTestTrackingPage; 