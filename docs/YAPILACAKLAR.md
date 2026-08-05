> Kaynak nüsha ANKAVERSE-Brain'de:
> `01_Projects/ankaverse-web/Yapilacaklar.md` — değişiklikler orada yapılır, buraya kopyalanır.


> **Yaşayan belge.** Madde bitince buradan silinir, ilgili kalıcı belgeye yazılır.
> 2026-08-05 sonunda oluşturuldu.

# Yapılacaklar

Etkiye göre sıralı. Üstteki madde alttakinden daha çok fark yaratır.

## 1. İçerik derinliği — en büyük SEO riski

70 blog yazısının **medyanı 216 kelime**, 60 tanesi 300 kelimenin altında, hiçbiri
500'ü geçmiyor. TR+EN ile ~140 URL, hepsi kısa haber özeti.

Google'ın helpful content sistemi tam bu profili düşürüyor ve etkisi tek tek
yazılarla sınırlı kalmayıp alan adına yayılıyor. **Çeviri kalitesi bunu
çözmüyor** — 2026-08-05'te arşiv baştan çevrildi, uzunluk sorunu aynen duruyor.

Seçenekler: daha az ama 800+ kelimelik özgün yazı; ya da arşivi seyreltip zayıf
olanları birleştirmek.

> ⚠️ Bu madde çözülmeden **blogu yeni dile açma**. Mekanik olarak kolay ve dil
> başına ~$0,76, ama 140 ince URL'i 420'ye çıkarır.

## 2. WordPress çekme adımı aralıklı düşüyor

`content-sync` workflow'u "Fetch WordPress content" adımında zaman zaman
`Content fetch failed: fetch failed` veriyor — bağlantı ~10 sn sonra kopuyor.

Gözlem (2026-08-05): 06:43 ✓, 09:58 ✗, 12:18 ✓, 13:41 ✗.

WordPress aynı anda başka yerden 200 dönüyor ve önünde Cloudflare yok (doğrudan
VPS'teki Apache). Yani GitHub runner'ından VPS'e erişim sorunu.

Muhtemel çözüm: `tools/fetch-content.js`'e yeniden deneme + geri çekilme. Bugün
`tools/openrouter.js`'e eklenen desenin aynısı. Sebep bulunana kadar en azından
kesintiyi maskeler.

**Bu düzelene kadar hattın OpenRouter ayağı sınanmış sayılmaz** — çeviri
adımlarına hiç gelinmedi.

## 3. Search Console

Sitemap gönderildi (2026-08-05, Kadir). İzlenecekler: kaç sayfa indekslendi,
hreflang kümeleri kabul edildi mi, thin content uyarısı düşüyor mu.

## 4. Proje sayfalarının başlıkları uzun

`verify-seo` 13 uyarı veriyor, neredeyse tamamı 65 karakteri aşan **proje
sayfası başlığı** (tr/de/fr/es/ar). Google bu uzunlukta başlığı kırpıyor.

Bunlar DeepL zamanından kalma. 2026-08-05'te eklenen kısaltma ve sözlük kuralları
yalnız bloga uygulandı; dolgu koleksiyonları kapsam dışı bırakıyor.

İki yol: proje/hizmet çevirilerini yeni promptla zorla yenilemek (~$0,10, ama
`--backfill` koleksiyonları kapsamıyor, küçük bir kod eklemesi gerekir); ya da
beş dildeki dört proje başlığını elle düzeltmek (20 başlık, cache elle
düzeltmeyi korur).

## 5. `--dry-run` diske yazıyor

`tools/translate-content.js` içinde `required === 0` dalı `dryRun` kontrolünden
**önce** geliyor, dolayısıyla kuru koşturma da indeks dosyalarını yeniden yazıyor.
Zararı bugün satır sonu farkıyla sınırlı kaldı ama "kuru" olması gereken bir
komutun diske dokunması yanlış.

## 6. Coolify Build Pack `dockerfile` mı

Repoda `Dockerfile` hazır ve nginx yapılandırmasını imaja gömüyor. Panelde Build
Pack hâlâ `nixpacks` ise yapılandırma panelde saklanmaya devam eder ve repodan
sapabilir — [[Deploy-ve-Altyapi]] belgesindeki 2. ve 3. tuzağın kaynağı buydu.

Dışarıdan doğrulanamıyor, panelden bakmak gerek.

## 7. Ufak temizlik

- `DEEPL_API_KEY` secret'ı GitHub'da duruyor, artık okunmuyor — silinebilir
- Yerel `.env`'deki `DEEPL_API_KEY` satırı da öyle

## Bilinçli yapılmayanlar

| Madde | Neden |
| --- | --- |
| `http://` → `https://` 302'nin 301 yapılması | Cloudflare hallediyor |
| Blogu DE/FR/ES/AR'a açmak | 1. madde çözülmeden zarar verir |
| `dist`'teki kullanılmayan manifest dosyasının silinmesi | Dursun ki kaldırma düzeneği bozulursa site yavaşlasın, çökmesin |
