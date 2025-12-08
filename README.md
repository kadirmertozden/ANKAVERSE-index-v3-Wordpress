# ANKAVERSE - Headless WordPress & React Entegrasyonu

Bu proje, modern bir React ön yüzü (frontend) ile güçlü bir WordPress arka yüzünü (backend) birleştiren "Headless CMS" mimarisi üzerine kurulmuştur.

## 🚀 Proje Hakkında

ANKAVERSE web sitesi, kullanıcılarına hızlı ve etkileşimli bir deneyim sunmak için React ile geliştirilmiştir. İçerik yönetimi ise (blog yazıları, projeler, hizmetler) WordPress paneli üzerinden yapılmaktadır.

### Kullanılan Teknolojiler

*   **Frontend:** React 19, Vite, Tailwind CSS, Framer Motion
*   **Backend (CMS):** WordPress (Headless modunda)
*   **API:** WordPress REST API
*   **Eklentiler:** Advanced Custom Fields (ACF), Custom Post Type UI (CPT UI)

## 🛠️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/kadirmertozden/ANKAVERSE-index-v3-Wordpress.git
    cd ANKAVERSE-index-v3-Wordpress
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Çevre Değişkenlerini Ayarlayın:**
    Kök dizinde `.env` dosyası oluşturun ve WordPress API adresinizi ekleyin:
    ```env
    VITE_WORDPRESS_API_URL=https://wordpress.ankaverse.com.tr/wp-json/wp/v2
    ```

4.  **Geliştirme Sunucusunu Başlatın:**
    ```bash
    npm run dev
    ```

## 📝 WordPress Yapılandırması

Bu projenin doğru çalışabilmesi için WordPress tarafında aşağıdaki yapılandırmaların yapılması gerekmektedir:

### Gerekli Eklentiler
*   **Custom Post Type UI (CPT UI):** Özel içerik türleri oluşturmak için.
*   **Advanced Custom Fields (ACF):** İçeriklere özel veri alanları eklemek için.

### Özel Yazı Türleri (Custom Post Types)
*   **Projeler (`project`):** Portfolyo projeleri için.
*   **Hizmetler (`service`):** Sunulan hizmetler için.

### Özel Alanlar (ACF Fields)

**Proje Detayları (Grup):**
*   `proje_kisa_aciklamasi` (Metin Alanı)
*   `musteri` (Metin)
*   `tarih` (Tarih Seçici)
*   `teknolojiler` (Metin Alanı - Virgülle ayrılmış)
*   `ikincil_gorsel` (Görsel)

**Hizmet Detayları (Grup):**
*   `ikon_adi` (Metin - Örn: Code2, Workflow)
*   `ozellikler` (Metin Alanı - Her satıra bir özellik)

## 🤖 Otomasyon (n8n)

Blog yazılarının otomatik olarak eklenmesi için n8n entegrasyonu desteklenmektedir. WordPress tarafında "Uygulama Şifreleri" (Application Passwords) kullanılarak güvenli bir API bağlantısı kurulabilir.

## 📦 Canlıya Alma (Deployment)

Proje, Vercel veya Netlify gibi platformlarda kolayca yayınlanabilir.

1.  GitHub deposunu Vercel/Netlify'a bağlayın.
2.  Build komutu: `npm run build`
3.  Output dizini: `dist`
4.  Environment Variable olarak `VITE_WORDPRESS_API_URL` eklemeyi unutmayın.

---
© 2025 ANKAVERSE. Tüm hakları saklıdır.