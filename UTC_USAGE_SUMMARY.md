# 🚢 NaviGuard - UTC Saat Kullanımı Özeti

## ✅ REACT UYGULAMASI - MEVCUT DURUM

React uygulamanızda **TÜM saatler UTC olarak** doğru şekilde işlenmektedir.

### 1️⃣ Başlangıç Saati Seçimi (Sidebar.js)

```javascript
// ✅ DatePicker UTC modunda
<DatePicker
  showTime
  format="DD.MM.YYYY HH:mm"
  value={startTime ? dayjs.utc(startTime) : null}
  onChange={(date) => onStartTimeChange(date ? date.utc().toDate() : null)}
  placeholder="Başlangıç saatini seçin (UTC)"
/>
```

**✅ Doğru:** `dayjs.utc()` kullanılıyor, seçilen saat UTC olarak kaydediliyor.

---

### 2️⃣ API İstekleri (App.js)

```javascript
// ✅ Backend'e ISO 8601 UTC formatında gönderiliyor
const timestamp = pos.time instanceof Date
  ? pos.time.toISOString()  // UTC ISO 8601
  : (typeof pos.time === 'string' ? pos.time : new Date(pos.time).toISOString());

// Analiz endpoint
{
  latitude: pos.lat,
  longitude: pos.lng,
  timestamp: timestamp,  // "2026-01-31T14:30:00.000Z" formatında
  hour: pos.hour,
  distance: pos.distance
}

// Hava durumu endpoint
{
  latitude: pos.lat,
  longitude: pos.lng,
  timestamp  // "2026-01-31T14:30:00.000Z" formatında
}
```

**✅ Doğru:** `toISOString()` her zaman UTC timestamp döndürür.

---

### 3️⃣ UI Gösterimi

#### Sidebar - Saatlik Konumlar:

```javascript
// ✅ UTC olarak formatlanıyor ve label açık
<Text className="waypoint-title">Saatlik Konumlar (UTC)</Text>

<Text className="hour-time" title="Tüm saatler UTC">
  {dayjs.utc(pos.time).format('DD.MM.YYYY HH:mm')} UTC
</Text>
```

#### MapView - Marker Tooltip:

```javascript
// ✅ UTC label ile gösteriliyor
<Tooltip>
  <strong>+{pos.hour} Saat</strong><br />
  {timeUtcFormatted} <span>UTC</span>
</Tooltip>

// ✅ Popup
<span className="hourly-popup-label">Tarih & Saat (UTC):</span>
<span className="hourly-popup-value" title="Tüm saatler UTC">
  {timeUtcFormatted}
</span>
```

**✅ Doğru:** Tüm UI elementlerinde UTC açıkça belirtiliyor.

---

### 4️⃣ Hava Durumu Karşılaştırması (MapView.js)

```javascript
// ✅ Her iki taraf da UTC olarak karşılaştırılıyor
// Hem pos.time hem API 'time' UTC. Direkt UTC üzerinden karşılaştır, TR'ye çevirme.
const posTimeUtc = dayjs.utc(pos.time).format('YYYY-MM-DDTHH:mm');

const weather = weatherData && weatherData.length > 0
  ? weatherData.find(w => {
      if (!w.time) return false;
      const weatherTimeUtc = w.time.substring(0, 16);
      return weatherTimeUtc === posTimeUtc;
    })
  : null;
```

**✅ Doğru:** 
- `dayjs.utc()` ile UTC format
- Backend'den gelen `w.time` zaten UTC ISO string
- Substring karşılaştırması doğru

---

## 🎯 YAPILAN DEĞİŞİKLİKLER

### ✏️ Sidebar.js

**Öncesi:**
```javascript
value={startTime ? dayjs(startTime) : null}
onChange={(date) => onStartTimeChange(date ? date.toDate() : null)}
```

**Sonrası:**
```javascript
value={startTime ? dayjs.utc(startTime) : null}
onChange={(date) => onStartTimeChange(date ? date.utc().toDate() : null)}
```

**Değişiklik:** DatePicker'ın UTC modunda çalışması sağlandı.

