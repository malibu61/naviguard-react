# Karasuyu Sınırları Entegrasyon Planı

## 📋 Genel Bakış

Gerçek karasuyu sınırları bilgisini backend'de (.NET) işleyip, frontend'den koordinat göndererek karasuyu bilgisini alacağız.

---

## 🔧 ADIM 1: Backend API Tasarımı (.NET)

### 1.1 API Endpoint

```
POST /api/waterzone/detect
Content-Type: application/json
```

### 1.2 Request Body

```json
{
  "coordinates": [
    {
      "lat": 40.1234,
      "lng": 26.5678
    },
    {
      "lat": 39.8765,
      "lng": 25.4321
    }
  ]
}
```

### 1.3 Response Body

```json
{
  "results": [
    {
      "lat": 40.1234,
      "lng": 26.5678,
      "waterZone": {
        "zone": "turkish",
        "country": "Turkey",
        "countryCode": "TR",
        "description": "Türk karasuyu",
        "flag": "🇹🇷",
        "territorialSea": true,
        "distanceFromCoast": 8.5
      }
    },
    {
      "lat": 39.8765,
      "lng": 25.4321,
      "waterZone": {
        "zone": "greek",
        "country": "Greece",
        "countryCode": "GR",
        "description": "Yunan karasuyu",
        "flag": "🇬🇷",
        "territorialSea": true,
        "distanceFromCoast": 5.2
      }
    }
  ]
}
```

### 1.4 WaterZone Types

- `turkish` - Türk karasuyu
- `greek` - Yunan karasuyu
- `international` - Uluslararası sular
- `[country_code]` - Diğer ülkeler (örn: `cyprus`, `bulgaria`, vb.)

---

## 🗄️ ADIM 2: Backend'de Veri Kaynakları

### 2.1 Önerilen Veri Kaynakları

#### A) Marine Regions (Önerilen - Ücretsiz)
- **URL**: https://www.marineregions.org/
- **Format**: Shapefile, GeoJSON, WFS/WMS
- **Kapsam**: Tüm dünya, EEZ, Territorial Sea (12NM)
- **Lisans**: Açık kaynak
- **İndirme**: 
  - EEZ: https://www.marineregions.org/downloads.php
  - Territorial Sea: https://www.marineregions.org/eezmethodology.php

#### B) Sovereign Limits (Ücretli - Daha Detaylı)
- **URL**: https://sovereignlimits.com/
- **Format**: GeoJSON, Shapefile
- **Kapsam**: Tüm dünya, çok detaylı sınırlar
- **Lisans**: Ücretli (commercial)

#### C) OpenStreetMap (Sınırlı)
- **Overpass API** ile karasuyu sınırlarını çekebilirsiniz
- Ancak OSM'de karasuyu verisi sınırlı ve güncel olmayabilir

### 2.2 Veri İşleme

1. **Shapefile/GeoJSON İndir**
   - Marine Regions'dan Territorial Sea (12NM) verilerini indirin
   - Tüm ülkeler için veri seti

2. **Veritabanına Yükle**
   - PostgreSQL + PostGIS (önerilen)
   - Veya SQL Server + Spatial Data Types
   - GeoJSON polygon'ları veritabanına kaydedin

3. **Spatial Index Oluştur**
   - Performans için spatial index ekleyin
   - PostGIS: `CREATE INDEX ON water_zones USING GIST (geometry);`

---

## 💻 ADIM 3: Backend Implementation (.NET)

### 3.1 NuGet Paketleri

```xml
<PackageReference Include="NetTopologySuite" Version="2.5.0" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite" Version="8.0.0" />
<!-- veya SQL Server için -->
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer.NetTopologySuite" Version="8.0.0" />
```

### 3.2 Model Sınıfları

```csharp
// Models/WaterZoneRequest.cs
public class WaterZoneRequest
{
    public List<Coordinate> Coordinates { get; set; }
}

public class Coordinate
{
    public double Lat { get; set; }
    public double Lng { get; set; }
}

// Models/WaterZoneResponse.cs
public class WaterZoneResponse
{
    public List<WaterZoneResult> Results { get; set; }
}

public class WaterZoneResult
{
    public double Lat { get; set; }
    public double Lng { get; set; }
    public WaterZoneInfo WaterZone { get; set; }
}

public class WaterZoneInfo
{
    public string Zone { get; set; } // "turkish", "greek", "international"
    public string Country { get; set; }
    public string CountryCode { get; set; }
    public string Description { get; set; }
    public string Flag { get; set; }
    public bool TerritorialSea { get; set; }
    public double? DistanceFromCoast { get; set; } // Deniz mili cinsinden
}
```

