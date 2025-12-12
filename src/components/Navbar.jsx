
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path) => {
    return location.pathname === path;
  }

  const menuItems = [
    { title: 'Ana Sayfa', path: '/giris' },
    { title: 'Hakkımızda', path: '/hakkimizda' },
    { 
      title: 'Hizmetler', 
      path: '/hizmetler',
    },
    { title: 'Projeler', path: '/projeler' },
    { title: 'Blog', path: '/blog' },
    { title: 'İletişim', path: '/iletisim' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-[#1a1b1e]/95 backdrop-blur-md border-b border-[#d4af37]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="https://horizons-cdn.hostinger.com/5cf3d390-6a19-42b7-97d6-72347a326ec5/efd54cbb556b696674869e910ac211e2.jpg" 
                alt="ANKAVERSE" 
                className="h-12 w-12 rounded-full border-2 border-[#d4af37] group-hover:border-white transition-colors duration-300"
              />
              <span className="font-bold text-2xl tracking-widest text-white group-hover:text-[#d4af37] transition-colors duration-300">
                ANKAVERSE
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item, index) => (
              <Link 
                key={index}
                to={item.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:bg-[#d4af37] after:left-0 after:bottom-0 after:transition-all group-hover:after:w-full",
                  isActive(item.path) ? "text-[#d4af37] after:w-full" : "text-gray-300 hover:text-[#d4af37]"
                )}
              >
                {item.title}
              </Link>
            ))}
            
            {/* CTA Button */}
            <Link 
              to="/iletisim"
              className="ml-4 px-6 py-2 bg-transparent border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black rounded-full font-medium transition-all duration-300"
            >
              Teklif Alın
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#1a1b1e] border-b border-[#d4af37]/20"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={cn(
                    "block px-3 py-4 text-base font-medium rounded-md",
                    isActive(item.path) ? "text-[#d4af37]" : "text-gray-300 hover:text-[#d4af37] hover:bg-gray-800"
                  )}
                  onClick={toggleMenu}
                >
                  {item.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
