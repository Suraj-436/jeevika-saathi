import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      <Header />
      <Sidebar />
      <div className="pl-72">
        <main className="w-full pt-20 bg-surface min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
