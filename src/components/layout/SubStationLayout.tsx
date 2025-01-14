import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { SubStationNavigation } from './SubStationNavigation';

export const SubStationLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-alexandria">
      <Header />
      <main className="pt-16 pb-24 px-6">
        <Outlet />
      </main>
      <SubStationNavigation />
    </div>
  );
};