import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import CsvUploadModal from '../upload/CsvUploadModal';

export const AppLayout = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setIsUploadOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app-shell">
      <Navbar />
      <div className="app-body">
        <Sidebar onOpenUpload={() => setIsUploadOpen(true)} />
        <main className="main-content">
          <Outlet context={{ refreshTrigger, onOpenUpload: () => setIsUploadOpen(true) }} />
        </main>
      </div>

      <CsvUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default AppLayout;

