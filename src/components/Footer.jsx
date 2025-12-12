
import React, { useState, useEffect } from 'react';
import { Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getServices } from '@/services/api';
import { decodeHtml } from '@/lib/utils';

const Footer = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        if (data && data.length > 0) {
          setServices(data.slice(0, 5));
        }
      } catch (err) {
        console.error('Footer services fetch error:', err);
      }
    };
    fetchServices();
  }, []);

  return (
    <footer className="bg-[#111] border-t border-[#333] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
               <img 
                src="https://horizons-cdn.hostinger.com/5cf3d390-6a19-42b7-97d6-72347a326ec5/efd54cbb556b696674869e910ac211e2.jpg" 
                alt="ANKAVERSE Logo" 
                className="h-10 w-10 rounded-full border border-[#d4af37]"
              />
              <span className="text-2xl font-bold text-white tracking-widest">ANKAVERSE</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Dijital dünyada markanızı yükselten yenilikçi çözümler. E-ticaretten kurumsal kimliğe, geleceği birlikte inşa ediyoruz.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <span className="block text-white font-bold text-lg mb-6 border-l-4 border-[#d4af37] pl-3">Hızlı Bağlantılar</span>
            <ul className="space-y-3">
              <li><Link to="/giris" className="text-gray-400 hover:text-[#d4af37] transition-colors">Ana Sayfa</Link></li>
              <li><Link to="/hakkimizda" className="text-gray-400 hover:text-[#d4af37] transition-colors">Hakkımızda</Link></li>
              <li><Link to="/hizmetler" className="text-gray-400 hover:text-[#d4af37] transition-colors">Hizmetler</Link></li>
              <li><Link to="/projeler" className="text-gray-400 hover:text-[#d4af37] transition-colors">Projeler</Link></li>
              <li><Link to="/iletisim" className="text-gray-400 hover:text-[#d4af37] transition-colors">İletişim</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <span className="block text-white font-bold text-lg mb-6 border-l-4 border-[#d4af37] pl-3">Hizmetlerimiz</span>
            <ul className="space-y-3">
              {services.length > 0 ? (
                services.map(service => (
                  <li key={service.id}>
                    <Link to={`/hizmetler#${service.slug}`} className="text-gray-400 hover:text-[#d4af37] transition-colors">
                      {decodeHtml(service.title.rendered)}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/hizmetler#yazilim" className="text-gray-400 hover:text-[#d4af37] transition-colors">Yazılım Geliştirme</Link></li>
                  <li><Link to="/hizmetler#otomasyon" className="text-gray-400 hover:text-[#d4af37] transition-colors">Otomasyon & Entegrasyon</Link></li>
                  <li><Link to="/hizmetler#eticaret" className="text-gray-400 hover:text-[#d4af37] transition-colors">E-Ticaret Teknolojileri</Link></li>
                  <li><Link to="/hizmetler#yapayzeka" className="text-gray-400 hover:text-[#d4af37] transition-colors">Yapay Zekâ Çözümleri</Link></li>
                  <li><Link to="/hizmetler#3dmodel" className="text-gray-400 hover:text-[#d4af37] transition-colors">3D Modelleme & Üretim</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <span className="block text-white font-bold text-lg mb-6 border-l-4 border-[#d4af37] pl-3">İletişim</span>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#d4af37] shrink-0 mt-1" />
                <span className="text-gray-400 text-sm">Fenerbahçe Mah. İğrıp Sk. No:13 İç Kapı No:1 Kadıköy / İstanbul</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#d4af37] shrink-0" />
                <a href="tel:+905384951696" className="text-gray-400 hover:text-white text-sm">+90 (538) 495 16 96</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#d4af37] shrink-0" />
                <a href="mailto:info@ankaverse.com.tr" className="text-gray-400 hover:text-white text-sm">info@ankaverse.com.tr</a>
              </li>
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="https://www.instagram.com/ankaverse.2025/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#d4af37] hover:text-black transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/ankaverse" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#d4af37] hover:text-black transition-all">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://x.com/ankaverseltd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#d4af37] hover:text-black transition-all">
                {/* X Logo */}
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#333] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ANKAVERSE E-Ticaret Ltd. Şti. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            {/* These policy links are placeholders */}
            <a href="#" onClick={() => alert("🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀")} className="hover:text-white transition-colors">Gizlilik Politikası</a>
            <a href="#" onClick={() => alert("🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀")} className="hover:text-white transition-colors">Kullanım Şartları</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
