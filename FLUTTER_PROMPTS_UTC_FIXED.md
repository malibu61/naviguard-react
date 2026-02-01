# 🚢 NaviGuard Flutter - UTC Sabit Saat Kullanımı Güncellemesi

## ⚠️ ÖNEMLİ: TÜM SAATLER UTC OLARAK İŞLENECEK

Bu dokümanda, tüm Flutter promptlarında **saat işlemlerinin UTC olarak yapılması** için gerekli düzeltmeler bulunmaktadır.

---

## 🔧 1. PROMPT 1 DÜZELTMELER

### Constants Güncelleme (utils/constants.dart):

```dart
class AppConstants {
  // ... existing constants
  
  // Date/Time formats (ALL IN UTC)
  static const String dateTimeFormat = 'dd.MM.yyyy HH:mm';
  static const String dateFormat = 'dd.MM.yyyy';
  static const String timeFormat = 'HH:mm';
  
  // Labels
  static const String utcLabel = 'UTC';
}
```

### Extensions Güncelleme (utils/extensions.dart):

```dart
import 'package:intl/intl.dart';

extension DateTimeExtensions on DateTime {
  /// Format as UTC datetime string
  String toUtcFormattedString() {
    final utcTime = toUtc();
    return '${utcTime.day.toString().padLeft(2, '0')}.${utcTime.month.toString().padLeft(2, '0')}.${utcTime.year} ${utcTime.hour.toString().padLeft(2, '0')}:${utcTime.minute.toString().padLeft(2, '0')} UTC';
  }
  
  /// Format as UTC date only
  String toUtcDateString() {
    final utcTime = toUtc();
    return '${utcTime.day.toString().padLeft(2, '0')}.${utcTime.month.toString().padLeft(2, '0')}.${utcTime.year}';
  }
  
  /// Format as UTC time only
  String toUtcTimeString() {
    final utcTime = toUtc();
    return '${utcTime.hour.toString().padLeft(2, '0')}:${utcTime.minute.toString().padLeft(2, '0')}';
  }
}
```

---

## 🔧 2. PROMPT 2 DÜZELTMELER

### Calculation Service - Saatlik Konumlar (calculation_service.dart):

```dart
/// Saatlik konumları hesapla - TÜM SAATLER UTC
List<HourlyPosition> calculateHourlyPositions(
  List<Waypoint> waypoints,
  Map<int, double?> segmentSpeeds,
  bool useDefaultSpeed,
  double defaultSpeed,
  DateTime startTime, // MUST BE UTC
) {
  if (waypoints.length < 2) return [];
  
  // startTime'ın UTC olduğundan emin ol
  final utcStartTime = startTime.toUtc();
  
  // ... existing segment calculation code ...
  
  for (int hour = 1; hour <= maxHours; hour++) {
    final timeAtHour = hour.toDouble();
    
    if (timeAtHour >= accumulatedTime) {
      // UTC olarak zaman ekle
      final timeAtPosition = utcStartTime.add(Duration(hours: hour));
      
      positions.add(HourlyPosition(
        hour: hour,
        time: timeAtPosition, // UTC datetime
        lat: waypoints.last.lat,
        lng: waypoints.last.lng,
        distance: accumulatedDistance,
      ));
      break;
    }
    
    // ... segment finding logic ...
    
    // UTC olarak zaman ekle
    final timeAtPosition = utcStartTime.add(Duration(hours: hour));
    
    positions.add(HourlyPosition(
      hour: hour,
      time: timeAtPosition, // UTC datetime
      lat: lat,
      lng: lng,
      distance: seg.accumulatedDistance + distanceInSegment,
    ));
  }
  
  return positions;
}
```

---

## 🔧 3. PROMPT 3 DÜZELTMELER

### API Service - Timestamp Formatting (api_service.dart):

