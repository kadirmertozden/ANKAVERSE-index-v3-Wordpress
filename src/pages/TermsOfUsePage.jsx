import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfUsePage = () => {
  return (
    <>
      <Helmet>
        <title>Ankaverse - Kullanım Şartları</title>
        <meta name="description" content="Ankaverse Kullanım Şartları" />
      </Helmet>
      <Navbar />
      <main className="bg-[#1a1b1e] text-white pt-32 pb-20 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#d4af37]">Kullanım Şartları</h1>
          
          <div className="prose prose-invert prose-lg max-w-none text-gray-300">
            <p>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</p>
            
            <h3>1. Kabul</h3>
            <p>
              Bu web sitesini ziyaret ederek veya hizmetlerimizi kullanarak, bu Kullanım Şartlarını kabul etmiş sayılırsınız.
            </p>

            <h3>2. Hizmet Kullanımı</h3>
            <p>
              Sitemizdeki içerikleri yalnızca yasal amaçlar için kullanabilirsiniz. Telif hakkı, marka veya diğer fikri mülkiyet haklarını ihlal eden eylemler yasaktır.
            </p>

            <h3>3. Sorumluluk Reddi</h3>
            <p>
              ANKAVERSE, web sitesindeki bilgilerin doğruluğu ve güncelliği konusunda azami özeni gösterir ancak garanti vermez. 
              Sitedeki içerikler bilgilendirme amaçlıdır.
            </p>

            <h3>4. Değişiklikler</h3>
            <p>
              ANKAVERSE, bu kullanım şartlarını dilediği zaman güncelleme hakkını saklı tutar. Değişiklikler yayınlandığı tarihte yürürlüğe girer.
            </p>

            <h3>5. İletişim</h3>
            <p>
              Sorularınız için <a href="mailto:info@ankaverse.com.tr" className="text-[#d4af37]">info@ankaverse.com.tr</a> adresinden bize ulaşabilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfUsePage;
