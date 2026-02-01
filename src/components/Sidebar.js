import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Divider, Typography, Statistic, DatePicker, Tag, Input, Checkbox } from 'antd';
import { Activity, Clock, Loader2, MapPin, Radio, ExternalLink, Search } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import WaypointList from './WaypointList';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import { announcementToPoints } from '../utils/navtexUtils';
import './Sidebar.css';

dayjs.extend(utc);

const { Text } = Typography;

const TAB_KEYS = { PLANNING: 'planning', NAVTEX: 'navtex' };

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
  isAnalyzing,
  onNavtexSelectionChange
}) => {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.PLANNING);
  const [navtexData, setNavtexData] = useState(null);
  const [navtexLoading, setNavtexLoading] = useState(false);
  const [navtexError, setNavtexError] = useState(null);
  const [navtexSearch, setNavtexSearch] = useState('');
  const [selectedNavtexIndices, setSelectedNavtexIndices] = useState([]); // Haritada gösterilecek duyuruların (tam liste) index'leri
  const canAnalyze = waypoints.length >= 2 && !isAnalyzing;

  const navtexAnnouncements = useMemo(
    () => navtexData?.announcements ?? [],
    [navtexData]
  );
  const navtexFiltered = useMemo(() => {
    if (!navtexSearch.trim()) return navtexAnnouncements;
    const q = navtexSearch.trim().toLowerCase();
    return navtexAnnouncements.filter((ann) => {
      const title = (ann.title ?? '').toLowerCase();
      const content = (ann.content ?? '').toLowerCase();
      return title.includes(q) || content.includes(q);
    });
  }, [navtexAnnouncements, navtexSearch]);
  const filteredWithIndex = useMemo(() => {
    const q = navtexSearch.trim().toLowerCase();
    return navtexAnnouncements
      .map((ann, fullIndex) => ({ ann, fullIndex }))
      .filter(({ ann }) => {
        if (!q) return true;
        const title = (ann.title ?? '').toLowerCase();
        const content = (ann.content ?? '').toLowerCase();
        return title.includes(q) || content.includes(q);
      });
  }, [navtexAnnouncements, navtexSearch]);

  const toggleNavtexSelection = useCallback((fullIndex) => {
    setSelectedNavtexIndices((prev) =>
      prev.includes(fullIndex) ? prev.filter((i) => i !== fullIndex) : [...prev, fullIndex]
    );
  }, []);

  const selectAllFiltered = useCallback(() => {
    const indicesToAdd = filteredWithIndex
      .filter(({ ann }) => ann.ltdlng?.length)
      .map(({ fullIndex }) => fullIndex);
    setSelectedNavtexIndices((prev) => {
      const set = new Set([...prev, ...indicesToAdd]);
      return Array.from(set);
    });
  }, [filteredWithIndex]);

  const clearAllNavtexSelection = useCallback(() => {
    setSelectedNavtexIndices([]);
  }, []);

  useEffect(() => {
    const points = [];
    for (const i of selectedNavtexIndices) {
      const ann = navtexAnnouncements[i];
      if (ann?.ltdlng?.length) {
        const coords = announcementToPoints(ann.ltdlng);
        coords.forEach(({ lat, lng }) => {
          points.push({
            lat,
            lng,
            navtexId: ann.id,
            navtexTitle: ann.title,
            navtexDetailUrl: ann.detailUrl,
            navtexContent: ann.content
          });
        });
      }
    }
    onNavtexSelectionChange?.(points);
  }, [selectedNavtexIndices, navtexAnnouncements, onNavtexSelectionChange]);

  useEffect(() => {
    if (activeTab !== TAB_KEYS.NAVTEX) return;
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        selectAllFiltered();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTab, selectAllFiltered]);

  useEffect(() => {
    if (activeTab !== TAB_KEYS.NAVTEX) return;
    setNavtexLoading(true);
    setNavtexError(null);
    fetch(getApiUrl(API_ENDPOINTS.NAVTEX))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setNavtexData(data);
        setNavtexError(null);
      })
      .catch((err) => {
        setNavtexError(err.message || 'Navtex verileri yüklenemedi.');
        setNavtexData(null);
      })
      .finally(() => setNavtexLoading(false));
  }, [activeTab]);

  return (
    <div className="sidebar">
      {/* Header — tam logo (naviguard-full) */}
      <div className="sidebar-header">
        <img
          src={`${process.env.PUBLIC_URL || ''}/naviguard-full.jpg`}
          alt="NaviGuard - Maritime Route Risk Analyzer"
          className="sidebar-logo-full"
        />
      </div>

      <Divider className="sidebar-divider" />

      {/* Tabs */}
      <div className="sidebar-tabs">
        <button
          type="button"
          className={`sidebar-tab ${activeTab === TAB_KEYS.PLANNING ? 'active' : ''}`}
          onClick={() => setActiveTab(TAB_KEYS.PLANNING)}
        >
          <MapPin size={16} />
          <span>Rota Planlama</span>
        </button>
        <button
          type="button"
          className={`sidebar-tab ${activeTab === TAB_KEYS.NAVTEX ? 'active' : ''}`}
          onClick={() => setActiveTab(TAB_KEYS.NAVTEX)}
        >
          <Radio size={16} />
          <span>Navtex</span>
        </button>
      </div>

      <div className="sidebar-tab-panels">
        {activeTab === TAB_KEYS.PLANNING && (
          <div key={TAB_KEYS.PLANNING} className="tab-panel tab-panel-enter">
            {/* Başlangıç Saati Girişi — Tüm saatler UTC olarak işlenir */}
            <div className="input-section">
              <div className="input-label">
                <Clock size={16} />
                <Text className="label-text">Başlangıç Saati (UTC)</Text>
              </div>
              <DatePicker
                showTime
                format="DD.MM.YYYY HH:mm"
                value={startTime ? dayjs.utc(startTime) : null}
                onChange={(date) => {
                  if (date) {
                    // Kullanıcının seçtiği değerleri al (local olarak yorumlanmış ama biz UTC istiyoruz)
                    const year = date.year();
                    const month = date.month();
                    const day = date.date();
                    const hour = date.hour();
                    const minute = date.minute();
                    
                    // Bu değerlerle direkt UTC Date oluştur (timezone shift olmadan)
                    const utcDate = new Date(Date.UTC(year, month, day, hour, minute));
                    onStartTimeChange(utcDate);
                  } else {
                    onStartTimeChange(null);
                  }
                }}
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
        )}

        {activeTab === TAB_KEYS.NAVTEX && (
          <div key={TAB_KEYS.NAVTEX} className="tab-panel tab-panel-enter">
            <div className="navtex-panel">
              {navtexLoading && (
                <div className="navtex-placeholder">
                  <Loader2 size={48} className="navtex-icon spinning-icon" />
                  <Text className="navtex-label">Yükleniyor...</Text>
                </div>
              )}
              {!navtexLoading && navtexError && (
                <div className="navtex-placeholder">
                  <Radio size={48} className="navtex-icon" />
                  <Text className="navtex-label">Hata</Text>
                  <Text type="secondary" className="navtex-hint">{navtexError}</Text>
                </div>
              )}
              {!navtexLoading && !navtexError && navtexData && (
                <div className="navtex-list-wrap">
                  <Input
                    prefix={<Search size={16} className="navtex-search-icon" />}
                    placeholder="Duyurularda ara..."
                    value={navtexSearch}
                    onChange={(e) => setNavtexSearch(e.target.value)}
                    allowClear
                    className="navtex-search-input"
                  />
                  <div className="navtex-header">
                    <Text className="navtex-count">
                      {navtexFiltered.length === navtexAnnouncements.length
                        ? `Toplam ${navtexAnnouncements.length} duyuru`
                        : `${navtexFiltered.length} / ${navtexAnnouncements.length} duyuru`}
                    </Text>
                    <div className="navtex-header-buttons">
                      <Button
                        type="primary"
                        size="middle"
                        onClick={selectAllFiltered}
                        className="navtex-select-all-btn"
                        title="Görünen tüm duyuruları haritada göster (Ctrl+Shift+A)"
                      >
                        Tümünü Göster
                      </Button>
                      <Button
                        size="middle"
                        onClick={clearAllNavtexSelection}
                        className="navtex-clear-all-btn"
                        disabled={selectedNavtexIndices.length === 0}
                        title="Haritadaki tüm Navtex noktalarını kaldır"
                      >
                        Tümünü Temizle
                      </Button>
                    </div>
                  </div>
                  <div className="navtex-list">
                    {filteredWithIndex.map(({ ann, fullIndex }) => (
                      <div key={`${ann.id}-${fullIndex}`} className="navtex-card">
                        <div className="navtex-card-header">
                          <div className="navtex-card-header-left">
                            {ann.ltdlng?.length ? (
                              <Checkbox
                                checked={selectedNavtexIndices.includes(fullIndex)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleNavtexSelection(fullIndex);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="navtex-card-checkbox"
                              >
                                <span className="navtex-checkbox-label">Haritada göster</span>
                              </Checkbox>
                            ) : (
                              <Text type="secondary" className="navtex-no-coords">Koordinat yok</Text>
                            )}
                          </div>
                          <Tag color="blue" className="navtex-card-id">{ann.id}</Tag>
                          <Text className="navtex-card-date">
                            {ann.date ? dayjs(ann.date).format('DD.MM.YYYY') : '-'}
                          </Text>
                        </div>
                        <Text className="navtex-card-title">{ann.title}</Text>
                        {ann.content && (
                          <Text className="navtex-card-content">{ann.content}</Text>
                        )}
                        {ann.detailUrl && (
                          <a
                            href={ann.detailUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="navtex-detail-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={14} />
                            Detay
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
