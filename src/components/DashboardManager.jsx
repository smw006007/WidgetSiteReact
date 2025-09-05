import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import SystemHealthWidget from '../widgets/status/system-health/SystemHealthWidget.jsx';
import WhaleAlertsWidget from '../widgets/activity/whale-alerts/WhaleAlertsWidget.jsx';
import EcosystemLeaderboardWidget from '../widgets/leaderboards/ecosystem/EcosystemLeaderboardWidget.jsx';
import { 
  Plus, Search, Grid, Eye, X, Filter, Tag, Maximize2, Minimize2,
  Menu, Settings, RotateCcw, Smartphone, Monitor
} from 'lucide-react';
import './DashboardManager.css';

const GRID_SIZE = 20;
const MOBILE_GRID_SIZE = 10;

const defaultLayout = [
  {
    id: 'system-health',
    type: 'SystemHealth',
    position: { x: 20, y: 20 },
    size: { width: 400, height: 300 },
    zIndex: 1
  },
  {
    id: 'whale-alerts',
    type: 'WhaleAlerts',
    position: { x: 440, y: 20 },
    size: { width: 500, height: 400 },
    zIndex: 2
  }
];

// Mobile-optimized default layout
const defaultMobileLayout = [
  {
    id: 'system-health',
    type: 'SystemHealth',
    position: { x: 10, y: 10 },
    size: { width: 350, height: 250 },
    zIndex: 1
  },
  {
    id: 'whale-alerts',
    type: 'WhaleAlerts',
    position: { x: 10, y: 270 },
    size: { width: 350, height: 300 },
    zIndex: 2
  }
];

// Widget Registry with mobile-specific configurations
const WIDGET_REGISTRY = {
  SystemHealth: {
    component: SystemHealthWidget,
    name: 'System Health',
    description: 'Monitor API health, uptime, and system metrics',
    category: 'Status',
    tags: ['health', 'monitoring', 'api', 'uptime'],
    defaultSize: { width: 400, height: 300 },
    mobileSize: { width: 350, height: 250 },
    icon: '🌐',
    mobileOptimized: true
  },
  
  WhaleAlerts: {
    component: WhaleAlertsWidget,
    name: 'Whale Alerts',
    description: 'Track large KARRAT transactions and whale activity',
    category: 'Activity',
    tags: ['whale', 'alerts', 'transactions', 'monitoring'],
    defaultSize: { width: 500, height: 400 },
    mobileSize: { width: 350, height: 300 },
    icon: '🐋',
    mobileOptimized: true
  },
  
  EcosystemLeaderboard: {
    component: EcosystemLeaderboardWidget,
    name: 'Ecosystem Leaderboard',
    description: 'View top ecosystem participants and their rankings',
    category: 'Leaderboards',
    tags: ['leaderboard', 'ecosystem', 'rankings', 'users'],
    defaultSize: { width: 400, height: 420 },
    mobileSize: { width: 350, height: 400 },
    icon: '🏆',
    mobileOptimized: true
  }
};

// Helper functions
const isMobile = () => window.innerWidth <= 768;
const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;
const isTouch = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const checkCollision = (itemA, itemB) => {
  if (
    itemA.x + itemA.width <= itemB.x ||
    itemA.x >= itemB.x + itemB.width ||
    itemA.y + itemA.height <= itemB.y ||
    itemA.y >= itemB.y + itemB.height
  ) {
    return false;
  }
  return true;
};

