import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Pencil, 
  Square, 
  Circle, 
  Eraser, 
  Save, 
  Trash2, 
  Undo, 
  Redo,
  Plus,
  Edit3,
  Move,
  ZapOff,
  Home,
  DoorOpen,
  Minus,
  Square as BedIcon,
  ChefHat,
  Bath,
  Tv,
  Square as ChairIcon
} from 'lucide-react';
import AddDeviceDialog from './AddDeviceDialog';

const RoomDrawingEditor = ({ room, onSave, onDeviceAdd }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [devices, setDevices] = useState(room?.devices || []);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [selectedDevicePosition, setSelectedDevicePosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedDevice, setDraggedDevice] = useState(null);
  const [roomSketch, setRoomSketch] = useState(room?.sketch || null);
  const [shapes, setShapes] = useState(room?.shapes || []);
  const [selectedShape, setSelectedShape] = useState(null);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [draggedShape, setDraggedShape] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStartPos, setShapeStartPos] = useState(null);
  const [currentShapePreview, setCurrentShapePreview] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Set default tool based on edit mode
  useEffect(() => {
    if (!editMode) {
      setCurrentTool('device');
    } else {
      setCurrentTool('pencil');
    }
  }, [editMode]);

  // Shape definitions
  const shapeTypes = [
    { id: 'rectangle', name: 'Rectangle', icon: Home, color: '#3b82f6' },
    { id: 'square', name: 'Square', icon: Square, color: '#10b981' },
    { id: 'circle', name: 'Circle', icon: Circle, color: '#f59e0b' },
    { id: 'door', name: 'Door', icon: DoorOpen, color: '#8b5cf6' },
    { id: 'window', name: 'Window', icon: Minus, color: '#06b6d4' },
    { id: 'bed', name: 'Bed', icon: BedIcon, color: '#ec4899' },
    { id: 'sofa', name: 'Sofa', icon: Square, color: '#f97316' },
    { id: 'table', name: 'Table', icon: Square, color: '#84cc16' },
    { id: 'chair', name: 'Chair', icon: ChairIcon, color: '#6366f1' },
    { id: 'kitchen', name: 'Kitchen', icon: ChefHat, color: '#ef4444' },
    { id: 'bathroom', name: 'Bathroom', icon: Bath, color: '#14b8a6' },
    { id: 'tv', name: 'TV', icon: Tv, color: '#a855f7' }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = 1000;
    canvas.height = 600;
    
    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Load existing sketch if available
    if (roomSketch) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveToHistory();
      };
      img.src = roomSketch;
    } else {
      // Clear canvas with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, [roomSketch]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(dataURL);
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      
      setHistoryIndex(historyIndex - 1);
      img.src = canvasHistory[historyIndex - 1];
    }
  };

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      
      setHistoryIndex(historyIndex + 1);
      img.src = canvasHistory[historyIndex + 1];
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  // Shape drawing functions
  const drawShape = (ctx, shape) => {
    ctx.save();
    
    // Handle preview mode
    if (shape.preview) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // Semi-transparent blue
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dashed line for preview
    } else {
      ctx.fillStyle = shape.color || '#3b82f6';
      ctx.strokeStyle = shape.selected ? '#ef4444' : shape.color || '#3b82f6';
      ctx.lineWidth = shape.selected ? 3 : 2;
      ctx.setLineDash([]); // Solid line for final shapes
    }

    switch (shape.type) {
      case 'rectangle':
      case 'table':
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        break;
      
      case 'square':
        const size = Math.min(shape.width, shape.height);
        ctx.fillRect(shape.x, shape.y, size, size);
        ctx.strokeRect(shape.x, shape.y, size, size);
        break;
      
      case 'circle':
        const radius = Math.min(shape.width, shape.height) / 2;
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      
      case 'door':
        // Draw door frame
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        // Draw door swing arc
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.width, 0, Math.PI / 2);
        ctx.stroke();
        break;
      
      case 'window':
        // Draw window frame
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        // Draw window cross
        ctx.beginPath();
        ctx.moveTo(shape.x + shape.width / 2, shape.y);
        ctx.lineTo(shape.x + shape.width / 2, shape.y + shape.height);
        ctx.moveTo(shape.x, shape.y + shape.height / 2);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height / 2);
        ctx.stroke();
        break;
      
      case 'bed':
        // Draw bed frame
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        // Draw pillow
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(shape.x + 5, shape.y + 5, shape.width - 10, shape.height / 3);
        break;
      
      case 'sofa':
        // Draw sofa base
        ctx.fillRect(shape.x, shape.y + shape.height / 3, shape.width, shape.height * 2 / 3);
        ctx.strokeRect(shape.x, shape.y + shape.height / 3, shape.width, shape.height * 2 / 3);
        // Draw sofa back
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height / 3);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height / 3);
        break;
      
      case 'chair':
        // Draw chair seat
        ctx.fillRect(shape.x, shape.y + shape.height / 2, shape.width, shape.height / 2);
        ctx.strokeRect(shape.x, shape.y + shape.height / 2, shape.width, shape.height / 2);
        // Draw chair back
        ctx.fillRect(shape.x, shape.y, shape.width / 4, shape.height / 2);
        ctx.strokeRect(shape.x, shape.y, shape.width / 4, shape.height / 2);
        break;
      
      case 'kitchen':
        // Draw kitchen counter
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        // Draw sink
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(shape.x + shape.width * 0.7, shape.y + 10, shape.width * 0.25, shape.height - 20);
        break;
      
      case 'bathroom':
        // Draw bathroom fixture
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        // Draw toilet/sink indicator
        ctx.fillStyle = '#f3f4f6';
        ctx.beginPath();
        ctx.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, Math.min(shape.width, shape.height) / 4, 0, 2 * Math.PI);
        ctx.fill();
        break;
      
      case 'tv':
        // Draw TV
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        // Draw screen
        ctx.fillStyle = '#1f2937';
        ctx.fillRect(shape.x + 5, shape.y + 5, shape.width - 10, shape.height - 10);
        break;
    }

    // Draw shape label (only for non-preview shapes)
    if (!shape.preview) {
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(shape.name || shape.type, shape.x + shape.width / 2, shape.y + shape.height + 15);

      // Draw resize handles if selected
      if (shape.selected) {
        drawResizeHandles(ctx, shape);
      }
    }

    ctx.restore();
  };

  const drawResizeHandles = (ctx, shape) => {
    const handleSize = 8;
    ctx.fillStyle = '#ef4444';
    
    // Corner handles
    const handles = [
      { x: shape.x - handleSize / 2, y: shape.y - handleSize / 2 }, // top-left
      { x: shape.x + shape.width - handleSize / 2, y: shape.y - handleSize / 2 }, // top-right
      { x: shape.x - handleSize / 2, y: shape.y + shape.height - handleSize / 2 }, // bottom-left
      { x: shape.x + shape.width - handleSize / 2, y: shape.y + shape.height - handleSize / 2 }, // bottom-right
    ];
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
    });
  };

  const drawAllShapes = (ctx) => {
    shapes.forEach(shape => drawShape(ctx, shape));
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const getClickedShape = (pos) => {
    // Check shapes in reverse order (top to bottom)
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (pos.x >= shape.x && pos.x <= shape.x + shape.width &&
          pos.y >= shape.y && pos.y <= shape.y + shape.height) {
        return { shape, index: i };
      }
    }
    return null;
  };

  const getResizeHandle = (pos, shape) => {
    const handleSize = 8;
    const handles = [
      { name: 'top-left', x: shape.x - handleSize / 2, y: shape.y - handleSize / 2 },
      { name: 'top-right', x: shape.x + shape.width - handleSize / 2, y: shape.y - handleSize / 2 },
      { name: 'bottom-left', x: shape.x - handleSize / 2, y: shape.y + shape.height - handleSize / 2 },
      { name: 'bottom-right', x: shape.x + shape.width - handleSize / 2, y: shape.y + shape.height - handleSize / 2 },
    ];
    
    for (const handle of handles) {
      if (pos.x >= handle.x && pos.x <= handle.x + handleSize &&
          pos.y >= handle.y && pos.y <= handle.y + handleSize) {
        return handle.name;
      }
    }
    return null;
  };

  const startDrawing = (e) => {
    const pos = getMousePos(e);

    // Allow device adding in both edit and view mode
    if (currentTool === 'device') {
      setSelectedDevicePosition(pos);
      setDeviceDialogOpen(true);
      return;
    }

    // Only allow drawing/editing in edit mode
    if (!editMode) {
      return;
    }

    if (currentTool === 'move') {
      // Check for device interaction first
      const clickedDevice = devices.find(device => {
        const dx = pos.x - device.position.x;
        const dy = pos.y - device.position.y;
        return Math.sqrt(dx * dx + dy * dy) < 20;
      });
      
      if (clickedDevice) {
        setIsDragging(true);
        setDraggedDevice(clickedDevice);
        return;
      }

      // Check for shape interaction
      const clickedShapeData = getClickedShape(pos);
      if (clickedShapeData) {
        const { shape, index } = clickedShapeData;
        
        // Check if clicking on resize handle
        if (shape.selected) {
          const handle = getResizeHandle(pos, shape);
          if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
            setDraggedShape({ ...shape, index });
            return;
          }
        }
        
        // Select and start dragging shape
        setSelectedShape(index);
        setShapes(prev => prev.map((s, i) => ({ ...s, selected: i === index })));
        setIsDraggingShape(true);
        setDraggedShape({ ...shape, index, offsetX: pos.x - shape.x, offsetY: pos.y - shape.y });
        return;
      } else {
        // Deselect all shapes
        setSelectedShape(null);
        setShapes(prev => prev.map(s => ({ ...s, selected: false })));
      }
      return;
    }

    // Check if it's a shape tool for freehand drawing
    const shapeType = shapeTypes.find(s => s.id === currentTool);
    if (shapeType) {
      setIsDrawingShape(true);
      setShapeStartPos(pos);
      setCurrentShapePreview({
        type: currentTool,
        name: shapeType.name,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: shapeType.color
      });
      return;
    }

    // Handle freehand drawing (pencil and eraser)
    if (currentTool === 'pencil' || currentTool === 'eraser') {
      setIsDrawing(true);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      return;
    }
  };

  const draw = (e) => {
    const pos = getMousePos(e);

    if (isDragging && draggedDevice) {
      setDevices(prev => prev.map(device => 
        device.id === draggedDevice.id 
          ? { ...device, position: pos }
          : device
      ));
      return;
    }

    if (isDraggingShape && draggedShape) {
      const newX = pos.x - draggedShape.offsetX;
      const newY = pos.y - draggedShape.offsetY;
      
      setShapes(prev => prev.map((shape, index) => 
        index === draggedShape.index 
          ? { ...shape, x: Math.max(0, newX), y: Math.max(0, newY) }
          : shape
      ));
      return;
    }

    if (isResizing && draggedShape && resizeHandle) {
      const shape = shapes[draggedShape.index];
      let newWidth = shape.width;
      let newHeight = shape.height;
      let newX = shape.x;
      let newY = shape.y;

      switch (resizeHandle) {
        case 'top-left':
          newWidth = shape.width + (shape.x - pos.x);
          newHeight = shape.height + (shape.y - pos.y);
          newX = pos.x;
          newY = pos.y;
          break;
        case 'top-right':
          newWidth = pos.x - shape.x;
          newHeight = shape.height + (shape.y - pos.y);
          newY = pos.y;
          break;
        case 'bottom-left':
          newWidth = shape.width + (shape.x - pos.x);
          newHeight = pos.y - shape.y;
          newX = pos.x;
          break;
        case 'bottom-right':
          newWidth = pos.x - shape.x;
          newHeight = pos.y - shape.y;
          break;
      }

      // Ensure minimum size
      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);

      setShapes(prev => prev.map((s, index) => 
        index === draggedShape.index 
          ? { ...s, x: newX, y: newY, width: newWidth, height: newHeight }
          : s
      ));
      return;
    }

    // Handle shape drawing preview
    if (isDrawingShape && shapeStartPos && currentShapePreview) {
      const width = Math.abs(pos.x - shapeStartPos.x);
      const height = Math.abs(pos.y - shapeStartPos.y);
      const x = Math.min(pos.x, shapeStartPos.x);
      const y = Math.min(pos.y, shapeStartPos.y);

      setCurrentShapePreview(prev => ({
        ...prev,
        x,
        y,
        width: Math.max(width, 10),
        height: Math.max(height, 10)
      }));

      // Redraw canvas with preview
      drawShapePreview();
      return;
    }

    // Handle freehand drawing
    if (isDrawing && (currentTool === 'pencil' || currentTool === 'eraser')) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const drawShapePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentShapePreview) return;
    
    // Use requestAnimationFrame to prevent excessive redraws
    requestAnimationFrame(() => {
      const ctx = canvas.getContext('2d');
      
      // Clear canvas and redraw everything
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Redraw base sketch from history
      if (canvasHistory[historyIndex] && historyIndex >= 0) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          // Draw existing shapes
          drawAllShapes(ctx);
          // Draw devices
          drawDevices();
          // Draw preview shape
          drawShape(ctx, { ...currentShapePreview, preview: true });
        };
        img.src = canvasHistory[historyIndex];
      } else {
        // Draw existing shapes
        drawAllShapes(ctx);
        // Draw devices
        drawDevices();
        // Draw preview shape
        drawShape(ctx, { ...currentShapePreview, preview: true });
      }
    });
  };

  const stopDrawing = () => {
    if (isDragging) {
      setIsDragging(false);
      setDraggedDevice(null);
      return;
    }

    if (isDraggingShape) {
      setIsDraggingShape(false);
      setDraggedShape(null);
      saveToHistory();
      return;
    }

    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      setDraggedShape(null);
      saveToHistory();
      return;
    }

    // Handle completion of shape drawing
    if (isDrawingShape && currentShapePreview) {
      // Only add shape if it has meaningful size
      if (currentShapePreview.width > 10 && currentShapePreview.height > 10) {
        const finalShape = {
          id: Date.now(),
          type: currentShapePreview.type,
          name: currentShapePreview.name,
          x: currentShapePreview.x,
          y: currentShapePreview.y,
          width: currentShapePreview.width,
          height: currentShapePreview.height,
          color: currentShapePreview.color,
          selected: false
        };
        setShapes(prev => [...prev, finalShape]);
      }
      
      setIsDrawingShape(false);
      setShapeStartPos(null);
      setCurrentShapePreview(null);
      saveToHistory();
      return;
    }

    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const redrawCanvas = (() => {
    let isRedrawing = false;
    
    return () => {
      if (isRedrawing) return;
      isRedrawing = true;
      
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
          isRedrawing = false;
          return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw base sketch from history (freehand drawings)
        if (canvasHistory[historyIndex] && historyIndex >= 0) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            // Draw shapes and devices on top
            drawAllShapes(ctx);
            drawDevices();
            isRedrawing = false;
          };
          img.onerror = () => {
            // If image fails to load, just draw shapes and devices
            drawAllShapes(ctx);
            drawDevices();
            isRedrawing = false;
          };
          img.src = canvasHistory[historyIndex];
        } else {
          // No base sketch, just draw shapes and devices
          drawAllShapes(ctx);
          drawDevices();
          isRedrawing = false;
        }
      });
    };
  })();

  const deleteSelectedShape = () => {
    if (selectedShape !== null) {
      setShapes(prev => prev.filter((_, index) => index !== selectedShape));
      setSelectedShape(null);
      redrawCanvas();
      saveToHistory();
    }
  };

  const saveSketch = () => {
    const canvas = canvasRef.current;
    
    // Create a temporary canvas to render the complete scene
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Fill with white background
    tempCtx.fillStyle = '#ffffff';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the current canvas content (freehand drawings)
    tempCtx.drawImage(canvas, 0, 0);
    
    // Draw shapes on top
    drawAllShapes(tempCtx);
    
    // Draw devices on top
    devices.forEach(device => {
      const { x, y } = device.position;
      
      // Draw device icon
      tempCtx.save();
      tempCtx.fillStyle = '#3b82f6';
      tempCtx.beginPath();
      tempCtx.arc(x, y, 12, 0, 2 * Math.PI);
      tempCtx.fill();
      
      // Draw device label
      tempCtx.fillStyle = '#ffffff';
      tempCtx.font = '10px Arial';
      tempCtx.textAlign = 'center';
      tempCtx.fillText('📱', x, y + 3);
      
      // Draw device name below
      tempCtx.fillStyle = '#000000';
      tempCtx.font = '8px Arial';
      tempCtx.fillText(device.name || 'Device', x, y + 25);
      tempCtx.restore();
    });
    
    const dataURL = tempCanvas.toDataURL();
    setRoomSketch(dataURL);
    
    if (onSave) {
      onSave({
        sketch: dataURL,
        devices: devices,
        shapes: shapes
      });
    }
    
    // Exit edit mode after saving
    setEditMode(false);
    setCurrentTool('move');
  };

  const handleDeviceAdd = (deviceData) => {
    if (!selectedDevicePosition) {
      console.error('No device position selected');
      toast.error('Please select a position on the canvas first');
      return;
    }

    if (!deviceData || !deviceData.name) {
      console.error('Invalid device data - missing name');
      toast.error('Device name is required');
      return;
    }

    // Create device object for the canvas
    const newDevice = {
      id: deviceData.id || Date.now().toString(),
      name: deviceData.name,
      type: deviceData.type || deviceData.typeName || 'device',
      typeName: deviceData.typeName || deviceData.type,
      position: selectedDevicePosition,
      roomPosition: selectedDevicePosition,
      roomId: room?.id,
      status: deviceData.status || 'Online',
      isOnline: deviceData.isOnline !== undefined ? deviceData.isOnline : true,
      brand: deviceData.brand || '',
      model: deviceData.model || '',
      description: deviceData.description || '',
      location: deviceData.location || '',
      image: deviceData.image || null,
      createdAt: deviceData.createdAt || new Date().toISOString(),
      lastSeen: deviceData.lastSeen || new Date().toISOString()
    };
    
    setDevices(prev => [...prev, newDevice]);
    setDeviceDialogOpen(false);
    setSelectedDevicePosition(null);
    
    if (onDeviceAdd) {
      onDeviceAdd(newDevice);
    }
  };

  const removeDevice = (deviceId) => {
    setDevices(prev => prev.filter(device => device.id !== deviceId));
  };

  const drawDevices = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    devices.forEach(device => {
      const { x, y } = device.position;
      
      // Draw device icon
      ctx.save();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw device label
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📱', x, y + 3);
      
      // Draw device name below
      ctx.fillStyle = '#000000';
      ctx.font = '8px Arial';
      ctx.fillText(device.name || 'Device', x, y + 25);
      ctx.restore();
    });
  };

  // Redraw canvas when devices or shapes change (throttled)
  useEffect(() => {
    if (canvasRef.current) {
      const timeoutId = setTimeout(() => {
        redrawCanvas();
      }, 50); // Small delay to prevent excessive redraws
      
      return () => clearTimeout(timeoutId);
    }
  }, [devices, shapes, selectedShape]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShape !== null) {
          deleteSelectedShape();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShape]);

  const tools = [
    { id: 'pencil', icon: Pencil, label: 'Draw' },
    { id: 'eraser', icon: Eraser, label: 'Erase' },
    { id: 'move', icon: Move, label: 'Select/Move' },
    { id: 'device', icon: Plus, label: 'Add Device' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Room Layout {editMode ? 'Editor' : 'Playground'}</span>
            <div className="flex gap-2">
              {!editMode ? (
                <Button onClick={() => setEditMode(true)} size="sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Layout
                </Button>
              ) : (
                <>
                  <Button onClick={undo} disabled={historyIndex <= 0} size="sm" variant="outline">
                    <Undo className="w-4 h-4" />
                  </Button>
                  <Button onClick={redo} disabled={historyIndex >= canvasHistory.length - 1} size="sm" variant="outline">
                    <Redo className="w-4 h-4" />
                  </Button>
                  <Button onClick={clearCanvas} size="sm" variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button onClick={saveSketch} size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save & Exit
                  </Button>
                  <Button onClick={() => setEditMode(false)} size="sm" variant="outline">
                    <ZapOff className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Content - Side by Side Layout */}
      <div className="flex gap-4">
        {/* Left Panel - Tools */}
        <Card className="w-80 h-fit">
          <CardHeader>
            <CardTitle>{editMode ? 'Drawing Tools' : 'Device Tools'}</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            {editMode ? (
              <>
                {/* Drawing Tools */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Drawing Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {tools.filter(tool => tool.id !== 'device').map(tool => (
                      <Button
                        key={tool.id}
                        variant={currentTool === tool.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentTool(tool.id)}
                        className="flex items-center gap-2"
                      >
                        <tool.icon className="w-4 h-4" />
                        {tool.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Shape Tools */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Room Elements</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {shapeTypes.map(shape => (
                      <Button
                        key={shape.id}
                        variant={currentTool === shape.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentTool(shape.id)}
                        className="flex flex-col items-center gap-1 h-auto py-2"
                        style={{ 
                          backgroundColor: currentTool === shape.id ? shape.color : undefined,
                          borderColor: shape.color 
                        }}
                      >
                        <shape.icon className="w-4 h-4" />
                        <span className="text-xs">{shape.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* Device Tools for Playground Mode */
              <div>
                <h4 className="text-sm font-medium mb-2">Add Devices</h4>
                <Button
                  variant={currentTool === 'device' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentTool('device')}
                  className="flex items-center gap-2 w-full"
                >
                  <Plus className="w-4 h-4" />
                  Add Device
                </Button>
              </div>
            )}

            {/* Shape Actions */}
            {selectedShape !== null && (
              <div>
                <h4 className="text-sm font-medium mb-2">Shape Actions</h4>
                <Button
                  onClick={deleteSelectedShape}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}

            {/* Drawing Settings - Only in Edit Mode */}
            {editMode && (currentTool === 'pencil' || currentTool === 'eraser') && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Drawing Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Color:</label>
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-8 h-8 rounded border"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Width:</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={strokeWidth}
                      onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm w-8">{strokeWidth}px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="text-sm text-muted-foreground">
              <h4 className="font-medium text-foreground mb-1">Instructions:</h4>
              {!editMode && currentTool === 'device' && "Click on the canvas to add a device to your room"}
              {!editMode && currentTool !== 'device' && "Click 'Edit Layout' to modify the room layout or use 'Add Device' to place devices"}
              {editMode && currentTool === 'pencil' && "Click and drag to draw freehand lines"}
              {editMode && currentTool === 'eraser' && "Click and drag to erase"}
              {editMode && currentTool === 'move' && "Click to select shapes/devices, drag to move them, drag corners to resize"}
              {editMode && shapeTypes.find(s => s.id === currentTool) && `Click and drag to draw a ${shapeTypes.find(s => s.id === currentTool)?.name} shape`}
            </div>
          </div>
          </CardContent>
        </Card>

        {/* Right Panel - Canvas */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Canvas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="cursor-crosshair max-w-full h-auto"
                style={{
                  cursor: !editMode && currentTool !== 'device' ? 'default' :
                         currentTool === 'eraser' ? 'grab' : 
                         currentTool === 'move' ? 'move' : 
                         currentTool === 'device' ? 'pointer' :
                         shapeTypes.find(s => s.id === currentTool) ? 'copy' : 'crosshair'
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Card>
        <CardHeader>
          <CardTitle>Devices in Room ({devices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No devices added yet. Use the "Add Device" tool to place devices on your room layout.
            </p>
          ) : (
            <div className="space-y-2">
              {devices.map(device => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      📱
                    </div>
                    <div>
                      <p className="font-medium">{device.name}</p>
                      <p className="text-sm text-muted-foreground">{device.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(device.position.x)}, {Math.round(device.position.y)})
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeDevice(device.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Device Dialog */}
      <AddDeviceDialog
        open={deviceDialogOpen}
        onOpenChange={setDeviceDialogOpen}
        onAdd={handleDeviceAdd}
      />
    </div>
  );
};

export default RoomDrawingEditor;