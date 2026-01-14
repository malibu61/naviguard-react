🚢 NaviGuard - Maritime Route Risk Analyzer
<div align="center">
!NaviGuard Logo
!React
!Leaflet
!Ant Design
Denizciler için profesyonel rota planlama ve risk analiz uygulaması
Demo · Özellikler · Kurulum · Kullanım
</div>
📖 Proje Hakkında
NaviGuard, deniz yolu ile seyahat eden gemiler için interaktif rota planlama ve risk analizi sunan modern bir web uygulamasıdır. Kullanıcılar harita üzerinde waypoint'ler belirleyerek rotalarını oluşturabilir, mesafe hesaplamaları yapabilir ve gelecekte hava durumu ile korsanlık risklerini analiz edebileceklerdir.
🎯 Proje Amacı
⚓ Denizcilere güvenli rota planlama imkanı sunmak
🌊 Deniz mili (Nautical Miles) cinsinden doğru mesafe hesaplamaları
🗺️ Interaktif harita üzerinde görsel rota oluşturma
📊 Gelecekte .NET backend ile hava durumu ve risk analizi entegrasyonu
✨ Özellikler
🗺️ Harita ve Navigasyon
✅ Leaflet.js ile tam ekran interaktif dünya haritası
✅ OpenStreetMap tile layer entegrasyonu
✅ Başlangıç konumu: Akdeniz bölgesi (39.0°N, 35.0°E)
✅ Zoom kontrolleri ve harita manipülasyonu
📍 Waypoint Yönetimi
✅ Haritaya tıklayarak waypoint ekleme
✅ Numaralı, custom tasarımlı marker'lar
✅ Sağ tık menüsü ile waypoint işlemleri:
🔄 Waypoint taşıma (Drag & Drop)
🗑️ Waypoint silme
❌ Taşımayı iptal etme
✅ Araya waypoint ekleme - İki waypoint arasındaki + butonuna tıklayarak
✅ Tooltip'ler ile detaylı koordinat bilgisi
✅ Minimal animasyonlar (fade-in & scale)
📏 Mesafe Hesaplama
✅ Haversine formülü ile doğru mesafe hesaplama
✅ Deniz Mili (Nautical Miles) cinsinden sonuçlar
✅ Gerçek zamanlı toplam rota mesafesi
✅ Tahmini varış süresi (hıza göre)
🎨 Rota Görselleştirme
✅ Mavi, kesikli (dashed) Polyline
✅ Dinamik rota güncelleme
✅ Her iki waypoint arasında yeşil + butonları
✅ Hover efektleri ve animasyonlar
🎛️ Yan Panel (Sidebar)
✅ Koyu tema (dark mode) arayüz
✅ Ortalama hız girişi (Knots)
✅ Waypoint listesi (numaralı, silinebilir)
✅ İstatistikler:
📊 Toplam mesafe (NM)
⏱️ Tahmini süre (saat)
✅ "Rotayı Analiz Et" butonu (2+ waypoint gerekli)
✅ "Tümünü Temizle" butonu
💫 Kullanıcı Deneyimi
✅ Responsive tasarım (mobil uyumlu)
✅ Smooth animasyonlar
✅ Context menu popup'ları
✅ Kapatılabilir popup'lar (X butonu)
✅ Event propagation kontrolü
✅ Bildirim mesajları (Ant Design)
🛠️ Teknoloji Stack
Kategori	Teknoloji	Versiyon
Frontend Framework	React.js	19.2.3
Harita	Leaflet.js	1.9.4
Harita React Wrapper	React-Leaflet	5.0.0
UI Library	Ant Design	6.2.0
İkonlar	Lucide-React	0.562.0
Styling	CSS3	-
📁 Proje Yapısı
naviguard-react/├── public/│   ├── index.html          # HTML template│   └── manifest.json       # PWA manifest├── src/│   ├── components/│   │   ├── MapView.js      # Harita ve waypoint rendering│   │   ├── MapView.css     # Harita stilleri│   │   ├── Sidebar.js      # Sol panel ve kontroller│   │   ├── Sidebar.css     # Sidebar stilleri│   │   ├── WaypointList.js # Waypoint listesi│   │   └── WaypointList.css│   ├── App.js              # Ana component ve state yönetimi│   ├── App.css             # Global stiller│   ├── index.js            # React entry point│   └── index.css           # Base styles├── package.json└── README.md
🚀 Kurulum
Gereksinimler
Node.js (v16 veya üzeri)
npm veya yarn
Adımlar
Projeyi klonlayın:
git clone https://github.com/kullaniciadi/naviguard-react.gitcd naviguard-react
Bağımlılıkları yükleyin:
npm install# veyayarn install
Geliştirme sunucusunu başlatın:
npm start# veyayarn start
Tarayıcıda açın:
http://localhost:3000
📖 Kullanım
1️⃣ Waypoint Ekleme
Harita üzerinde istediğiniz yere tıklayın
Yeni waypoint numaralı marker ile eklenir
2️⃣ Araya Waypoint Ekleme
İki waypoint arasındaki yeşil + butonuna tıklayın
Orta noktaya otomatik waypoint eklenir
3️⃣ Waypoint Taşıma
Waypoint'e sağ tıklayın
"Taşı" butonunu seçin
Marker'ı istediğiniz yere sürükleyin
"Taşımayı İptal Et" ile iptal edebilirsiniz
4️⃣ Waypoint Silme
Waypoint'e sağ tıklayın
"Sil" butonunu seçin
5️⃣ Hız ve Mesafe
Sol panelden ortalama hızı girin (Knots)
Toplam mesafe ve tahmini süre otomatik hesaplanır
6️⃣ Rota Analizi
En az 2 waypoint ekleyin
"Rotayı Analiz Et" butonuna tıklayın
(Gelecekte backend entegrasyonu ile risk analizi yapılacak)
🔮 Gelecek Özellikler (Roadmap)
Backend Entegrasyonu
[ ] .NET Core backend API geliştirme
[ ] Rota verilerini backend'e gönderme
[ ] RESTful API endpoints
Risk Analizi
[ ] Hava durumu verisi entegrasyonu
Rüzgar hızı ve yönü
Dalga yüksekliği
Görüş mesafesi
[ ] Korsanlık risk haritası
Riskli bölgelerin gösterimi
Risk seviyesi hesaplama
[ ] Gerçek zamanlı uyarılar
Gelişmiş Özellikler
[ ] Rota kaydetme ve yükleme
[ ] Kullanıcı hesapları
[ ] Çoklu rota karşılaştırma
[ ] Deniz akıntıları hesaba katma
[ ] Yakıt tüketimi tahmini
[ ] PDF/Excel rota raporu
[ ] Offline mod
[ ] Çoklu dil desteği
Optimizasyonlar
[ ] Performans iyileştirmeleri
[ ] PWA özellikleri
[ ] Daha fazla harita katmanı
[ ] Dark/Light tema seçeneği
🎨 Tasarım
Renk Paleti
Primary Blue: #3b82f6 - Rota, butonlar
Green: #10b981 - Midpoint (+) butonları
Dark Background: #1a202c - Ana arka plan
Secondary Dark: #2d3748 - Panel arka planı
Red: #ef4444 - Silme ve uyarı
Tema
Modern, minimalist, endüstriyel
Koyu tema (dark mode) ağırlıklı
Denizcilik hissi veren mavi-gri tonları
Smooth animasyonlar ve transitions
🤝 Katkıda Bulunma
Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:
Fork yapın
Feature branch oluşturun (git checkout -b feature/amazing-feature)
Değişikliklerinizi commit edin (git commit -m 'feat: Add amazing feature')
Branch'inizi push edin (git push origin feature/amazing-feature)
Pull Request açın
📝 Lisans
Bu proje MIT License altında lisanslanmıştır.
👨‍💻 Geliştirici
[Adınız]
GitHub: @kullaniciadi
LinkedIn: Profil
🙏 Teşekkürler
Leaflet.js - Harita kütüphanesi
OpenStreetMap - Harita verileri
Ant Design - UI component'leri
Lucide - İkon seti
<div align="center">
⚓ Güvenli yolculuklar dileriz! ⚓
Made with ❤️ for maritime navigation
</div>
📊 Proje İstatistikleri
Component Sayısı: 3 (MapView, Sidebar, WaypointList)
Kod Satırı: ~1000+ lines
Özellik Sayısı: 20+ features
Geliştirme Süresi: Active development
