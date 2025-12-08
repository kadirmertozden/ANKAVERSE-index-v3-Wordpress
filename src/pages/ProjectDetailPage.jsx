
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Code2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { projects } from '@/data/projects';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === parseInt(id));

  useEffect(() => {
    if (!project) {
      navigate('/projeler');
    }
    window.scrollTo(0, 0);
  }, [id, project, navigate]);

  if (!project) return null;

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
          <div className="absolute inset-0 bg-black/50 z-10" />
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
              className="text-[#d4af37] font-bold tracking-wider uppercase mb-4 bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm"
            >
              {project.category}
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg"
            >
              {project.title}
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
                className="bg-[#25262b] p-8 rounded-2xl border border-white/5 shadow-xl"
              >
                <h2 className="text-2xl font-bold mb-4 text-white">Proje Hakkında</h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {project.description}
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#25262b] p-8 rounded-2xl border border-white/5 shadow-xl"
              >
                <h2 className="text-2xl font-bold mb-6 text-white">Proje Görselleri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="rounded-lg overflow-hidden h-64 bg-gray-800">
                      <img 
                        src={project.image} 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                        alt={`${project.title} - Ana Görsel`}
                        loading="lazy" 
                      />
                   </div>
                   <div className="rounded-lg overflow-hidden h-64 bg-gray-800">
                      <img 
                        src={project.secondaryImage || project.image} 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                        alt={`Detailed view of ${project.title}`}
                        loading="lazy"
                      />
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#25262b] p-6 rounded-2xl border border-white/5 shadow-xl sticky top-24"
              >
                <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Proje Detayları</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
                      <User size={20} />
                    </div>
                    <div>
                      <span className="text-sm text-gray-400 block mb-1">Müşteri</span>
                      <span className="font-medium text-white">{project.client}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <span className="text-sm text-gray-400 block mb-1">Tarih</span>
                      <span className="font-medium text-white">{project.date}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
                      <Code2 size={20} />
                    </div>
                    <div>
                      <span className="text-sm text-gray-400 block mb-1">Teknolojiler</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.technologies.map((tech, idx) => (
                          <span key={idx} className="text-xs bg-white/5 px-2 py-1 rounded text-gray-300 border border-white/5">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                   <Link to="/iletisim" className="block w-full">
                      <button className="w-full py-3 bg-[#d4af37] hover:bg-[#c4a030] text-black font-bold rounded-lg transition-colors duration-300">
                        Benzer Proje Başlat
                      </button>
                   </Link>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-16">
             <Link to="/projeler" className="inline-flex items-center text-gray-400 hover:text-[#d4af37] transition-colors">
               <ArrowLeft className="mr-2 h-4 w-4" />
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
