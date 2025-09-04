import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import SystemHealthWidget from '../widgets/status/system-health/SystemHealthWidget.jsx';
import WhaleAlertsWidget from '../widgets/activity/whale-alerts/WhaleAlertsWidget.jsx';
import './DashboardManager.css';

const GRID_SIZE = 20;

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

// Helper function to check for overlap between two widgets
const checkCollision = (itemA, itemB) => {
  // itemA and itemB are objects with {x, y, width, height}
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

const DashboardManager = () => {
  // Initialize state by trying to load from localStorage first.
  const [widgets, setWidgets] = useState(() => {
    try {
      const savedLayout = localStorage.getItem('karrat-dashboard-layout');
      return savedLayout ? JSON.parse(savedLayout) : defaultLayout;
    } catch (error) {
      console.error("Could not load dashboard layout from localStorage:", error);
      return defaultLayout;
    }
  });

  const [dragState, setDragState] = useState(null);
  const [resizeState, setResizeState] = useState(null);
  const [isInvalidDrop, setIsInvalidDrop] = useState(false);
  const dashboardRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Save layout to localStorage whenever the widgets state changes.
  useEffect(() => {
    try {
      localStorage.setItem('karrat-dashboard-layout', JSON.stringify(widgets));
    } catch (error) {
      console.error("Could not save dashboard layout to localStorage:", error);
    }
  }, [widgets]);

  const widgetComponents = useMemo(() => ({
    SystemHealth: SystemHealthWidget,
    WhaleAlerts: WhaleAlertsWidget
  }), []);

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

  const handleMouseDown = useCallback((e, widgetId, action = 'drag') => {
    e.preventDefault();
    e.stopPropagation();
    
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    // Bring widget to front
    const maxZIndex = Math.max(0, ...widgets.map(w => w.zIndex || 0));
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, zIndex: maxZIndex + 1 } : w
    ));

    if (action === 'drag') {
      setDragState({
        widgetId,
        startX: e.clientX,
        startY: e.clientY,
        startPosition: { ...widget.position },
      });
    } else if (action === 'resize') {
      setResizeState({
        widgetId,
        startX: e.clientX,
        startY: e.clientY,
        startSize: { ...widget.size },
        startPosition: { ...widget.position }
      });
    }
  }, [widgets]);

  const handleMouseMove = useCallback((e) => {
    let isColliding = false;

    if (dragState) {
      const mouseMoveDeltaX = e.clientX - dragState.startX;
      const mouseMoveDeltaY = e.clientY - dragState.startY;
      const rawX = dragState.startPosition.x + mouseMoveDeltaX;
      const rawY = dragState.startPosition.y + mouseMoveDeltaY;
      const snappedX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;

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
      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;
      const rawWidth = resizeState.startSize.width + deltaX;
      const rawHeight = resizeState.startSize.height + deltaY;
      
      const minWidth = GRID_SIZE * 10;
      const minHeight = GRID_SIZE * 8;
      const snappedWidth = Math.max(minWidth, Math.round(rawWidth / GRID_SIZE) * GRID_SIZE);
      const snappedHeight = Math.max(minHeight, Math.round(rawHeight / GRID_SIZE) * GRID_SIZE);

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
  }, [dragState, resizeState, widgets, updatePosition, updateSize]);

  const handleMouseUp = useCallback(() => {
    if (isInvalidDrop) {
      if (dragState) {
        // Revert to original position
        setWidgets(prev => prev.map(w =>
          w.id === dragState.widgetId
            ? { ...w, position: dragState.startPosition }
            : w
        ));
      }
      if (resizeState) {
        // Revert to original size
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

  useEffect(() => {
    if (dragState || resizeState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dragState, resizeState, handleMouseMove, handleMouseUp]);

  const resetLayout = useCallback(() => {
    setWidgets(defaultLayout);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-toolbar">
        <h2>KARRAT Dashboard</h2>
        <div className="dashboard-controls">
          <button onClick={resetLayout} className="dashboard-btn secondary">
            Reset Layout
          </button>
        </div>
      </div>

      <div 
        ref={dashboardRef}
        className="dashboard-grid"
      >
        {widgets.map(widget => {
          const WidgetComponent = widgetComponents[widget.type];
          if (!WidgetComponent) return null;
          
          const isDragging = dragState?.widgetId === widget.id;
          const isResizing = resizeState?.widgetId === widget.id;
          const isInvalid = (isDragging || isResizing) && isInvalidDrop;

          return (
            <div
              key={widget.id}
              data-widget-id={widget.id}
              className={`dashboard-widget ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''} ${isInvalid ? 'is-invalid' : ''}`}
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
                onMouseDown={(e) => handleMouseDown(e, widget.id, 'drag')}
              >
                <span className="widget-title">{widget.type}</span>
                <div className="widget-controls">
                  <button 
                    className="widget-control-btn"
                    onClick={() => {
                      setWidgets(prev => prev.filter(w => w.id !== widget.id));
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="widget-content-area">
                <WidgetComponent />
              </div>
              <div 
                className="resize-handle"
                onMouseDown={(e) => handleMouseDown(e, widget.id, 'resize')}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardManager;