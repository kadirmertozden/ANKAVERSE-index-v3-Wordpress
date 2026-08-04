# ANKAVERSE — SEO ve Çok Dillilik Tasarımı

**Tarih:** 2026-08-04
**Durum:** Onaylandı, uygulama planı bekliyor

## Amaç

ANKAVERSE kurumsal sitesini uluslararası yatırımcı ve müşteri görünürlüğü için
arama motorlarına ve sosyal platformlara tam uyumlu hale getirmek; Türkçe,
İngilizce, Almanca, Fransızca, İspanyolca ve Arapça olmak üzere altı dilde
yayınlamak.

## Mevcut Durum

Vite 4 + React 19 SPA. İçerik kısmen headless WordPress REST API'den
(`https://wordpress.ankaverse.com.tr/wp-json/wp/v2`), kısmen JSX içine gömülü
Türkçe metinlerden geliyor. Rotalar Türkçe slug kullanıyor.

İçerik hacmi (2026-08-04 ölçümü):

| Tür | Adet | Karakter |
|---|---|---|
| Blog yazısı | 70 | 180.907 (ort. 2.584) |
| Proje (CPT `project`) | 3 | — |
| Hizmet (CPT `service`) | 5 | — |

### Tespit edilen eksikler

1. **Client-side render.** Crawler'a boş `<div id="root">` sunuluyor. Google JS
   render edebiliyor ama gecikmeli ve güvenilmez; LinkedIn, X, Facebook ve Bing
   crawler'ları JS çalıştırmaz — paylaşılan linklerde önizleme kartı çıkmıyor.
2. `robots.txt`, `sitemap.xml`, canonical, Open Graph/Twitter meta ve JSON-LD
   yapısal veri yok.
3. `index.html` sabit `lang="tr"`, hreflang yok.
4. `react-helmet` React 19'da deprecated; meta yönetimi 10 sayfaya dağılmış.
5. `<Route path="*" element={<Navigate to="/" />}` — bilinmeyen tüm adresler
   ana sayfaya 200 OK ile yönleniyor. Google için **soft 404**.
6. Ana sayfa (`/`) yaklaşık 20 kelimelik bir splash ekranı; gerçek kurumsal
   içerik `/giris` adresinde. Sitenin en yetkili URL'i en zayıf içeriği taşıyor.
7. `vite.config.js:167-221` — Hostinger Horizons'ın 5 adet dev hata-raporlama
   script'i `isDev` koşuluna bağlı değil, production build'e de giriyor
   (~4KB render-blocking inline JS, her sayfada).

## Kararlar

| Konu | Karar |
|---|---|
| Diller | tr, en, de, fr, es, ar (ar için RTL) |
| Render | Build-time prerender (SSG), `vite-react-ssg` |
| URL yapısı | TR kökte ön eksiz; diğer diller `/{lang}/` ön ekli; slug'lar dile çevrili |
| İçerik kapsamı | Tüm içerik (kurumsal + blog + projeler) 6 dilde |
| Çeviri | DeepL API Free, **build sırasında**, sonuç repoda cache'lenir |
| Backfill | Kademeli: 1. ay EN (180.907 krk), 2. ay DE/FR/ES/AR |
| Ana sayfa | `CorporateHome` içeriği `/`'a taşınır; `/giris` → 301 → `/` |
| Hosting | Kendi VPS (web sunucusu — nginx/Apache — uygulama başında netleşecek) |

## Mimari

### 1. Render katmanı

`vite-react-ssg` ile build-time prerender. Gereken değişiklikler:

- `src/App.jsx`'teki JSX route ağacı → `src/routes.jsx` içinde route config dizisi
  (SSG kütüphanesi rota listesini statik olarak okuyabilsin diye)
- `src/main.jsx` → `ViteReactSSG(...)` ile başlar
- Vite 4 → 5 yükseltmesi (`vite-react-ssg` şartı)
- `react-helmet` → `vite-react-ssg`'nin `Head` bileşeni, tek merkezî `<Seo>` içinde
- `vite.config.js`'teki `addTransformIndexHtml` production'dan çıkarılır,
  `console.warn = () => {}` kaldırılır

### 2. Dil ve rota katmanı — tek doğruluk kaynağı

`src/i18n/routes.js` tek başına React Router rotalarını, hreflang alternatiflerini
ve sitemap girdilerini türetir. Üçünün birbirinden ayrışması (çok dilli SEO'da en
sık görülen hata) böylece yapısal olarak imkânsız hale gelir.

