# Çeviri hattının OpenRouter'a taşınması

**Tarih:** 2026-08-05
**Durum:** onaylandı, uygulanacak

## Amaç

Çeviri kalitesini yükseltmek. DeepL'in çıktısı, özellikle teknik metinde ve marka
tonunda yetersiz bulundu. OpenRouter üzerinden bir LLM, sistem promptuyla terim
sözlüğü ve ton talimatı alabildiği için bu işte daha iyi sonuç verir.

Kota veya maliyet **birincil sebep değil**. Maliyet yine de sınırlanacak, çünkü
kullandıkça öde modelinde kontrolsüz bir koşturma DeepL'in aylık kotasından daha
tehlikelidir: kota bitince DeepL durur, kredi bitene kadar OpenRouter harcar.

## Kapsam

Hat **tamamen** OpenRouter'a taşınır. `tools/deepl.js` silinir; yedek olarak
tutulmaz. İki sağlayıcıyı birlikte tutmak, aynı dosyada iki farklı üslubun
karışmasına ve hangi metnin nereden geldiğinin belirsizleşmesine yol açardı.

Mevcut çeviriler yerinde kalır — hash cache onlara dokunmaz. Tek istisna, aşağıda
tarif edilen tek seferlik blog dolgusudur.

## Kısıtlar

Bunlar tartışmaya açık değil; her biri yaşanmış bir kesintinin ya da SEO
kaybının karşılığı.

1. **Çeviri Coolify build'inde çalışmaz.** Build konteyneri geçici; orada
   çevirmek her deploy'da tüm arşivi yeniden çevirir. Çeviri GitHub Actions'ta
   çalışır ve sonucu repoya commit eder. `OPENROUTER_API_KEY` Coolify'a
   **konulmaz**; VPS'e inmesi için hiçbir sebep yok.
2. **`VITE_` öneki kullanılmaz.** `VITE_` ile başlayan her değişken JS bundle'ına
   gömülür ve her ziyaretçiye açık görünür.
3. **Yarım koşturma olmaz.** Bir dilin bazı metinleri çevrilip bazıları Türkçe
   kalırsa, o sayfa yabancı bir `hreflang` altında Türkçe metin sunar. Bu hattın
   kardinal günahı budur: Google'a "site kendi içeriği hakkında yanlış bilgi
   veriyor" der ve o dilin hiç olmamasından kötüdür.
4. **İndekslenmiş URL'ler oynatılmaz.** Slug başlıktan türer; yeniden çeviri yeni
   başlık üretirse URL değişir.

## Mimari

### Modül sınırı

`tools/deepl.js` → `tools/openrouter.js`. İki çeviri betiği (`translate-content.js`,
`translate-locales.js`) bugün aynı altı sembolü içeri alıp yaklaşık sekiz yerde
çağırıyor. Bu sınır zaten temiz olduğu için betiklerin kendi mantığına
dokunulmaz: hash cache, `pruneDuplicates()`, `sourceSlug` eşlemesi ve kurumsal
metinlerin ayrı yönetimi aynen kalır.

| DeepL | OpenRouter karşılığı | Not |
| --- | --- | --- |
| `createClient()` | `createClient({ model })` | model çağıran tarafından verilir |
| `DEEPL_TARGETS` | `TARGET_LANGUAGES` | dil kodu → prompt'ta geçecek dil adı |
| `assertTargetsSupported()` | `assertModelAvailable()` | model listede yoksa durur |
| `assertQuota()` | `assertBudget()` | kredi yetmiyorsa hiç başlamaz |
| `countCharacters()` | değişmeden taşınır | sağlayıcıdan bağımsız |
| `restoreProtectedTerms()` | değişmeden taşınır | sağlayıcıdan bağımsız |

`translate(texts, targetLocale, { html, sourceLang })` imzası korunur; çağıran
betikler yalnız import bloğunu ve iki fonksiyon adını değiştirir.

### LLM güvenlik sözleşmesi

DeepL hata verdiğinde yüksek sesle verir. LLM sessizce bozar: önsöz ekler,
listeden bir kalem düşürür, HTML etiketini yer, ya da metni olduğu gibi geri
döndürür. Kısıt 3 ile birleşince bu, sitenin en sessiz ve en pahalı hata
biçimidir. Bu yüzden beş kontrol konur. **Hepsi koşturmayı durdurur; hiçbiri
kurtarmaya çalışmaz.**

1. **Toplu iş bütünlüğü.** İstek numaralı bir JSON nesnesi taşır
   (`{"0": "...", "1": "..."}`), yanıt aynı anahtar kümesiyle beklenir. Eksik,
   fazla, boş değer veya string olmayan değer → hata.
2. **Çevrilmemiş metin koruması.** Çıktı girdiyle birebir aynıysa hata verilir.
   İki istisna: korunan marka adları ve **20 karakterden kısa** metinler
   (`Blog`, `CTA`, `Demo` gibi tek kelimeler birçok dilde aynı kalır ve bunları
   hata saymak yanlış pozitif üretir — belgelenmiş 8. tuzak).
3. **HTML bütünlüğü.** `html: true` alanlarda etiket dizisi çeviri öncesi ve
   sonrası karşılaştırılır. Dizi değiştiyse hata. Blog gövdeleri HTML'dir.