```dart
/// Rota analizi yap
Future<AnalysisResult> analyzeRoute({
  required List<Waypoint> waypoints,
  required List<double> segmentSpeeds,
  required double totalDistance,
  required double estimatedTime,
  required List<Segment> segments,
  required List<HourlyPosition> hourlyPositions,
}) async {
  // ... existing code ...
  
  final requestBody = {
    // ... existing fields ...
    'hourlyPositions': hourlyPositions.map((pos) => {
      'latitude': pos.lat,
      'longitude': pos.lng,
      'timestamp': pos.time.toUtc().toIso8601String(), // FORCE UTC
      'hour': pos.hour,
      'distance': pos.distance,
    }).toList(),
  };
  
  // ... rest of the code ...
}

/// Hava durumu verileri al
Future<List<WeatherData>> getWeatherData(
  List<HourlyPosition> hourlyPositions,
) async {
  // ... existing code ...
  
  final requestBody = hourlyPositions.map((pos) => {
    'latitude': pos.lat,
    'longitude': pos.lng,
    'timestamp': pos.time.toUtc().toIso8601String(), // FORCE UTC
  }).toList();
  
  // ... rest of the code ...
}
```

### Sidebar Panel - UTC Date/Time Picker (sidebar_panel.dart):

```dart
Widget _buildStartTimeSection(RouteProvider routeProvider) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        children: [
          Icon(Icons.access_time, size: 16, color: Colors.white70),
          SizedBox(width: 8),
          Text(
            'Başlangıç Saati (UTC)', // UTC label açık
            style: TextStyle(
              color: Colors.white70,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
      SizedBox(height: 8),
      InkWell(
        onTap: () => _selectStartTime(context, routeProvider),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: AppConstants.secondaryDark,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(Icons.calendar_today, size: 16, color: Colors.white70),
              SizedBox(width: 12),
              Text(
                _startTime != null
                    ? _formatDateTimeUtc(_startTime!) // UTC formatla
                    : 'Başlangıç saatini seçin (UTC)',
                style: TextStyle(
                  color: _startTime != null ? Colors.white : Colors.white54,
                ),
              ),
            ],
          ),
        ),
      ),
    ],
  );
}

Future<void> _selectStartTime(BuildContext context, RouteProvider routeProvider) async {
  // Mevcut zamanı UTC'ye çevir
  final initialDate = _startTime?.toUtc() ?? DateTime.now().toUtc();
  
  final date = await showDatePicker(
    context: context,
    initialDate: initialDate,
    firstDate: DateTime.now().toUtc().subtract(Duration(days: 365)),
    lastDate: DateTime.now().toUtc().add(Duration(days: 365)),
  );
  
  if (date != null) {
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initialDate),
    );
    
    if (time != null) {
      // DateTime'ı UTC olarak oluştur
      final dateTime = DateTime.utc(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
      
      setState(() {
        _startTime = dateTime;
      });
      routeProvider.setStartTime(dateTime);
    }
  }
}

String _formatDateTimeUtc(DateTime dateTime) {
  final utc = dateTime.toUtc();
  return '${utc.day.toString().padLeft(2, '0')}.${utc.month.toString().padLeft(2, '0')}.${utc.year} ${utc.hour.toString().padLeft(2, '0')}:${utc.minute.toString().padLeft(2, '0')} UTC';
}
```

### Hourly Positions Display - UTC Format (sidebar_panel.dart):

```dart
Widget _buildHourlyPositions(RouteProvider routeProvider) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        children: [
          Icon(Icons.access_time, size: 18, color: Colors.white70),
          SizedBox(width: 8),
          Text(
            'Saatlik Konumlar (UTC)', // UTC label
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w600,
              fontSize: 16,
            ),
          ),
        ],
      ),
      SizedBox(height: 12),
      ...routeProvider.hourlyPositions.map((pos) {
        return Container(
          margin: EdgeInsets.only(bottom: 8),
          padding: EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppConstants.secondaryDark,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  '+${pos.hour}s',
                  style: TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _formatDateTimeUtc(pos.time), // UTC formatla
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                      ),
                    ),
                    Text(
                      'Lat: ${pos.lat.toStringAsFixed(4)}° | Lon: ${pos.lng.toStringAsFixed(4)}°',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
      SizedBox(height: 16),
      Divider(color: Colors.white24),
      SizedBox(height: 16),
    ],
  );
}
```

---

## 🔧 4. PROMPT 4 DÜZELTMELER

### Hourly Position Marker - UTC Display (hourly_position_marker.dart):

