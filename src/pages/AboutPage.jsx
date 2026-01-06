import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { 
  Building2, 
  FileText, 
  Target, 
  Compass, 
  MapPin, 
  Calendar, 
  Hash, 
  Award,
  Landmark
} from 'lucide-react';

const AboutPage = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const officialInfo = [
    { label: "Unvan", value: "ANKAVERSE E-Ticaret ve Teknoloji Ltd. Şti.", icon: <Building2 className="h-4 w-4" /> },
    { label: "MERSİS No", value: "0070121668800001", icon: <Hash className="h-4 w-4" /> },
    { label: "Ticaret Sicil No / Dosya No", value: "1089705", icon: <FileText className="h-4 w-4" /> },
    { label: "Vergi Dairesi / No", value: "GÖZTEPE VERGİ DAİRESİ / 0701216688", icon: <Landmark className="h-4 w-4" /> },
    { label: "Ticaret Sicili Müdürlüğü", value: "İSTANBUL TİCARET SİCİLİ MÜDÜRLÜĞÜ", icon: <Landmark className="h-4 w-4" /> },
    { label: "Firma Türü", value: "ORTAK SAYISI BİRDEN FAZLA LİMİTED ŞİRKET", icon: <Building2 className="h-4 w-4" /> },
    { label: "Kuruluş Tarihi", value: "09.07.2025", icon: <Calendar className="h-4 w-4" /> },
    { label: "Adres", value: "Kadıköy / İstanbul", icon: <MapPin className="h-4 w-4" /> },
    { label: "Marka Durumu", value: "ANKAVERSE", icon: <Award className="h-4 w-4" /> },
  ];

  return (
    <>
      <Helmet>
        <title>Ankaverse - Hakkımızda</title>
        <meta name="description" content="Ankaverse Hakkımızda - Kurumsal bilgiler, vizyon, misyon ve resmi şirket detayları." />
      </Helmet>
      <Navbar />
      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen flex flex-col">
        
        {/* Header Section */}
        <section className="relative py-20 bg-[#111] overflow-hidden">
           <div className="absolute inset-0 bg-cover bg-center opacity-10">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" alt="Corporate Architecture" className="w-full h-full object-cover" />
           </div>
           <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent"></div>
           <div className="container mx-auto px-4 relative z-10 text-center">
             <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.6 }}>
               <span className="text-[#d4af37] font-bold tracking-widest text-sm uppercase mb-3 block">Kurumsal</span>
               <h1 className="text-4xl md:text-5xl font-bold mb-6">Hakkımızda</h1>
               <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                 Teknoloji ve inovasyonun kesişim noktasında, işletmeleri geleceğe taşıyoruz.
               </p>
             </motion.div>
           </div>
        </section>

        {/* Company Profile */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="w-full text-center" /* Added text-center here */
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3"> {/* Added justify-center */}
                <span className="w-1 h-8 bg-[#d4af37] rounded-full block"></span>
                Şirket Profili
              </h2>
              <div className="space-y-4 text-gray-300 leading-relaxed text-lg max-w-4xl mx-auto"> {/* Added mx-auto */}
                <p>
                  <strong className="text-white">ANKAVERSE E-Ticaret ve Teknoloji Ltd. Şti.</strong>, dijital dünyanın karmaşık yapısında işletmelere rehberlik eden, modern teknolojileri iş süreçlerine entegre eden güvenilir bir teknoloji ortağıdır.
                </p>
                <p>
                  Kurulduğumuz günden bu yana, yazılım geliştirme, otomasyon sistemleri ve yapay zeka tabanlı çözümlerimizle sektörde fark yaratmayı hedefledik. Müşterilerimizin dijital dönüşüm yolculuklarında sadece bir hizmet sağlayıcı değil, aynı zamanda stratejik bir çözüm ortağı olarak yer alıyoruz.
                </p>
                <p>
                  Yenilikçi bakış açımız, güçlü teknik altyapımız ve uzman kadromuzla, e-ticaret dünyasının dinamiklerine uygun, ölçeklenebilir, güvenli ve sürdürülebilir projeler geliştiriyoruz.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 bg-[#25262b] relative">
           <div className="container mx-auto px-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Vision */}
               <motion.div 
                 className="bg-[#1a1b1e] p-8 md:p-10 rounded-2xl border border-[#333] hover:border-[#d4af37]/50 transition-all duration-300 group relative overflow-hidden"
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5 }}
               >
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Compass className="w-32 h-32 text-[#d4af37]" />
                 </div>
                 <div className="relative z-10">
                   <div className="w-14 h-14 bg-[#d4af37]/10 rounded-xl flex items-center justify-center text-[#d4af37] mb-6 border border-[#d4af37]/20">
                     <Compass className="h-7 w-7" />
                   </div>
                   <h3 className="text-2xl font-bold mb-4 text-white">Vizyonumuz</h3>
                   <p className="text-gray-400 leading-relaxed">
                     Teknoloji dünyasında global standartları belirleyen, sürdürülebilir ve insan odaklı çözümlerle geleceği şekillendiren, Türkiye'den dünyaya açılan lider bir teknoloji markası olmak. Sınırsız inovasyon anlayışımızla dijital sınırları zorlayarak ekosisteme yön vermek.
                   </p>
                 </div>
               </motion.div>

               {/* Mission */}
               <motion.div 
                 className="bg-[#1a1b1e] p-8 md:p-10 rounded-2xl border border-[#333] hover:border-[#d4af37]/50 transition-all duration-300 group relative overflow-hidden"
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: 0.2 }}
               >
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Target className="w-32 h-32 text-[#d4af37]" />
                 </div>
                 <div className="relative z-10">
                   <div className="w-14 h-14 bg-[#d4af37]/10 rounded-xl flex items-center justify-center text-[#d4af37] mb-6 border border-[#d4af37]/20">
                     <Target className="h-7 w-7" />
                   </div>
                   <h3 className="text-2xl font-bold mb-4 text-white">Misyonumuz</h3>
                   <p className="text-gray-400 leading-relaxed">
                     Müşterilerimizin dijital potansiyellerini en üst seviyeye çıkarmak için güvenilir, yenilikçi ve yüksek performanslı teknoloji çözümleri üretmek. Etik değerlere bağlı kalarak, iş ortaklarımızın büyümesine katkı sağlamak ve topluma katma değer sunan projeler geliştirmek.
                   </p>
                 </div>
               </motion.div>
             </div>
           </div>
        </section>

        {/* Official Information */}
        <section className="py-24 bg-[#1a1b1e]">
          <div className="container mx-auto px-4 max-w-3xl">
             <div className="text-center mb-10">
               <h2 className="text-3xl font-bold mb-4">Resmi Bilgiler</h2>
               <div className="h-1 w-16 bg-[#d4af37] mx-auto rounded-full"></div>
               <p className="text-gray-400 mt-4 text-sm">Şirketimizin yasal ve resmi kayıt bilgileri aşağıdadır.</p>
             </div>
             
             <div className="bg-[#25262b] rounded-xl border border-[#333] overflow-hidden text-sm">
               {officialInfo.map((item, index) => (
                 <motion.div 
                   key={index}
                   className={`flex items-center gap-4 p-4 ${index !== officialInfo.length - 1 ? 'border-b border-[#333]' : ''} hover:bg-[#2c2e33] transition-colors`}
                   initial={{ opacity: 0, x: -10 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ duration: 0.3, delay: index * 0.05 }}
                 >
                   <div className="text-[#d4af37] bg-[#d4af37]/10 p-2 rounded-md shrink-0">
                     {item.icon}
                   </div>
                   <span className="text-gray-400 font-medium w-32 shrink-0">{item.label}:</span>
                   <span className="text-white font-semibold flex-grow break-words">{item.value}</span>
                 </motion.div>
               ))}
             </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default AboutPage;
