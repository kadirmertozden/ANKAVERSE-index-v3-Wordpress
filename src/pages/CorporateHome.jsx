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

const CorporateHome = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const services = [
    {
      icon: <Code className="h-8 w-8" />,
      title: "Yazılım Geliştirme",
      desc: "İşletmenizin ihtiyaçlarına özel, yüksek performanslı, güvenli ve ölçeklenebilir web, mobil ve masaüstü yazılım çözümleri."
    },
    {
      icon: <Workflow className="h-8 w-8" />,
      title: "Otomasyon & Entegrasyon",
      desc: "İş süreçlerinizi hızlandıran, insan hatasını minimize eden otomasyon sistemleri ve karmaşık API entegrasyonları."
    },
    {
      icon: <ShoppingCart className="h-8 w-8" />,
      title: "E-Ticaret Teknolojileri",
      desc: "Modern, kullanıcı dostu ve dönüşüm odaklı e-ticaret altyapıları ile dijital satış kanallarınızı güçlendiriyoruz."
    },
    {
      icon: <BrainCircuit className="h-8 w-8" />,
      title: "Yapay Zekâ Uygulamaları",
      desc: "Veri analizi, makine öğrenimi ve doğal dil işleme teknolojileriyle işinize akıl katan geleceğin çözümleri."
    },
    {
      icon: <Box className="h-8 w-8" />,
      title: "3D Modelleme",
      desc: "Ürün görselleştirme, oyun geliştirme ve sanal gerçeklik projeleri için profesyonel 3D modelleme hizmetleri."
    }
  ];

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

        {/* SERVICES SECTION */}
        <section className="py-24 bg-[#111] relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Hizmet Alanlarımız</h2>
              <div className="h-1 w-24 bg-[#d4af37] mx-auto rounded-full"></div>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                Uçtan uca dijital çözümlerle işinizi büyütüyoruz.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 justify-center">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-[#1a1b1e] p-8 rounded-2xl border border-[#333] hover:border-[#d4af37] transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]"
                >
                  <div className="h-14 w-14 bg-[#25262b] rounded-xl flex items-center justify-center text-[#d4af37] mb-6 group-hover:scale-110 transition-transform duration-300 border border-[#333] group-hover:border-[#d4af37]/30">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {service.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY ANKAVERSE SECTION */}
        <section className="py-24 bg-[#1a1b1e] relative overflow-hidden">
          {/* Decorative BG */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#d4af37]/5 to-transparent pointer-events-none"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              
              {/* Left Content */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-[#d4af37] font-bold tracking-wider text-sm uppercase mb-2 block">Neden Biz?</span>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                    Neden <span className="text-[#d4af37]">ANKAVERSE?</span>
                  </h2>
                  <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                    Teknoloji dünyasında fark yaratmak için sadece kod yazmak yetmez. Biz, sürdürülebilir, güvenli ve yüksek performanslı sistemler inşa ediyoruz.
                  </p>

                  <div className="space-y-6">
                    {whyUsPoints.map((point, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-[#333]"
                      >
                        <div className="mt-1 text-[#d4af37] bg-[#d4af37]/10 p-2 rounded-lg">
                          {point.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">{point.title}</h4>
                          <p className="text-gray-400 text-sm">{point.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Image/Visual */}
              <div className="w-full lg:w-1/2 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-[#333] group"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" 
                    alt="Advanced Technology Server Room" 
                    className="w-full h-auto transform group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Floating Card Overlay */}
                  <div className="absolute bottom-8 left-8 right-8 z-20 bg-[#1a1b1e]/90 backdrop-blur-md p-6 rounded-xl border border-[#d4af37]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold">Sistem Durumu</span>
                      <span className="flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div className="bg-[#d4af37] h-2 rounded-full" style={{ width: '98%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Uptime: %99.9</span>
                      <span>Performans: Optimum</span>
                    </div>
                  </div>
                </motion.div>

                {/* Decorative background elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4af37]/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl"></div>
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