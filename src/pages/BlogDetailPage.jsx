
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Tag, Share2, ArrowLeft, Facebook, Twitter, Linkedin, ChevronRight, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getBlogPostById, getBlogPosts, getCategories } from '@/services/api';
import { calculateReadTime, stripHtml, decodeHtml } from '@/lib/utils';

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        setLoading(true);
        const postData = await getBlogPostById(id);
        
        // Map API data to component format
        const formattedPost = {
          id: postData.id,
          title: decodeHtml(postData.title.rendered),
          content: postData.content.rendered.replace(/\{"parts":\[.*\]\}/g, ''), // Basic cleanup for JSON artifacts
          excerpt: stripHtml(postData.excerpt.rendered).replace(/\{"parts":\[.*\]\}/g, ''),
          image: postData._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/1200x600?text=No+Image',
          date: new Date(postData.date).toLocaleDateString('tr-TR'),
          category: postData._embedded?.['wp:term']?.flat().find(term => term.taxonomy === 'category')?.name || 'Genel',
          readTime: calculateReadTime(postData.content.rendered),
          tags: postData._embedded?.['wp:term']?.flat().filter(term => term.taxonomy === 'post_tag').map(tag => tag.name) || [],
          author: {
            name: postData._embedded?.author?.[0]?.name || 'Admin',
            role: 'Yazar', // Placeholder or from user meta
            avatar: postData._embedded?.author?.[0]?.avatar_urls?.['96'] || 'https://via.placeholder.com/96'
          }
        };
        
        setPost(formattedPost);

        // Fetch related posts (simple implementation: just get latest posts excluding current)
        const allPosts = await getBlogPosts(1, 3); // Fetch 3 to ensure we have enough after filtering
        const related = allPosts
          .filter(p => p.id !== parseInt(id))
          .slice(0, 2)
          .map(p => ({
            id: p.id,
            title: decodeHtml(p.title.rendered),
            date: new Date(p.date).toLocaleDateString('tr-TR'),
            image: p._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'https://via.placeholder.com/150x150?text=No+Image'
          }));
        setRelatedPosts(related);

        // Fetch categories
        const cats = await getCategories();
        setCategories(cats);

      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Yazı bulunamadı veya yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1b1e] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#d4af37] animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#1a1b1e] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Hata</h2>
        <p className="text-gray-400 mb-6">{error || 'Yazı bulunamadı.'}</p>
        <Link to="/blog" className="text-[#d4af37] hover:underline">
          Blog Listesine Dön
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${post.title} - Ankaverse Blog`}</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>
      <Navbar />
      
      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        {/* Hero Section */}
        <div className="relative w-full h-[50vh] min-h-[400px] bg-gray-900">
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b1e] via-black/50 to-transparent z-10" />
          <img 
            src={post.image} 
            alt={post.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-4 pb-12">
            <div className="max-w-4xl mx-auto">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-wrap items-center gap-3 mb-4 text-sm"
               >
                  <span className="bg-[#d4af37] text-black font-bold px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-gray-300 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Calendar className="w-4 h-4 text-[#d4af37]" /> {post.date}
                  </span>
                  <span className="flex items-center gap-1 text-gray-300 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Clock className="w-4 h-4 text-[#d4af37]" /> {post.readTime}
                  </span>
               </motion.div>
               
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg"
               >
                 {post.title}
               </motion.h1>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            
            {/* Main Content Column */}
            <div className="lg:col-span-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-[#25262b] p-8 md:p-10 rounded-2xl border border-white/5 shadow-xl"
              >
                {/* Content Body */}
                <div 
                  className="prose prose-invert prose-lg max-w-none
                  prose-headings:text-white prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
                  prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                  prose-a:text-[#d4af37] prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:text-gray-300 prose-ul:mb-6
                  prose-li:mb-2
                  prose-blockquote:border-l-4 prose-blockquote:border-[#d4af37] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg
                  "
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />

                {/* Tags */}
                <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
                  <Tag className="w-5 h-5 text-[#d4af37]" />
                  <span className="text-white font-medium mr-2">Etiketler:</span>
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-sm bg-white/5 text-gray-300 px-3 py-1 rounded-full hover:bg-[#d4af37] hover:text-black transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Share */}
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-white font-medium bg-white/5 px-4 py-2 rounded-lg">
                    <Share2 className="w-5 h-5 text-[#d4af37]" />
                    Paylaş
                  </div>
                  <button className="w-10 h-10 rounded-full bg-[#3b5998] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                    <Facebook className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[#1da1f2] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                    <Twitter className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[#0077b5] flex items-center justify-center text-white hover:opacity-80 transition-opacity">
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
              
              {/* Author Box */}
              <div className="mt-8 bg-[#25262b] p-8 rounded-2xl border border-white/5 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                <img 
                  src={post.author.avatar} 
                  alt={post.author.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#d4af37]/20" 
                />
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{post.author.name}</h3>
                  <span className="text-[#d4af37] text-sm font-medium block mb-3">{post.author.role}</span>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Teknoloji ve inovasyon alanında 10 yılı aşkın deneyime sahip. Dijital dönüşüm projelerinde stratejik danışmanlık veriyor ve geleceğin teknolojileri üzerine araştırmalar yapıyor.
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex justify-between">
                 <Link to="/blog" className="flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Blog Listesine Dön
                 </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Search Widget (Visual Only) */}
              <div className="bg-[#25262b] p-6 rounded-2xl border border-white/5 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Arama</h3>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Blogda ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                  <button type="submit" className="absolute right-3 top-3 text-gray-500 hover:text-[#d4af37]">
                     <ChevronRight className="w-5 h-5 rotate-90" />
                  </button>
                </form>
              </div>

              {/* Categories Widget */}
              <div className="bg-[#25262b] p-6 rounded-2xl border border-white/5 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Kategoriler</h3>
                <ul className="space-y-3">
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <Link to={`/blog?category=${cat.id}`} className="flex items-center justify-between text-gray-400 hover:text-[#d4af37] transition-colors group">
                        <span>{cat.name}</span>
                        <span className="bg-white/5 text-xs px-2 py-1 rounded-full group-hover:bg-[#d4af37] group-hover:text-black transition-colors">
                          {cat.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recent Posts Widget */}
              <div className="bg-[#25262b] p-6 rounded-2xl border border-white/5 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-white/10 pb-2">İlginizi Çekebilir</h3>
                <div className="space-y-6">
                  {relatedPosts.map(post => (
                    <Link to={`/blog/${post.id}`} key={post.id} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <div>
                        <span className="text-xs text-[#d4af37] block mb-1">{post.date}</span>
                        <h4 className="text-white text-sm font-bold leading-snug group-hover:text-[#d4af37] transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter Widget */}
              <div className="bg-gradient-to-br from-[#d4af37]/20 to-[#25262b] p-6 rounded-2xl border border-[#d4af37]/20 shadow-lg text-center">
                <h3 className="text-lg font-bold text-white mb-2">Bültene Abone Olun</h3>
                <p className="text-sm text-gray-400 mb-4">En yeni teknoloji haberleri ve içgörüler e-posta kutunuza gelsin.</p>
                <input 
                  type="email" 
                  placeholder="E-posta adresiniz" 
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#d4af37] mb-3"
                />
                <button className="w-full py-2 bg-[#d4af37] text-black font-bold text-sm rounded-lg hover:bg-[#c4a030] transition-colors">
                  Abone Ol
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogDetailPage;
