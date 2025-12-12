
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import CorporateHome from '@/pages/CorporateHome';
import AboutPage from '@/pages/AboutPage';
import ServicesPage from '@/pages/ServicesPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import BlogPage from '@/pages/BlogPage';
import BlogDetailPage from '@/pages/BlogDetailPage';
import ContactPage from '@/pages/ContactPage';
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Landing Page removed/replaced by CorporateHome as root */}
        <Route path="/" element={<CorporateHome />} />
        {/* Redirect legacy paths to root */}
        <Route path="/giris.html" element={<Navigate to="/" replace />} />
        <Route path="/kurumsal" element={<Navigate to="/" replace />} />
        <Route path="/hakkimizda" element={<AboutPage />} />
        <Route path="/hizmetler" element={<ServicesPage />} />
        <Route path="/projeler" element={<ProjectsPage />} />
        <Route path="/projeler/:id" element={<ProjectDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />
        <Route path="/iletisim" element={<ContactPage />} />
        {/* Redirect any unknown paths to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
