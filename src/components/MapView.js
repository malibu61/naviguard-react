import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Tooltip, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import dayjs from 'dayjs';
import { Button, Popover, Modal, Typography, Divider, Tag } from 'antd';
import { MapPin, X, Info, BookOpen } from 'lucide-react';
import { maritimeSymbols, ialaSystem } from '../data/maritimeSymbols';
import MaritimeSymbolIcon from './MaritimeSymbolIcon';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

const { Title, Text, Paragraph } = Typography;

// Custom numbered marker icon oluştur
const createNumberedIcon = (number, isNewlyAdded = false) => {
  return L.divIcon({
    className: `custom-marker-icon ${isNewlyAdded ? 'newly-added' : ''}`,
    html: `
      <div class="marker-pin">
        <span class="marker-number">${number}</span>
      </div>
      <div class="marker-shadow"></div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
  });
};

// Midpoint (+ butonu) icon oluştur
const createMidpointIcon = () => {
  return L.divIcon({
    className: 'midpoint-marker-icon',
    html: `
      <div class="midpoint-button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Saatlik konum marker icon oluştur
const createHourlyPositionIcon = (hour) => {
  return L.divIcon({
    className: 'hourly-position-icon',
    html: `
      <div class="hourly-marker-pin">
        <span class="hourly-marker-hour">+${hour}h</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  });
};

// Harita tıklama olaylarını yakalayan component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Mesafe hesaplama fonksiyonu (Haversine formülü kullanarak Deniz Mili cinsinden)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3440.065; // Dünya yarıçapı Deniz Mili cinsinden
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Mouse koordinatlarını gösteren kontrol
function MousePositionControl({ position, waypoints }) {
  const map = useMap();
  const controlRef = useRef(null);
  const containerElementRef = useRef(null);

  useEffect(() => {
    // Control'ü sadece bir kez oluştur
    if (!controlRef.current) {
      const MouseControl = L.Control.extend({
        onAdd: function(map) {
          const container = L.DomUtil.create('div', 'leaflet-coordinate-control');
          container.style.display = 'none'; // Başlangıçta gizli
          containerElementRef.current = container;
          return container;
        },
        onRemove: function(map) {
          containerElementRef.current = null;
        }
      });

      controlRef.current = new MouseControl({ position: 'bottomright' });
      controlRef.current.addTo(map);
    }

    return () => {
      // Cleanup yapma - control haritada kalmalı
    };
  }, [map]);

  // Koordinatları güncelle
  useEffect(() => {
    const container = containerElementRef.current;
    if (container) {
      if (position && position.lat && position.lng) {
        // En son waypoint'i al
        const lastWaypoint = waypoints && waypoints.length > 0 ? waypoints[waypoints.length - 1] : null;
        const distanceFromLastWP = lastWaypoint 
          ? calculateDistance(lastWaypoint.lat, lastWaypoint.lng, position.lat, position.lng)
          : null;

        let distanceHtml = '';
        if (distanceFromLastWP !== null) {
          distanceHtml = `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.2);">
              <div style="font-weight: 600; margin-bottom: 4px; color: #e2e8f0;">Son WP'den Mesafe</div>
              <div style="color: #3b82f6;">${distanceFromLastWP.toFixed(2)} NM</div>
            </div>
          `;
        }

        container.innerHTML = `
          <div style="font-weight: 600; margin-bottom: 4px; color: #e2e8f0;">Koordinatlar</div>
          <div style="color: #e2e8f0;">Lat: ${position.lat.toFixed(4)}°</div>
          <div style="color: #e2e8f0;">Lon: ${position.lng.toFixed(4)}°</div>
          ${distanceHtml}
        `;
        container.style.display = 'block';
      } else {
        container.style.display = 'none';
      }
    }
  }, [position, waypoints]);

  return null;
}

// Mouse hareketini dinleyen component
function MouseMoveTracker({ onMouseMove }) {
  useMapEvents({
    mousemove: (e) => {
      onMouseMove(e.latlng);
    },
    mouseout: () => {
      onMouseMove(null);
    }
  });
  return null;
}

const MapView = ({ waypoints, onWaypointAdd, onWaypointRemove, onWaypointUpdate, onWaypointInsert, lastAddedIndex, hourlyPositions, weatherData }) => {
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [mousePosition, setMousePosition] = useState(null);
  const [showMaritimeDetails, setShowMaritimeDetails] = useState(true);
  const [showSymbolsModal, setShowSymbolsModal] = useState(false);
  const markerRefs = useRef([]);

  // Polyline için koordinatları hazırla
  const routePositions = waypoints.map(wp => [wp.lat, wp.lng]);

  // İki nokta arasındaki orta noktayı hesapla
  const calculateMidpoint = (wp1, wp2) => {
    return {
      lat: (wp1.lat + wp2.lat) / 2,
      lng: (wp1.lng + wp2.lng) / 2
    };
  };

  // Araya waypoint ekle
  const handleInsertWaypoint = (afterIndex) => {
    const midpoint = calculateMidpoint(waypoints[afterIndex], waypoints[afterIndex + 1]);
    onWaypointInsert(afterIndex + 1, midpoint);
  };

  // Marker'ı taşınabilir yap
  const handleMoveClick = (index, event) => {
    event.stopPropagation(); // Harita tıklamasını engelle
    setDraggingIndex(index);
    // Popup'ı kapat
    if (markerRefs.current[index]) {
      markerRefs.current[index].closePopup();
    }
  };

  // Taşımayı iptal et
  const handleCancelMove = (index, event) => {
    event.stopPropagation(); // Harita tıklamasını engelle
    setDraggingIndex(null);
    // Popup'ı kapat
    if (markerRefs.current[index]) {
      markerRefs.current[index].closePopup();
    }
  };

  // Marker taşındığında
  const handleDragEnd = (index, event) => {
    const newPosition = event.target.getLatLng();
    onWaypointUpdate(index, newPosition);
    setDraggingIndex(null);
  };

  // Waypoint sil
  const handleDeleteClick = (index, event) => {
    event.stopPropagation(); // Harita tıklamasını engelle
    
    // Önce popup'ı kapat
    if (markerRefs.current[index]) {
      markerRefs.current[index].closePopup();
    }
    
    // Dragging state'ini de temizle
    if (draggingIndex === index) {
      setDraggingIndex(null);
    }
    
    // Waypoint'i sil
    onWaypointRemove(index);
    
    // Tüm popup'ları kapat (index'ler değişeceği için)
    setTimeout(() => {
      markerRefs.current.forEach(ref => {
        if (ref) {
          ref.closePopup();
        }
      });
    }, 50);
  };

  const popoverContent = (
    <div style={{ maxWidth: '280px', lineHeight: '1.6' }}>
      <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', marginBottom: '8px' }}>
        Denizcilik detaylarını görmek için yanındaki butonu <strong>açınız</strong>.
      </p>
      <p style={{ margin: 0, color: '#cbd5e0', fontSize: '12px' }}>
        Açıldığında harita üzerinde <strong>fenerler, şamandıralar, limanlar, iskeleler</strong> 
        ve diğer denizcilik noktaları gösterilecektir.
      </p>
    </div>
  );

  return (
    <div className="map-container">
      {/* Denizcilik Detayları Kontrol Butonu */}
      <div className="maritime-control-button-container">
        <Button
          type={showMaritimeDetails ? 'primary' : 'default'}
          icon={<MapPin size={24} />}
          onClick={() => setShowMaritimeDetails(!showMaritimeDetails)}
          className={`maritime-toggle-button ${showMaritimeDetails ? 'active' : 'inactive'}`}
          size="large"
        >
          {showMaritimeDetails ? 'Detaylar Açık' : 'Detaylar Kapalı'}
        </Button>
        <Popover
          content={popoverContent}
          title="Denizcilik Detayları Hakkında"
          trigger="hover"
          placement="left"
        >
          <Button
            type="text"
            icon={<Info size={20} />}
            className="maritime-info-button"
            size="large"
          />
        </Popover>
        <Button
          type="text"
          icon={<BookOpen size={20} />}
          onClick={() => setShowSymbolsModal(true)}
          className="maritime-reference-button"
          size="large"
          title="Denizcilik İşaretleri Referansı"
        />
      </div>

      {/* Denizcilik İşaretleri Referans Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={24} style={{ color: '#60a5fa' }} />
            <span>Denizcilik İşaretleri Referansı</span>
          </div>
        }
        open={showSymbolsModal}
        onCancel={() => setShowSymbolsModal(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
        className="maritime-symbols-modal"
      >
        <div style={{ maxHeight: '75vh', overflowY: 'auto', padding: '8px' }}>
          {/* IALA Sistemi Açıklaması */}
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.1)', 
            border: '1px solid rgba(59, 130, 246, 0.3)', 
            borderRadius: '8px', 
            padding: '16px', 
            marginBottom: '24px' 
          }}>
            <Title level={4} style={{ color: '#60a5fa', marginBottom: '12px' }}>
              {ialaSystem.title}
            </Title>
            <Paragraph style={{ color: '#cbd5e0', marginBottom: '16px' }}>
              {ialaSystem.description}
            </Paragraph>
            {ialaSystem.regions.map((region, idx) => (
              <div key={idx} style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: idx < ialaSystem.regions.length - 1 ? '1px solid rgba(74, 85, 104, 0.3)' : 'none' }}>
                <Text strong style={{ color: '#60a5fa', fontSize: '15px' }}>{region.name}: </Text>
                <br />
                <Text style={{ color: '#e2e8f0', fontSize: '13px', marginTop: '4px', display: 'block' }}>
                  {region.description}
                </Text>
                <br />
                <Text type="secondary" style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  <strong>Örnek Ülkeler:</strong> {region.countries}
                </Text>
                <Text type="secondary" style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  <strong>Standart:</strong> {region.standard || 'IALA'}
                </Text>
                {region.tag && (
                  <Text type="secondary" style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginTop: '4px', fontFamily: 'monospace' }}>
                    <strong>Tag:</strong> {region.tag}
                  </Text>
                )}
              </div>
            ))}
            {ialaSystem.reference && (
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(74, 85, 104, 0.3)' }}>
                <Text strong style={{ color: '#60a5fa', fontSize: '14px' }}>{ialaSystem.reference.title}:</Text>
                <ul style={{ marginTop: '8px', paddingLeft: '20px', color: '#cbd5e0', fontSize: '12px' }}>
                  {ialaSystem.reference.sources.map((source, srcIdx) => (
                    <li key={srcIdx} style={{ marginBottom: '4px' }}>
                      {source}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* İşaret Kategorileri */}
          {maritimeSymbols.map((category, catIdx) => (
            <div key={catIdx} style={{ marginBottom: '32px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '16px',
                paddingBottom: '8px',
                borderBottom: '2px solid #4a5568'
              }}>
                <span style={{ fontSize: '24px' }}>{category.icon}</span>
                <Title level={3} style={{ color: '#e2e8f0', margin: 0 }}>
                  {category.category}
                </Title>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '16px' }}>
                {category.symbols.map((symbol, symIdx) => (
                  <div
                    key={symIdx}
                    style={{
                      background: 'rgba(26, 32, 44, 0.8)',
                      border: '1px solid #4a5568',
                      borderRadius: '8px',
                      padding: '16px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#60a5fa';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#4a5568';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                      {/* Görsel Sembol */}
                      <div style={{ flexShrink: 0, marginTop: '4px' }}>
                        <MaritimeSymbolIcon 
                          type={symbol.symbolType} 
                          category={category.seamarkType}
                          style={{ width: '56px', height: '56px' }}
                        />
                      </div>
                      {/* İçerik */}
                      <div style={{ flex: 1 }}>
                        <Text strong style={{ color: '#60a5fa', fontSize: '15px', marginBottom: '8px', display: 'block' }}>
                          {symbol.name}
                        </Text>
                        
                        <Paragraph style={{ color: '#cbd5e0', margin: '8px 0', fontSize: '13px', lineHeight: '1.6' }}>
                          {symbol.description}
                        </Paragraph>
                      </div>
                    </div>
                    
                    {symbol.seamarkTag && (
                      <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px', marginBottom: '8px' }}>
                        <Text type="secondary" style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                          <strong>OSM Tag:</strong> {symbol.seamarkTag}
                        </Text>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                      {symbol.standard && (
                        <Tag color="blue">{symbol.standard}</Tag>
                      )}
                      {symbol.color && (
                        <Tag color="cyan">Renk: {symbol.color}</Tag>
                      )}
                      {symbol.topmark && (
                        <Tag color="orange">Topmark: {symbol.topmark}</Tag>
                      )}
                      {symbol.shape && (
                        <Tag color="purple">Şekil: {symbol.shape}</Tag>
                      )}
                      {symbol.purpose && (
                        <Tag color="green">{symbol.purpose}</Tag>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <MapContainer
        center={[39.0, 35.0]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* OpenSeaMap Seamark Overlay - Denizcilik Detayları */}
        {showMaritimeDetails && (
          <TileLayer
            attribution='Seamarks © <a href="https://www.openseamap.org">OpenSeaMap</a> contributors'
            url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
            maxZoom={18}
            transparent={true}
            opacity={0.9}
          />
        )}
        
        {/* Mouse hareketi tracker */}
        <MouseMoveTracker onMouseMove={setMousePosition} />
        
        {/* Koordinat göstergesi */}
        <MousePositionControl position={mousePosition} waypoints={waypoints} />
        
        {/* Harita tıklama handler */}
        <MapClickHandler onMapClick={onWaypointAdd} />
        
        {/* Waypoint markerları */}
        {waypoints.map((waypoint, index) => (
          <Marker
            key={index}
            position={[waypoint.lat, waypoint.lng]}
            icon={createNumberedIcon(index + 1, index === lastAddedIndex)}
            draggable={draggingIndex === index}
            eventHandlers={{
              dragend: (e) => handleDragEnd(index, e),
            }}
            ref={(ref) => (markerRefs.current[index] = ref)}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -40]}>
              <div style={{ textAlign: 'center' }}>
                <strong>Waypoint #{index + 1}</strong><br />
                Lat: {waypoint.lat.toFixed(4)}°<br />
                Lon: {waypoint.lng.toFixed(4)}°
              </div>
            </Tooltip>
            
            {/* Context Menu Popup */}
            <Popup className="waypoint-context-menu" closeButton={true}>
              <div className="context-menu-container">
                <div className="context-menu-header">
                  <span className="context-menu-title">Waypoint #{index + 1}</span>
                </div>
                <div className="context-menu-actions">
                  {draggingIndex === index ? (
                    // Taşıma modundaysa "İptal Et" butonu göster
                    <>
                      <button
                        className="context-menu-btn cancel-btn"
                        onClick={(e) => handleCancelMove(index, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                        <span>Taşımayı İptal Et</span>
                      </button>
                      <div className="context-menu-hint active">
                        📍 Marker'ı istediğiniz yere sürükleyin
                      </div>
                    </>
                  ) : (
                    // Normal mod: Taşı ve Sil butonları
                    <>
                      <button
                        className="context-menu-btn move-btn"
                        onClick={(e) => handleMoveClick(index, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
                        </svg>
                        <span>Taşı</span>
                      </button>
                      <button
                        className="context-menu-btn delete-btn"
                        onClick={(e) => handleDeleteClick(index, e)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                        <span>Sil</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Rota çizgisi */}
        {waypoints.length > 1 && (
          <Polyline
            positions={routePositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 3,
              dashArray: '5, 10',
              opacity: 0.8
            }}
          />
        )}

        {/* Midpoint marker'ları (+ butonları) - her iki waypoint arasına */}
        {waypoints.length > 1 && waypoints.slice(0, -1).map((waypoint, index) => {
          const midpoint = calculateMidpoint(waypoint, waypoints[index + 1]);
          return (
            <Marker
              key={`midpoint-${index}`}
              position={[midpoint.lat, midpoint.lng]}
              icon={createMidpointIcon()}
              eventHandlers={{
                click: () => handleInsertWaypoint(index)
              }}
            >
              <Tooltip direction="top" offset={[0, -16]} permanent={false}>
                <span style={{ fontSize: '12px', fontWeight: '500' }}>
                  Waypoint Ekle
                </span>
              </Tooltip>
            </Marker>
          );
        })}

        {/* Saatlik konum marker'ları */}
        {hourlyPositions && hourlyPositions.map((pos, index) => {
          // Bu konum için hava durumu verisini bul (time'a göre eşleştir)
          const posTimeStr = dayjs(pos.time).format('YYYY-MM-DDTHH:mm');
          const weather = weatherData && weatherData.length > 0 
            ? weatherData.find(w => {
                // Time string'ini karşılaştır (format: "2026-01-21T00:00")
                const weatherTimeStr = w.time ? w.time.substring(0, 16) : null;
                return weatherTimeStr === posTimeStr;
              })
            : null;

          return (
            <Marker
              key={`hourly-${index}`}
              position={[pos.lat, pos.lng]}
              icon={createHourlyPositionIcon(pos.hour)}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -24]}>
                <div style={{ textAlign: 'center' }}>
                  <strong>+{pos.hour} Saat</strong><br />
                  {dayjs(pos.time).format('DD.MM.YYYY HH:mm')}
                </div>
              </Tooltip>
              
              <Popup className="hourly-position-popup" closeButton={true}>
                <div className="hourly-popup-container">
                  <div className="hourly-popup-header">
                    <span className="hourly-popup-title">+{pos.hour} Saat Sonra</span>
                  </div>
                  <div className="hourly-popup-content">
                    <div className="hourly-popup-item">
                      <span className="hourly-popup-label">Tarih & Saat:</span>
                      <span className="hourly-popup-value">
                        {dayjs(pos.time).format('DD.MM.YYYY HH:mm')}
                      </span>
                    </div>
                    <div className="hourly-popup-item">
                      <span className="hourly-popup-label">Enlem (Lat):</span>
                      <span className="hourly-popup-value coord-value">
                        {pos.lat.toFixed(4)}°
                      </span>
                    </div>
                    <div className="hourly-popup-item">
                      <span className="hourly-popup-label">Boylam (Lon):</span>
                      <span className="hourly-popup-value coord-value">
                        {pos.lng.toFixed(4)}°
                      </span>
                    </div>
                    {pos.distance !== undefined && (
                      <div className="hourly-popup-item">
                        <span className="hourly-popup-label">Mesafe:</span>
                        <span className="hourly-popup-value">
                          {pos.distance.toFixed(2)} NM
                        </span>
                      </div>
                    )}
                    
                    {/* Hava Durumu Bilgileri */}
                    {weather && (
                      <>
                        <div style={{ 
                          marginTop: '16px', 
                          paddingTop: '16px', 
                          borderTop: '2px solid rgba(59, 130, 246, 0.3)' 
                        }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#60a5fa', 
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                            </svg>
                            Hava Durumu
                          </div>
                          
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '1fr 1fr', 
                            gap: '10px' 
                          }}>
                            {weather.temperature_2m !== undefined && (
                              <div className="hourly-popup-item">
                                <span className="hourly-popup-label">Sıcaklık (2m):</span>
                                <span className="hourly-popup-value" style={{ color: '#fbbf24' }}>
                                  {weather.temperature_2m.toFixed(1)}°C
                                </span>
                              </div>
                            )}
                            
                            {weather.windspeed_10m !== undefined && (
                              <div className="hourly-popup-item">
                                <span className="hourly-popup-label">Rüzgar Hızı (10m):</span>
                                <span className="hourly-popup-value" style={{ color: '#34d399' }}>
                                  {weather.windspeed_10m.toFixed(1)} m/s
                                </span>
                              </div>
                            )}
                            
                            {weather.winddirection_10m !== undefined && (
                              <div className="hourly-popup-item">
                                <span className="hourly-popup-label">Rüzgar Yönü:</span>
                                <span className="hourly-popup-value" style={{ color: '#34d399' }}>
                                  {weather.winddirection_10m}°
                                </span>
                              </div>
                            )}
                            
                            {weather.visibility !== undefined && (
                              <div className="hourly-popup-item">
                                <span className="hourly-popup-label">Görüş Mesafesi:</span>
                                <span className="hourly-popup-value" style={{ color: '#93c5fd' }}>
                                  {weather.visibility.toFixed(1)} km
                                </span>
                              </div>
                            )}
                            
                            {weather.cloudcover !== undefined && (
                              <div className="hourly-popup-item">
                                <span className="hourly-popup-label">Bulut Örtüsü:</span>
                                <span className="hourly-popup-value" style={{ color: '#a78bfa' }}>
                                  {weather.cloudcover}%
                                </span>
                              </div>
                            )}
                            
                            {weather.surface_Pressure !== undefined && (
                              <div className="hourly-popup-item">
                                <span className="hourly-popup-label">Yüzey Basıncı:</span>
                                <span className="hourly-popup-value" style={{ color: '#fb7185' }}>
                                  {weather.surface_Pressure.toFixed(1)} hPa
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
