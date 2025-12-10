import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MapPin, Phone, Zap, Loader2 } from 'lucide-react';
import { submitContactForm } from '@/services/api';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    // WordPress Contact Form 7 ID
    const FORM_ID = 203;

    try {
      const data = {
        'your-name': formData.name,
        'your-email': formData.email,
        'your-phone': formData.phone,
        'your-subject': formData.subject,
        'your-message': formData.message
      };
      
      const result = await submitContactForm(FORM_ID, data);
      
      if (result.status === 'mail_sent') {
        setStatus({ type: 'success', message: 'Mesajınız başarıyla gönderildi.' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ type: 'error', message: result.message || 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Ankaverse - İletişim</title>
        <meta name="description" content="Ankaverse İletişim - Bizimle iletişime geçin." />
      </Helmet>
      <Navbar />
      <main className="bg-[#1a1b1e] text-white pt-20 min-h-screen">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-[#d4af37] font-bold tracking-wider text-sm uppercase mb-2 block">İletişim</span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Bizimle İletişime Geçin</h1>
            </div>

            <div className="max-w-5xl mx-auto bg-[#25262b] rounded-2xl overflow-hidden shadow-2xl border border-[#333]">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                
                {/* Form Info */}
                <div className="p-10 lg:p-12 bg-[#111] text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-6">İletişim Bilgileri</h3>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                      Projeleriniz için bir kahve eşliğinde tanışalım. Size en uygun çözümleri sunmak için buradayız.
                    </p>
                    
                    <div className="space-y-6">
                       <div className="flex items-start gap-4">
                         <div className="p-3 bg-[#25262b] rounded-lg text-[#d4af37]">
                           <MapPin className="h-6 w-6" />
                         </div>
                         <div>
                           <h4 className="font-bold text-white">Adres</h4>
                           <p className="text-gray-400 text-sm">Fenerbahçe Mah. İğrıp Sk. No:13 İç Kapı No:1 Kadıköy / İstanbul</p>
                         </div>
                       </div>
                       <div className="flex items-start gap-4">
                         <div className="p-3 bg-[#25262b] rounded-lg text-[#d4af37]">
                           <Phone className="h-6 w-6" />
                         </div>
                         <div>
                           <h4 className="font-bold text-white">Telefon</h4>
                           <p className="text-gray-400 text-sm">+90 (538) 495 16 96</p>
                         </div>
                       </div>
                       <div className="flex items-start gap-4">
                         <div className="p-3 bg-[#25262b] rounded-lg text-[#d4af37]">
                           <Zap className="h-6 w-6" />
                         </div>
                         <div>
                           <h4 className="font-bold text-white">E-Posta</h4>
                           <p className="text-gray-400 text-sm">info@ankaverse.com.tr</p>
                         </div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-[#333]">
                    <p className="text-xs text-gray-500">© 2025 ANKAVERSE</p>
                  </div>
                </div>

                {/* Form */}
                <div className="p-10 lg:p-12 bg-[#1f2024]">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Adınız Soyadınız</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-[#1a1b1e] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="Örn: Ahmet Yılmaz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">E-Posta Adresiniz</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-[#1a1b1e] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="orn@sirket.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Telefon Numarası</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-[#1a1b1e] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Konu</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-[#1a1b1e] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="Mesajınızın konusu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Mesajınız</label>
                      <textarea
                        rows="4"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-[#1a1b1e] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
                        placeholder="Projenizden bahsedin..."
                      ></textarea>
                    </div>
                    {status && (
                      <div className={`p-4 rounded-lg mb-4 ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {status.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-lg hover:bg-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Gönderiliyor...
                        </>
                      ) : (
                        'Gönder'
                      )}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage;