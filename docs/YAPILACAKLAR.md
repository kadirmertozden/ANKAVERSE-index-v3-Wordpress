> Kaynak nüsha ANKAVERSE-Brain'de:
> `01_Projects/ankaverse-web/Yapilacaklar.md` — değişiklikler orada yapılır, buraya kopyalanır.

> Son güncelleme: 2026-08-05 akşamı.

# Yapılacaklar

Etkiye göre sıralı.

## 1. İçerik derinliği — en büyük SEO riski

70 blog yazısının **medyanı 216 kelime**, 60 tanesi 300'ün altında, hiçbiri 500'ü
geçmiyor. TR+EN ile ~140 URL, hepsi kısa haber özeti.

Google'ın helpful content sistemi tam bu profili düşürüyor ve etkisi alan adına
yayılıyor. **Çeviri kalitesi bunu çözmedi** — 2026-08-05'te arşiv gpt-5.4 ile
baştan çevrildi, uzunluk sorunu aynen duruyor.

> ⚠️ Yazıları yapay zekâyla **uzatma**. İçerik zaten yapay zekâ özeti; üstüne bir
> kat daha makine metni koymak cezalandırılan profili derinleştirir. 216 kelimelik
> zayıf bir yazı, 900 kelimelik dolgulu bir yazıdan az zarar verir.

İki aşama:

- **Budama** (Claude yapabilir, yarım gün) — en zayıf 30-40 yazıyı ayıkla,
  benzerleri birleştir. Silinen her URL için 301 gerekir.
- **Yeniden yazmak** (Kadir, haftalar) — ayda 2-3 tane, 800+ kelime, ANKAVERSE'in
  kendi görüşünü taşıyan. Yatırımcıya gösterilecek olan bu.

> ⚠️ Bu madde çözülmeden **blogu yeni dile açma**. Dil başına ~$0,76 ve mekanik
> olarak kolay, ama 140 ince URL'i 420'ye çıkarır.

## 2. Coolify Build Pack → `dockerfile`

**2026-08-05'te doğrulandı: Build Pack `Nixpacks`.** Yani repodaki `Dockerfile`
kullanılmıyor ve canlı nginx yapılandırması panelin "Custom Nginx Configuration"
kutusunda, Coolify'ın veritabanında duruyor. Repodaki `deploy/nginx.conf` şu an
dekoratif — kimse okumuyor, ikisi sessizce ayrışabilir.

[[Deploy-ve-Altyapi]] belgesindeki 2. ve 3. tuzak (base64 bozulması, konteyner
içi düzeltmenin kalıcı olmaması) tam olarak bu kurulumdan çıkmıştı.

**Sıra önemli, atlanırsa pahalıya patlıyor:**

1. Paneldeki yapılandırmayı repodakiyle satır satır karşılaştır; fark varsa
   **canlı olan kazanır**, repoya işlenir
2. Ayrı bir konteynerde sına:
   `docker run --rm -v /tmp/n.conf:/etc/nginx/conf.d/default.conf:ro nginx:alpine nginx -t`
3. Build Pack'i `dockerfile`'a çevir, deploy et, doğrula

Yarım saatlik iş. Bu alan siteyi üç kez kapattı, aceleye getirme.

> ⚠️ Panelde **"Is it a SPA?" işaretsiz kalmalı.** İşaretlenirse nginx her
> bilinmeyen adrese `index.html`'i 200 ile döndürür, `/yok` 404 vermez ve site
> geneline soft-404 geri gelir.

## 3. Proje sayfalarının başlıkları uzun

`verify-seo` 13 uyarı veriyor, neredeyse tamamı 65 karakteri aşan **proje sayfası
başlığı** (tr/de/fr/es/ar). Google bu uzunlukta başlığı SERP'te kırpıyor.

Bunlar DeepL zamanından kalma; 2026-08-05'te eklenen sözlük ve kısaltma kuralları
yalnız bloga uygulandı, dolgu koleksiyonları kapsam dışı bırakıyor.

İki yol: proje/hizmet çevirilerini yeni promptla zorla yenilemek (~$0,10, ama
`--backfill` koleksiyonları kapsamadığı için küçük bir kod eklemesi gerekir); ya
da 5 dildeki ~20 başlığı elle düzeltmek (cache elle düzeltmeyi korur).

Beklenen sonuç: 13 uyarı → ~4.

## 4. Ufak temizlik

- GitHub'daki `DEEPL_API_KEY` secret'ı — artık okunmuyor, silinebilir
- Yerel `.env`'deki `DEEPL_API_KEY` satırı da öyle

## Bilinçli yapılmayanlar

| Madde | Neden |
| --- | --- |
| `http://` → `https://` 302'nin 301 yapılması | Cloudflare hallediyor |
| Blogu DE/FR/ES/AR'a açmak | 1. madde çözülmeden zarar verir |
| `dist`'teki kullanılmayan manifest dosyasının silinmesi | Dursun ki kaldırma düzeneği bozulursa site yavaşlasın, çökmesin |
| GA4'ün GTM içine de eklenmesi | `G-G242C7TQGR` zaten gtag.js'te; ikisinde birden tanımlamak her ziyareti iki kez sayar |

---

# 2026-08-05'te kapananlar

| İş | Sonuç |
| --- | --- |
| `Unexpected token '<'` çökmesi | Hata sınırı + tek seferlik otomatik yenileme. [[Deploy-ve-Altyapi]] tuzak 6 |
| Çeviri hattı DeepL → OpenRouter | 70 yazı gpt-5.4 ile yeniden çevrildi, 208 URL sabit, $1,07 |
| Manifest yükü | İlk yükleme 598 KB → 196 KB |
| GA4 | `G-G242C7TQGR` eklendi; öncesinde hiç trafik ölçümü yoktu |
| GDPR/KVKK onayı | Consent Mode v2, varsayılan ret, 6 dil, 4 sinyalin dördü |
| Google Tag Manager | `GTM-WQJRH2G3`, onay bloğunun **altına** |
| WordPress çekme adımı | 3 yeniden deneme + geri çekilme (4 CI koşturmasından 2'si düşüyordu) |
| `--dry-run` diske yazıyordu | Düzeltildi |
| Search Console | Sitemap gönderildi (Kadir) |

Test sayısı 0 → 41. `verify-seo` uyarısı 23 → 13.

**Sınanmamış kalan:** çeviri hattının OpenRouter ayağı üretimde yalnız bir kez
çalıştı (çerez metinleri, $0,0062). Saatlik senkron OpenRouter ile henüz tam tur
atmadı — çekme adımı düşüyordu, yeniden deneme onun için eklendi.
