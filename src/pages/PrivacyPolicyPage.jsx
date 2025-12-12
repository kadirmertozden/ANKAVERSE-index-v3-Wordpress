import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicyPage = () => {
  return (
    <>
      <Helmet>
        <title>Ankaverse - Gizlilik Politikası</title>
        <meta name="description" content="Ankaverse Gizlilik Politikası" />
      </Helmet>
      <Navbar />
      <main className="bg-[#1a1b1e] text-white pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#d4af37]">Gizlilik Politikası</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
            <p>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            
            <h3>1. Giriş</h3>
            <p>
              ANKAVERSE ("Şirket") olarak, kullanıcılarımızın gizliliğine ve kişisel verilerinin korunmasına büyük önem veriyoruz. 
              Bu Gizlilik Politikası, web sitemizi ziyaret ettiğinizde toplanan bilgilerin nasıl kullanıldığını açıklar.
            </p>

            <h3>2. Toplanan Bilgiler</h3>
            <p>
              Sitemizi ziyaret ettiğinizde, IP adresi, tarayıcı türü, ziyaret süresi gibi teknik veriler otomatik olarak toplanabilir. 
              Ayrıca, iletişim formları veya bülten aboneliği aracılığıyla adınız, e-posta adresiniz ve telefon numaranız gibi kişisel bilgileri bize iletebilirsiniz.
            </p>

            <h3>3. Bilgilerin Kullanımı</h3>
            <p>Toplanan bilgiler şu amaçlarla kullanılabilir:</p>
            <ul>
              <li>Hizmetlerimizin sunulması ve iyileştirilmesi</li>
              <li>İletişim taleplerinize yanıt verilmesi</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Pazarlama ve bilgilendirme (onayınız dahilinde)</li>
            </ul>

            <h3>4. Çerezler (Cookies)</h3>
            <p>
              Web sitemiz, kullanıcı deneyimini artırmak için çerezler kullanabilir. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.
            </p>

            <h3>5. İletişim</h3>
            <p>
              Gizlilik politikamızla ilgili sorularınız için <a href="mailto:info@ankaverse.com.tr" className="text-[#d4af37]">info@ankaverse.com.tr</a> adresinden bize ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;
