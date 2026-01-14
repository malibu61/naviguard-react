import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

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
    className: 'midpoint-marker-icon'
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

const MapView = ({ waypoints, onWaypointAdd, onWaypointRemove, onWaypointUpdate, onWaypointInsert, lastAddedIndex }) => {
  const [draggingIndex, setDraggingIndex] = useState(null);
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

  return (
    <div className="map-container">
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
      </MapContainer>
    </div>
  );
};

export default MapView;