```js
export const LOCALES = ['tr','en','de','fr','es','ar'];
export const DEFAULT_LOCALE = 'tr';   // kök, ön eksiz
export const RTL_LOCALES = ['ar'];

export const ROUTES = {
  home:     { tr:'',           en:'',          de:'',           fr:'',         es:'',               ar:'' },
  about:    { tr:'hakkimizda', en:'about-us',  de:'ueber-uns',  fr:'a-propos', es:'sobre-nosotros', ar:'من-نحن' },
  services: { tr:'hizmetler',  en:'services',  de:'leistungen', ... },
  projects: { tr:'projeler',   en:'projects',  ... },
  blog:     { tr:'blog',       en:'blog',      ... },
  contact:  { tr:'iletisim',   en:'contact',   ... },
  privacy:  { ... },
  terms:    { ... },
};
```

Yukarıdaki blok biçimi göstermek içindir; `home`, `about`, `services`,
`projects`, `blog`, `contact`, `privacy`, `terms` anahtarlarının altı dildeki
tam slug tablosu Faz 3'te oluşturulur ve tabloda eksik hücre kalması
`verify-seo.js` tarafından hata sayılır.

Yardımcılar: `pathFor(routeKey, locale, params)`, `alternatesFor(routeKey, params)`.

**Çeviri motoru:** `react-i18next`. Metinler
`src/locales/{lang}/{namespace}.json` — namespace'ler: `common`, `home`, `about`,
`services`, `projects`, `blog`, `contact`, `legal`, `seo`. JSX içine gömülü tüm
Türkçe metinler önce `tr/` altına çıkarılır; diğer beş dil `tr/` dosyalarından
DeepL ile bir kez üretilip repoya commit edilir ve **elle gözden geçirilir**.
Bu dosyalar bundan sonra elle bakım görür — `translate-content.js` yalnızca
`src/content/` altındaki WordPress içeriğini çevirir, `src/locales/` altına
dokunmaz. Gerekçe: kurumsal metinler yatırımcının okuduğu metinlerdir ve
makine çevirisi denetimsiz bırakılmamalıdır; hacimleri de küçük olduğu için
elle bakım maliyeti düşüktür.

**Dil algılama:** Otomatik yönlendirme **yapılmaz**. Kök adres her zaman TR kalır.
Bunun yerine ziyaretçinin tarayıcı diline göre kapatılabilir bir öneri şeridi
(`LanguageSuggestionBanner`) ve navbar'da dil seçici. Gerekçe: otomatik
yönlendirme crawler'ları yanlış dile savurur ve indekslemeyi bozar; Google'ın
açıkça uyardığı bir hatadır.

**RTL:** `<html dir>` locale'e göre ayarlanır. Tailwind'e `rtl:`/`ltr:` variant'ları
eklenir; yön bağımlı boşluk utility'leri mantıksal karşılıklarına geçer
(`ml-4` → `ms-4`, `pr-2` → `pe-2`). Yalnızca yön-duyarlı sınıflar dönüştürülür.

### 3. İçerik ve çeviri hattı

**Kaynak:** `tools/fetch-content.js` build'den önce WordPress'ten çeker →
`src/content/{posts,projects,services}.json`. Prerender sırasında ağ çağrısı
olmaz. WordPress erişilemezse son başarılı cache ile devam edilir, build kırılmaz.

**Çeviri:** `tools/translate-content.js`

```
her TR kayıt için içerik hash'i hesaplanır
  → src/content/i18n/<slug>.<lang>.json cache'te varsa DeepL'e HİÇ gidilmez
  → yoksa DeepL'e sorulur, cache'e yazılır, git'e commit edilir
```

Sonuçlar:

- Her yazı ömrü boyunca **bir kez** çevrilir; rebuild kota harcamaz
- Deterministik — Google aynı URL'de değişen metin görmez
- Düzeltilebilir — kötü çeviri cache JSON'ında elle düzeltilir, hash aynı
  kaldığı sürece korunur
- hreflang eşleşmesi yapısal olarak doğru (aynı kaydın çevirisi)
- WordPress paneli temiz kalır (yalnızca Türkçe)

**DeepL yapılandırması:**

- Anahtar `.env` içinde `DEEPL_API_KEY` olarak — **`VITE_` öneki olmadan**.
  `VITE_` önekli değişkenler JS bundle'ına gömülür ve tarayıcıda herkese görünür.
  Anahtarı yalnızca build makinesindeki Node script'i okur.
- `tag_handling=html` — blog içeriği HTML olduğu için zorunlu
- Marka koruması: `ANKAVERSE`, `Vaktia` ve ürün/teknoloji adları
  `<span translate="no">` ile sarılır
