import React, { useState, useCallback, useEffect } from 'react';
import { ConfigProvider, theme, message, Modal, Typography, Button } from 'antd';
import { Bot, Minimize2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { getApiUrl, API_ENDPOINTS } from './config/api';
import './App.css';

const { Title, Paragraph } = Typography;

function App() {
  const [waypoints, setWaypoints] = useState([]);
  const [segmentSpeeds, setSegmentSpeeds] = useState([]); // Her segment için hız array'i (index = segment index)
  const [totalDistance, setTotalDistance] = useState(0);
  const [lastAddedIndex, setLastAddedIndex] = useState(null);
  const [startTime, setStartTime] = useState(null); // Başlangıç saati (Date object)
  const [hourlyPositions, setHourlyPositions] = useState([]); // Her saat için hesaplanan konumlar
  const [weatherData, setWeatherData] = useState([]); // Backend'den gelen hava durumu verileri
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false); // Modal minimize durumu
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Analiz yapılıyor mu?
  const DEFAULT_SPEED = 12; // Varsayılan hız: 12 knots
  const [defaultSpeed, setDefaultSpeed] = useState(DEFAULT_SPEED); // Varsayılan sürat değeri
  const [useDefaultSpeed, setUseDefaultSpeed] = useState(false); // Varsayılan sürat kullanılsın mı?

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
    
    // Segment hızları array'ini güncelle (yeni segment için undefined, varsayılan hız kullanılacak)
    // Yeni waypoint eklendiğinde yeni bir segment oluşur, ama hız girilmediği için undefined kalır
    
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
    
    // Segment hızları array'ini güncelle
    // Eğer ilk veya son waypoint silinirse, bir segment kaybolur
    // Eğer ortadaki bir waypoint silinirse, iki segment birleşir
    setSegmentSpeeds(prev => {
      const newSpeeds = [...prev];
      if (index === 0) {
        // İlk waypoint silindi, ilk segment kayboldu
        newSpeeds.shift();
      } else if (index === waypoints.length - 1) {
        // Son waypoint silindi, son segment kayboldu
        newSpeeds.pop();
      } else {
        // Ortadaki waypoint silindi, iki segment birleşti
        // index-1 ve index segmentleri birleşiyor
        // index-1 segmentinin hızını koruyoruz
        newSpeeds.splice(index - 1, 1);
      }
      return newSpeeds;
    });
    
    // Mesafeyi güncelle
    const newDistance = calculateTotalDistance(updatedWaypoints);
    setTotalDistance(newDistance);
    
    message.info(`Waypoint #${index + 1} kaldırıldı`);
  }, [waypoints, calculateTotalDistance]);

  // Waypoint güncelleme (taşıma)
  const handleWaypointUpdate = useCallback((index, newPosition) => {
    setWaypoints(prevWaypoints => {
      const updatedWaypoints = [...prevWaypoints];
      updatedWaypoints[index] = {
        lat: newPosition.lat,
        lng: newPosition.lng
      };
      return updatedWaypoints;
    });
    
    message.success(`Waypoint #${index + 1} taşındı`);
  }, []);

  // Araya waypoint ekleme
  const handleWaypointInsert = useCallback((index, position) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints.splice(index, 0, {
      lat: position.lat,
      lng: position.lng
    });
    setWaypoints(updatedWaypoints);
    
    // Segment hızları array'ini güncelle
    // index-1 segmenti ikiye bölünüyor
    // Eski segmentin hızını her iki yeni segmente de kopyalıyoruz
    setSegmentSpeeds(prev => {
      const newSpeeds = [...prev];
      if (index > 0 && index <= prev.length) {
        const oldSpeed = newSpeeds[index - 1];
        newSpeeds.splice(index - 1, 1, oldSpeed, oldSpeed);
      }
      return newSpeeds;
    });
    
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
    setSegmentSpeeds([]);
    setTotalDistance(0);
    setDefaultSpeed(DEFAULT_SPEED);
    setUseDefaultSpeed(false);
    message.warning('Tüm waypointler temizlendi');
  }, []);

  // Segment hızı değişimi
  const handleSegmentSpeedChange = useCallback((segmentIndex, value) => {
    const numValue = parseFloat(value);
    setSegmentSpeeds(prev => {
      const newSpeeds = [...prev];
      if (!isNaN(numValue) && numValue >= 0) {
        newSpeeds[segmentIndex] = numValue;
      } else if (value === '') {
        newSpeeds[segmentIndex] = undefined;
      }
      return newSpeeds;
    });
  }, []);

  // Varsayılan sürat değişimi
  const handleDefaultSpeedChange = useCallback((value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setDefaultSpeed(numValue);
    } else if (value === '') {
      setDefaultSpeed(DEFAULT_SPEED);
    }
  }, []);

  // Varsayılan sürat kullanımı değişimi
  const handleUseDefaultSpeedChange = useCallback((checked) => {
    setUseDefaultSpeed(checked);
  }, []);

  // Toplam süre hesaplama (segment bazlı hızlara göre)
  const calculateTotalTime = useCallback((points, speeds, useDefault, defaultSpd) => {
    if (points.length < 2) return 0;
    
    let totalTime = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const dist = calculateDistance(
        points[i].lat,
        points[i].lng,
        points[i + 1].lat,
        points[i + 1].lng
      );
      // Eğer varsayılan sürat kullanılıyorsa, onu kullan; değilse segment hızını kullan
      const segmentSpeed = useDefault 
        ? defaultSpd 
        : (speeds[i] !== undefined ? speeds[i] : DEFAULT_SPEED);
      if (segmentSpeed > 0) {
        totalTime += dist / segmentSpeed;
      }
    }
    return totalTime;
  }, [calculateDistance]);

  // Tahmini süre hesaplama (saat cinsinden)
  const estimatedTime = calculateTotalTime(waypoints, segmentSpeeds, useDefaultSpeed, defaultSpeed);

  // Her 1 saat için rotadaki konumu hesapla (segment bazlı hızlara göre)
  const calculateHourlyPositions = useCallback(() => {
    if (!startTime || waypoints.length < 2) {
      setHourlyPositions([]);
      return;
    }

    // Tüm segmentlerin hızlarını kontrol et
    const hasValidSpeed = segmentSpeeds.some(speed => speed !== undefined && speed > 0);
    if (!hasValidSpeed && waypoints.length >= 2) {
      // Hiç hız girilmemişse varsayılan hızı kullan
    }

    const positions = [];
    let accumulatedDistance = 0;
    let accumulatedTime = 0; // Saat cinsinden

    // Her segment için mesafe, hız ve süre bilgilerini hesapla
    const segments = [];
    for (let i = 0; i < waypoints.length - 1; i++) {
      const dist = calculateDistance(
        waypoints[i].lat,
        waypoints[i].lng,
        waypoints[i + 1].lat,
        waypoints[i + 1].lng
      );
      // Eğer varsayılan sürat kullanılıyorsa, onu kullan; değilse segment hızını kullan
      const speed = useDefaultSpeed 
        ? defaultSpeed 
        : (segmentSpeeds[i] !== undefined ? segmentSpeeds[i] : DEFAULT_SPEED);
      const time = speed > 0 ? dist / speed : 0;
      
      segments.push({
        from: waypoints[i],
        to: waypoints[i + 1],
        distance: dist,
        speed: speed,
        time: time,
        accumulatedDistance: accumulatedDistance,
        accumulatedTime: accumulatedTime
      });
      
      accumulatedDistance += dist;
      accumulatedTime += time;
    }

    // Her saat için konum hesapla
    const maxHours = Math.ceil(accumulatedTime) + 1;
    
    for (let hour = 1; hour <= maxHours; hour++) {
      const timeAtHour = hour; // Saat cinsinden
      
      // Eğer toplam süreyi aştıysa, son waypoint'i kullan ve dur
      if (timeAtHour >= accumulatedTime) {
        const timeAtPosition = new Date(startTime);
        timeAtPosition.setHours(timeAtPosition.getHours() + hour);

        positions.push({
          hour: hour,
          time: timeAtPosition,
          lat: waypoints[waypoints.length - 1].lat,
          lng: waypoints[waypoints.length - 1].lng,
          distance: accumulatedDistance
        });
        break;
      }

      // Hangi segmentte olduğunu bul
      let foundSegment = false;
      for (let seg of segments) {
        if (timeAtHour >= seg.accumulatedTime && 
            timeAtHour < seg.accumulatedTime + seg.time) {
          // Bu segmentte
          const timeInSegment = timeAtHour - seg.accumulatedTime;
          const distanceInSegment = timeInSegment * seg.speed;
          const ratio = seg.distance > 0 ? distanceInSegment / seg.distance : 0;

          const lat = seg.from.lat + (seg.to.lat - seg.from.lat) * ratio;
          const lng = seg.from.lng + (seg.to.lng - seg.from.lng) * ratio;

          const timeAtPosition = new Date(startTime);
          timeAtPosition.setHours(timeAtPosition.getHours() + hour);

          positions.push({
            hour: hour,
            time: timeAtPosition,
            lat: lat,
            lng: lng,
            distance: seg.accumulatedDistance + distanceInSegment
          });

          foundSegment = true;
          break;
        }
      }

      // Eğer segment bulunamadıysa (bu durumda rotanın sonuna ulaşılmış demektir)
      if (!foundSegment) {
        break;
      }
    }

    setHourlyPositions(positions);
  }, [startTime, waypoints, segmentSpeeds, totalDistance, calculateDistance, useDefaultSpeed, defaultSpeed]);

  // Waypoints değiştiğinde toplam mesafeyi güncelle
  useEffect(() => {
    const newDistance = calculateTotalDistance(waypoints);
    setTotalDistance(newDistance);
  }, [waypoints, calculateTotalDistance]);

  // NOT: Saatlik konumları artık otomatik hesaplamıyoruz!
  // Sadece "Analiz Et" butonuna basıldığında hesaplanacak.

  // Başlangıç saati değişimi
  const handleStartTimeChange = useCallback((time) => {
    setStartTime(time);
  }, []);

  // Analiz fonksiyonu
  const handleAnalyze = useCallback(async () => {
    if (waypoints.length < 2) {
      message.warning('En az 2 waypoint gereklidir!');
      return;
    }

    // Eğer zaten analiz yapılıyorsa, tekrar tıklamayı engelle
    if (isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);

    // ✅ Saatlik konumları SADECE analiz sırasında hesapla!
    console.log('📊 Analiz başlıyor - saatlik konumlar hesaplanıyor...');
    calculateHourlyPositions();

    // Backend'e gönderilecek data
    // Eğer varsayılan sürat kullanılıyorsa, tüm segmentler için varsayılan sürat değerini gönder
    // Değilse, her segment için kendi sürat değerini gönder (undefined ise null)
    let cleanedSegmentSpeeds;
    if (useDefaultSpeed) {
      // Tüm segmentler için varsayılan sürat değerini kullan
      cleanedSegmentSpeeds = Array(waypoints.length - 1).fill(defaultSpeed);
    } else {
      // Her segment için kendi sürat değerini kullan
      cleanedSegmentSpeeds = segmentSpeeds.map(speed => 
        speed !== undefined ? speed : null
      );
    }

    // hourlyPositions'ı backend formatına dönüştür
    const formattedHourlyPositions = startTime && hourlyPositions && hourlyPositions.length > 0
      ? hourlyPositions.map(pos => {
          // Timestamp'i ISO 8601 formatına çevir (UTC)
          const timestamp = pos.time instanceof Date
            ? pos.time.toISOString()
            : (typeof pos.time === 'string' ? pos.time : new Date(pos.time).toISOString());

          return {
            latitude: pos.lat,
            longitude: pos.lng,
            timestamp: timestamp,
            hour: pos.hour,
            distance: pos.distance
          };
        })
      : [];

    const routeData = {
      waypoints: waypoints.map(wp => ({
        lat: wp.lat,
        lng: wp.lng
      })),
      segmentSpeeds: cleanedSegmentSpeeds,
      totalDistance: totalDistance,
      estimatedTime: estimatedTime,
      hourlyPositions: formattedHourlyPositions
    };

    console.log('Analiz için backend\'e gönderilecek data:', routeData);

    try {
      const loadingMessage = message.loading('Rota analiz ediliyor...', 0);
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.ANALYZE_ROUTE), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeData)
      });

      loadingMessage();
      setIsAnalyzing(false);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Analiz sonucunu state'e kaydet ve modal'ı aç
      setAnalysisResult(result.response);
      setAnalysisModalVisible(true);
      setIsMinimized(false); // Yeni analiz geldiğinde modal'ı açık göster
      
      message.success({
        content: `Rota analizi tamamlandı! ${waypoints.length} waypoint, ${totalDistance.toFixed(2)} NM`,
        duration: 3,
      });

      console.log('Backend\'den gelen sonuç:', result);
      
      // Saatlik konumları backend'e gönder
      console.log('startTime:', startTime);
      console.log('hourlyPositions:', hourlyPositions);
      console.log('hourlyPositions length:', hourlyPositions?.length);
      
      if (!startTime) {
        console.warn('Başlangıç saati belirlenmediği için saatlik konumlar gönderilemiyor');
        message.warning('Başlangıç saati belirlenmediği için hava durumu verileri alınamadı');
      } else if (hourlyPositions && hourlyPositions.length > 0) {
        const coordinatesData = hourlyPositions.map(pos => {
          if (!pos.time) {
            console.warn('Time property bulunamadı:', pos);
            return null;
          }
          // Timestamp her zaman UTC (ISO 8601). TR'ye çevirme.
          const timestamp = pos.time instanceof Date
            ? pos.time.toISOString()
            : (typeof pos.time === 'string' ? pos.time : new Date(pos.time).toISOString());

          return {
            latitude: pos.lat,
            longitude: pos.lng,
            timestamp
          };
        }).filter(item => item !== null);

        console.log('Saatlik konumlar backend\'e gönderiliyor:', coordinatesData);

        try {
          const weatherResponse = await fetch(getApiUrl(API_ENDPOINTS.WEATHER_COORDINATES), {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(coordinatesData)
          });

          if (!weatherResponse.ok) {
            throw new Error(`HTTP error! status: ${weatherResponse.status}`);
          }

          const weatherResult = await weatherResponse.json();
          console.log('Backend\'den gelen hava durumu verileri:', weatherResult);
          
          // Hava durumu verilerini state'e kaydet
          setWeatherData(weatherResult);
        } catch (weatherError) {
          console.error('Hava durumu API çağrısı hatası:', weatherError);
          message.error({
            content: `Hava durumu verileri alınamadı: ${weatherError.message}`,
            duration: 5,
          });
        }
      } else {
        console.log('Gönderilecek saatlik konum bulunamadı');
      }
      
      return result;
    } catch (error) {
      console.error('API çağrısı hatası:', error);
      setIsAnalyzing(false);
      message.error({
        content: `API çağrısı başarısız: ${error.message}`,
        duration: 5,
      });
    }
  }, [waypoints, segmentSpeeds, totalDistance, estimatedTime, hourlyPositions, useDefaultSpeed, defaultSpeed, isAnalyzing]);

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
          segmentSpeeds={segmentSpeeds}
          onSegmentSpeedChange={handleSegmentSpeedChange}
          totalDistance={totalDistance}
          estimatedTime={estimatedTime}
          onAnalyze={handleAnalyze}
          onWaypointRemove={handleWaypointRemove}
          onClearAll={handleClearAll}
          startTime={startTime}
          onStartTimeChange={handleStartTimeChange}
          hourlyPositions={hourlyPositions}
          defaultSpeed={defaultSpeed}
          onDefaultSpeedChange={handleDefaultSpeedChange}
          useDefaultSpeed={useDefaultSpeed}
          onUseDefaultSpeedChange={handleUseDefaultSpeedChange}
          isAnalyzing={isAnalyzing}
        />
        <div className="map-wrapper">
          <MapView
            waypoints={waypoints}
            onWaypointAdd={handleWaypointAdd}
            onWaypointRemove={handleWaypointRemove}
            onWaypointUpdate={handleWaypointUpdate}
            onWaypointInsert={handleWaypointInsert}
            lastAddedIndex={lastAddedIndex}
            hourlyPositions={hourlyPositions}
            weatherData={weatherData}
          />
          
          {/* Minimize Edilmiş AI Analiz Simgesi */}
          {isMinimized && analysisResult && (
            <div 
              className="ai-analysis-minimized-icon"
              onClick={() => setIsMinimized(false)}
              title="AI Analizini Göster"
            >
              <Bot size={24} />
              <span className="ai-analysis-badge">AI</span>
            </div>
          )}
        </div>
      </div>

      {/* Analiz Sonuçları Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Rota Analiz Sonuçları</span>
            <Button
              type="text"
              icon={<Minimize2 size={16} />}
              onClick={() => setIsMinimized(true)}
              style={{ color: '#cbd5e0' }}
              title="Küçült"
            />
          </div>
        }
        open={analysisModalVisible && !isMinimized}
        onCancel={() => setIsMinimized(true)}
        footer={null}
        width={800}
        style={{ top: 20 }}
        closable={false}
      >
        {analysisResult && (
          <div className="ai-analysis-content">
            {typeof analysisResult === 'string' ? (
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <Title level={2} style={{ color: '#60a5fa', marginTop: '24px', marginBottom: '16px' }} {...props} />,
                  h2: ({node, ...props}) => <Title level={3} style={{ color: '#60a5fa', marginTop: '20px', marginBottom: '12px' }} {...props} />,
                  h3: ({node, ...props}) => <Title level={4} style={{ color: '#60a5fa', marginTop: '16px', marginBottom: '10px' }} {...props} />,
                  h4: ({node, ...props}) => <Title level={5} style={{ color: '#60a5fa', marginTop: '12px', marginBottom: '8px' }} {...props} />,
                  p: ({node, ...props}) => <Paragraph style={{ color: '#e2e8f0', marginBottom: '12px', lineHeight: '1.8' }} {...props} />,
                  strong: ({node, ...props}) => <strong style={{ color: '#f7fafc', fontWeight: 600 }} {...props} />,
                  ul: ({node, ...props}) => <ul style={{ color: '#e2e8f0', marginBottom: '12px', paddingLeft: '24px' }} {...props} />,
                  ol: ({node, ...props}) => <ol style={{ color: '#e2e8f0', marginBottom: '12px', paddingLeft: '24px' }} {...props} />,
                  li: ({node, ...props}) => <li style={{ color: '#e2e8f0', marginBottom: '6px', lineHeight: '1.8' }} {...props} />,
                  code: ({node, inline, ...props}) => 
                    inline ? (
                      <code style={{ 
                        background: 'rgba(59, 130, 246, 0.2)', 
                        color: '#60a5fa', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.9em'
                      }} {...props} />
                    ) : (
                      <code style={{ 
                        display: 'block',
                        background: '#1a1a1a', 
                        color: '#e2e8f0', 
                        padding: '12px', 
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '0.9em',
                        overflow: 'auto',
                        marginBottom: '12px'
                      }} {...props} />
                    ),
                  blockquote: ({node, ...props}) => (
                    <blockquote style={{
                      borderLeft: '4px solid #3b82f6',
                      paddingLeft: '16px',
                      marginLeft: 0,
                      marginBottom: '12px',
                      color: '#cbd5e0',
                      fontStyle: 'italic'
                    }} {...props} />
                  ),
                }}
              >
                {analysisResult}
              </ReactMarkdown>
            ) : analysisResult.comment ? (
              <div>
                <Title level={4}>Analiz Yorumu</Title>
                <ReactMarkdown
                  components={{
                    p: ({node, ...props}) => <Paragraph style={{ color: '#e2e8f0', marginBottom: '12px', lineHeight: '1.8' }} {...props} />,
                    strong: ({node, ...props}) => <strong style={{ color: '#f7fafc', fontWeight: 600 }} {...props} />,
                    ul: ({node, ...props}) => <ul style={{ color: '#e2e8f0', marginBottom: '12px', paddingLeft: '24px' }} {...props} />,
                    li: ({node, ...props}) => <li style={{ color: '#e2e8f0', marginBottom: '6px', lineHeight: '1.8' }} {...props} />,
                  }}
                >
                  {analysisResult.comment}
                </ReactMarkdown>
              </div>
            ) : (
              <Paragraph>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  color: '#e2e8f0',
                  backgroundColor: '#1a1a1a',
                  padding: '16px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              </Paragraph>
            )}
            
            {/* Diğer sonuç verileri varsa göster */}
            {analysisResult && typeof analysisResult === 'object' && analysisResult.waypoints && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>Waypoint Sayısı: {analysisResult.waypoints.length || waypoints.length}</Title>
              </div>
            )}
          </div>
        )}
      </Modal>
    </ConfigProvider>
  );
}

export default App;
