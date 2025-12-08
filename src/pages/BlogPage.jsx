
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Calendar, Clock, Loader2 } from 'lucide-react';
import { getBlogPosts } from '@/services/api';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getBlogPosts();
        
        // Map WordPress API data to component format
        const formattedPosts = data.map(post => ({
          id: post.id,
          title: post.title.rendered,
          excerpt: post.excerpt.rendered.replace(/<[^>]+>/g, ''),
          image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/800x600?text=No+Image',
          date: new Date(post.date).toLocaleDateString('tr-TR'),
          category: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Genel', // Getting category from embedded terms
          readTime: '5 dk', // Placeholder or calculate based on word count
          author: {
            name: post._embedded?.author?.[0]?.name || 'Admin',
            avatar: post._embedded?.author?.[0]?.avatar_urls?.['48'] || 'https://via.placeholder.com/48'
          }
        }));
        
        setPosts(formattedPosts);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Yazılar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Helmet>
        <title>Ankaverse - Blog</title>
        <meta name="description" content="Ankaverse Blog - Teknoloji ve dijital dünyadan haberler." />
      </Helmet>
      <Navbar />
      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <span className="text-[#d4af37] font-bold tracking-wider text-sm uppercase mb-2 block">Blog</span>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Haberler ve İçgörüler</h1>
                <p className="text-gray-400 max-w-2xl mx-auto">Dijital dünya, teknoloji trendleri ve şirketimizden son haberler.</p>
             </div>

             {loading ? (
               <div className="flex justify-center items-center min-h-[300px]">
                 <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
               </div>
             ) : error ? (
               <div className="text-center text-red-500 py-10">
                 {error}
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {posts.map((post) => (
                   <Link to={`/blog/${post.id}`} key={post.id} className="group">
                     <article className="bg-[#25262b] h-full rounded-xl overflow-hidden border border-[#333] group-hover:border-[#d4af37]/50 group-hover:transform group-hover:-translate-y-1 transition-all duration-300 flex flex-col shadow-lg">
                       <div className="aspect-video bg-gray-800 overflow-hidden relative">
                         <div className="absolute top-4 left-4 z-10">
                           <span className="bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full">
                             {post.category}
                           </span>
                         </div>
                         <img
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          alt={post.title}
                          src={post.image}
                          loading="lazy"
                         />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                       </div>
                       <div className="p-6 flex-1 flex flex-col">
                         <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                           <div className="flex items-center gap-1">
                             <Calendar className="w-3 h-3 text-[#d4af37]" />
                             <span>{post.date}</span>
                           </div>
                           <div className="flex items-center gap-1">
                             <Clock className="w-3 h-3 text-[#d4af37]" />
                             <span>{post.readTime}</span>
                           </div>
                         </div>
                         
                         <h2 className="text-xl font-bold mb-3 text-white group-hover:text-[#d4af37] transition-colors line-clamp-2">
                          {post.title}
                         </h2>
                         
                         <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                           {post.excerpt}
                         </p>
                         
                         <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                           <div className="flex items-center gap-2">
                              <img src={post.author.avatar} alt={post.author.name} className="w-6 h-6 rounded-full object-cover" />
                              <span className="text-xs text-gray-300">{post.author.name}</span>
                           </div>
                           <span className="text-[#d4af37] text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                             Devamını Oku <ArrowRight className="h-4 w-4" />
                           </span>
                         </div>
                       </div>
                     </article>
                   </Link>
                 ))}
               </div>
             )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BlogPage;