```dart
void _showPositionDetails(BuildContext context) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      backgroundColor: AppConstants.secondaryDark,
      title: Text(
        '+$hour Saat Sonra',
        style: TextStyle(color: AppConstants.primaryBlue),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInfoRow(
            'Tarih & Saat (UTC)', 
            position.time.toUtcFormattedString(), // UTC extension kullan
          ),
          _buildInfoRow('Enlem', '${position.lat.toStringAsFixed(4)}°'),
          _buildInfoRow('Boylam', '${position.lng.toStringAsFixed(4)}°'),
          _buildInfoRow('Mesafe', '${position.distance.toStringAsFixed(2)} NM'),
          
          // Hava Durumu için UTC karşılaştırma
          if (weatherData != null) ...[
            SizedBox(height: 16),
            Divider(color: Colors.white24),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.wb_sunny, size: 16, color: AppConstants.primaryBlue),
                SizedBox(width: 8),
                Text(
                  'Hava Durumu',
                  style: TextStyle(
                    color: AppConstants.primaryBlue,
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
            // ... weather info display ...
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Kapat'),
        ),
      ],
    ),
  );
}
```

### Map View - Weather Matching (map_view.dart):

```dart
// Build hourly position markers with weather data
List<Marker> _buildHourlyPositionMarkers(RouteProvider routeProvider) {
  return routeProvider.hourlyPositions.map((pos) {
    // UTC karşılaştırma - TR'ye çevirme yapma!
    final posTimeUtc = pos.time.toUtc().toIso8601String().substring(0, 16);
    
    // Weather data'yı bul
    final weather = analysisProvider.weatherData.firstWhere(
      (w) => w.time.substring(0, 16) == posTimeUtc,
      orElse: () => null,
    );
    
    return Marker(
      point: pos.position,
      width: AppConstants.hourlyMarkerSize,
      height: AppConstants.hourlyMarkerSize,
      child: HourlyPositionMarker(
        hour: pos.hour,
        position: pos,
        weather: weather, // Weather data'yı pass et
      ),
    );
  }).toList();
}
```

---

## 📝 FLUTTER İÇİN SON KONTROL LİSTESİ

### ✅ Her Yerde UTC Kullanımı:

1. **DatePicker/TimePicker:**
   - `DateTime.utc()` ile oluşturma
   - `toUtc()` ile dönüştürme
   - Local time kullanma!

2. **API İstekleri:**
   - `toUtc().toIso8601String()` ile ISO 8601 UTC format
   - Backend'e UTC timestamp gönderme
   - Response'tan gelen UTC timestamp'leri direkt kullanma

3. **UI Gösterimi:**
   - Her yerde "(UTC)" label'ı gösterme
   - `toUtcFormattedString()` extension kullanma
   - TimeZone dönüşümü yapma!

4. **Weather Data Matching:**
   - Her iki tarafı da UTC olarak karşılaştırma
   - Substring ile (0, 16) karşılaştırma (YYYY-MM-DDTHH:mm)
   - Local time conversion yapma!

---

## 🎯 ÖNEMLİ HATIRLATMALAR

1. ❌ **ASLA** `DateTime.now()` kullanma → ✅ `DateTime.now().toUtc()` kullan
2. ❌ **ASLA** timezone conversion yapma
3. ❌ **ASLA** `toLocal()` kullanma
4. ✅ **HER ZAMAN** `toUtc()` kullan
5. ✅ **HER ZAMAN** "(UTC)" label'ı göster
6. ✅ **HER ZAMAN** `DateTime.utc()` constructor kullan

---

## 🚀 TEST SENARYOLARI

1. **Saat Seçimi:**
   - DatePicker'dan saat seç
   - Seçilen saatin UTC olarak kaydedildiğini kontrol et
   - UI'da "(UTC)" label ile gösterildiğini kontrol et

2. **API İsteği:**
   - Rota analizi yap
   - Network inspector ile timestamp'lerin ISO 8601 UTC formatında olduğunu kontrol et
   - Backend'e giden tüm timestamp'lerin "Z" ile bittiğini kontrol et

3. **Hava Durumu:**
   - Saatlik konumlara tıkla
   - Hava durumu verilerinin doğru eşleştiğini kontrol et
   - Tüm saatlerin UTC olarak gösterildiğini kontrol et

4. **Saatlik Konumlar:**
   - Sidebar'daki saatlik konumların UTC olarak gösterildiğini kontrol et
   - Marker tooltip'lerinde UTC label olduğunu kontrol et

---

Bu güncelleme ile **TÜM** Flutter uygulaması tamamen UTC saatlerle çalışacak! 🎉
