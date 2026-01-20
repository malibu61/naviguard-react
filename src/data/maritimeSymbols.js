// OpenSeaMap / OpenStreetMap Seamark Standart İşaretleri
// Bu liste OpenSeaMap seamark overlay'inde görünen standart etiketlere göre hazırlanmıştır
// Kaynak: https://wiki.openseamap.org ve https://wiki.openstreetmap.org/wiki/Seamarks

export const maritimeSymbols = [
  {
    category: 'Işıklar (Lights)',
    seamarkType: 'light',
    symbols: [
      {
        name: 'Ana Fener (Light Major)',
        seamarkTag: 'seamark:type=light_major',
        description: 'Uzun mesafe navigasyon için kullanılan büyük fenerler. Güçlü ışık sinyali verir.',
        standard: 'IHO S-101 / INT-1',
        symbolType: 'light_major'
      },
      {
        name: 'Yardımcı Işık (Light Minor)',
        seamarkTag: 'seamark:type=light_minor',
        description: 'Kısa mesafe navigasyon için kullanılan küçük ışık işaretleri.',
        standard: 'IHO S-101 / INT-1',
        symbolType: 'light_minor'
      },
      {
        name: 'Fener Gemisi (Light Vessel)',
        seamarkTag: 'seamark:type=light_vessel',
        description: 'Açık denizlerde sabit duran, üzerinde fener bulunan özel gemi.',
        standard: 'IHO S-101 / INT-1',
        symbolType: 'light_vessel'
      },
      {
        name: 'Yüzen Işık (Light Float)',
        seamarkTag: 'seamark:type=light_float',
        description: 'Şamandıra üzerinde veya yüzen platformda bulunan ışık.',
        standard: 'IHO S-101 / INT-1',
        symbolType: 'light_float'
      },
      {
        name: 'Fener (Lighthouse)',
        seamarkTag: 'seamark:type=lighthouse',
        description: 'Sahilde veya açık denizde bulunan, gece ve gündüz navigasyon yardımı sağlayan yapı.',
        standard: 'IHO S-101 / INT-1',
        symbolType: 'lighthouse'
      }
    ]
  },
  {
    category: 'Yan Şamandıralar (Lateral Buoys)',
    seamarkType: 'buoy_lateral',
    symbols: [
      {
        name: 'Sancak Yan Şamandırası (Starboard Lateral Buoy)',
        seamarkTag: 'seamark:type=buoy_lateral;seamark:buoy_lateral:category=starboard',
        description: 'IALA-A: Yeşil, giriş yönünde sancak (sağ) tarafını işaretler. IALA-B: Kırmızı, giriş yönünde sancak (sağ) tarafını işaretler.',
        standard: 'IALA-A/B',
        color: 'IALA-A: Yeşil | IALA-B: Kırmızı',
        shape: 'Koni (conical), üstte koni işareti',
        symbolType: 'starboard_lateral'
      },
      {
        name: 'İskele Yan Şamandırası (Port Lateral Buoy)',
        seamarkTag: 'seamark:type=buoy_lateral;seamark:buoy_lateral:category=port',
        description: 'IALA-A: Kırmızı, giriş yönünde iskele (sol) tarafını işaretler. IALA-B: Yeşil, giriş yönünde iskele (sol) tarafını işaretler.',
        standard: 'IALA-A/B',
        color: 'IALA-A: Kırmızı | IALA-B: Yeşil',
        shape: 'Silindirik (can), üstte silindir işareti',
        symbolType: 'port_lateral'
      }
    ]
  },
  {
    category: 'Kardinal Şamandıralar (Cardinal Buoys)',
    seamarkType: 'buoy_cardinal',
    symbols: [
      {
        name: 'Kuzey Kardinal Şamandırası (North Cardinal)',
        seamarkTag: 'seamark:type=buoy_cardinal;seamark:buoy_cardinal:category=north',
        description: 'Sarı-üst, siyah-alt. Tehlikenin kuzeyinde kalın. Üstte iki koni, uçları yukarı.',
        standard: 'IALA',
        color: 'Sarı-üst / Siyah-alt',
        topmark: 'İki koni, uçları yukarı ▲▲',
        symbolType: 'north_cardinal'
      },
      {
        name: 'Doğu Kardinal Şamandırası (East Cardinal)',
        seamarkTag: 'seamark:type=buoy_cardinal;seamark:buoy_cardinal:category=east',
        description: 'Sarı-üst, siyah-orta, sarı-alt. Tehlikenin doğusunda kalın. Üstte iki koni, tabanlar birleşik.',
        standard: 'IALA',
        color: 'Sarı-üst / Siyah-orta / Sarı-alt',
        topmark: 'İki koni, tabanlar birleşik ◄►',
        symbolType: 'east_cardinal'
      },
      {
        name: 'Güney Kardinal Şamandırası (South Cardinal)',
        seamarkTag: 'seamark:type=buoy_cardinal;seamark:buoy_cardinal:category=south',
        description: 'Siyah-üst, sarı-alt. Tehlikenin güneyinde kalın. Üstte iki koni, uçları aşağı.',
        standard: 'IALA',
        color: 'Siyah-üst / Sarı-alt',
        topmark: 'İki koni, uçları aşağı ▼▼',
        symbolType: 'south_cardinal'
      },
      {
        name: 'Batı Kardinal Şamandırası (West Cardinal)',
        seamarkTag: 'seamark:type=buoy_cardinal;seamark:buoy_cardinal:category=west',
        description: 'Sarı-üst, siyah-orta, sarı-alt. Tehlikenin batısında kalın. Üstte iki koni, uçları birbirine bakar.',
        standard: 'IALA',
        color: 'Sarı-üst / Siyah-orta / Sarı-alt',
        topmark: 'İki koni, uçları birbirine bakar ►◄',
        symbolType: 'west_cardinal'
      }
    ]
  },
  {
    category: 'Tehlikeli Bölge Şamandıraları (Isolated Danger Buoys)',
    seamarkType: 'buoy_isolated_danger',
    symbols: [
      {
        name: 'Tehlikeli Bölge Şamandırası (Isolated Danger)',
        seamarkTag: 'seamark:type=buoy_isolated_danger',
        description: 'Siyah-kırmızı-siyah yatay bantlar. Küçük tehlikeli bölgeleri (kayalar, sığlık, batık) işaretler. Üstte iki siyah küre.',
        standard: 'IALA',
        color: 'Siyah-Kırmızı-Siyah',
        topmark: 'İki siyah küre ●●',
        symbolType: 'isolated_danger'
      }
    ]
  },
  {
    category: 'Güvenli Su Şamandıraları (Safe Water Buoys)',
    seamarkType: 'buoy_safe_water',
    symbols: [
      {
        name: 'Güvenli Su Şamandırası (Safe Water)',
        seamarkTag: 'seamark:type=buoy_safe_water',
        description: 'Kırmızı-beyaz dikey çizgili. Derin ve güvenli su alanlarını işaretler. Üstte kırmızı küre.',
        standard: 'IALA',
        color: 'Kırmızı-Beyaz dikey çizgiler',
        topmark: 'Kırmızı küre ●',
        symbolType: 'safe_water'
      }
    ]
  },
  {
    category: 'Özel Amaçlı Şamandıralar (Special Purpose Buoys)',
    seamarkType: 'buoy_special_purpose',
    symbols: [
      {
        name: 'Özel Amaçlı Şamandıra (Special Purpose)',
        seamarkTag: 'seamark:type=buoy_special_purpose',
        description: 'Sarı renkli. Özel amaçlar için kullanılır (askeri bölgeler, araştırma alanları, telekomünikasyon kabloları vb.).',
        standard: 'IALA',
        color: 'Sarı',
        purpose: 'Özel amaç belirtilir (askeri, araştırma, kablo vb.)',
        symbolType: 'special_purpose'
      }
    ]
  },
  {
    category: 'Yan İşaretler (Lateral Beacons)',
    seamarkType: 'beacon_lateral',
    symbols: [
      {
        name: 'Sancak Yan İşareti (Starboard Lateral Beacon)',
        seamarkTag: 'seamark:type=beacon_lateral;seamark:beacon_lateral:category=starboard',
        description: 'Sabit yapı. IALA-A: Yeşil, IALA-B: Kırmızı. Kanalların sancak tarafını işaretler.',
        standard: 'IALA-A/B',
        color: 'IALA-A: Yeşil | IALA-B: Kırmızı',
        symbolType: 'starboard_lateral'
      },
      {
        name: 'İskele Yan İşareti (Port Lateral Beacon)',
        seamarkTag: 'seamark:type=beacon_lateral;seamark:beacon_lateral:category=port',
        description: 'Sabit yapı. IALA-A: Kırmızı, IALA-B: Yeşil. Kanalların iskele tarafını işaretler.',
        standard: 'IALA-A/B',
        color: 'IALA-A: Kırmızı | IALA-B: Yeşil',
        symbolType: 'port_lateral'
      }
    ]
  },
  {
    category: 'Kardinal İşaretler (Cardinal Beacons)',
    seamarkType: 'beacon_cardinal',
    symbols: [
      {
        name: 'Kardinal İşaret (Cardinal Beacon)',
        seamarkTag: 'seamark:type=beacon_cardinal',
        description: 'Sabit yapılar. Şamandıralar gibi kuzey, doğu, güney, batı kardinal noktalarını işaretler. Aynı renk ve topmark kuralları geçerlidir.',
        standard: 'IALA',
        color: 'Kardinal şamandıralar ile aynı',
        topmark: 'Kardinal şamandıralar ile aynı',
        symbolType: 'north_cardinal'
      }
    ]
  },
  {
    category: 'Limanlar ve Tesisler (Ports & Facilities)',
    seamarkType: 'port',
    symbols: [
      {
        name: 'Liman (Port)',
        seamarkTag: 'seamark:type=port',
        description: 'Gemilerin yük alma-boşaltma, yolcu indirme-bindirme yaptığı liman tesisleri.',
        standard: 'OSM Seamark',
        symbolType: 'port'
      },
      {
        name: 'Liman (Harbour)',
        seamarkTag: 'seamark:type=harbour',
        description: 'Gemilerin barınması ve yanaşması için kullanılan doğal veya yapay liman.',
        standard: 'OSM Seamark',
        symbolType: 'harbour'
      },
      {
        name: 'Marina',
        seamarkTag: 'seamark:type=marina',
        description: 'Tekne ve yatların barınması için özel olarak tasarlanmış küçük liman tesisleri.',
        standard: 'OSM Seamark',
        symbolType: 'marina'
      },
      {
        name: 'İskele (Wharf)',
        seamarkTag: 'seamark:type=wharf',
        description: 'Gemilerin yanaşabileceği, yük ve yolcu transferi yapılabileceği sabit yapı.',
        standard: 'OSM Seamark',
        symbolType: 'wharf'
      },
      {
        name: 'Rıhtım (Jetty)',
        seamarkTag: 'seamark:type=jetty',
        description: 'Deniz veya nehir kenarındaki yanaşma platformu.',
        standard: 'OSM Seamark',
        symbolType: 'jetty'
      },
      {
        name: 'İndirme İskelesi (Landing Stage)',
        seamarkTag: 'seamark:type=landing_stage',
        description: 'Yolcu indirme-bindirme için kullanılan küçük iskele veya platform.',
        standard: 'OSM Seamark',
        symbolType: 'landing_stage'
      },
      {
        name: 'Bağlama Yeri (Mooring)',
        seamarkTag: 'seamark:type=mooring',
        description: 'Teknelerin geçici veya kalıcı olarak bağlanabileceği nokta veya alan.',
        standard: 'OSM Seamark',
        symbolType: 'mooring'
      },
      {
        name: 'Dalga Kıran (Breakwater)',
        seamarkTag: 'seamark:type=breakwater',
        description: 'Liman veya kıyıyı dalgalardan korumak için inşa edilen yapı.',
        standard: 'OSM Seamark',
        symbolType: 'breakwater'
      }
    ]
  }
];

