import React from 'react';

// Denizcilik İşareti Görsel Sembolleri (OpenSeaMap/IHO Standart)
const MaritimeSymbolIcon = ({ type, category, style = {} }) => {
  const iconStyle = {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  };

  // Işıklar
  if (type === 'light_major' || type === 'lighthouse') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        {/* Fener kulesi */}
        <rect x="20" y="8" width="8" height="32" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
        <rect x="18" y="28" width="12" height="4" fill="#654321"/>
        {/* Işık */}
        <circle cx="24" cy="12" r="6" fill="#FFD700" opacity="0.9"/>
        <path d="M 18 12 L 30 12 L 26 8 L 22 8 Z" fill="#FFD700" opacity="0.7"/>
        <path d="M 18 12 L 30 12 L 26 16 L 22 16 Z" fill="#FFD700" opacity="0.7"/>
      </svg>
    );
  }

  if (type === 'light_minor') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        <circle cx="24" cy="24" r="8" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
        <circle cx="24" cy="24" r="4" fill="#FFF" opacity="0.8"/>
        <path d="M 24 16 L 24 10 M 24 38 L 24 32 M 32 24 L 38 24 M 10 24 L 16 24" 
              stroke="#FFA500" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  }

  if (type === 'light_vessel') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        {/* Gemi gövdesi */}
        <path d="M 8 32 L 16 28 L 32 28 L 40 32 L 38 36 L 10 36 Z" fill="#4682B4"/>
        {/* Fener */}
        <rect x="22" y="16" width="4" height="12" fill="#8B4513"/>
        <circle cx="24" cy="12" r="4" fill="#FFD700" opacity="0.9"/>
      </svg>
    );
  }

  if (type === 'light_float') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        {/* Şamandıra gövdesi */}
        <ellipse cx="24" cy="32" rx="10" ry="8" fill="#4682B4"/>
        {/* Işık */}
        <circle cx="24" cy="20" r="6" fill="#FFD700" opacity="0.9"/>
        <path d="M 18 20 L 30 20 L 26 14 L 22 14 Z" fill="#FFD700" opacity="0.7"/>
      </svg>
    );
  }

  // Yan Şamandıralar - Sancak (Starboard) - IALA-A Yeşil, IALA-B Kırmızı
  if (type === 'starboard_lateral' || (category === 'buoy_lateral' && type?.includes('starboard'))) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        {/* Koni şamandıra - Yeşil (IALA-A) veya Kırmızı (IALA-B) */}
        <path d="M 24 8 L 32 28 L 16 28 Z" fill="#00AA00" stroke="#006600" strokeWidth="1.5"/>
        <ellipse cx="24" cy="28" rx="8" ry="4" fill="#00AA00" stroke="#006600" strokeWidth="1.5"/>
        {/* Üst işaret - Konik */}
        <path d="M 24 8 L 28 16 L 20 16 Z" fill="#006600"/>
      </svg>
    );
  }

  // Yan Şamandıralar - İskele (Port) - IALA-A Kırmızı, IALA-B Yeşil
  if (type === 'port_lateral' || (category === 'buoy_lateral' && type?.includes('port'))) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        {/* Silindirik şamandıra - Kırmızı (IALA-A) veya Yeşil (IALA-B) */}
        <rect x="16" y="12" width="16" height="20" rx="2" fill="#CC0000" stroke="#990000" strokeWidth="1.5"/>
        <ellipse cx="24" cy="12" rx="8" ry="4" fill="#CC0000" stroke="#990000" strokeWidth="1.5"/>
        <ellipse cx="24" cy="32" rx="8" ry="4" fill="#CC0000" stroke="#990000" strokeWidth="1.5"/>
        {/* Üst işaret - Silindirik */}
        <rect x="20" y="8" width="8" height="8" rx="1" fill="#990000"/>
      </svg>
    );
  }

  // Kardinal Şamandıralar
  if (type === 'north_cardinal' || (category === 'buoy_cardinal' && type?.includes('north'))) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        <rect x="16" y="16" width="16" height="16" fill="#FFD700" stroke="#000" strokeWidth="2"/>
        <rect x="16" y="24" width="16" height="8" fill="#000"/>
        {/* Üst işaret - İki koni yukarı */}
        <path d="M 22 12 L 26 16 L 22 16 Z" fill="#000"/>
        <path d="M 26 12 L 22 16 L 26 16 Z" fill="#000"/>
      </svg>
    );
  }

  if (type === 'south_cardinal' || (category === 'buoy_cardinal' && type?.includes('south'))) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        <rect x="16" y="16" width="16" height="16" fill="#FFD700" stroke="#000" strokeWidth="2"/>
        <rect x="16" y="16" width="16" height="8" fill="#000"/>
        {/* Üst işaret - İki koni aşağı */}
        <path d="M 22 36 L 26 32 L 22 32 Z" fill="#000"/>
        <path d="M 26 36 L 22 32 L 26 32 Z" fill="#000"/>
      </svg>
    );
  }

  if (type === 'east_cardinal' || (category === 'buoy_cardinal' && type?.includes('east'))) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        <rect x="16" y="16" width="16" height="16" fill="#FFD700" stroke="#000" strokeWidth="2"/>
        <rect x="16" y="20" width="16" height="8" fill="#000"/>
        {/* Üst işaret - İki koni tabanlar birleşik */}
        <path d="M 20 12 L 24 16 L 24 12 Z" fill="#000"/>
        <path d="M 28 12 L 24 16 L 24 12 Z" fill="#000"/>
      </svg>
    );
  }

  if (type === 'west_cardinal' || (category === 'buoy_cardinal' && type?.includes('west'))) {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        <rect x="16" y="16" width="16" height="16" fill="#FFD700" stroke="#000" strokeWidth="2"/>
        <rect x="16" y="20" width="16" height="8" fill="#000"/>
        {/* Üst işaret - İki koni uçlar birbirine bakar */}
        <path d="M 20 12 L 24 16 L 20 16 Z" fill="#000"/>
        <path d="M 28 12 L 24 16 L 28 16 Z" fill="#000"/>
      </svg>
    );
  }

  // Tehlikeli Bölge Şamandırası
  if (type === 'isolated_danger' || category === 'buoy_isolated_danger') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        <rect x="16" y="12" width="16" height="20" rx="2" fill="#000" stroke="#CC0000" strokeWidth="2"/>
        <rect x="16" y="18" width="16" height="8" fill="#CC0000"/>
        {/* Üst işaret - İki siyah küre */}
        <circle cx="21" cy="8" r="2" fill="#000"/>
        <circle cx="27" cy="8" r="2" fill="#000"/>
      </svg>
    );
  }

  // Güvenli Su Şamandırası
  if (type === 'safe_water' || category === 'buoy_safe_water') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        <rect x="16" y="12" width="16" height="20" rx="2" fill="#FFF" stroke="#CC0000" strokeWidth="2"/>
        {/* Kırmızı dikey çizgiler */}
        <rect x="18" y="12" width="2" height="20" fill="#CC0000"/>
        <rect x="22" y="12" width="2" height="20" fill="#CC0000"/>
        <rect x="26" y="12" width="2" height="20" fill="#CC0000"/>
        <rect x="30" y="12" width="2" height="20" fill="#CC0000"/>
        {/* Üst işaret - Kırmızı küre */}
        <circle cx="24" cy="8" r="3" fill="#CC0000"/>
      </svg>
    );
  }

  // Özel Amaçlı Şamandıra
  if (type === 'special_purpose' || category === 'buoy_special_purpose') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        <ellipse cx="24" cy="28" rx="10" ry="8" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
        <circle cx="24" cy="20" r="6" fill="#FFD700"/>
        {/* X işareti */}
        <path d="M 20 18 L 28 26 M 28 18 L 20 26" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }

  // Liman/İskele
  if (type === 'port' || type === 'harbour' || type === 'marina' || type === 'wharf' || type === 'jetty' || type === 'landing_stage') {
    return (
      <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
        {/* Çapa */}
        <path d="M 24 12 L 20 24 L 28 24 Z" fill="#8B4513" stroke="#654321" strokeWidth="1.5"/>
        <circle cx="24" cy="28" r="3" fill="#8B4513"/>
        <path d="M 22 28 L 18 36 M 26 28 L 30 36" stroke="#8B4513" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }

  // Varsayılan
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" style={iconStyle}>
      <circle cx="24" cy="24" r="12" fill="#4682B4" stroke="#2E5C8A" strokeWidth="2"/>
      <path d="M 24 12 L 24 36 M 12 24 L 36 24" stroke="#FFF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
};

export default MaritimeSymbolIcon;
