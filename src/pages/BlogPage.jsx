
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Calendar, Clock, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getBlogPosts } from '@/services/api';
import { calculateReadTime, stripHtml, decodeHtml } from '@/lib/utils';

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchQuery = searchParams.get('search');
  const categoryId = searchParams.get('category');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (categoryId) params.categories = categoryId;

        const data = await getBlogPosts(page, 9, params);
        
        // Map WordPress API data to component format
        const formattedPosts = data.map(post => ({
          id: post.id,
          title: decodeHtml(post.title.rendered),
          excerpt: stripHtml(post.excerpt.rendered).replace(/\{"parts":\[.*\]\}/g, ''), // Basic cleanup for JSON artifacts if visible
          image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/800x600?text=No+Image',
          date: new Date(post.date).toLocaleDateString('tr-TR'),
          category: post._embedded?.['wp:term']?.flat().find(term => term.taxonomy === 'category')?.name || 'Genel',
          readTime: calculateReadTime(post.content.rendered),
          author: {
            name: post._embedded?.author?.[0]?.name === 'kadirmertozden' ? 'Kadir Mert Özden' : (post._embedded?.author?.[0]?.name || 'Admin'),
            avatar: post._embedded?.author?.[0]?.avatar_urls?.['48'] || 'https://via.placeholder.com/48'
          }
        }));
        
        setPosts(formattedPosts);
        // Note: Total pages should ideally come from headers, but fetchFromAPI returns json directly.
        // We might need to adjust fetchFromAPI to return headers or handle pagination metadata if available.
        // For now, we'll assume if we got full page of posts, there might be more.
        // A better approach would be to update fetchFromAPI to return { data, headers } or similar.
        
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Yazılar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    window.scrollTo(0, 0);
  }, [page, searchQuery, categoryId]);

  const handlePrevPage = () => {
    if (page > 1) setPage(p => p - 1);
  };

  const handleNextPage = () => {
    setPage(p => p + 1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(1);
  };

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
                
                {(searchQuery || categoryId) && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-full hover:bg-red-500/20 transition-colors text-sm"
                    >
                      <X className="w-4 h-4" /> Filtreleri Temizle
                      {searchQuery && <span className="font-bold">"{searchQuery}"</span>}
                      {categoryId && <span className="font-bold">(Kategori ID: {categoryId})</span>}
                    </button>
                  </div>
                )}
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

             {/* Simple Pagination Controls */}
             {!loading && !error && posts.length > 0 && (
               <div className="flex justify-center mt-12 gap-4">
                 <button
                   onClick={handlePrevPage}
                   disabled={page === 1}
                   className="flex items-center gap-2 px-6 py-3 bg-[#25262b] border border-white/10 rounded-lg text-white hover:bg-[#d4af37] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                   <ChevronLeft className="w-4 h-4" /> Önceki
                 </button>
                 <button
                   onClick={handleNextPage}
                   // Disable if we have fewer posts than per_page (9), implying last page
                   disabled={posts.length < 9}
                   className="flex items-center gap-2 px-6 py-3 bg-[#25262b] border border-white/10 rounded-lg text-white hover:bg-[#d4af37] hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                 >
                   Sonraki <ChevronRight className="w-4 h-4" />
                 </button>
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
