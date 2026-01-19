import React from 'react';
import { Input, Button, Divider, Typography, Statistic, DatePicker, Tag } from 'antd';
import { Ship, Activity, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import WaypointList from './WaypointList';
import './Sidebar.css';

const { Title, Text } = Typography;

const Sidebar = ({ 
  waypoints, 
  segmentSpeeds,
  onSegmentSpeedChange,
  totalDistance,
  estimatedTime,
  onAnalyze,
  onWaypointRemove,
  onClearAll,
  startTime,
  onStartTimeChange,
  hourlyPositions
}) => {
  const canAnalyze = waypoints.length >= 2;

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <Ship size={32} className="header-icon" />
        <Title level={3} className="sidebar-title">NaviGuard</Title>
        <Text className="sidebar-subtitle">Maritime Route Risk Analyzer</Text>
      </div>

      <Divider className="sidebar-divider" />

      {/* Başlangıç Saati Girişi */}
      <div className="input-section">
        <div className="input-label">
          <Clock size={16} />
          <Text className="label-text">Başlangıç Saati</Text>
        </div>
        <DatePicker
          showTime
          format="DD.MM.YYYY HH:mm"
          value={startTime ? dayjs(startTime) : null}
          onChange={(date) => onStartTimeChange(date ? date.toDate() : null)}
          placeholder="Başlangıç saatini seçin"
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
              <Text className="waypoint-title">Saatlik Konumlar</Text>
            </div>
            <div className="hourly-positions-list">
              {hourlyPositions.map((pos, index) => (
                <div key={index} className="hourly-position-item">
                  <Tag color="green" className="hour-tag">
                    +{pos.hour}s
                  </Tag>
                  <div className="hourly-position-content">
                    <Text className="hour-time">
                      {dayjs(pos.time).format('DD.MM.YYYY HH:mm')}
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
      />

      <Divider className="sidebar-divider" />

      {/* Action Buttons */}
      <div className="action-buttons">
        <Button
          type="primary"
          size="large"
          icon={<Activity size={18} />}
          disabled={!canAnalyze}
          onClick={onAnalyze}
          className="analyze-btn"
          block
        >
          Rotayı Analiz Et
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
