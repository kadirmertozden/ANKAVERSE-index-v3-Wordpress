
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Workflow, 
  ShoppingCart, 
  BrainCircuit, 
  Box,
  CheckCircle2
} from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      id: "yazilim",
      icon: <Code2 className="h-12 w-12 text-[#d4af37]" />,
      title: 'Yazılım Geliştirme',
      description: 'Modern teknolojilerle ölçeklenebilir ve güvenli kurumsal yazılım çözümleri sunuyoruz.',
      features: [
        'API tabanlı kurumsal çözümler',
        'Web ve yönetim paneli geliştirme',
        'Gelişmiş veri doğrulama mekanizmaları',
        'Python / Node.js / .NET altyapıları',
        'MSSQL / PostgreSQL / Redis veritabanı yönetimi',
        'Docker ve mikro servis mimarileri'
      ]
    },
    {
      id: "otomasyon",
      icon: <Workflow className="h-12 w-12 text-[#d4af37]" />,
      title: 'Otomasyon & Entegrasyon',
      description: 'İş süreçlerinizi hızlandıran akıllı otomasyonlar ve kesintisiz entegrasyon sistemleri.',
      features: [
        'n8n workflow otomasyonları',
        'Cron tabanlı periyodik veri işleme',
        'Telegram bot ve tetikleyici entegrasyonları',
        'XML / CSV veri ayrıştırma ve işleme',
        'Pazaryeri API entegrasyonları',
        'Veri akışı optimizasyonu ve sunucu performansı'
      ]
    },
    {
      id: "eticaret",
      icon: <ShoppingCart className="h-12 w-12 text-[#d4af37]" />,
      title: 'E-Ticaret Teknolojileri',
      description: 'Büyük ölçekli e-ticaret operasyonları için veri yönetimi ve altyapı çözümleri.',
      features: [
        'Büyük ölçekli ürün veri yönetimi',
        '10.000+ SKU için optimize edilmiş pipeline',
        'HTML açıklama ve içerik otomasyonu',
        'Görsel standartlaştırma süreçleri',
        'Hepsiburada / Trendyol tam uyumluluk',
        'N8N + AI hibrit sistem entegrasyonları'
      ]
    },
    {
      id: "yapayzeka",
      icon: <BrainCircuit className="h-12 w-12 text-[#d4af37]" />,
      title: 'Yapay Zekâ Çözümleri',
      description: 'İşletmenize özel yapay zeka modelleri ile verimliliği artıran akıllı analizler.',
      features: [
        'Domain-specific Türkçe NLP modelleri',
        'Otomatik içerik doğrulama sistemleri',
        'Akıllı ürün varyant tespit algoritmaları',
        'Büyük veri temizleme ve düzenleme',
        'LLM tabanlı derinlemesine analiz',
        'AI destekli operasyonel otomasyon'
      ]
    },
    {
      id: "3dmodel",
      icon: <Box className="h-12 w-12 text-[#d4af37]" />,
      title: '3D Modelleme & Dijital Üretim',
      description: 'Endüstriyel tasarım ve görselleştirme ihtiyaçlarınız için profesyonel 3D çözümler.',
      features: [
        'Endüstriyel ürün modellemeleri',
        'Profesyonel CAD teknik çizimleri',
        'Fotorealistik render ve animasyon',
        'Prototip üretim dosyaları hazırlama',
        'Simülasyon ve tasarım doğrulama analizleri',
        'Üretime hazır dijital modelleme',
        '3D Mimari Görselleştirme'
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Ankaverse - Hizmetler</title>
        <meta name="description" content="Ankaverse Hizmetler - Yazılım Geliştirme, Otomasyon, E-Ticaret Altyapısı, Yapay Zeka ve 3D Modelleme Çözümleri." />
      </Helmet>
      <Navbar />
      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#d4af37]/5 to-transparent pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-r from-[#d4af37]/5 to-transparent pointer-events-none"></div>

           <div className="container mx-auto px-4 relative z-10">
             <motion.div 
               className="text-center max-w-3xl mx-auto mb-16"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
             >
                <span className="text-[#d4af37] font-bold tracking-wider text-sm uppercase mb-3 block">Uzmanlık Alanlarımız</span>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Teknolojik Çözümler</h1>
                <p className="text-gray-400 text-lg leading-relaxed">
                  Dijital dönüşüm yolculuğunuzda, en son teknolojileri kullanarak işletmenize özel, ölçeklenebilir ve sürdürülebilir çözümler üretiyoruz.
                </p>
             </motion.div>

             <div className="space-y-24">
                {services.map((service, index) => (
                  <motion.div 
                    key={service.id}
                    id={service.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7 }}
                    className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
                  >
                    {/* Icon & Image Area */}
                    <div className="w-full lg:w-1/2">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-[#d4af37]/10 rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-300"></div>
                        <div className="relative bg-[#25262b] p-10 rounded-2xl border border-[#333] shadow-2xl hover:border-[#d4af37]/30 transition-colors">
                          <div className="bg-[#1a1b1e] w-20 h-20 rounded-xl flex items-center justify-center mb-6 border border-[#333] group-hover:border-[#d4af37]/50 transition-colors">
                            {service.icon}
                          </div>
                          <h3 className="text-3xl font-bold mb-4">{service.title}</h3>
                          <p className="text-gray-400 text-lg leading-relaxed">{service.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="w-full lg:w-1/2">
                      <div className="pl-0 lg:pl-8">
                        <h4 className="text-xl font-semibold text-[#d4af37] mb-6 flex items-center gap-2">
                          <span className="h-px w-8 bg-[#d4af37]"></span>
                          Neler Sunuyoruz?
                        </h4>
                        <ul className="space-y-4">
                          {service.features.map((feature, fIndex) => (
                            <motion.li 
                              key={fIndex}
                              className="flex items-start gap-3"
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: fIndex * 0.1 }}
                            >
                              <CheckCircle2 className="h-6 w-6 text-[#d4af37] shrink-0 mt-0.5" />
                              <span className="text-gray-300 text-lg">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                ))}
             </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#111] border-t border-[#333]">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Projenizi Hayata Geçirelim</h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              İhtiyaçlarınıza özel çözümlerimiz hakkında detaylı bilgi almak ve teklif oluşturmak için bizimle iletişime geçin.
            </p>
            <Link 
              to="/iletisim" 
              className="inline-block px-8 py-4 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors duration-300 shadow-lg hover:shadow-[#d4af37]/20"
            >
              Hemen İletişime Geçin
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default ServicesPage;
