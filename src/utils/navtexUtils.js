/**
 * Navtex koordinat formatı: "42 20.70 K" (derece dakika yön) -> ondalık derece
 * K/G = Kuzey/Güney, D/B = Doğu/Batı
 */
export function parseNavtexCoord(latStr, lngStr) {
  const parsePart = (str, isLat) => {
    if (!str || typeof str !== 'string') return null;
    const parts = str.trim().split(/\s+/);
    if (parts.length < 2) return null;
    const deg = parseFloat(parts[0]);
    const min = parseFloat(parts[1]);
    if (isNaN(deg) || isNaN(min)) return null;
    const dir = (parts[2] || '').toUpperCase();
    let sign = 1;
    if (isLat) {
      if (dir === 'G' || dir === 'S') sign = -1; // Güney
    } else {
      if (dir === 'B' || dir === 'W') sign = -1; // Batı
    }
    return (deg + min / 60) * sign;
  };
  const lat = parsePart(latStr, true);
  const lng = parsePart(lngStr, false);
  if (lat == null || lng == null) return null;
  return { lat, lng };
}

/** Bir duyurunun ltdlng dizisini { lat, lng }[] olarak döndürür */
export function announcementToPoints(ltdlng) {
  if (!ltdlng || !Array.isArray(ltdlng)) return [];
  const points = [];
  for (const pt of ltdlng) {
    const coords = parseNavtexCoord(pt.latitude, pt.longitude);
    if (coords) points.push(coords);
  }
  return points;
}
