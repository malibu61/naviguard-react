import React from 'react';
import { Input, Button, Divider, Typography, Statistic, DatePicker, Tag, Spin } from 'antd';
import { Ship, Activity, Clock, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import WaypointList from './WaypointList';
import './Sidebar.css';

dayjs.extend(utc);

const { Title, Text } = Typography;

const Sidebar = ({ 
  waypoints, 
  segmentSpeeds,
  onSegmentSpeedChange,
  totalDistance,
  estimatedTime,
  segmentDetails,
  onAnalyze,
  onWaypointRemove,
  onClearAll,
  startTime,
  onStartTimeChange,
  hourlyPositions,
  defaultSpeed,
  onDefaultSpeedChange,
  useDefaultSpeed,
  onUseDefaultSpeedChange,
  isAnalyzing
}) => {
  const canAnalyze = waypoints.length >= 2 && !isAnalyzing;

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <Ship size={32} className="header-icon" />
        <Title level={3} className="sidebar-title">NaviGuard</Title>
        <Text className="sidebar-subtitle">Maritime Route Risk Analyzer</Text>
      </div>

      <Divider className="sidebar-divider" />

      {/* Başlangıç Saati Girişi — Tüm saatler UTC olarak işlenir */}
      <div className="input-section">
        <div className="input-label">
          <Clock size={16} />
          <Text className="label-text">Başlangıç Saati (UTC)</Text>
        </div>
        <DatePicker
          showTime
          format="DD.MM.YYYY HH:mm"
          value={startTime ? dayjs(startTime) : null}
          onChange={(date) => onStartTimeChange(date ? date.toDate() : null)}
          placeholder="Başlangıç saatini seçin (UTC)"
          className="time-input"
          style={{ width: '100%' }}
        />
      </div>

      <Divider className="sidebar-divider" />

      {/* İstatistikler */}
      <div className="stats-section">
        <Statistic
          title={<span className="stat-title">Toplam Mesafe</span>}
          value={totalDistance}
          suffix="NM"
          precision={2}
          className="stat-item"
        />
        
        {estimatedTime > 0 && totalDistance > 0 && (
          <Statistic
            title={<span className="stat-title">Tahmini Süre</span>}
            value={estimatedTime}
            suffix="saat"
            precision={1}
            className="stat-item"
          />
        )}
      </div>

      <Divider className="sidebar-divider" />

      {/* Saatlik Konumlar */}
      {startTime && hourlyPositions.length > 0 && (
        <>
          <div className="hourly-positions-section">
            <div className="waypoint-header">
              <Clock size={18} />
              <Text className="waypoint-title">Saatlik Konumlar (UTC)</Text>
            </div>
            <div className="hourly-positions-list">
              {hourlyPositions.map((pos, index) => (
                <div key={index} className="hourly-position-item">
                  <Tag color="green" className="hour-tag">
                    +{pos.hour}s
                  </Tag>
                  <div className="hourly-position-content">
                    <Text className="hour-time" title="Tüm saatler UTC">
                      {dayjs.utc(pos.time).format('DD.MM.YYYY HH:mm')} UTC
                    </Text>
                    <Text className="hour-coords">
                      Lat: {pos.lat.toFixed(4)}° | Lon: {pos.lng.toFixed(4)}°
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Divider className="sidebar-divider" />
        </>
      )}

      {/* Waypoint Listesi */}
      <WaypointList 
        waypoints={waypoints}
        onWaypointRemove={onWaypointRemove}
        segmentSpeeds={segmentSpeeds}
        onSegmentSpeedChange={onSegmentSpeedChange}
        defaultSpeed={defaultSpeed}
        onDefaultSpeedChange={onDefaultSpeedChange}
        useDefaultSpeed={useDefaultSpeed}
        onUseDefaultSpeedChange={onUseDefaultSpeedChange}
      />

      {/* Segment Detayları */}
      {segmentDetails && segmentDetails.length > 0 && (
        <>
          <Divider className="sidebar-divider" />
          <div className="segment-section">
            <div className="waypoint-header">
              <Activity size={18} />
              <Text className="waypoint-title">Segment Detayları</Text>
            </div>
            <div className="segment-list">
              {segmentDetails.map(segment => (
                <div key={segment.index} className="segment-item">
                  <Tag color="blue" className="segment-tag">
                    #{segment.index + 1} → #{segment.index + 2}
                  </Tag>
                  <div className="segment-content">
                    <Text className="segment-distance">
                      Mesafe: {segment.distance.toFixed(2)} NM
                    </Text>
                    <Text className="segment-speed">
                      Hız: {Number(segment.speed).toFixed(1)} kn
                    </Text>
                    <Text className="segment-heading">
                      Pruva: {segment.heading.toFixed(0)}°
                    </Text>
                    <Text className={`segment-time ${segment.time ? '' : 'muted'}`}>
                      Süre: {segment.time ? segment.time.toFixed(2) : '-'} saat
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Divider className="sidebar-divider" />

      {/* Action Buttons */}
      <div className="action-buttons">
        <Button
          type="primary"
          size="large"
          icon={isAnalyzing ? <Loader2 size={18} className="spinning-icon" /> : <Activity size={18} />}
          disabled={!canAnalyze || isAnalyzing}
          onClick={onAnalyze}
          className="analyze-btn"
          block
          loading={isAnalyzing}
        >
          {isAnalyzing ? 'Analiz Ediliyor...' : 'Rotayı Analiz Et'}
        </Button>
        
        {waypoints.length > 0 && (
          <Button
            type="default"
            size="large"
            onClick={onClearAll}
            className="clear-btn"
            block
          >
            Tümünü Temizle
          </Button>
        )}
      </div>

      {!canAnalyze && waypoints.length > 0 && (
        <Text className="warning-text">
          Analiz için en az 2 waypoint gereklidir
        </Text>
      )}
    </div>
  );
};

export default Sidebar;
