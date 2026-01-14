import React, { useState, useCallback, useEffect } from 'react';
import { ConfigProvider, theme, message } from 'antd';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [waypoints, setWaypoints] = useState([]);
  const [speed, setSpeed] = useState(12); // Varsayılan hız: 12 knots
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastAddedIndex, setLastAddedIndex] = useState(null);

  // Mesafe hesaplama fonksiyonu (Haversine formülü kullanarak Deniz Mili cinsinden)
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
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
  }, []);

  // Toplam mesafeyi hesapla
  const calculateTotalDistance = useCallback((points) => {
    if (points.length < 2) return 0;
    
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const dist = calculateDistance(
        points[i].lat,
        points[i].lng,
        points[i + 1].lat,
        points[i + 1].lng
      );
      total += dist;
    }
    return total;
  }, [calculateDistance]);

  // Waypoint ekleme
  const handleWaypointAdd = useCallback((latlng) => {
    const newWaypoint = {
      lat: latlng.lat,
      lng: latlng.lng
    };
    
    const updatedWaypoints = [...waypoints, newWaypoint];
    setWaypoints(updatedWaypoints);
    
    // Son eklenen waypoint'in index'ini işaretle
    const newIndex = updatedWaypoints.length - 1;
    setLastAddedIndex(newIndex);
    
    // Mesafeyi güncelle
    const newDistance = calculateTotalDistance(updatedWaypoints);
    setTotalDistance(newDistance);
    
    message.success(`Waypoint #${updatedWaypoints.length} eklendi`);
  }, [waypoints, calculateTotalDistance]);

  // lastAddedIndex'i animasyon bitince temizle
  useEffect(() => {
    if (lastAddedIndex !== null) {
      const timer = setTimeout(() => {
        setLastAddedIndex(null);
      }, 350); // Animasyon süresi (300ms) + biraz buffer
      
      return () => clearTimeout(timer);
    }
  }, [lastAddedIndex]);

  // Waypoint kaldırma
  const handleWaypointRemove = useCallback((index) => {
    const updatedWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(updatedWaypoints);
    
    // Mesafeyi güncelle
    const newDistance = calculateTotalDistance(updatedWaypoints);
    setTotalDistance(newDistance);
    
    message.info(`Waypoint #${index + 1} kaldırıldı`);
  }, [waypoints, calculateTotalDistance]);

  // Waypoint güncelleme (taşıma)
  const handleWaypointUpdate = useCallback((index, newPosition) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints[index] = {
      lat: newPosition.lat,
      lng: newPosition.lng
    };
    setWaypoints(updatedWaypoints);
    
    // Mesafeyi güncelle
    const newDistance = calculateTotalDistance(updatedWaypoints);
    setTotalDistance(newDistance);
    
    message.success(`Waypoint #${index + 1} taşındı`);
  }, [waypoints, calculateTotalDistance]);

  // Araya waypoint ekleme
  const handleWaypointInsert = useCallback((index, position) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints.splice(index, 0, {
      lat: position.lat,
      lng: position.lng
    });
    setWaypoints(updatedWaypoints);
    
    // Son eklenen waypoint'in index'ini işaretle
    setLastAddedIndex(index);
    
    // Mesafeyi güncelle
    const newDistance = calculateTotalDistance(updatedWaypoints);
    setTotalDistance(newDistance);
    
    message.success(`Waypoint #${index + 1} eklendi`);
  }, [waypoints, calculateTotalDistance]);

  // Tümünü temizle
  const handleClearAll = useCallback(() => {
    setWaypoints([]);
    setTotalDistance(0);
    message.warning('Tüm waypointler temizlendi');
  }, []);

  // Hız değişimi
  const handleSpeedChange = useCallback((value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setSpeed(numValue);
    } else if (value === '') {
      setSpeed(0);
    }
  }, []);

  // Tahmini süre hesaplama (saat cinsinden)
  const estimatedTime = speed > 0 ? totalDistance / speed : 0;

  // Analiz fonksiyonu (şu an sadece mesaj gösteriyor, backend entegrasyonu için hazır)
  const handleAnalyze = useCallback(() => {
    if (waypoints.length < 2) {
      message.warning('En az 2 waypoint gereklidir!');
      return;
    }

    // Backend'e gönderilecek data
    const routeData = {
      waypoints: waypoints,
      speed: speed,
      totalDistance: totalDistance,
      estimatedTime: estimatedTime
    };

    console.log('Analiz için backend\'e gönderilecek data:', routeData);
    
    message.success({
      content: `Rota analizi hazır! ${waypoints.length} waypoint, ${totalDistance.toFixed(2)} NM`,
      duration: 3,
    });

    // TODO: Backend API çağrısı burada yapılacak
    // fetch('/api/analyze-route', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(routeData)
    // })
  }, [waypoints, speed, totalDistance, estimatedTime]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          colorBgContainer: '#1a202c',
          borderRadius: 8,
        },
      }}
    >
      <div className="app-container">
        <Sidebar
          waypoints={waypoints}
          speed={speed}
          onSpeedChange={handleSpeedChange}
          totalDistance={totalDistance}
          estimatedTime={estimatedTime}
          onAnalyze={handleAnalyze}
          onWaypointRemove={handleWaypointRemove}
          onClearAll={handleClearAll}
        />
        <div className="map-wrapper">
          <MapView
            waypoints={waypoints}
            onWaypointAdd={handleWaypointAdd}
            onWaypointRemove={handleWaypointRemove}
            onWaypointUpdate={handleWaypointUpdate}
            onWaypointInsert={handleWaypointInsert}
            lastAddedIndex={lastAddedIndex}
          />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
