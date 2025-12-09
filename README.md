# ANKAVERSE - Headless WordPress & React Entegrasyonu V3

Bu proje, modern bir React ön yüzü (frontend) ile güçlü bir WordPress arka yüzünü (backend) birleştiren **Headless CMS** mimarisi üzerine kurulmuştur. Kullanıcılar web sitesinde React ile oluşturulmuş hızlı ve modern bir arayüzle karşılaşırken, tüm içerik yönetimi tanıdık WordPress paneli üzerinden yapılmaktadır.

## 🚀 Proje Hakkında

ANKAVERSE web sitesi, performans, güvenlik ve ölçeklenebilirlik odaklı modern bir web uygulamasıdır. İçerik güncellemeleri, blog yazıları, projeler ve hizmetler tamamen WordPress üzerinden yönetilir ve API aracılığıyla anlık olarak siteye yansır.

### Temel Özellikler
*   **Headless Mimari:** Frontend ve Backend tamamen birbirinden bağımsız çalışır.
*   **Modern Teknoloji Yığını:** React 19, Vite, Tailwind CSS ve Framer Motion.
*   **Dinamik İçerik Yönetimi:** WordPress REST API entegrasyonu.
*   **Blog Sistemi:** Kategori filtreleme, arama fonksiyonu, ilgili yazılar ve detaylı blog görüntüleme.
*   **Proje ve Hizmet Yönetimi:** Özel Post Tipleri (Custom Post Types) ile özelleştirilmiş içerik alanları.
*   **Responsive Tasarım:** Tüm cihazlarda kusursuz görünüm.

### Kullanılan Teknolojiler

**Frontend:**
*   **React 19:** Kullanıcı arayüzü kütüphanesi.
*   **Vite:** Hızlı geliştirme ve build aracı.
*   **Tailwind CSS:** Hızlı ve esnek stillendirme.
*   **Framer Motion:** Animasyon kütüphanesi.
*   **React Router:** Sayfa yönlendirmeleri (SPA).
*   **Lucide React:** Modern ikon seti.

**Backend (CMS):**
*   **WordPress:** İçerik yönetim sistemi (Headless modda).
*   **REST API:** Veri iletişimi.
*   **Eklentiler:**
    *   **Advanced Custom Fields (ACF):** İçeriklere özel veri alanları eklemek için.
    *   **Custom Post Type UI (CPT UI):** Özel içerik türleri (Projeler, Hizmetler) oluşturmak için.
    *   **WP REST API Controller (Opsiyonel):** API çıktılarını özelleştirmek için.

## 📂 Proje Yapısı

```bash
src/
├── components/      # Tekrar kullanılabilir UI bileşenleri (Navbar, Footer, Button vb.)
├── components/ui/   # Temel UI elementleri (Toast vb.)
├── data/            # Sabit veriler (gerekirse)
├── lib/             # Yardımcı fonksiyonlar (utils.js vb.)
├── pages/           # Sayfa bileşenleri (Anasayfa, Blog, Projeler vb.)
├── services/        # API servisleri ve konfigürasyonu (api.js)
├── App.jsx          # Ana uygulama bileşeni ve Router yapısı
└── main.jsx         # Uygulama giriş noktası
```

## 🛠️ Kurulum ve Geliştirme

Projeyi yerel ortamınızda çalıştırmak ve geliştirmek için aşağıdaki adımları izleyin:

### 1. Gereksinimler
*   Node.js (v18 veya üzeri önerilir)
*   Git

### 2. Kurulum
Depoyu klonlayın ve bağımlılıkları yükleyin:

```bash
git clone https://github.com/kadirmertozden/ANKAVERSE-index-v3-Wordpress.git
cd ANKAVERSE-index-v3-Wordpress
npm install
```

### 3. Çevre Değişkenleri (.env)
Kök dizinde `.env` dosyası oluşturun (veya mevcut olanı düzenleyin) ve WordPress API adresinizi ekleyin:

```env
VITE_WORDPRESS_API_URL=https://wordpress.ankaverse.com.tr/wp-json/wp/v2
```

