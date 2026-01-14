import React from 'react';
import { Input, Button, Divider, Typography, Statistic } from 'antd';
import { Ship, Navigation, Activity } from 'lucide-react';
import WaypointList from './WaypointList';
import './Sidebar.css';

const { Title, Text } = Typography;

const Sidebar = ({ 
  waypoints, 
  speed, 
  onSpeedChange, 
  totalDistance,
  estimatedTime,
  onAnalyze,
  onWaypointRemove,
  onClearAll
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

      {/* Hız Girişi */}
      <div className="input-section">
        <div className="input-label">
          <Navigation size={16} />
          <Text className="label-text">Ortalama Hız (Knots)</Text>
        </div>
        <Input
          type="number"
          value={speed}
          onChange={(e) => onSpeedChange(e.target.value)}
          placeholder="Örn: 12"
          className="speed-input"
          min={0}
          max={50}
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
        
        {speed > 0 && totalDistance > 0 && (
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

      {/* Waypoint Listesi */}
      <WaypointList 
        waypoints={waypoints}
        onWaypointRemove={onWaypointRemove}
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
