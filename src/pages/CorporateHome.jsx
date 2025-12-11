import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Code, 
  Workflow, 
  ShoppingCart, 
  BrainCircuit, 
  Box, 
  Server, 
  ShieldCheck, 
  Activity, 
  Database, 
  Layers 
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { getServices } from '@/services/api';

// Helper to map icon string names to components
const IconMap = {
  'Code': Code,
  'Code2': Code, // Map Code2 to Code for consistency if needed, or import Code2
  'Workflow': Workflow,
  'ShoppingCart': ShoppingCart,
  'BrainCircuit': BrainCircuit,
  'Box': Box,
  'Server': Server,
  'ShieldCheck': ShieldCheck,
  'Activity': Activity,
  'Database': Database,
  'Layers': Layers
};

// Helper function to decode HTML entities
const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const CorporateHome = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        
        // Map WordPress API data to component format
        const formattedServices = data.map(service => {
          const iconName = service.acf?.ikon_adi ? service.acf.ikon_adi.trim() : 'Code';
          // Handle Code2 mapping if necessary, or ensure IconMap has all keys
          const IconComponent = IconMap[iconName] || IconMap['Code2'] || Code;
          
          return {
            id: service.id,
            icon: <IconComponent className="h-8 w-8" />,
            title: decodeHtml(service.title.rendered),
            desc: service.content.rendered.replace(/<[^>]+>/g, '').replace(/\n/g, '').substring(0, 150) + (service.content.rendered.length > 150 ? '...' : '') // Truncate description
          };
        });
        
        // If no services from API, fallback to static (optional, or just show empty)
        if (formattedServices.length > 0) {
           setServices(formattedServices.slice(0, 6)); // Limit to 6 services for home page
        }
      } catch (err) {
        console.error('Error fetching services for home:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const whyUsPoints = [
    {
      icon: <Server className="h-6 w-6" />,
      title: "API Merkezli Mimari",
      desc: "Sistemler arası kesintisiz iletişim sağlayan esnek yapı."
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: "Veri Güvenliği",
      desc: "En güncel protokollerle korunan uçtan uca güvenlik."
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Düşük Hatalı İşlem",
      desc: "Optimize edilmiş kod yapısı ile maksimum kararlılık."
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Yüksek Veri Hacmi",
      desc: "Big Data (Büyük Veri) işleme kapasitesine sahip altyapı."
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Modüler Sistem",
      desc: "İhtiyacınıza göre büyüyebilen ve şekillenen esnek mimari."
    }
  ];

  return (
    <>
      <Helmet>
        <title>ANKAVERSE® – Yazılım, Otomasyon, Yapay Zekâ ve E-Ticaret Teknolojileri</title>
        <meta name="description" content="ANKAVERSE® kurumsal ana sayfası. Yazılım geliştirme, otomasyon, yapay zeka ve e-ticaret çözümleri ile işletmenizi geleceğe taşıyın." />
      </Helmet>

      <Navbar />

      <main className="bg-[#1a1b1e] text-white overflow-hidden min-h-screen flex flex-col">
        
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a1b1e] via-[#1a1b1e]/90 to-[#1a1b1e] z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b" 
              alt="Technology Background" 
              className="w-full h-full object-cover opacity-20"
            />
            {/* Animated particles/glow effect simulation */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto relative z-20 text-center max-w-5xl">
            <motion.div
              initial="hidden"
              animate="visible"
              transition={{ staggerChildren: 0.2 }}
              variants={fadeIn}
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] text-sm font-medium mb-8 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
                </span>
                Teknoloji ile Geleceği İnşa Ediyoruz
              </motion.div>

              <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight tracking-tight">
                ANKAVERSE® <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                  Yazılım, Otomasyon, Yapay Zekâ ve 
                </span>
                <span className="block text-[#d4af37] mt-2">E-Ticaret Teknolojileri</span>
              </motion.h1>

              <motion.p variants={fadeIn} className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
                ANKAVERSE®, dijital dönüşümün öncüsü olarak işletmelere özel teknolojik çözümler sunar. 
                Güçlü mühendislik altyapımız ve yenilikçi vizyonumuzla, iş süreçlerinizi modernize ediyor, 
                verimliliğinizi artırıyor ve markanızı global standartlara taşıyoruz.
              </motion.p>

              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/iletisim" 
                  className="w-full sm:w-auto px-8 py-4 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-[#f4d678] transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
                >
                  Hemen Başlayın <ArrowRight className="h-5 w-5" />
                </Link>
                <Link 
                  to="/projeler" 
                  className="w-full sm:w-auto px-8 py-4 border border-white/20 bg-white/5 text-white font-bold rounded-lg hover:bg-white/10 hover:border-[#d4af37]/50 transition-all duration-300 backdrop-blur-sm"
                >
                  Projelerimizi İnceleyin
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* WHY ANKAVERSE SECTION */}
        <section className="py-24 bg-[#1a1b1e] relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              
              {/* Left Column: Why Us Points */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div style={{ opacity: 1, transform: 'none' }}>
                  <h2 className="text-[#d4af37] font-semibold tracking-wider uppercase mb-3 text-sm">
                    Neden ANKAVERSE?
                  </h2>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Teknolojiye Sadece Kod Olarak Bakmıyoruz
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    Geleneksel barındırma hizmetlerinin ötesine geçerek, işletmenizin büyümesine doğrudan katkı sağlayan stratejik teknoloji ortağınız oluyoruz. Başarımızı, sunduğumuz sunucu kapasitesiyle değil, yarattığımız katma değerle ölçüyoruz.
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Point 1 */}
                  <div className="flex gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-[#d4af37]/30" style={{ opacity: 1, transform: 'none' }}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-database w-6 h-6">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                        <path d="M3 12A9 3 0 0 0 21 12"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Veri Odaklı Çözümler</h4>
                      <p className="text-sm text-gray-400">Kararlarımızı ve tasarımlarımızı varsayımlara değil, somut verilere ve analitik içgörülere dayandırıyoruz.</p>
                    </div>
                  </div>
                  
                  {/* Point 2 */}
                  <div className="flex gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-[#d4af37]/30" style={{ opacity: 1, transform: 'none' }}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers w-6 h-6">
                        <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"></path>
                        <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
                        <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Teknik Mükemmeliyet</h4>
                      <p className="text-sm text-gray-400">Kod kalitesi, güvenlik ve performans konularında endüstri standartlarının ötesini hedefliyoruz.</p>
                    </div>
                  </div>
                  
                  {/* Point 3 */}
                  <div className="flex gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-[#d4af37]/30" style={{ opacity: 1, transform: 'none' }}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield w-6 h-6">
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Sürdürülebilir Mimari</h4>
                      <p className="text-sm text-gray-400">Bugünün ihtiyaçlarını karşılarken yarının teknolojilerine uyumlu, esnek ve uzun ömürlü sistemler inşa ediyoruz.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Services Grid (Mapped from State) */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#d4af37]/20 to-purple-500/20 blur-3xl opacity-30 rounded-full"></div>
                <div className="relative grid sm:grid-cols-2 gap-4">
                  {services.length > 0 ? services.map((service, index) => (
                    <div
                      key={service.id}
                      className={`p-6 rounded-2xl bg-[#222] border border-gray-800 hover:border-[#d4af37]/50 transition-all duration-300 group ${index === services.length - 1 && services.length % 2 !== 0 ? 'sm:col-span-2' : ''}`}
                      style={{ opacity: 1, transform: 'none' }}
                    >
                      <div className="mb-4 transform group-hover:scale-105 transition-transform duration-300 text-[#d4af37]">
                        {/* Clone the icon element to add classes if needed, or wrap it */}
                        <div className="w-8 h-8 text-[#d4af37]">
                          {service.icon}
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors">
                        {service.title}
                      </h4>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        {service.desc}
                      </p>
                    </div>
                  )) : (
                    // Optional fallback if no services
                    <div className="col-span-2 text-center text-gray-500">Hizmetler yükleniyor...</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-20 bg-[#111] border-t border-[#333]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Projenizi Hayata Geçirmeye Hazır mısınız?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Siz hayal edin, ANKAVERSE teknolojisiyle gerçeğe dönüştürelim. Hemen bizimle iletişime geçin ve dijital dönüşüm yolculuğunuza başlayın.
            </p>
            <Link 
              to="/iletisim" 
              className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-[#d4af37] to-[#f4d678] text-black font-bold text-lg rounded-lg shadow-lg hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-1"
            >
              Teklif Alın <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
};

export default CorporateHome;