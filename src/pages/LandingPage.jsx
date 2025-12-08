import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <>
      <Helmet>
        <title>Ankaverse - Giriş</title>
        <meta name="description" content="Ankaverse E-Ticaret Limited Şirketi Giriş Ekranı" />
      </Helmet>
      
      {/* Added h-screen and overflow-hidden specifically for this page layout */}
      <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[#1a1b1e] relative">
        {/* Global Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.07, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            src="https://horizons-cdn.hostinger.com/5cf3d390-6a19-42b7-97d6-72347a326ec5/f0f8ff1a4ec871d0dc6dbafd38df3f60.png" 
            alt="Ankaverse Global Background"
            className="w-[60%] max-w-3xl h-auto object-contain"
          />
        </div>

        {/* Left Section - Kurumsal (Redirects to Corporate Home) */}
        <Link 
          to="/giris.html"
          className="w-full lg:w-1/2 flex-1 relative flex items-center justify-center p-8 lg:p-12 z-10 cursor-pointer hover:bg-white/5 transition-colors duration-300 group no-underline"
        >
           <motion.div
             initial={{ opacity: 0, x: -50 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, ease: 'easeOut' }}
             className="w-full flex items-center justify-center"
           >
            <div className="relative text-center max-w-md">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-[#d4af37] transition-colors duration-300"
              >
                Ankaverse E-Ticaret Limited Şirketi
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-xl lg:text-2xl text-gray-300 font-semibold group-hover:text-white transition-colors duration-300"
              >
                Kurumsal
              </motion.p>
            </div>
          </motion.div>
        </Link>

        {/* Divider - Desktop (Vertical) */}
        <div className="hidden lg:block w-px relative z-20 self-stretch">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(to bottom, transparent 0%, transparent calc(50% - 1px), #d4af37 calc(50% - 1px), #d4af37 calc(50% + 1px), transparent calc(50% + 1px), transparent 100%),
                               repeating-linear-gradient(to bottom, transparent, transparent 20px, rgba(212, 175, 55, 0.3) 20px, rgba(212, 175, 55, 0.3) 21px)`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4af37]/20 to-transparent" />
        </div>

        {/* Divider - Mobile (Horizontal) */}
        <div className="block lg:hidden h-px w-full relative z-20">
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(to right, transparent 0%, transparent calc(50% - 1px), #d4af37 calc(50% - 1px), #d4af37 calc(50% + 1px), transparent calc(50% + 1px), transparent 100%),
                               repeating-linear-gradient(to right, transparent, transparent 20px, rgba(212, 175, 55, 0.3) 20px, rgba(212, 175, 55, 0.3) 21px)`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent" />
        </div>

        {/* Right Section - E-Ticaret */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full lg:w-1/2 flex-1 relative flex items-center justify-center p-8 lg:p-12 z-10 cursor-pointer hover:bg-white/5 transition-colors duration-300 group"
        >
          {/* Content */}
          <div className="relative text-center max-w-md">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight group-hover:text-[#d4af37] transition-colors duration-300"
            >
              E-Ticaret
            </motion.h2>
            
            <motion.a
              href="https://eticaret.ankaverse.com.tr"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(212, 175, 55, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-[#d4af37] to-[#f4d678] text-[#1a1b1e] font-bold text-lg rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              Mağazaya Git
            </motion.a>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LandingPage;