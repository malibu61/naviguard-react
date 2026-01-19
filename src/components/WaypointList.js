import React from 'react';
import { List, Tag, Typography, Input } from 'antd';
import { MapPin, X } from 'lucide-react';
import './WaypointList.css';

const { Text } = Typography;

const WaypointList = ({ waypoints, onWaypointRemove, segmentSpeeds, onSegmentSpeedChange }) => {
  return (
    <div className="waypoint-list-container">
      <div className="waypoint-header">
        <MapPin size={18} />
        <Text className="waypoint-title">Waypoint Listesi</Text>
      </div>
      
      {waypoints.length === 0 ? (
        <div className="empty-state">
          <Text className="empty-text">
            Haritaya tıklayarak waypoint ekleyin
          </Text>
        </div>
      ) : (
        <List
          className="waypoint-list"
          dataSource={waypoints}
          renderItem={(waypoint, index) => (
            <List.Item className="waypoint-item">
              <div className="waypoint-content">
                <Tag color="blue" className="waypoint-tag">
                  #{index + 1}
                </Tag>
                <div className="waypoint-coords">
                  <Text className="coord-text">
                    Lat: {waypoint.lat.toFixed(4)}°
                  </Text>
                  <Text className="coord-text">
                    Lon: {waypoint.lng.toFixed(4)}°
                  </Text>
                </div>
                {/* Segment hızı - sadece son waypoint değilse göster */}
                {index < waypoints.length - 1 && (
                  <div className="segment-speed-container">
                    <Text className="segment-speed-label">Hız:</Text>
                    <Input
                      type="number"
                      size="small"
                      value={segmentSpeeds && segmentSpeeds[index] !== undefined ? segmentSpeeds[index] : ''}
                      onChange={(e) => onSegmentSpeedChange && onSegmentSpeedChange(index, e.target.value)}
                      placeholder="12"
                      className="segment-speed-input"
                      min={0}
                      max={50}
                    />
                    <Text className="segment-speed-unit">knots</Text>
                  </div>
                )}
              </div>
              <button
                className="remove-btn"
                onClick={() => onWaypointRemove(index)}
                title="Waypoint'i kaldır"
              >
                <X size={16} />
              </button>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default WaypointList;