### 4. Çalıştırma
Geliştirme sunucusunu başlatın:

```bash
npm run dev
```
Tarayıcınızda `http://localhost:3000` adresine gidin.

## 📝 WordPress Yapılandırması (Backend)

Bu projenin backend tarafında doğru çalışabilmesi için WordPress'te aşağıdaki yapılandırmaların yapılması gerekir.

### Gerekli Eklentiler
1.  **Custom Post Type UI (CPT UI):** Özel içerik türleri oluşturmak için.
2.  **Advanced Custom Fields (ACF):** İçeriklere özel veri alanları eklemek için.

### Özel Yazı Türleri (Custom Post Types)
*   **slug:** `project` (Projeler için)
*   **slug:** `service` (Hizmetler için)

### Özel Alanlar (ACF Fields)
Verilerin doğru çekilebilmesi için ilgili yazı türlerine aşağıdaki alanları ekleyin:

**Projeler (`project`) için:**
*   `proje_kisa_aciklamasi` (Text/Textarea)
*   `musteri` (Text)
*   `tarih` (Date Picker)
*   `teknolojiler` (Text - Virgülle ayrılmış)
*   `ikincil_gorsel` (Image)

**Hizmetler (`service`) için:**
*   `ikon_adi` (Text - Örn: 'Code2', 'Workflow' vb. Lucide icon isimleri)
*   `ozellikler` (Textarea - Her satıra bir özellik)

### Blog Sistemi Yapılandırması
Blog bölümü standart WordPress "Yazılar" (Posts) altyapısını kullanır.

*   **Yazılar (Posts):** Haberler ve blog içerikleri için standart WordPress yazılarını kullanın.
*   **Kategoriler:** "Teknoloji", "Yapay Zeka" gibi kategoriler oluşturun ve yazılara atayın. Frontend bu kategorileri otomatik olarak çeker ve filtreleme için kullanır.
*   **Etiketler (Tags):** Yazı detay sayfasında gösterilecek etiketleri ekleyin.
*   **Öne Çıkan Görsel (Featured Image):** Yazı listelerinde ve detay sayfasında başlık görseli olarak kullanılır. Mutlaka eklenmelidir.
*   **İçerik:** Standart WordPress editörü (Gutenberg veya Klasik) ile oluşturulan içerik, frontend tarafında HTML olarak işlenir ve gösterilir.
*   **Yazar:** Yazıyı oluşturan kullanıcı yazar olarak gösterilir. Yazarın Gravatar görseli otomatik çekilir.

## 🤖 Otomasyon ve Entegrasyonlar (n8n)

Sistem, **n8n** gibi otomasyon araçlarıyla entegre çalışabilir. Özellikle blog içeriklerinin yapay zeka tarafından üretilip otomatik olarak WordPress'e eklenmesi senaryolarında:

1.  **WordPress Application Passwords:** WordPress kullanıcı profilinizden bir uygulama şifresi oluşturun.
2.  **n8n WordPress Node:** Oluşturduğunuz şifreyi ve kullanıcı adını kullanarak n8n'i WordPress'e bağlayın.
3.  **Otomatik İçerik:** n8n workflow'ları ile üretilen içerikleri `posts` endpoint'ine göndererek blog yazılarını otomatikleştirin.

## 📦 Canlıya Alma (Deployment)

Proje statik bir site olarak derlenir ve Vercel, Netlify, Cloudflare Pages gibi platformlarda kolayca barındırılabilir.

Build komutu:
```bash
npm run build
```
Oluşan `dist` klasörünü sunucunuza yükleyin.

## 🤝 Katkıda Bulunma

1.  Bu depoyu "Fork"layın.
2.  Yeni bir özellik dalı (branch) oluşturun (`git checkout -b ozellik/yeni-ozellik`).
3.  Değişikliklerinizi kaydedin (`git commit -m 'Yeni özellik eklendi'`).
4.  Dalınızı uzak sunucuya gönderin (`git push origin ozellik/yeni-ozellik`).
5.  Bir "Pull Request" oluşturun.

---
© 2025 ANKAVERSE. Tüm hakları saklıdır.