### 3.3 Controller

```csharp
[ApiController]
[Route("api/[controller]")]
public class WaterZoneController : ControllerBase
{
    private readonly IWaterZoneService _waterZoneService;

    public WaterZoneController(IWaterZoneService waterZoneService)
    {
        _waterZoneService = waterZoneService;
    }

    [HttpPost("detect")]
    public async Task<ActionResult<WaterZoneResponse>> DetectWaterZones(
        [FromBody] WaterZoneRequest request)
    {
        if (request?.Coordinates == null || !request.Coordinates.Any())
        {
            return BadRequest("Coordinates are required");
        }

        var results = await _waterZoneService.DetectWaterZonesAsync(request.Coordinates);
        
        return Ok(new WaterZoneResponse { Results = results });
    }
}
```

### 3.4 Service Implementation

```csharp
public interface IWaterZoneService
{
    Task<List<WaterZoneResult>> DetectWaterZonesAsync(List<Coordinate> coordinates);
}

public class WaterZoneService : IWaterZoneService
{
    private readonly ApplicationDbContext _context;

    public WaterZoneService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<WaterZoneResult>> DetectWaterZonesAsync(
        List<Coordinate> coordinates)
    {
        var results = new List<WaterZoneResult>();

        foreach (var coord in coordinates)
        {
            var point = new Point(coord.Lng, coord.Lat) { SRID = 4326 };
            
            // Spatial query: Koordinat hangi polygon içinde?
            var waterZone = await _context.WaterZones
                .Where(wz => wz.Geometry.Contains(point))
                .Select(wz => new WaterZoneInfo
                {
                    Zone = wz.Zone,
                    Country = wz.Country,
                    CountryCode = wz.CountryCode,
                    Description = wz.Description,
                    Flag = wz.Flag,
                    TerritorialSea = wz.TerritorialSea,
                    DistanceFromCoast = CalculateDistanceFromCoast(point, wz)
                })
                .FirstOrDefaultAsync();

            if (waterZone == null)
            {
                // Uluslararası sular
                waterZone = new WaterZoneInfo
                {
                    Zone = "international",
                    Country = null,
                    CountryCode = null,
                    Description = "Uluslararası sular",
                    Flag = "🌊",
                    TerritorialSea = false
                };
            }

            results.Add(new WaterZoneResult
            {
                Lat = coord.Lat,
                Lng = coord.Lng,
                WaterZone = waterZone
            });
        }

        return results;
    }

    private double? CalculateDistanceFromCoast(Point point, WaterZone zone)
    {
        // Kıyı çizgisinden mesafe hesapla (opsiyonel)
        // Bu için kıyı çizgisi verisi gerekli
        return null;
    }
}
```

### 3.5 Database Context

```csharp
public class ApplicationDbContext : DbContext
{
    public DbSet<WaterZone> WaterZones { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<WaterZone>(entity =>
        {
            entity.ToTable("water_zones");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Geometry)
                .HasColumnType("geometry(Polygon, 4326)");
        });
    }
}

public class WaterZone
{
    public int Id { get; set; }
    public string Zone { get; set; }
    public string Country { get; set; }
    public string CountryCode { get; set; }
    public string Description { get; set; }
    public string Flag { get; set; }
    public bool TerritorialSea { get; set; }
    public Geometry Geometry { get; set; } // PostGIS Geometry
}
```

---

## 🌐 ADIM 4: Frontend Implementation (React)

### 4.1 API Service Oluştur

`src/services/waterZoneService.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const detectWaterZones = async (coordinates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/waterzone/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates: coordinates.map(coord => ({
          lat: coord.lat,
          lng: coord.lng
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error detecting water zones:', error);
    throw error;
  }
};
```

### 4.2 App.js'de State ve Fonksiyon Ekle