---

## 📊 BACKEND BEKLENEN FORMAT

### Request Format (Frontend → Backend):

```json
{
  "hourlyPositions": [
    {
      "latitude": 40.1234,
      "longitude": 26.5678,
      "timestamp": "2026-01-31T14:00:00.000Z",  // ✅ ISO 8601 UTC
      "hour": 1,
      "distance": 12.5
    }
  ]
}
```

### Response Format (Backend → Frontend):

```json
[
  {
    "time": "2026-01-31T14:00:00",  // ✅ UTC ISO string (Z olmadan da olabilir)
    "temperature_2m": 18.5,
    "windspeed_10m": 5.2,
    "wave_height": 1.5
    // ... other weather data
  }
]
```

---

## ✅ KONTROL LİSTESİ

### React Uygulaması:
- ✅ DatePicker UTC modunda
- ✅ Saatler UTC olarak kaydediliyor
- ✅ API'ye UTC timestamp gönderiliyor (ISO 8601)
- ✅ Backend'den gelen UTC timestamp direkt kullanılıyor
- ✅ UI'da "(UTC)" label'ı mevcut
- ✅ Hava durumu UTC olarak eşleştiriliyor
- ✅ Hiçbir timezone dönüşümü yok

### Flutter Uygulaması için TODO:
- 📝 `FLUTTER_PROMPTS_UTC_FIXED.md` dokümanı hazırlandı
- 📝 Tüm promptlar UTC kullanımı için güncellendi
- 📝 Extension'lar UTC format için hazırlandı
- 📝 API servisleri UTC timestamp gönderecek şekilde ayarlandı
- 📝 DatePicker UTC modunda çalışacak
- 📝 UI'da "(UTC)" label'ları eklenecek

---

## 🔍 DOĞRULAMA

### Test Senaryosu:

1. **Başlangıç Saati Seç:**
   - Saat: 15:30
   - UI'da: "15:30 UTC" görünmeli
   - State'te: UTC Date object olmalı

2. **Rota Analizi Yap:**
   - Network tab'da request body kontrol et
   - Timestamp: `"2026-01-31T15:30:00.000Z"` formatında olmalı

3. **Saatlik Konumlar Göster:**
   - Her pozisyonda "+1h", "+2h" vb. görünmeli
   - Saatler: "31.01.2026 16:30 UTC", "31.01.2026 17:30 UTC" formatında

4. **Hava Durumu:**
   - Marker'lara tıklayınca weather data görünmeli
   - Eşleşme doğru olmalı (UTC comparison)

---

## 📝 SON NOTLAR

### ✅ Ne Doğru?
- Tüm saatler UTC olarak işleniyor
- Backend ile UTC üzerinden iletişim
- UI'da açık UTC label'ları
- Timezone conversion yok

### ❌ Ne Yanlış Olabilirdi?
- ~~Local time kullanımı~~ → Kullanılmıyor ✅
- ~~TR timezone'a dönüştürme~~ → Yapılmıyor ✅
- ~~Backend'e local timestamp göndermek~~ → UTC gönderiliyor ✅
- ~~UI'da timezone belirtmemek~~ → "(UTC)" label var ✅

---

## 🎉 SONUÇ

React uygulamanız **tamamen UTC saatlerle çalışıyor**! 

- ✅ Kullanıcı UTC saati seçiyor
- ✅ Backend'e UTC timestamp gönderiliyor
- ✅ Backend'den UTC timestamp alınıyor
- ✅ UI'da UTC olarak gösteriliyor
- ✅ Hava durumu UTC üzerinden eşleştiriliyor

**HİÇBİR timezone dönüşümü yapılmıyor!** ✨

---

## 📚 Flutter için Hazır Dokümanlar:

1. **FLUTTER_PROMPTS_UTC_FIXED.md** - Tüm promptlar için UTC düzeltmeleri
2. Bu dosya - React uygulamasının mevcut durumu

Flutter uygulaması için `FLUTTER_PROMPTS_UTC_FIXED.md` dokümanını takip ederek tüm promptlarda UTC kullanımını garantileyin!
