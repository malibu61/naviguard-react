import React from 'react';
import { List, Tag, Typography } from 'antd';
import { MapPin, X } from 'lucide-react';
import './WaypointList.css';

const { Text } = Typography;

const WaypointList = ({ waypoints, onWaypointRemove }) => {
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
