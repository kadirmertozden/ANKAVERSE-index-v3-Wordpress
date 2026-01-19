import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Code2, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getProjectById, getMediaById } from '@/services/api';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // API çağrısı (Not: getProjectById fonksiyonunda URL sonuna '?_embed' eklendiğinden emin olmalısın)
        const data = await getProjectById(id);
        
        // ACF verilerinin güvenli kontrolü (Boş gelirse boş obje ata)
        const acf = data.acf || {};

        // İkincil görsel işlemleri
        let secondaryImageUrl = null;
        if (acf.ikincil_gorsel) {
          if (typeof acf.ikincil_gorsel === 'string') {
            // URL olarak geliyorsa direkt al
            secondaryImageUrl = acf.ikincil_gorsel;
          } else if (typeof acf.ikincil_gorsel === 'number') {
            // ID olarak geliyorsa fetch et
            try {
              const mediaData = await getMediaById(acf.ikincil_gorsel);
              secondaryImageUrl = mediaData.source_url;
            } catch (e) {
              console.error('İkincil görsel çekilemedi:', e);
            }
          } else if (acf.ikincil_gorsel.url) {
            // Obje olarak geliyorsa url'i al
            secondaryImageUrl = acf.ikincil_gorsel.url;
          }
        }

        // Teknolojiler alanının işlenmesi (String veya Array gelebilir)
        let technologiesArray = [];
        if (acf.teknolojiler) {
          if (Array.isArray(acf.teknolojiler)) {
             // Zaten dizi ise (Checkbox vb.)
             technologiesArray = acf.teknolojiler;
          } else if (typeof acf.teknolojiler === 'string') {
             // String ise virgül veya yeni satıra göre böl
             technologiesArray = acf.teknolojiler.split(/,|\r\n|\n|\r/).map(t => t.trim()).filter(t => t !== '');
          }
        }

        // Tarih formatlama
        let formattedDate = new Date(data.date).toLocaleDateString('tr-TR');
        if (acf.tarih && acf.tarih.length === 8) {
          // YYYYMMDD formatı gelirse
          formattedDate = `${acf.tarih.substring(6, 8)}.${acf.tarih.substring(4, 6)}.${acf.tarih.substring(0, 4)}`;
        }

        // HTML İçeriği Temizleme (Excerpt için)
        const summaryText = data.excerpt?.rendered 
          ? data.excerpt.rendered.replace(/<[^>]+>/g, '') 
          : '';

        const formattedProject = {
          id: data.id,
          title: data.title?.rendered || 'Başlıksız Proje',
          // Content'i olduğu gibi HTML olarak saklıyoruz, render ederken kullanacağız
          contentHtml: data.content?.rendered || '', 
          summary: summaryText,
          // Görsel yoksa placeholder kullan
          image: data._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/1200x600?text=Gorsel+Yok',
          category: acf.kategori || 'Genel',
          client: acf.musteri || 'Belirtilmedi',
          date: formattedDate,
          technologies: technologiesArray,
          secondaryImage: secondaryImageUrl
        };
        
        setProject(formattedProject);
      } catch (err) {
        console.error('Proje detayı hatası:', err);
        setError('Proje verisi alınamadı.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
      window.scrollTo(0, 0);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#1a1b1e] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4 text-red-400">Bir Hata Oluştu</h2>
        <p className="text-gray-400 mb-6">{error || 'Proje bulunamadı.'}</p>
        <Link to="/projeler" className="text-[#d4af37] hover:underline px-6 py-2 border border-[#d4af37] rounded-lg">
          Projelere Dön
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${project.title} - Ankaverse`}</title>
        <meta name="description" content={project.summary} />
      </Helmet>
      <Navbar />
      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        {/* Hero Section */}
        <div className="relative h-[60vh] w-full overflow-hidden bg-gray-900">
          <div className="absolute inset-0 bg-black/60 z-10" />
          <img 
            src={project.image} 
            alt={project.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-center px-4">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#d4af37] font-bold tracking-wider uppercase mb-4 bg-black/40 px-4 py-1 rounded-full backdrop-blur-md border border-[#d4af37]/20"
            >
              {project.category}
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-xl max-w-4xl"
            >
              <span dangerouslySetInnerHTML={{ __html: project.title }} />
            </motion.h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 -mt-20 relative z-30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#25262b] p-8 rounded-2xl border border-white/5 shadow-2xl"
              >
                <h2 className="text-2xl font-bold mb-6 text-white border-b border-white/10 pb-4">Proje Detayları</h2>
                
                {/* HTML İçeriği Güvenli Şekilde Yazdırma */}
                {/* WordPress içeriği genellikle p etiketleriyle gelir, o yüzden stil veriyoruz */}
                <div 
                  className="text-gray-300 leading-relaxed text-lg prose prose-invert max-w-none prose-p:mb-4 prose-a:text-[#d4af37]"
                  dangerouslySetInnerHTML={{ __html: project.contentHtml }}
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#25262b] p-8 rounded-2xl border border-white/5 shadow-2xl"
              >
                <h2 className="text-2xl font-bold mb-6 text-white">Proje Görselleri</h2>
                <div className={`grid grid-cols-1 ${project.secondaryImage ? 'md:grid-cols-2' : ''} gap-6`}>
                   <div className="rounded-xl overflow-hidden h-72 bg-gray-800 border border-white/10 group">
                      <img
                        src={project.image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt={`${project.title} - Ana Görsel`}
                        loading="lazy"
                      />
                   </div>
                   {project.secondaryImage && (
                     <div className="rounded-xl overflow-hidden h-72 bg-gray-800 border border-white/10 group">
                        <img
                          src={project.secondaryImage}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={`Detaylı görünüm - ${project.title}`}
                          loading="lazy"
                        />
                     </div>
                   )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#25262b] p-6 rounded-2xl border border-white/5 shadow-2xl sticky top-24"
              >
                <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4 text-[#d4af37]">Bilgi Kartı</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 bg-[#d4af37]/10 rounded-xl text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
                      <User size={22} />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Müşteri</span>
                      <span className="font-medium text-white text-lg">{project.client}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="p-3 bg-[#d4af37]/10 rounded-xl text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Tarih</span>
                      <span className="font-medium text-white text-lg">{project.date}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="p-3 bg-[#d4af37]/10 rounded-xl text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
                      <Code2 size={22} />
                    </div>
                    <div className="w-full">
                      <span className="text-sm text-gray-500 block mb-2">Teknolojiler</span>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.length > 0 ? (
                          project.technologies.map((tech, idx) => (
                            <span key={idx} className="text-xs font-medium bg-white/5 px-3 py-1.5 rounded-md text-gray-300 border border-white/10 hover:border-[#d4af37]/50 transition-colors">
                              {tech}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                   <Link to="/iletisim" className="block w-full">
                      <button className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#bfa030] hover:from-[#c4a030] hover:to-[#a08525] text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-[#d4af37]/20 transform hover:-translate-y-1">
                        Benzer Proje Başlat
                      </button>
                   </Link>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-16 pb-8">
             <Link to="/projeler" className="inline-flex items-center text-gray-400 hover:text-[#d4af37] transition-colors group">
               <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
               Tüm Projelere Dön
             </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProjectDetailPage;