
import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Loader2,
  Server,
  ShieldCheck,
  Activity,
  Database,
  Layers
} from 'lucide-react';
import { getServices } from '@/services/api';

// Helper to map icon string names to components
const IconMap = {
  'Code2': Code2,
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

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        
        // Map WordPress API data to component format
        const formattedServices = data.map(service => {
          // Get icon component or default to Code2
          const IconComponent = IconMap[service.acf?.ikon_adi] || Code2;
          
          return {
            id: service.slug, // Use slug as ID for anchor links
            icon: <IconComponent className="h-12 w-12 text-[#d4af37]" />,
            title: service.title.rendered,
            description: service.content.rendered.replace(/<[^>]+>/g, ''), // Strip HTML
            features: service.acf?.ozellikler ? service.acf.ozellikler.split(/\r\n|\r|\n/).filter(f => f.trim() !== '') : [] // Handle all types of line breaks
          };
        });
        
        setServices(formattedServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Hizmetler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

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

             {loading ? (
               <div className="flex justify-center items-center min-h-[400px]">
                 <Loader2 className="w-16 h-16 text-[#d4af37] animate-spin" />
               </div>
             ) : error ? (
               <div className="text-center text-red-500 py-10 text-xl">
                 {error}
               </div>
             ) : (
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
             )}
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
