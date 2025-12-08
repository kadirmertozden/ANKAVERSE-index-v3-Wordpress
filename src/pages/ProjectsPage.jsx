
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { projects } from '@/data/projects';
import { ArrowRight, Eye } from 'lucide-react';

const ProjectsPage = () => {
  return (
    <>
      <Helmet>
        <title>Ankaverse - Projeler</title>
        <meta name="description" content="Ankaverse Projeler - Tamamladığımız başarılı dijital projeler." />
      </Helmet>
      <Navbar />
      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        {/* Header Section */}
        <section className="py-20 bg-[#111] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[#d4af37]/5 skew-x-12 transform origin-bottom" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl">
              <span className="text-[#d4af37] font-bold tracking-wider text-sm uppercase mb-4 block">Portfolyo</span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Başarı Hikayelerimiz</h1>
              <p className="text-xl text-gray-400 leading-relaxed">
                BU SAYFA YAKINDA GÜNCELLENECEKTİR. ŞU ANKİ PROJELER DENEME AMAÇLI KONULMUŞTUR.
                
              </p> 
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-24 bg-[#1a1b1e]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-[#25262b] rounded-xl overflow-hidden border border-white/5 shadow-lg hover:shadow-xl hover:shadow-[#d4af37]/10 transition-all duration-300"
                >
                  <Link to={`/projeler/${project.id}`} className="block h-full">
                    {/* Image Container */}
                    <div className="aspect-video overflow-hidden relative">
                      <img 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                        src={project.image}
                        alt={project.title}
                        loading="lazy" 
                      />
                      
                      {/* Overlay - Darkens on hover */}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/60 transition-colors duration-300 z-10" />
                      
                      {/* Category Tag */}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                          {project.category}
                        </span>
                      </div>

                      {/* Centered Hover Action Icon */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-[#d4af37] text-black p-3 rounded-full transform scale-50 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                          <Eye className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Content Container */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                        {project.summary}
                      </p>
                      
                      <div className="flex items-center text-[#d4af37] text-sm font-medium mt-auto">
                        İncele <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
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

export default ProjectsPage;