- Build başında `/languages` uç noktasından hedef diller doğrulanır; desteklenmeyen
  dil varsa build hata verir (sessizce Türkçe basmaz)
- Çeviriden önce `/usage` ile kalan kota sorulur; yetmiyorsa uyarı verip durur,
  yarım çeviri üretmez

**Blog slug'ları:** Çevrilmiş başlıktan slugify edilir (`/en/blog/ai-in-ecommerce`),
cache'e yazılır ve **bir daha değişmez**. URL kararlılığı geri alınamaz bir
şeydir; sonradan değişen slug birikmiş sıralamayı sıfırlar.

### 4. SEO katmanı

**Merkezî `<Seo routeKey="..." />` bileşeni.** Geri kalanı `routes.js` ve locale
dosyalarından türetir:

- `<title>`, `<meta name="description">`
- `<link rel="canonical">` — mutlak URL
- `hreflang` alternatifleri + `x-default` (TR'ye işaret eder)
- Open Graph + Twitter Card (`og:locale`, `og:locale:alternate` dahil)
- `<html lang>` / `<html dir>` — prerender edilmiş HTML'in içinde

Sayfalara dağılmış 10 `<Helmet>` bloğu kaldırılır. Gerekçe: dağınık meta
yönetiminde bir sayfada canonical/hreflang unutulması kaçınılmazdır ve tek bir
yanlış canonical o sayfayı indeksten düşürür.

**JSON-LD yapısal veri** (`JsonLd.jsx`):

| Şema | Nerede | Ne sağlar |
|---|---|---|
| `Organization` | Tüm sayfalar | Logo, resmi ad, adres, iletişim, `sameAs` → Knowledge Panel adaylığı |
| `WebSite` + `SearchAction` | Ana sayfa | Site içi arama kutusu |
| `BreadcrumbList` | İç sayfalar | Okunabilir yol |
| `BlogPosting` | Blog detay | Yazar, tarih, görsel |
| `Service` | Hizmetler | Hizmet kalemleri |

Hepsinde `inLanguage` doğru locale ile dolar.

**sitemap.xml + robots.txt:** `tools/generate-sitemap.js` build sonunda
`routes.js` ve içerik cache'inden üretir. Her `<url>` girdisinde `xhtml:link` ile
tüm dil alternatifleri listelenir (Google'ın çok dilli siteler için önerdiği
biçim). `robots.txt` sitemap'i işaret eder ve `/Vaktia/PRIVACY_POLICY` gibi
listelenmeyen sayfaları hariç tutar.

**Gerçek 404:** `<Route path="*">` yönlendirmesi kaldırılır; yerine `noindex`'li
`NotFoundPage` gelir ve sunucu 404 status kodu döner.

**301 yönlendirmeler** (`deploy/nginx.conf.snippet` ve `deploy/.htaccess`):
`/giris`, `/giris.html`, `/kurumsal` → `/`; www ↔ non-www tekilleştirme;
http → https; sondaki `/` tutarlılığı.

**Core Web Vitals:**

- Horizons debug script'leri production'dan çıkar
- Görsellere `width`/`height` (CLS önlenir) + `loading="lazy"` + WordPress
  görselleri için `srcset`
- Rota bazlı kod bölme; WordPress alan adına `preconnect`
- Framer Motion animasyonları `prefers-reduced-motion` ile koşullu

## Dosya Yapısı

```
src/
  i18n/
    routes.js              # LOCALES, ROUTES, pathFor(), alternatesFor()
    config.js              # i18next kurulumu
    LocaleProvider.jsx     # aktif dil + <html lang/dir>
  locales/{tr,en,de,fr,es,ar}/
    common.json about.json blog.json contact.json home.json
    legal.json projects.json services.json seo.json
  content/
    posts.json projects.json services.json     # WordPress'ten çekilen TR kaynak
    i18n/<slug>.<lang>.json                    # DeepL cache, git'te versiyonlu
  components/
    Seo.jsx JsonLd.jsx LanguageSwitcher.jsx LanguageSuggestionBanner.jsx
  pages/NotFoundPage.jsx
  routes.jsx                                   # App.jsx'in yerine
tools/
  fetch-content.js translate-content.js generate-sitemap.js verify-seo.js
deploy/
  nginx.conf.snippet .htaccess
docs/superpowers/specs/
  2026-08-04-seo-i18n-design.md
```

## Build Hattı

```
npm run build
  1  fetch-content.js       WordPress'ten TR içerik (erişilemezse son cache)
  2  translate-content.js   eksik çevirileri DeepL'e sor → cache'e yaz
  3  generate-llms.js       mevcut
  4  vite-react-ssg build   ~486 HTML üretir
  5  generate-sitemap.js    sitemap.xml + robots.txt
  6  verify-seo.js          kontroller — hata varsa build BAŞARISIZ
```

Üretilen sayfa sayısı: 6 dil × 8 statik = 48, blog 70 × 6 = 420,
projeler 3 × 6 = 18 → yaklaşık **486 HTML**.

## Doğrulama

`tools/verify-seo.js` build'i kıran kontroller:

1. Her HTML'de gerçek içerik var — boş `<div id="root">` kalmış sayfa yok
2. Her sayfada canonical var ve kendine işaret ediyor
3. **hreflang çift yönlü** — A→B varsa B→A da var (tek yönlü hreflang Google
   tarafından tamamen yok sayılır)
4. `title`/`description` dolu, uzunluk sınırları içinde, aynı dil içinde tekrar yok
5. JSON-LD geçerli JSON, zorunlu alanlar dolu
6. sitemap'teki her URL üretilmiş bir dosyaya karşılık geliyor; üretilmiş ama
   sitemap'te olmayan rota yok
7. **Çeviri sızıntısı:** en/de/fr/es sayfalarında Türkçe'ye özgü karakter ve
   anahtar kelime taraması — çevrilmemiş bir sayfanın çevrilmiş gibi hreflang
   alması bu işin en sinsi hatasıdır

Manuel doğrulama: Lighthouse, Google Rich Results Test, Search Console'a 6 dil
için sitemap gönderimi.

## Aşamalandırma

Her faz tek başına yayına alınabilir.

| Faz | İçerik | Kazanç |
|---|---|---|
| 0 | Vite 4→5, Horizons script'lerinin prod'dan çıkarılması, react-helmet kaldırma | Temiz zemin |
| 1 | SSG kurulumu + ana sayfa taşıma + 301'ler | Sayfalar gerçek HTML olarak sunulur |
| 2 | SEO katmanı (TR): `Seo`, JSON-LD, sitemap, robots, 404 | **Yayına alınabilir — en büyük tek kazanç** |
| 3 | i18n iskeleti: i18next, metin çıkarma, dil seçici, RTL, TR+EN statik sayfalar | Site iki dilli |
| 4 | DeepL hattı + 70 yazının EN backfill'i (180.907 krk, kotaya sığar) | **Yayına alınabilir — blog iki dilde** |
| 5 | DE/FR/ES/AR açılışı (2. ay kotasıyla) | 6 dil tam |

**Faz 4 ile 5 arasındaki ara durum:** Blog yalnızca `tr` ve `en` altında üretilir.
`de`, `fr`, `es`, `ar` için blog rotaları **hiç oluşturulmaz**; o dillerdeki navbar
"Blog" bağlantısı `/en/blog`'a gider ve blog sayfalarının hreflang'i yalnızca
`tr`, `en` ve `x-default` listeler. Böylece "beş dilde aynı İngilizce içerik"
duplicate-content sorunu ara dönemde de doğmaz. Faz 5'te bu diller için rotalar
açılır ve hreflang kendiliğinden genişler.

## Riskler

| Risk | Karşılık |
|---|---|
| Vite 4→5 ile Horizons dev plugin'lerinin bozulması | Plugin'ler yalnızca `isDev`'de yükleniyor, üretim riski yok. Faz 0'da izole edilir; dev ortamı bozulursa plugin'ler devre dışı bırakılabilir |
| DeepL Arapça desteği | Build başında `/languages` ile doğrulanır; desteklenmiyorsa build hata verir |
| DeepL kota aşımı | Çeviri öncesi `/usage` ile kalan kota kontrol edilir; yetmiyorsa durur, yarım çeviri üretmez |
| Blog slug'larının sonradan değişmesi | Slug bir kez üretilip cache'e sabitlenir, değişmez |
| WordPress API'nin build anında erişilemez olması | Son başarılı içerik cache'i kullanılır, build kırılmaz |
| Makine çevirisi kalitesi | Kurumsal sayfa çevirileri repoda tutulur ve elle gözden geçirilir; blog çevirileri cache JSON'ında düzeltilebilir |

## Kapsam Dışı

- WordPress'e çok dilli eklenti (Polylang/WPML) kurulumu — çeviri build tarafında
- Next.js'e geçiş — mevcut statik hosting korunuyor
- Tasarım/görsel kimlik değişikliği (ana sayfa içerik taşıması hariç)
- E-ticaret alt alan adının (`eticaret.ankaverse.com.tr`) SEO'su