```javascript
// App.js
import { detectWaterZones } from './services/waterZoneService';

// State ekle
const [waterZoneCache, setWaterZoneCache] = useState(new Map());

// Waypoint'ler için karasuyu bilgisi al
const fetchWaterZonesForWaypoints = useCallback(async (waypoints) => {
  if (waypoints.length === 0) return;

  try {
    const results = await detectWaterZones(waypoints);
    const newCache = new Map(waterZoneCache);
    
    results.forEach(result => {
      const key = `${result.lat},${result.lng}`;
      newCache.set(key, result.waterZone);
    });
    
    setWaterZoneCache(newCache);
  } catch (error) {
    console.error('Failed to fetch water zones:', error);
  }
}, [waterZoneCache]);

// Waypoint eklendiğinde/güncellendiğinde çağır
useEffect(() => {
  if (waypoints.length > 0) {
    fetchWaterZonesForWaypoints(waypoints);
  }
}, [waypoints, fetchWaterZonesForWaypoints]);
```

### 4.3 MapView.js'de Karasuyu Bilgisini Göster

```javascript
// MapView.js
import { waterZoneCache } from '../App'; // veya context kullan

// Waypoint popup'ında
const waterZone = waterZoneCache.get(`${waypoint.lat},${waypoint.lng}`);
{waterZone && (
  <div style={{ marginTop: '8px', fontSize: '12px', color: '#cbd5e0' }}>
    <span>{waterZone.flag}</span>
    <span>{waterZone.description}</span>
  </div>
)}

// Saatlik konum popup'ında
const waterZone = waterZoneCache.get(`${pos.lat},${pos.lng}`);
{waterZone && (
  <div className="hourly-popup-item">
    <span className="hourly-popup-label">Sular:</span>
    <span className="hourly-popup-value">
      {waterZone.flag} {waterZone.description}
    </span>
  </div>
)}
```

---

## 📦 ADIM 5: Veri Hazırlama

### 5.1 Marine Regions'dan Veri İndirme

1. https://www.marineregions.org/downloads.php adresine gidin
2. "EEZ" veya "Territorial Sea" verilerini indirin
3. Shapefile formatında indirilecek

### 5.2 Veri Dönüştürme

Shapefile'ı GeoJSON'a çevirin:
- **QGIS** kullanarak
- Veya **ogr2ogr** komutu:
  ```bash
  ogr2ogr -f GeoJSON territorial_seas.json territorial_seas.shp
  ```

### 5.3 Veritabanına Yükleme

PostGIS'e yükleme script'i:

```sql
-- Tablo oluştur
CREATE TABLE water_zones (
    id SERIAL PRIMARY KEY,
    zone VARCHAR(50),
    country VARCHAR(100),
    country_code VARCHAR(3),
    description VARCHAR(200),
    flag VARCHAR(10),
    territorial_sea BOOLEAN,
    geometry GEOMETRY(Polygon, 4326)
);

-- Spatial index
CREATE INDEX water_zones_geometry_idx ON water_zones USING GIST (geometry);

-- GeoJSON'dan veri yükleme (ogr2ogr ile)
-- ogr2ogr -f "PostgreSQL" PG:"host=localhost dbname=yourdb user=user password=pass" \
--   territorial_seas.json -nln water_zones -nlt PROMOTE_TO_MULTI
```

---

## ✅ ADIM 6: Test

### 6.1 Backend Test

```bash
curl -X POST http://localhost:5000/api/waterzone/detect \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [
      {"lat": 40.0, "lng": 26.0},
      {"lat": 39.5, "lng": 25.5}
    ]
  }'
```

### 6.2 Frontend Test

1. Waypoint ekleyin
2. Popup'ı açın
3. Karasuyu bilgisinin göründüğünü kontrol edin

---

## 🚀 Özet

1. ✅ **Backend**: .NET API endpoint oluştur (`/api/waterzone/detect`)
2. ✅ **Veri**: Marine Regions'dan karasuyu verilerini indir
3. ✅ **Database**: PostGIS/SQL Server Spatial ile veritabanına yükle
4. ✅ **Service**: Spatial query ile point-in-polygon kontrolü yap
5. ✅ **Frontend**: API'yi çağır ve sonuçları göster

---

## 📚 Kaynaklar

- **Marine Regions**: https://www.marineregions.org/
- **PostGIS Documentation**: https://postgis.net/documentation/
- **NetTopologySuite**: https://github.com/NetTopologySuite/NetTopologySuite