// Mobile-friendly Widget Library Component
const WidgetLibrary = ({ isOpen, onClose, onAddWidget, existingWidgets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [previewWidget, setPreviewWidget] = useState(null);

  const categories = useMemo(() => {
    const cats = new Set(['All']);
    Object.values(WIDGET_REGISTRY).forEach(widget => cats.add(widget.category));
    return Array.from(cats);
  }, []);

  const filteredWidgets = useMemo(() => {
    return Object.entries(WIDGET_REGISTRY).filter(([key, widget]) => {
      const matchesSearch = widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           widget.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           widget.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || widget.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleAddWidget = (widgetType, widgetConfig) => {
    const mobile = isMobile();
    const size = mobile ? (widgetConfig.mobileSize || widgetConfig.defaultSize) : widgetConfig.defaultSize;
    
    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      position: { x: mobile ? 10 : 20, y: mobile ? 10 : 20 },
      size: { ...size },
      zIndex: Math.max(0, ...existingWidgets.map(w => w.zIndex || 0)) + 1
    };
    onAddWidget(newWidget);
  };

  if (!isOpen) return null;

  return (
    <div className="widget-library-overlay">
      <div className="widget-library">
        <div className="widget-library-header">
          <div className="library-title">
            <Grid size={isMobile() ? 16 : 20} />
            <h3>Widget Library</h3>
            <span className="widget-count">{filteredWidgets.length}</span>
          </div>
          <button className="close-library-btn" onClick={onClose}>
            <X size={isMobile() ? 16 : 18} />
          </button>
        </div>

        <div className="widget-library-controls">
          <div className="search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="category-filter">
            <Filter size={14} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="widget-library-content">
          <div className="widget-grid-library">
            {filteredWidgets.map(([widgetType, widgetConfig]) => (
              <div key={widgetType} className="widget-card">
                <div className="widget-card-header">
                  <div className="widget-icon">{widgetConfig.icon}</div>
                  <div className="widget-info">
                    <h4>{widgetConfig.name}</h4>
                    <span className="widget-category">{widgetConfig.category}</span>
                    {widgetConfig.mobileOptimized && (
                      <span className="mobile-badge">
                        <Smartphone size={10} />
                        Mobile
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="widget-description">{widgetConfig.description}</p>
                
                <div className="widget-tags">
                  {widgetConfig.tags.slice(0, isMobile() ? 2 : 4).map(tag => (
                    <span key={tag} className="widget-tag">
                      <Tag size={8} />
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="widget-card-actions">
                  <button
                    className="preview-btn"
                    onClick={() => setPreviewWidget({ type: widgetType, config: widgetConfig })}
                  >
                    <Eye size={12} />
                    Preview
                  </button>
                  <button
                    className="add-widget-btn"
                    onClick={() => handleAddWidget(widgetType, widgetConfig)}
                  >
                    <Plus size={12} />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile-optimized Preview Modal */}
        {previewWidget && (
          <div className="widget-preview-overlay">
            <div className="widget-preview-modal full">
              <div className="preview-header">
                <div className="preview-title">
                  <span>{previewWidget.config.icon}</span>
                  <h4>{previewWidget.config.name}</h4>
                </div>
                <div className="preview-controls">
                  <button
                    className="add-from-preview-btn"
                    onClick={() => {
                      handleAddWidget(previewWidget.type, previewWidget.config);
                      setPreviewWidget(null);
                    }}
                  >
                    <Plus size={12} />
                    Add
                  </button>
                  <button
                    className="close-preview-btn"
                    onClick={() => setPreviewWidget(null)}
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
              
              <div className="preview-content">
                <div 
                  className="preview-widget-container"
                  style={{
                    width: isMobile() 
                      ? (previewWidget.config.mobileSize?.width || 300)
                      : previewWidget.config.defaultSize.width,
                    height: isMobile() 
                      ? (previewWidget.config.mobileSize?.height || 200)
                      : previewWidget.config.defaultSize.height
                  }}
                >
                  {React.createElement(previewWidget.config.component, {
                    key: `preview-${previewWidget.type}`,
                    refreshInterval: null
                  })}
                </div>
              </div>
              
              <div className="preview-info">
                <p><strong>Category:</strong> {previewWidget.config.category}</p>
                {isMobile() && previewWidget.config.mobileOptimized && (
                  <p><strong>Mobile Optimized:</strong> Yes</p>
                )}
                <p><strong>Description:</strong> {previewWidget.config.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardManager = () => {
  const [widgets, setWidgets] = useState(() => {
    try {
      const savedLayout = localStorage.getItem('karrat-dashboard-layout');
      if (savedLayout) {
        return JSON.parse(savedLayout);
      }
      return isMobile() ? defaultMobileLayout : defaultLayout;
    } catch (error) {
      console.error("Could not load dashboard layout from localStorage:", error);
      return isMobile() ? defaultMobileLayout : defaultLayout;
    }
  });

  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [isInvalidDrop, setIsInvalidDrop] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState(isMobile() ? 'mobile' : 'desktop');
  
  const dashboardRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = isMobile();
      setCurrentViewMode(mobile ? 'mobile' : 'desktop');
      
      // Auto-adjust widget sizes for mobile
      if (mobile) {
        setWidgets(prev => prev.map(widget => {
          const config = WIDGET_REGISTRY[widget.type];
          if (config?.mobileSize) {
            return {
              ...widget,
              size: { ...config.mobileSize }
            };
          }
          return widget;
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save layout to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('karrat-dashboard-layout', JSON.stringify(widgets));
    } catch (error) {
      console.error("Could not save dashboard layout to localStorage:", error);
    }
  }, [widgets]);

  const currentGridSize = currentViewMode === 'mobile' ? MOBILE_GRID_SIZE : GRID_SIZE;

  const updatePosition = useCallback((widgetId, newPosition) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      setWidgets(prev => prev.map(widget => 
        widget.id === widgetId
          ? { ...widget, position: newPosition }
          : widget
      ));
    });
  }, []);

  const updateSize = useCallback((widgetId, newSize) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      setWidgets(prev => prev.map(widget => 
        widget.id === widgetId
          ? { ...widget, size: newSize }
          : widget
      ));
    });
  }, []);

  // Enhanced touch/mouse event handling
  const handleInteractionStart = useCallback((e, widgetId, action = 'drag') => {
    e.preventDefault();
    e.stopPropagation();
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Bring widget to front
    const maxZIndex = Math.max(0, ...widgets.map(w => w.zIndex || 0));
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, zIndex: maxZIndex + 1 } : w
    ));

    if (action === 'drag') {
      setDragState({
        widgetId,
        startX: clientX,
        startY: clientY,
        startPosition: { ...widget.position },
      });
    } else if (action === 'resize') {
      setResizeState({
        widgetId,
        startX: clientX,
        startY: clientY,
        startSize: { ...widget.size },
        startPosition: { ...widget.position }
      });
    }
  }, [widgets]);

  const handleInteractionMove = useCallback((e) => {
    if (!dragState && !resizeState) return;
    
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    let isColliding = false;

    if (dragState) {
      const mouseMoveDeltaX = clientX - dragState.startX;
      const mouseMoveDeltaY = clientY - dragState.startY;
      const rawX = dragState.startPosition.x + mouseMoveDeltaX;
      const rawY = dragState.startPosition.y + mouseMoveDeltaY;
      const snappedX = Math.round(rawX / currentGridSize) * currentGridSize;
      const snappedY = Math.round(rawY / currentGridSize) * currentGridSize;

      const currentWidget = widgets.find(w => w.id === dragState.widgetId);
      if (!currentWidget) return;

      const proposedBounds = { x: snappedX, y: snappedY, width: currentWidget.size.width, height: currentWidget.size.height };

      for (const widget of widgets) {
        if (widget.id === dragState.widgetId) continue;
        if (checkCollision(proposedBounds, { ...widget.position, ...widget.size })) {
          isColliding = true;
          break;
        }
      }
      updatePosition(dragState.widgetId, { x: snappedX, y: snappedY });
    }

    if (resizeState) {
      const deltaX = clientX - resizeState.startX;
      const deltaY = clientY - resizeState.startY;
      const rawWidth = resizeState.startSize.width + deltaX;
      const rawHeight = resizeState.startSize.height + deltaY;
      
      // Allow resizing down to a small size, removing the larger minimum constraints
      const minWidth = currentGridSize * 2;
      const minHeight = currentGridSize * 2;
      
      const snappedWidth = Math.max(minWidth, Math.round(rawWidth / currentGridSize) * currentGridSize);
      const snappedHeight = Math.max(minHeight, Math.round(rawHeight / currentGridSize) * currentGridSize);

      const currentWidget = widgets.find(w => w.id === resizeState.widgetId);
      if (!currentWidget) return;

      const proposedBounds = { ...currentWidget.position, width: snappedWidth, height: snappedHeight };

      for (const widget of widgets) {
        if (widget.id === resizeState.widgetId) continue;
        if (checkCollision(proposedBounds, { ...widget.position, ...widget.size })) {
          isColliding = true;
          break;
        }
      }
      updateSize(resizeState.widgetId, { width: snappedWidth, height: snappedHeight });
    }
    
    setIsInvalidDrop(isColliding);
  }, [dragState, resizeState, widgets, updatePosition, updateSize, currentGridSize]);

  const handleInteractionEnd = useCallback(() => {
    if (isInvalidDrop) {
      if (dragState) {
        setWidgets(prev => prev.map(w =>
          w.id === dragState.widgetId
            ? { ...w, position: dragState.startPosition }
            : w
        ));
      }
      if (resizeState) {
        setWidgets(prev => prev.map(w =>
          w.id === resizeState.widgetId
            ? { ...w, size: resizeState.startSize }
            : w
        ));
      }
    }
    
    setDragState(null);
    setResizeState(null);
    setIsInvalidDrop(false);
  }, [dragState, resizeState, isInvalidDrop]);

  // Event listeners for both mouse and touch
  useEffect(() => {
    if (dragState || resizeState) {
      const moveEvent = isTouch() ? 'touchmove' : 'mousemove';
      const endEvent = isTouch() ? 'touchend' : 'mouseup';
      
      document.addEventListener(moveEvent, handleInteractionMove, { passive: false });
      document.addEventListener(endEvent, handleInteractionEnd);
      
      return () => {
        document.removeEventListener(moveEvent, handleInteractionMove);
        document.removeEventListener(endEvent, handleInteractionEnd);
      };
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [dragState, resizeState, handleInteractionMove, handleInteractionEnd]);

  const resetLayout = useCallback(() => {
    const layout = currentViewMode === 'mobile' ? defaultMobileLayout : defaultLayout;
    setWidgets(layout);
  }, [currentViewMode]);

  const addWidget = useCallback((newWidget) => {
    let position = { x: currentViewMode === 'mobile' ? 10 : 20, y: currentViewMode === 'mobile' ? 10 : 20 };
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const proposedBounds = { ...position, ...newWidget.size };
      let hasCollision = false;
      
      for (const widget of widgets) {
        if (checkCollision(proposedBounds, { ...widget.position, ...widget.size })) {
          hasCollision = true;
          break;
        }
      }
      
      if (!hasCollision) break;
      
      position.x += currentGridSize * 3;
      if (position.x > (currentViewMode === 'mobile' ? 300 : 800)) {
        position.x = currentViewMode === 'mobile' ? 10 : 20;
        position.y += currentGridSize * 3;
      }
      attempts++;
    }
    
    setWidgets(prev => [...prev, { ...newWidget, position }]);
    setIsLibraryOpen(false);
  }, [widgets, currentGridSize, currentViewMode]);

  const MobileToolbar = () => (
    <div className="mobile-toolbar">
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu size={20} />
      </button>
      
      <h2>KARRAT Dashboard</h2>
      
      <button 
        onClick={() => setIsLibraryOpen(true)} 
        className="mobile-add-widget-btn"
      >
        <Plus size={20} />
      </button>
      
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <button onClick={resetLayout} className="mobile-menu-item">
            <RotateCcw size={16} />
            Reset Layout
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="mobile-menu-item"
          >
            <Settings size={16} />
            Settings
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`dashboard-container ${currentViewMode}`}>
      {currentViewMode === 'mobile' ? (
        <MobileToolbar />
      ) : (
        <div className="dashboard-toolbar">
          <h2>KARRAT Dashboard</h2>
          <div className="dashboard-controls">
            <div className="view-mode-indicator">
              {currentViewMode === 'mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
              <span>{currentViewMode === 'mobile' ? 'Mobile' : 'Desktop'}</span>
            </div>
            <button 
              onClick={() => setIsLibraryOpen(true)} 
              className="dashboard-btn primary"
            >
              <Plus size={16} />
              Add Widget
            </button>
            <button onClick={resetLayout} className="dashboard-btn secondary">
              <RotateCcw size={16} />
              Reset Layout
            </button>
          </div>
        </div>
      )}

      <div 
        ref={dashboardRef}
        className="dashboard-grid"
        style={{
          backgroundSize: `${currentGridSize}px ${currentGridSize}px`
        }}
      >
        {widgets.map(widget => {
          const widgetConfig = WIDGET_REGISTRY[widget.type];
          const WidgetComponent = widgetConfig?.component;
          
          if (!WidgetComponent) {
            console.warn(`Widget type "${widget.type}" not found in registry`);
            return null;
          }
          
          const isDragging = dragState?.widgetId === widget.id;
          const isResizing = resizeState?.widgetId === widget.id;
          const isInvalid = (isDragging || isResizing) && isInvalidDrop;

          return (
            <div
              key={widget.id}
              data-widget-id={widget.id}
              className={`dashboard-widget ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isInvalid ? 'is-invalid' : ''} ${currentViewMode}`}
              style={{
                position: 'absolute',
                left: widget.position.x,
                top: widget.position.y,
                width: widget.size.width,
                height: widget.size.height,
                zIndex: widget.zIndex,
              }}
            >
              <div 
                className="widget-drag-handle"
                onMouseDown={(e) => handleInteractionStart(e, widget.id, 'drag')}
                onTouchStart={(e) => handleInteractionStart(e, widget.id, 'drag')}
              >
                <span className="widget-title">
                  {widgetConfig.icon} {currentViewMode === 'mobile' ? widgetConfig.name.split(' ')[0] : widgetConfig.name}
                </span>
                <div className="widget-controls">
                  <button 
                    className="widget-control-btn"
                    onClick={() => {
                      setWidgets(prev => prev.filter(w => w.id !== widget.id));
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="widget-content-area">
                <WidgetComponent />
              </div>
              {!isMobile() && (
                <div 
                  className="resize-handle"
                  onMouseDown={(e) => handleInteractionStart(e, widget.id, 'resize')}
                  onTouchStart={(e) => handleInteractionStart(e, widget.id, 'resize')}
                />
              )}
            </div>
          );
        })}
      </div>

      <WidgetLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onAddWidget={addWidget}
        existingWidgets={widgets}
      />
    </div>
  );
};

export default DashboardManager;