// IALA Sistemi Açıklaması (OpenSeaMap Standart)
export const ialaSystem = {
  title: 'IALA Deniz İşaretleri Sistemi (OpenSeaMap Standart)',
  description: 'Uluslararası Deniz Fenerleri Kurumu (IALA) tarafından belirlenen denizcilik işaretleri sistemi. OpenSeaMap bu standartlara uygun etiketleme kullanır.',
  regions: [
    {
      name: 'IALA-Bölge A',
      tag: 'seamark:buoy_lateral:system=iala-a',
      description: 'Avrupa, Afrika, Asya, Avustralya (Türkiye dahil). Kırmızı şamandıra giriş yönünde SOL (iskele), yeşil şamandıra SAĞ (sancak) tarafını işaretler.',
      countries: 'Türkiye, Yunanistan, İtalya, Fransa, İngiltere, Almanya vb.',
      standard: 'IHO S-101 / INT-1'
    },
    {
      name: 'IALA-Bölge B',
      tag: 'seamark:buoy_lateral:system=iala-b',
      description: 'Amerika, Japonya, Kore, Filipinler. Kırmızı şamandıra giriş yönünde SAĞ (sancak), yeşil şamandıra SOL (iskele) tarafını işaretler.',
      countries: 'ABD, Kanada, Japonya, Güney Kore, Filipinler vb.',
      standard: 'IHO S-101 / INT-1'
    }
  ],
  reference: {
    title: 'Referans Kaynaklar',
    sources: [
      'OpenSeaMap Wiki: https://wiki.openseamap.org',
      'OSM Seamarks: https://wiki.openstreetmap.org/wiki/Seamarks',
      'IALA Resmi: https://www.iala-aism.org',
      'IHO S-101 Standard'
    ]
  }
};