4. **`temperature: 0`.** Belgelenmiş 7. tuzak — aynı yazı için iki URL —
   yeniden çevirinin farklı başlık üretmesinden doğmuştu. Determinizm bu
   sapmayı en aza indirir.
5. **Yeniden deneme yalnız 429 ve 5xx için**, üstel geri çekilmeyle. Doğrulama
   hatası asla yeniden denenmez; o geçici bir aksaklık değil, gerçek bir
   bozukluktur ve tekrar denemek yalnız para harcar.

Sistem promptu şunları taşır: hedef dilin adı, korunacak marka adları
(`ANKAVERSE`, `Vaktia`, `Suguya`, `ANKAVERSE Nexus`, `ANKAVERSE Hub`), HTML
alanlarında yapının korunması kuralı ve "yalnızca çeviriyi döndür, açıklama
ekleme" talimatı.

### Model kademeleri

```
OPENROUTER_MODEL        kurumsal metinler + yeni blog yazıları
OPENROUTER_MODEL_BULK   yalnız tek seferlik geçmiş blog dolgusu
```

Model adları koda gömülmez. OpenRouter'ın kataloğu ve fiyatları sık değiştiği
için sabitlenen bir ad kısa sürede eskir. `assertModelAvailable()` yapılandırılan
modeli OpenRouter'ın model listesiyle karşılaştırır ve bulamazsa çalışmayı
durdurur — yanlış yazılmış bir model adı ilk saniyede görünür olur.

`OPENROUTER_MODEL_BULK` tanımlı değilse dolgu modu `OPENROUTER_MODEL` kullanır.

### Geçmiş blog yazılarının dolgusu

```bash
npm run content:translate -- --backfill --locales=en
```

70 İngilizce yazı TR kaynağından yeniden çevrilir. **Slug sabitlenir:** sonuç
mevcut dosya adına yazılır, yeni dosya üretilmez.

- `pruneDuplicates()` dolgu modunda çalışmaz — silinecek kopya yoktur ve
  çalışırsa mevcut dosyaları silme riski taşır
- `sourceHash` güncellenir, böylece sonraki normal koşturmalar bu yazıları
  tekrar çevirmez
- Başlık metni değişir, slug değişmez. Google başlık değişimini sorunsuz
  karşılar; URL değişimini karşılamaz.

**Kabul kriteri:** dolgudan önce ve sonra `dist/sitemap.xml` alınır ve
karşılaştırılır. **Tek satır bile değişirse dolgu hatalıdır** ve geri alınır.

### Maliyet kontrolü

- `--dry-run` hiçbir şey çevirmeden kalem sayısını, karakter toplamını ve
  tahmini token maliyetini yazdırır. Model seçimi buradan karşılaştırılarak
  yapılır.
- `assertBudget()` koşturma öncesi OpenRouter kredi bakiyesini okur. Tahmin
  kalan bakiyeyi aşıyorsa **hiçbir istek gönderilmeden** durur. Bu, DeepL'deki
  `assertQuota()`'nın amacını korur: yarım çeviri üretmemek.

## Test

`tools/verify-translation.js`, `tools/verify-stale-deploy.js` ile aynı desende
düz node testleri:

- toplu iş bütünlüğü: eksik anahtar, fazla anahtar, boş değer, string olmayan
  değer — dördü de hata vermeli
- çevrilmemiş metin koruması: birebir aynı uzun metin hata vermeli; marka adı ve
  kısa metin vermemeli
- HTML bütünlüğü: etiket düşmüş, etiket eklenmiş ve sırası değişmiş gövdeler hata
  vermeli; yalnız metni değişmiş gövde vermemeli
- `restoreProtectedTerms`: küçük harfe düşmüş ve harf çevrimine uğramış marka
  adlarını geri yazmalı

`npm run verify:translation` olarak eklenir. Build zincirine **girmez** — build'in
ağ erişimi gerektirmemesi mevcut tasarımın bilinçli bir özelliği.

## Devreye alma sırası

1. `--dry-run`, çeviri yok, maliyet okunur
2. Tek dil (`de`) kurumsal metinlerle, çıktı elle okunur
3. Kalan diller
4. Blog dolgusu en sonda, sitemap farkı kontrol edilerek

## Anahtarlar

| Nerede | Ne |
| --- | --- |
| GitHub Secrets | `OPENROUTER_API_KEY` eklenir, `DEEPL_API_KEY` silinir |
| Yerel `.env` | `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `OPENROUTER_MODEL_BULK` |
| Coolify | hiçbir şey |

## Kapsam dışı

Bunlar ayrı işler; bu spec'e karıştırılmaz:

- 411 KB'lık `static-loader-data-manifest` yükü
- 65 karakteri aşan başlıklar (`verify-seo`'nun 21 uyarısı)
- Blog yazılarının ince içerik sorunu — **yeniden çeviri bunu çözmez**;
  70 yazının medyanı 216 kelime ve sorun uzunluk, çeviri kalitesi değil
- `http://` → `https://` yönlendirmesinin 302 olması
- Search Console'a sitemap gönderimi
