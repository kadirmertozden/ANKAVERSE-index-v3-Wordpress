import React, { useEffect } from 'react';

const VaktiaPrivacyPolicyPage = () => {
  useEffect(() => {
    document.title = 'Vaktia - Gizlilik Politikası / Privacy Policy';
  }, []);

  return (
    <main className="bg-[#1a1b1e] text-white min-h-screen pt-16 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <img
            src="/favicon-4-Buyuk.png"
            alt="ANKAVERSE"
            className="h-12 w-12 rounded-full border-2 border-[#d4af37]"
          />
          <span className="font-bold text-xl tracking-widest text-white">ANKAVERSE</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-[#d4af37]">
          Vaktia — Gizlilik Politikası / Privacy Policy
        </h1>
        <div className="text-sm text-gray-400 mb-10 space-y-1">
          <p><strong className="text-gray-300">Son güncelleme / Last updated:</strong> 28.07.2026</p>
          <p><strong className="text-gray-300">Uygulama / Application:</strong> Vaktia (<code className="text-gray-300">com.ankaverse.vaktia</code>)</p>
          <p><strong className="text-gray-300">Geliştirici / Developer:</strong> ANKAVERSE</p>
          <p><strong className="text-gray-300">İletişim / Contact:</strong> info@ankaverse.com.tr</p>
        </div>

        <div className="prose prose-invert prose-lg max-w-none text-gray-300 prose-headings:text-white prose-h2:text-[#d4af37] prose-h3:text-white prose-a:text-[#d4af37] prose-strong:text-white prose-table:text-sm">

          <h2 id="tr">🇹🇷 Türkçe</h2>

          <h3>Özet</h3>
          <p><strong>Vaktia; ibadet, konum ve ayar verilerinizi cihazınızın dışına çıkarmaz.</strong></p>
          <p>
            Namaz vakitleri, kıble yönü ve günün ayeti dâhil tüm içerik doğrudan cihazınızda hesaplanır. Çetele
            kayıtlarınız, konumunuz ve tercihleriniz hiçbir sunucuya gönderilmez.
          </p>
          <p>Hesap oluşturmanız gerekmez. Analitik veya izleme aracı yoktur. Uygulamada yalnızca <strong>Google AdMob</strong> aracılığıyla banner reklamlar gösterilir; bunun kapsamı aşağıdaki "Reklamlar" bölümünde açıklanmıştır.</p>

          <h3>İşlenen Bilgiler</h3>
          <p>Aşağıdaki bilgiler <strong>yalnızca cihazınızda</strong> tutulur ve cihazınızdan hiçbir zaman çıkmaz:</p>
          <table>
            <thead>
              <tr><th>Bilgi</th><th>Amaç</th><th>Nerede saklanır</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Yaklaşık konum (enlem/boylam)</td>
                <td>Bulunduğunuz yere göre namaz vakitlerini ve kıble yönünü hesaplamak</td>
                <td>Cihaz hafızası (uygulama ayarları)</td>
              </tr>
              <tr>
                <td>Seçtiğiniz şehir</td>
                <td>Konum izni vermek istemeyenler için vakit hesaplaması</td>
                <td>Cihaz hafızası (uygulama ayarları)</td>
              </tr>
              <tr>
                <td>Uygulama ayarları (hesaplama yöntemi, tema, bildirim tercihleri, bildirim sesi)</td>
                <td>Tercihlerinizi hatırlamak</td>
                <td>Cihaz hafızası (uygulama ayarları)</td>
              </tr>
              <tr>
                <td>İbadet çetelesi kayıtları</td>
                <td>Kıldığınız namazları işaretleyip takip edebilmeniz</td>
                <td>Cihaz üzerindeki yerel veritabanı</td>
              </tr>
            </tbody>
          </table>
          <p>Bu bilgiler geliştiriciye, ANKAVERSE'e veya herhangi bir üçüncü tarafa <strong>iletilmez</strong>.</p>

          <h3>Reklamlar (Google AdMob)</h3>
          <p>
            Uygulama, Google AdMob aracılığıyla banner reklamlar gösterir. Reklamların sunulabilmesi için Google'ın
            reklam SDK'sı cihazınızın <strong>reklam kimliğini</strong> (advertising ID) ve IP adresi, cihaz modeli
            gibi temel teknik bilgileri Google'a iletebilir. Bu veriler reklam sunumu, sıklık sınırlama ve sahtecilik
            önleme amacıyla Google tarafından işlenir.
          </p>
          <ul>
            <li>Reklam verileri; konumunuz, çetele kayıtlarınız veya uygulama içi hiçbir ibadet verinizle <strong>ilişkilendirilmez</strong> ve bu veriler Google'a <strong>gönderilmez</strong>.</li>
            <li>Avrupa Ekonomik Alanı ve Birleşik Krallık'taki kullanıcılara, reklamlar gösterilmeden önce Google'ın onay formu sunulur; tercihinizi daha sonra Ayarlar → "Reklam tercihlerini yönet" üzerinden değiştirebilirsiniz.</li>
            <li>Cihazınızın ayarlarından reklam kimliğinizi sıfırlayabilir veya kişiselleştirilmiş reklamları kapatabilirsiniz.</li>
            <li>Google'ın verileri nasıl işlediği için: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a></li>
          </ul>

          <h3>Konum İzni</h3>
          <p>Uygulama, yalnızca <strong>yaklaşık konum</strong> (<code>ACCESS_COARSE_LOCATION</code>) izni ister. Hassas konum izni istenmez.</p>
          <ul>
            <li>Konum bilgisi <strong>sadece</strong> namaz vakitlerinin ve kıble yönünün hesaplanmasında kullanılır.</li>
            <li>Konum bilgisi cihazınızdan <strong>dışarı çıkmaz</strong>, kaydedilip gönderilmez.</li>
            <li>Konum iznini vermeyi reddedebilirsiniz. Bu durumda uygulama tam olarak çalışmaya devam eder; şehrinizi listeden elle seçmeniz yeterlidir.</li>
            <li>İzni dilediğiniz zaman cihaz ayarlarından geri alabilirsiniz.</li>
          </ul>

          <h3>Diğer İzinler</h3>
          <table>
            <thead>
              <tr><th>İzin</th><th>Neden gerekli</th></tr>
            </thead>
            <tbody>
              <tr><td><code>POST_NOTIFICATIONS</code></td><td>Ezan vakti bildirimlerini gösterebilmek için</td></tr>
              <tr><td><code>SCHEDULE_EXACT_ALARM</code></td><td>Ezan bildirimini vaktinde, dakikası dakikasına gösterebilmek için</td></tr>
              <tr><td><code>RECEIVE_BOOT_COMPLETED</code></td><td>Cihaz yeniden başladıktan sonra vakit alarmlarını yeniden kurmak için</td></tr>
              <tr><td><code>INTERNET</code>, <code>ACCESS_NETWORK_STATE</code></td><td>Yalnızca reklamların yüklenebilmesi için</td></tr>
              <tr><td><code>AD_ID</code></td><td>Google AdMob'un reklam kimliğini kullanabilmesi için</td></tr>
            </tbody>
          </table>

          <h3>Bildirim Sesi Olarak Kendi Dosyanızı Seçmek</h3>
          <p>
            Ayarlardan bildirim sesi olarak cihazınızdaki bir ses dosyasını seçebilirsiniz. Bu durumda uygulama
            yalnızca seçtiğiniz dosyanın konumunu (URI) kaydeder ve o dosyayı çalar. Dosyanın kendisi kopyalanmaz,
            yüklenmez veya paylaşılmaz.
          </p>

          <h3>Çocukların Gizliliği</h3>
          <p>Uygulama her yaştan kullanıcı için uygundur ve hiç kimseden, çocuklar dâhil, kişisel veri toplamaz.</p>

          <h3>Verilerinizi Silme</h3>
          <p>Uygulama içindeki verileriniz cihazınızda tutulduğu için silmek tamamen sizin kontrolünüzdedir:</p>
          <ul>
            <li><strong>Çetele kayıtlarını silmek için:</strong> Ayarlar → İbadet geçmişini temizle</li>
            <li><strong>Tüm verileri silmek için:</strong> Uygulamayı kaldırın veya cihaz ayarlarından Uygulama Bilgisi → Depolama → Verileri temizle</li>
          </ul>
          <p>Uygulamayı kaldırdığınızda tüm veriler cihazınızdan kalıcı olarak silinir. Bizde saklanan bir kopyası olmadığı için ayrıca bize başvurmanıza gerek yoktur.</p>

          <h3>Değişiklikler</h3>
          <p>Bu politikada değişiklik yapılırsa, güncellenmiş metin bu sayfada yayımlanır ve yukarıdaki "Son güncelleme" tarihi değiştirilir.</p>

          <h3>İletişim</h3>
          <p>Gizlilikle ilgili sorularınız için: <a href="mailto:info@ankaverse.com.tr">info@ankaverse.com.tr</a></p>

          <hr />

          <h2 id="en">🇬🇧 English</h2>

          <h3>Summary</h3>
          <p><strong>Vaktia never sends your worship, location, or settings data off your device.</strong></p>
          <p>
            Prayer times, qibla direction, and the daily verse are all calculated directly on your device. Your
            tracking records, location, and preferences are never sent to any server.
          </p>
          <p>No account is required. There are no analytics and no tracking tools. The app shows banner ads through <strong>Google AdMob</strong> only; the scope of this is described in the "Advertising" section below.</p>

          <h3>Information Processed</h3>
          <p>The following is stored <strong>only on your device</strong> and never leaves it:</p>
          <table>
            <thead>
              <tr><th>Information</th><th>Purpose</th><th>Where it is stored</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Approximate location (latitude/longitude)</td>
                <td>Calculating prayer times and qibla direction for where you are</td>
                <td>Device storage (app preferences)</td>
              </tr>
              <tr>
                <td>Selected city</td>
                <td>Calculating times for users who prefer not to grant location access</td>
                <td>Device storage (app preferences)</td>
              </tr>
              <tr>
                <td>App settings (calculation method, theme, notification preferences, notification sound)</td>
                <td>Remembering your preferences</td>
                <td>Device storage (app preferences)</td>
              </tr>
              <tr>
                <td>Prayer tracking records</td>
                <td>Letting you mark and follow the prayers you have performed</td>
                <td>Local database on the device</td>
              </tr>
            </tbody>
          </table>
          <p>None of this is <strong>transmitted</strong> to the developer, to ANKAVERSE, or to any third party.</p>

          <h3>Advertising (Google AdMob)</h3>
          <p>
            The app displays banner ads through Google AdMob. To serve ads, Google's advertising SDK may transmit
            your device's <strong>advertising ID</strong> and basic technical information (such as IP address and
            device model) to Google, which processes it for ad delivery, frequency capping, and fraud prevention.
          </p>
          <ul>
            <li>Advertising data is <strong>never linked</strong> to your location, tracking records, or any worship data in the app — none of that is sent to Google.</li>
            <li>Users in the EEA and UK are shown Google's consent form before any ad is served; you can change your choice later under Settings → "Manage ad preferences".</li>
            <li>You can reset your advertising ID or opt out of personalised ads in your device settings.</li>
            <li>How Google processes this data: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">policies.google.com/technologies/partner-sites</a></li>
          </ul>

          <h3>Location Permission</h3>
          <p>The app requests <strong>approximate location</strong> only (<code>ACCESS_COARSE_LOCATION</code>). Precise location is not requested.</p>
          <ul>
            <li>Location is used <strong>solely</strong> to calculate prayer times and the qibla direction.</li>
            <li>Location data <strong>never leaves your device</strong>; it is not logged or uploaded.</li>
            <li>You may decline the location permission. The app remains fully functional — simply select your city from the list.</li>
            <li>You can revoke the permission at any time in your device settings.</li>
          </ul>

          <h3>Other Permissions</h3>
          <table>
            <thead>
              <tr><th>Permission</th><th>Why it is needed</th></tr>
            </thead>
            <tbody>
              <tr><td><code>POST_NOTIFICATIONS</code></td><td>To display prayer time notifications</td></tr>
              <tr><td><code>SCHEDULE_EXACT_ALARM</code></td><td>To deliver the prayer notification at the exact minute it is due</td></tr>
              <tr><td><code>RECEIVE_BOOT_COMPLETED</code></td><td>To restore prayer alarms after the device restarts</td></tr>
              <tr><td><code>INTERNET</code>, <code>ACCESS_NETWORK_STATE</code></td><td>Solely so that ads can load</td></tr>
              <tr><td><code>AD_ID</code></td><td>So Google AdMob can use the advertising ID</td></tr>
            </tbody>
          </table>

          <h3>Choosing Your Own Notification Sound</h3>
          <p>
            You may pick an audio file from your device as the notification sound. In that case the app stores only
            the location (URI) of the file you chose and plays it. The file itself is never copied, uploaded, or shared.
          </p>

          <h3>Children's Privacy</h3>
          <p>The app is suitable for users of all ages and collects no personal data from anyone, including children.</p>

          <h3>Deleting Your Data</h3>
          <p>Because your data lives on your device, deleting it is entirely under your control:</p>
          <ul>
            <li><strong>To clear tracking records:</strong> Settings → Clear worship history</li>
            <li><strong>To delete everything:</strong> Uninstall the app, or go to device Settings → App info → Storage → Clear data</li>
          </ul>
          <p>Uninstalling permanently removes all data from your device. As we hold no copy, there is nothing you need to request from us.</p>

          <h3>Changes</h3>
          <p>If this policy changes, the updated text will be published on this page and the "Last updated" date above will be revised.</p>

          <h3>Contact</h3>
          <p>For privacy questions: <a href="mailto:info@ankaverse.com.tr">info@ankaverse.com.tr</a></p>
        </div>

        <p className="text-gray-500 text-xs mt-12 pt-6 border-t border-[#333]">
          © {new Date().getFullYear()} ANKAVERSE. Tüm hakları saklıdır. / All rights reserved.
        </p>
      </div>
    </main>
  );
};

export default VaktiaPrivacyPolicyPage;
