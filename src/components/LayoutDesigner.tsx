/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Type, 
  SquarePlay, 
  Image, 
  TextCursorInput, 
  Loader2, 
  ToggleLeft, 
  Sliders, 
  CreditCard, 
  Minus, 
  AlignVerticalJustifyStart, 
  AlignHorizontalJustifyStart, 
  LayoutGrid, 
  LayoutDashboard, 
  Layers, 
  Scroll,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Monitor,
  Smartphone,
  RotateCw,
  Sun,
  Moon,
  Maximize2
} from 'lucide-react';
import { VisualElement, PALETTE_ITEMS, PaletteItem } from '../utils/androidXmlTemplates';

interface LayoutDesignerProps {
  layoutTree: VisualElement;
  setLayoutTree: (tree: VisualElement) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  deviceTheme: 'light' | 'dark';
  setDeviceTheme: (theme: 'light' | 'dark') => void;
  deviceOrientation: 'portrait' | 'landscape';
  setDeviceOrientation: (orientation: 'portrait' | 'landscape') => void;
}

export default function LayoutDesigner({
  layoutTree,
  setLayoutTree,
  selectedId,
  setSelectedId,
  deviceTheme,
  setDeviceTheme,
  deviceOrientation,
  setDeviceOrientation,
}: LayoutDesignerProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | 'Layouts' | 'Widgets' | 'Containers'>('All');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    root: true,
  });

  // Dynamic state for dragged palette elements
  const [draggedItem, setDraggedItem] = useState<PaletteItem | null>(null);

  // Category filter
  const filteredPaletteItems = PALETTE_ITEMS.filter(
    (item) => activeCategory === 'All' || item.category === activeCategory
  );

  // Icon mapping helper
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Type': return <Type className="w-4 h-4" />;
      case 'SquarePlay': return <SquarePlay className="w-4 h-4 text-emerald-400" />;
      case 'Image': return <Image className="w-4 h-4 text-sky-400" />;
      case 'TextCursorInput': return <TextCursorInput className="w-4 h-4 text-amber-400" />;
      case 'Loader2': return <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />;
      case 'ToggleLeft': return <ToggleLeft className="w-4 h-4 text-rose-400" />;
      case 'Sliders': return <Sliders className="w-4 h-4 text-violet-400" />;
      case 'CreditCard': return <CreditCard className="w-4 h-4 text-orange-400" />;
      case 'Minus': return <Minus className="w-4 h-4 text-slate-400" />;
      case 'AlignVerticalJustifyStart': return <AlignVerticalJustifyStart className="w-4 h-4 text-indigo-500" />;
      case 'AlignHorizontalJustifyStart': return <AlignHorizontalJustifyStart className="w-4 h-4 text-purple-500" />;
      case 'LayoutGrid': return <LayoutGrid className="w-4 h-4 text-blue-500" />;
      case 'LayoutDashboard': return <LayoutDashboard className="w-4 h-4 text-[#3DDC84]" />;
      case 'Layers': return <Layers className="w-4 h-4 text-slate-400" />;
      case 'Scroll': return <Scroll className="w-4 h-4 text-teal-500" />;
      default: return <Plus className="w-4 h-4" />;
    }
  };

  // Traversal helper: find a node by ID and call action callback
  const findAndModifyNode = (
    node: VisualElement,
    id: string,
    action: (node: VisualElement, parent: VisualElement | null) => void,
    parent: VisualElement | null = null
  ): boolean => {
    if (node.id === id) {
      action(node, parent);
      return true;
    }
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const found = findAndModifyNode(node.children[i], id, action, node);
        if (found) return true;
      }
    }
    return false;
  };

  // Add item from Palette to Selected Node (if container) or to Root
  const handleAddElementFromPalette = (item: PaletteItem) => {
    // Generate unique ID based on element type
    const randSuffix = Math.floor(Math.random() * 1000);
    const elementId = `${item.type.toLowerCase()}_${randSuffix}`;
    const androidId = `@+id/${item.type.toLowerCase()}${randSuffix}`;

    const newElement: VisualElement = {
      id: elementId,
      type: item.type,
      attributes: {
        ...item.defaultAttributes,
        'android:id': androidId,
      },
    };

    const treeCopy = { ...layoutTree };

    const action = (targetNode: VisualElement) => {
      // Check if node is a container
      const containerTypes = ['LinearLayout', 'RelativeLayout', 'ConstraintLayout', 'FrameLayout', 'ScrollView', 'CardView'];
      if (containerTypes.includes(targetNode.type)) {
        if (!targetNode.children) targetNode.children = [];
        targetNode.children.push(newElement);
        setSelectedId(elementId);
      } else {
        // Find parent and insert neighboring
        alert(`Cannot add element nested inside ${targetNode.type}. Select a layout first!`);
      }
    };

    if (selectedId) {
      findAndModifyNode(treeCopy, selectedId, action);
    } else {
      // Append to outer root node
      if (!treeCopy.children) treeCopy.children = [];
      treeCopy.children.push(newElement);
      setSelectedId(elementId);
    }

    setLayoutTree(treeCopy);
    // Expand added node directory listing
    setExpandedNodes(prev => ({ ...prev, [selectedId || 'root']: true }));
  };

  // Drag operations
  const handleDragStart = (e: React.DragEvent, item: PaletteItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.type);
  };

  const handleDragOver = (e: React.DragEvent, targetNodeId: string) => {
    e.preventDefault();
  };

  const handleDropOnNode = (e: React.DragEvent, targetNodeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem) return;

    const randSuffix = Math.floor(Math.random() * 1000);
    const elementId = `${draggedItem.type.toLowerCase()}_${randSuffix}`;
    const androidId = `@+id/${draggedItem.type.toLowerCase()}${randSuffix}`;

    const newElement: VisualElement = {
      id: elementId,
      type: draggedItem.type,
      attributes: {
        ...draggedItem.defaultAttributes,
        'android:id': androidId,
      },
    };

    const treeCopy = { ...layoutTree };

    const action = (targetNode: VisualElement) => {
      const containerTypes = ['LinearLayout', 'RelativeLayout', 'ConstraintLayout', 'FrameLayout', 'ScrollView', 'CardView'];
      if (containerTypes.includes(targetNode.type)) {
        if (!targetNode.children) targetNode.children = [];
        targetNode.children.push(newElement);
        setSelectedId(elementId);
      } else {
        // Appending to parent of targetNode
        alert(`Selected target node "${targetNode.type}" is a widget. Drop on layouts instead!`);
      }
    };

    findAndModifyNode(treeCopy, targetNodeId, action);
    setLayoutTree(treeCopy);
    setDraggedItem(null);
  };

  // Delete matching element
  const handleDeleteElement = (id: string) => {
    if (id === layoutTree.id) {
      alert("Cannot delete the root layout container!");
      return;
    }

    const treeCopy = { ...layoutTree };
    
    const action = (targetNode: VisualElement, parent: VisualElement | null) => {
      if (parent && parent.children) {
        parent.children = parent.children.filter((item) => item.id !== id);
        setSelectedId(null);
      }
    };

    findAndModifyNode(treeCopy, id, action);
    setLayoutTree(treeCopy);
  };

  // Update selected node attributes
  const handleUpdateAttribute = (key: string, value: string) => {
    if (!selectedId) return;

    const treeCopy = { ...layoutTree };

    const action = (targetNode: VisualElement) => {
      if (value === '' || value === undefined) {
        delete targetNode.attributes[key];
      } else {
        targetNode.attributes[key] = value;
      }
    };

    findAndModifyNode(treeCopy, selectedId, action);
    setLayoutTree(treeCopy);
  };

  // Selected Element Lookup
  let activeElement: VisualElement | null = null;
  const findSelectedElement = (node: VisualElement): VisualElement | null => {
    if (node.id === selectedId) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findSelectedElement(child);
        if (found) return found;
      }
    }
    return null;
  };
  if (selectedId) {
    activeElement = findSelectedElement(layoutTree);
  }

  // --- XML Drag Rendering on Tablet/Phone canvas ---
  const renderCanvasElement = (node: VisualElement): React.ReactNode => {
    const isSelected = selectedId === node.id;
    const isContainer = ['LinearLayout', 'RelativeLayout', 'ConstraintLayout', 'FrameLayout', 'ScrollView', 'CardView'].includes(node.type);

    // Collect base layout params
    const width = node.attributes['android:layout_width'] || 'wrap_content';
    const height = node.attributes['android:layout_height'] || 'wrap_content';
    const orientation = node.attributes['android:orientation'] || 'vertical';
    const padding = node.attributes['android:padding'] || '';
    const background = node.attributes['android:background'] || '';
    const textStyle = node.attributes['android:textStyle'] || '';
    
    // Convert dp margins & padding to Tailwind roughly
    const parseDpToRem = (value: string) => {
      if (!value) return '';
      const numbers = parseInt(value, 10);
      if (isNaN(numbers)) return '';
      if (numbers < 4) return '0.125';
      if (numbers < 8) return '0.25';
      if (numbers < 12) return '0.5';
      if (numbers < 16) return '0.75';
      if (numbers < 24) return '1';
      if (numbers < 36) return '1.5';
      return '2';
    };

    const padRem = parseDpToRem(padding);
    const padClass = padRem ? `p-[${padRem}rem]` : '';

    const marginValue = node.attributes['android:layout_margin'] || '';
    const margRem = parseDpToRem(marginValue);
    const margClass = margRem ? `m-[${margRem}rem]` : '';

    // Handle background coloring
    let bgStyle: React.CSSProperties = {};
    if (background.startsWith('#')) {
      bgStyle.backgroundColor = background;
    }

    const selectClass = isSelected 
      ? 'outline-2 outline-[#3DDC84] outline-offset-1 relative shadow-lg' 
      : 'hover:outline hover:outline-dashed hover:outline-blue-400 hover:outline-offset-1';

    // Click handler for editing selected node
    const handleElementClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedId(node.id);
    };

    const wrapClasses = `transition-all duration-150 ${selectClass} ${padClass} ${margClass}`;

    // Elements Renderer logic
    switch (node.type) {
      case 'ConstraintLayout': {
        const bgVal = background || (deviceTheme === 'dark' ? '#0F172A' : '#F8F9FA');
        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            onDragOver={(e) => handleDragOver(e, node.id)}
            onDrop={(e) => handleDropOnNode(e, node.id)}
            style={{ backgroundColor: bgVal, ...bgStyle }}
            className={`w-full min-h-64 h-full relative p-4 flex flex-col space-y-4 ${wrapClasses}`}
          >
            {isSelected && (
              <span className="absolute top-0 left-0 bg-[#3DDC84] text-[#0F172A] text-[10px] font-bold px-1 py-0.2 rounded-br shadow z-10">
                ConstraintLayout
              </span>
            )}
            {node.children && node.children.length > 0 ? (
              node.children.map((child) => (
                <React.Fragment key={child.id}>
                  {renderCanvasElement(child)}
                </React.Fragment>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded p-6 text-xs text-slate-500 bg-slate-800/10 select-none">
                <LayoutDashboard className="w-8 h-8 text-slate-500 mb-2" />
                <p>ConstraintLayout Empty Canvas</p>
                <p className="text-[10px] text-slate-400 mt-1">Drop widgets or layouts here</p>
              </div>
            )}
          </div>
        );
      }

      case 'LinearLayout': {
        const isVertical = orientation !== 'horizontal';
        const bgVal = background || '';
        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            onDragOver={(e) => handleDragOver(e, node.id)}
            onDrop={(e) => handleDropOnNode(e, node.id)}
            style={{ backgroundColor: bgVal || undefined, ...bgStyle }}
            className={`flex ${isVertical ? 'flex-col space-y-3' : 'flex-row items-center space-x-3'} ${width === 'match_parent' ? 'w-full' : 'w-auto'} ${height === 'match_parent' ? 'h-full flex-grow' : 'h-auto'} border border-slate-700/40 rounded p-3 bg-slate-50/5 min-h-[60px] ${wrapClasses}`}
          >
            {isSelected && (
              <span className="absolute top-0 right-0 bg-[#3DDC84] text-[#0F172A] text-[9px] font-semibold px-1.5 py-0.5 rounded-bl shadow">
                Linear ({orientation})
              </span>
            )}
            {node.children && node.children.length > 0 ? (
              node.children.map((child) => (
                <React.Fragment key={child.id}>
                  {renderCanvasElement(child)}
                </React.Fragment>
              ))
            ) : (
              <div className="flex-1 py-4 text-center text-[11px] text-slate-500 border border-dashed border-slate-700 rounded bg-slate-900/10">
                Empty LinearLayout
              </div>
            )}
          </div>
        );
      }

      case 'RelativeLayout': {
        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            onDragOver={(e) => handleDragOver(e, node.id)}
            onDrop={(e) => handleDropOnNode(e, node.id)}
            style={bgStyle}
            className={`w-full min-h-[100px] border border-slate-600/30 rounded p-3 relative bg-slate-400/5 ${wrapClasses}`}
          >
            {isSelected && (
              <span className="absolute top-0 left-0 bg-[#3DDC84] text-[#0F172A] text-[9px] font-semibold px-1 rounded-br">
                RelativeLayout
              </span>
            )}
            <div className="flex flex-col space-y-2">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <React.Fragment key={child.id}>
                    {renderCanvasElement(child)}
                  </React.Fragment>
                ))
              ) : (
                <p className="text-center text-xs text-slate-500 py-6">Empty RelativeLayout</p>
              )}
            </div>
          </div>
        );
      }

      case 'FrameLayout': {
        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            onDragOver={(e) => handleDragOver(e, node.id)}
            onDrop={(e) => handleDropOnNode(e, node.id)}
            style={bgStyle}
            className={`w-full min-h-[90px] border border-slate-600/30 rounded p-4 relative ${wrapClasses}`}
          >
            {isSelected && (
              <span className="absolute bottom-0 right-0 bg-[#3DDC84] text-[#0F172A] text-[9px] font-semibold px-1">
                FrameLayout (Stacked)
              </span>
            )}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <React.Fragment key={child.id}>
                    {renderCanvasElement(child)}
                  </React.Fragment>
                ))
              ) : (
                <p className="text-xs text-slate-500">Empty FrameLayout</p>
              )}
            </div>
          </div>
        );
      }

      case 'ScrollView': {
        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            onDragOver={(e) => handleDragOver(e, node.id)}
            onDrop={(e) => handleDropOnNode(e, node.id)}
            style={bgStyle}
            className={`w-full overflow-y-auto max-h-[360px] h-full border border-sky-950 rounded py-2 ${wrapClasses}`}
          >
            {isSelected && (
              <span className="absolute top-0 right-0 bg-sky-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-bl shadow">
                ScrollView
              </span>
            )}
            <div className="p-1 space-y-2">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <React.Fragment key={child.id}>
                    {renderCanvasElement(child)}
                  </React.Fragment>
                ))
              ) : (
                <p className="text-center text-xs text-slate-500 py-10">Empty ScrollView Container</p>
              )}
            </div>
          </div>
        );
      }

      case 'CardView': {
        const radiusVal = node.attributes['app:cardCornerRadius'] || '8dp';
        const elevationVal = node.attributes['app:cardElevation'] || '4dp';
        const cardBg = node.attributes['app:cardBackgroundColor'] || (deviceTheme === 'dark' ? '#1E293B' : '#FFFFFF');
        
        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            onDragOver={(e) => handleDragOver(e, node.id)}
            onDrop={(e) => handleDropOnNode(e, node.id)}
            style={{ 
              backgroundColor: cardBg, 
              borderRadius: radiusVal.includes('dp') ? `${parseInt(radiusVal, 10)}px` : '8px', 
              boxShadow: elevationVal.includes('dp') ? `0 ${parseInt(elevationVal, 10)/2}px ${parseInt(elevationVal, 10)}px rgba(0,0,0,0.15)` : 'none',
              ...bgStyle
            }}
            className={`w-full p-4 border border-slate-700/20 select-none ${wrapClasses}`}
          >
            {isSelected && (
              <span className="text-[9px] font-bold text-slate-400 block mb-1">CardView ID: {node.id}</span>
            )}
            <div className="flex flex-col space-y-2">
              {node.children && node.children.length > 0 ? (
                node.children.map((child) => (
                  <React.Fragment key={child.id}>
                    {renderCanvasElement(child)}
                  </React.Fragment>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-800 rounded bg-slate-900/10">CardView Body</div>
              )}
            </div>
          </div>
        );
      }

      case 'View': {
        const heightVal = node.attributes['android:layout_height'] || '1dp';
        const bgColor = background || '#e2e8f0';
        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            style={{ 
              height: heightVal.includes('dp') ? `${parseInt(heightVal, 10)}px` : '1px',
              backgroundColor: bgColor
            }}
            className={`w-full ${wrapClasses}`}
          />
        );
      }

      case 'TextView': {
        const textValue = node.attributes['android:text'] || 'TextView Placeholder';
        const rawSize = node.attributes['android:textSize'] || '14sp';
        const sizeVal = parseInt(rawSize, 10) || 14;
        const colorVal = node.attributes['android:textColor'] || (deviceTheme === 'dark' ? '#FFFFFF' : '#1C1B1F');

        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            style={{ 
              color: colorVal, 
              fontSize: `${sizeVal}px`,
              fontWeight: textStyle === 'bold' ? 'bold' : 'normal',
            }}
            className={`truncate px-2 py-1 ${width === 'match_parent' ? 'w-full' : 'w-auto'} ${wrapClasses}`}
          >
            {textValue}
          </div>
        );
      }

      case 'Button': {
        const textValue = node.attributes['android:text'] || 'Submit';
        const bgVal = background || '#3DDC84';
        const textColors = node.attributes['android:textColor'] || '#ffffff';

        return (
          <button
            type="button"
            id={`node_${node.id}`}
            onClick={handleElementClick}
            style={{ backgroundColor: bgVal, color: textColors }}
            className={`px-4 py-2 text-center text-sm font-bold uppercase rounded tracking-wider shadow cursor-pointer transition active:scale-[0.98] ${width === 'match_parent' ? 'w-full' : 'w-auto'} ${wrapClasses}`}
          >
            {textValue}
          </button>
        );
      }

      case 'ImageView': {
        const srcVal = node.attributes['android:src'] || 'android_robot';
        const wVal = node.attributes['android:layout_width'] || '80dp';
        const hVal = node.attributes['android:layout_height'] || '80dp';

        // Render mock assets
        const getAssetSvg = (src: string) => {
          if (src === 'android_robot') {
            return (
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#3DDC84] fill-current">
                <path d="M50 20c-13.8 0-25 11.2-25 25v10h50V45c0-13.8-11.2-25-25-25zm-8 15a4 4 0 110-8 4 4 0 010 8zm16 0a4 4 0 110-8 4 4 0 010 8z" />
                <rect x="23" y="58" width="54" height="28" rx="6" />
                <rect x="14" y="58" width="6" height="20" rx="3" />
                <rect x="80" y="58" width="6" height="20" rx="3" />
                <rect x="35" y="86" width="10" height="12" rx="4" />
                <rect x="55" y="86" width="10" height="12" rx="4" />
                <line x1="30" y1="12" x2="38" y2="24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                <line x1="70" y1="12" x2="62" y2="24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            );
          } else if (src.includes('avatar_unlocked')) {
            return (
              <div className="w-full h-full rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-1/2 h-1/2 text-indigo-400">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                </svg>
              </div>
            );
          } else if (src.includes('avatar_profile')) {
            return (
              <div className="w-full h-full rounded-full bg-sky-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                AD
              </div>
            );
          } else if (src.includes('cpu')) {
            return (
              <div className="w-full h-full rounded bg-emerald-500/10 border border-emerald-400 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-2/3 h-2/3 text-emerald-400">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <rect x="9" y="9" width="6" height="6" />
                  <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
                </svg>
              </div>
            );
          } else {
            return (
              <div className="w-full h-full border-2 border-slate-700 bg-slate-800 rounded flex flex-col items-center justify-center">
                <Image className="w-1/2 h-1/2 text-slate-500" />
                <span className="text-[9px] text-slate-400 mt-1 truncate max-w-full px-1">{src}</span>
              </div>
            );
          }
        };

        const widthPx = wVal.includes('dp') ? `${parseInt(wVal, 10)}px` : '64px';
        const heightPx = hVal.includes('dp') ? `${parseInt(hVal, 10)}px` : '64px';

        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            style={{ width: widthPx, height: heightPx }}
            className={`mx-auto ${wrapClasses}`}
          >
            {getAssetSvg(srcVal)}
          </div>
        );
      }

      case 'EditText': {
        const hint = node.attributes['android:hint'] || 'Enter characters...';
        const isPassword = node.attributes['android:inputType'] === 'textPassword';
        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            className={`w-full flex flex-col cursor-text ${wrapClasses}`}
          >
            <input
              disabled
              type={isPassword ? 'password' : 'text'}
              placeholder={hint}
              className="w-full px-3 py-2 bg-slate-950/20 border border-slate-700 rounded text-sm text-slate-200 placeholder-slate-500"
            />
          </div>
        );
      }

      case 'ProgressBar': {
        const isSpinned = !node.attributes['android:progress'];
        const progressVal = parseInt(node.attributes['android:progress'] || '0', 10);
        const maxVal = parseInt(node.attributes['android:max'] || '100', 10);
        const percentage = Math.round((progressVal / maxVal) * 100);

        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            className={`w-full py-2 flex justify-center ${wrapClasses}`}
          >
            {isSpinned ? (
              <Loader2 className="w-8 h-8 text-[#3DDC84] animate-spin" />
            ) : (
              <div className="w-full bg-slate-800 rounded-full h-3.5 mt-1 overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="bg-[#3DDC84] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}
          </div>
        );
      }

      case 'Switch': {
        const textVal = node.attributes['android:text'] || 'Switch option';
        const isChecked = node.attributes['android:checked'] === 'true';

        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            className={`w-full flex items-center justify-between p-2 rounded hover:bg-slate-700/10 ${wrapClasses}`}
          >
            <span className="text-sm font-medium text-slate-200">{textVal}</span>
            <div className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${isChecked ? 'bg-[#3DDC84]' : 'bg-slate-700'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${isChecked ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>
        );
      }

      case 'Slider': {
        const progressVal = parseInt(node.attributes['android:progress'] || '50', 10);
        return (
          <div
            id={`node_${node.id}`}
            onClick={handleElementClick}
            className={`w-full py-2 flex flex-col justify-center ${wrapClasses}`}
          >
            <input
              disabled
              type="range"
              min="0"
              max="100"
              value={progressVal}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#3DDC84]"
            />
          </div>
        );
      }

      default:
        return (
          <div 
            onClick={handleElementClick}
            className={`p-2 border border-rose-500/20 text-rose-500 rounded text-xs text-center ${wrapClasses}`}
          >
            Unknown node type: {node.type}
          </div>
        );
    }
  };

  // --- Recursive Component Tree renderer ---
  const renderTreeItem = (node: VisualElement, depth = 0): React.ReactNode => {
    const isExpanded = expandedNodes[node.id] || false;
    const hasChildren = node.children && node.children.length > 0;
    const isSelected = selectedId === node.id;

    const toggleNodeExpand = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setExpandedNodes((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    };

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => setSelectedId(node.id)}
          className={`flex items-center py-1 px-2 text-xs font-semibold cursor-pointer rounded transition-all ${
            isSelected 
              ? 'bg-[#3DDC84]/20 text-[#3DDC84] font-bold border-l-2 border-[#3DDC84]' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
          }`}
          style={{ paddingLeft: `${Math.max(8, depth * 12)}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => toggleNodeExpand(e, node.id)}
              className="mr-1 p-0.5 text-slate-500 hover:text-slate-200"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <span className="truncate max-w-[124px]" title={`${node.type} id: ${node.id}`}>
            {node.type} <span className="text-[10px] text-slate-500">#{node.id}</span>
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteElement(node.id);
            }}
            className="ml-auto opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 text-slate-500"
            title="Delete Layout Element"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="border-l border-slate-800/60 ml-2.5">
            {node.children!.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-hidden h-full flex bg-[#1E1E24]">
      {/* 1. PALETTE (Far Left sidebar of Designer) */}
      <div className="w-60 bg-[#141519] border-r border-[#2B2D30] flex flex-col">
        <div className="p-3 border-b border-[#2D3035] bg-[#1A1C20] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Palette Controls</span>
          <span className="text-[9px] text-[#3DDC84] font-medium uppercase">XML Blocks</span>
        </div>

        {/* Filter Categories */}
        <div className="p-1 px-2 border-b border-[#23252a] grid grid-cols-4 gap-0.5 bg-[#17181c]">
          {(['All', 'Layouts', 'Widgets', 'Containers'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] py-1 px-0.5 rounded text-center truncate ${
                activeCategory === cat 
                  ? 'bg-slate-800 text-[#3DDC84] font-bold' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Palette Draggable list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 select-none">
            Drag to smartphone or click the (+) to add inside selection target
          </p>

          <div className="grid grid-cols-1 gap-1.5">
            {filteredPaletteItems.map((item) => (
              <div
                key={item.type + item.name}
                id={`palette_item_${item.type.toLowerCase()}`}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                className="group p-2 rounded bg-[#1C1D22] border border-slate-700/50 hover:border-slate-500 text-slate-300 transition hover:bg-[#23252C] cursor-grab active:cursor-grabbing flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded bg-slate-800 text-slate-400 group-hover:text-slate-200">
                    {getIconComponent(item.icon)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-200">{item.type}</p>
                    <p className="text-[9px] text-slate-500">{item.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  id={`btn_add_palette_${item.type.toLowerCase()}`}
                  onClick={() => handleAddElementFromPalette(item)}
                  className="p-1 rounded bg-[#3DDC84]/12 text-[#3DDC84] opacity-0 group-hover:opacity-100 transition hover:bg-[#3DDC84]/20"
                  title={`Add to layout`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Component Tree panel placed inside left nav for space optimization */}
        <div className="h-60 bg-[#121316] border-t border-[#2D3035] flex flex-col">
          <div className="px-3 py-2 bg-[#17181c] border-b border-[#2B2D30] flex items-center justify-between select-none">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Component Tree Layout</span>
            <span className="text-[9px] text-slate-600">Nesting Matrix</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 group scrollbar-thin">
            {renderTreeItem(layoutTree)}
          </div>
        </div>
      </div>

      {/* 2. LIVE INTERACTIVE CANVAS (MIDDLE) */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0F0F12]">
        {/* Device Controls Header toolbar */}
        <div className="p-2 border-b border-[#2D3035] bg-[#1E2024] flex items-center justify-between shadow select-none">
          <div className="flex items-center space-x-3 text-xs">
            {/* Device selection */}
            <div className="flex items-center space-x-1.5 bg-[#2B2D30] text-slate-300 px-2.5 py-1 rounded border border-slate-700">
              <Smartphone className="w-3.5 h-3.5 text-[#3DDC84]" />
              <span className="font-semibold text-[11px]">Pixel 8 Pro emulator</span>
            </div>

            {/* API Level */}
            <span className="text-[10px] text-slate-500">API 34 (Android 14)</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Theme switcher */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-0.5 flex space-x-0.5">
              <button
                type="button"
                id="btn_canvas_theme_light"
                onClick={() => setDeviceTheme('light')}
                className={`p-1 rounded-md transition ${deviceTheme === 'light' ? 'bg-[#3DDC84] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                title="Material Light Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="btn_canvas_theme_dark"
                onClick={() => setDeviceTheme('dark')}
                className={`p-1 rounded-md transition ${deviceTheme === 'dark' ? 'bg-[#3DDC84] text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                title="Material Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Orientation */}
            <button
              type="button"
              id="btn_canvas_rotate"
              onClick={() => setDeviceOrientation(deviceOrientation === 'portrait' ? 'landscape' : 'portrait')}
              className="p-1 px-2.5 bg-[#2B2D30] border border-slate-700 text-slate-300 hover:text-white rounded cursor-pointer transition flex items-center space-x-1.5"
              title="Rotate Screen"
            >
              <RotateCw className="w-3.2 h-3.2 text-[#3DDC84]" />
              <span className="text-[10px] font-semibold tracking-wider uppercase">Rotate</span>
            </button>
          </div>
        </div>

        {/* Live device Canvas scroll viewport */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
          {/* Virtual Bezel Screen Frame */}
          <div
            id="virtual_phone_frame"
            className={`border-[10px] border-slate-950 rounded-[35px] shadow-2xl relative bg-[#090D16] transition-all duration-300 flex flex-col overflow-hidden max-w-full ${
              deviceOrientation === 'portrait' ? 'w-[320px] h-[580px]' : 'w-[580px] h-[320px]'
            }`}
          >
            {/* Notch Camera hole spacer */}
            <div className="h-6 w-full bg-slate-950 flex justify-center items-center relative select-none z-20">
              <div className="w-24 h-4 rounded-full bg-black flex items-center justify-between px-4 text-[9px] text-slate-400 font-mono">
                <span>12:00</span>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <div className="flex items-center space-x-1">
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>
            </div>

            {/* Virtual Canvas Render Container */}
            <div className="flex-1 overflow-y-auto scrollbar-thin relative flex flex-col bg-slate-950">
              {renderCanvasElement(layoutTree)}
            </div>

            {/* Android Navigation bar simulated footer */}
            <div className="h-7 w-full bg-slate-950 flex items-center justify-center space-x-16 select-none z-20 border-t border-slate-900/30">
              {/* Back Arrow */}
              <div className="w-3.5 h-3.5 border-l-2 border-b-2 border-slate-400 transform rotate-45 rounded-sm hover:border-white transition-colors" />
              {/* Home Indicator */}
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 hover:border-white transition-colors" />
              {/* Task switcher Recents */}
              <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded-sm hover:border-white transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROPERTY INSPECTOR ATTRIBUTES PANEL (FAR RIGHT) */}
      <div className="w-72 bg-[#141519] border-l border-[#2B2D30] overflow-y-auto flex flex-col scrollbar-thin">
        <div className="p-3 border-b border-[#2D3035] bg-[#1A1C20] flex items-center justify-between select-none">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Attributes Inspector</span>
          <span className="text-[10px] text-[#3DDC84] font-medium uppercase font-mono">Properties</span>
        </div>

        {activeElement ? (
          <div className="p-4 space-y-4">
            {/* Header info */}
            <div className="p-2.5 rounded bg-slate-900/40 border border-slate-800">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3DDC84]/15 text-[#3DDC84] font-mono font-bold">
                {activeElement.type}
              </span>
              <p className="text-xs font-semibold text-slate-300 mt-2 truncate">
                ID: <span className="text-[#3DDC84]">{activeElement.id}</span>
              </p>
            </div>

            {/* General Android layout properties section */}
            <div className="space-y-3.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1.5">
                Core Settings
              </p>

              {/* ID Edit field */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-semibold">android:id</label>
                <input
                  id="attr_field_id"
                  type="text"
                  value={activeElement.attributes['android:id'] || ''}
                  onChange={(e) => handleUpdateAttribute('android:id', e.target.value)}
                  className="w-full text-xs bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-slate-200 outline-none focus:border-[#3DDC84]"
                  placeholder="@+id/myView"
                />
              </div>

              {/* Width and Height selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block font-semibold">android:layout_width</label>
                  <select
                    id="attr_field_width"
                    value={activeElement.attributes['android:layout_width'] || 'wrap_content'}
                    onChange={(e) => handleUpdateAttribute('android:layout_width', e.target.value)}
                    className="w-full text-xs bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-300 focus:border-[#3DDC84]"
                  >
                    <option value="wrap_content">wrap_content</option>
                    <option value="match_parent">match_parent</option>
                    <option value="120dp">120dp</option>
                    <option value="180dp">180dp</option>
                    <option value="250dp">250dp</option>
                    <option value="0dp">0dp (Constraint)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block font-semibold">android:layout_height</label>
                  <select
                    id="attr_field_height"
                    value={activeElement.attributes['android:layout_height'] || 'wrap_content'}
                    onChange={(e) => handleUpdateAttribute('android:layout_height', e.target.value)}
                    className="w-full text-xs bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-300 focus:border-[#3DDC84]"
                  >
                    <option value="wrap_content">wrap_content</option>
                    <option value="match_parent">match_parent</option>
                    <option value="48dp">48dp</option>
                    <option value="96dp">96dp</option>
                    <option value="120dp">120dp</option>
                    <option value="200dp">200dp</option>
                  </select>
                </div>
              </div>

              {/* Orientation if LinearLayout */}
              {activeElement.type === 'LinearLayout' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block font-semibold">android:orientation</label>
                  <div className="grid grid-cols-2 gap-1 bg-[#1A1C20] p-1 rounded border border-slate-850">
                    <button
                      type="button"
                      id="opt_orientation_vertical"
                      onClick={() => handleUpdateAttribute('android:orientation', 'vertical')}
                      className={`text-[10px] py-1 rounded text-center transition ${
                        activeElement.attributes['android:orientation'] !== 'horizontal' 
                          ? 'bg-[#3DDC84] text-slate-950 font-bold' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      vertical
                    </button>
                    <button
                      type="button"
                      id="opt_orientation_horizontal"
                      onClick={() => handleUpdateAttribute('android:orientation', 'horizontal')}
                      className={`text-[10px] py-1 rounded text-center transition ${
                        activeElement.attributes['android:orientation'] === 'horizontal' 
                          ? 'bg-[#3DDC84] text-slate-950 font-bold' 
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      horizontal
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pt-3 pb-1.5">
                Widget Specific
              </p>

              {/* Text value attribute */}
              {['TextView', 'Button', 'EditText', 'Switch'].includes(activeElement.type) && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block font-semibold">android:text</label>
                  <input
                    id="attr_field_text"
                    type="text"
                    value={activeElement.attributes['android:text'] || activeElement.attributes['android:hint'] || ''}
                    onChange={(e) => handleUpdateAttribute(activeElement!.type === 'EditText' ? 'android:hint' : 'android:text', e.target.value)}
                    className="w-full text-xs bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-slate-250 outline-none focus:border-[#3DDC84]"
                    placeholder="Submit label"
                  />
                </div>
              )}

              {/* Custom Size selection for Text Element */}
              {activeElement.type === 'TextView' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block font-semibold">android:textSize</label>
                  <select
                    id="attr_field_textSize"
                    value={activeElement.attributes['android:textSize'] || '14sp'}
                    onChange={(e) => handleUpdateAttribute('android:textSize', e.target.value)}
                    className="w-full text-xs bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-300 focus:border-[#3DDC84]"
                  >
                    <option value="12sp">12sp (Small)</option>
                    <option value="14sp">14sp (Regular)</option>
                    <option value="16sp">16sp (Body)</option>
                    <option value="18sp">18sp (Header Light)</option>
                    <option value="24sp">24sp (Title Medium)</option>
                    <option value="28sp">28sp (Display Large)</option>
                  </select>
                </div>
              )}

              {/* Text Style */}
              {activeElement.type === 'TextView' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block font-semibold">android:textStyle</label>
                  <select
                    id="attr_field_textStyle"
                    value={activeElement.attributes['android:textStyle'] || 'normal'}
                    onChange={(e) => handleUpdateAttribute('android:textStyle', e.target.value)}
                    className="w-full text-xs bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-300 focus:border-[#3DDC84]"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold (+200 weight)</option>
                  </select>
                </div>
              )}

              {/* Image Src for Image views */}
              {activeElement.type === 'ImageView' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block font-semibold">android:src</label>
                  <select
                    id="attr_field_src"
                    value={activeElement.attributes['android:src'] || 'android_robot'}
                    onChange={(e) => handleUpdateAttribute('android:src', e.target.value)}
                    className="w-full text-xs bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-300 focus:border-[#3DDC84] font-mono"
                  >
                    <option value="android_robot">@drawable/ic_android</option>
                    <option value="avatar_unlocked">@drawable/ic_avatar_unlocked</option>
                    <option value="avatar_profile">@drawable/ic_profile_admin</option>
                    <option value="icon_cpu">@drawable/ic_vector_cpu</option>
                    <option value="icon_database">@drawable/ic_vector_database</option>
                  </select>
                </div>
              )}

              {/* Progress parameter values (e.g. ProgressBar / Sliders) */}
              {['ProgressBar', 'Slider'].includes(activeElement.type) && (
                <div className="space-y-2">
                  <label className="text-[11px] text-slate-400 block font-semibold">
                    android:progress ({activeElement.attributes['android:progress'] || 'Linear infinite'})
                  </label>
                  <input
                    id="attr_field_progress"
                    type="range"
                    min="0"
                    max="100"
                    value={activeElement.attributes['android:progress'] || '0'}
                    onChange={(e) => handleUpdateAttribute('android:progress', e.target.value)}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#3DDC84]"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleUpdateAttribute('android:progress', '')}
                      className="hover:text-amber-400 underline"
                      title="Clear static value to trigger loader spin"
                    >
                      Make Indeterminate
                    </button>
                    <span>Val: {activeElement.attributes['android:progress'] || 'Spins'}</span>
                  </div>
                </div>
              )}

              {/* Switch Checked toggles */}
              {activeElement.type === 'Switch' && (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 block font-semibold">android:checked</label>
                  <select
                    id="attr_field_checked"
                    value={activeElement.attributes['android:checked'] || 'false'}
                    onChange={(e) => handleUpdateAttribute('android:checked', e.target.value)}
                    className="w-full text-xs bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-300 focus:border-[#3DDC84]"
                  >
                    <option value="true">true (Checked)</option>
                    <option value="false">false (Unchecked)</option>
                  </select>
                </div>
              )}

              {/* Colors (Hex inputs with palette presets) */}
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pt-3 pb-1.5">
                Spacing & Theming
              </p>

              {/* Padding */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-semibold">android:padding</label>
                <select
                  id="attr_field_padding"
                  value={activeElement.attributes['android:padding'] || ''}
                  onChange={(e) => handleUpdateAttribute('android:padding', e.target.value)}
                  className="w-full text-xs bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-300 focus:border-[#3DDC84]"
                >
                  <option value="">None</option>
                  <option value="8dp">8dp (Tight)</option>
                  <option value="16dp">16dp (Generous)</option>
                  <option value="24dp">24dp (Spacious)</option>
                </select>
              </div>

              {/* Margins */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-semibold">android:layout_margin</label>
                <select
                  id="attr_field_margin"
                  value={activeElement.attributes['android:layout_margin'] || ''}
                  onChange={(e) => handleUpdateAttribute('android:layout_margin', e.target.value)}
                  className="w-full text-xs bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-slate-300 focus:border-[#3DDC84]"
                >
                  <option value="">None</option>
                  <option value="4dp">4dp (Tiny)</option>
                  <option value="8dp">8dp (Small)</option>
                  <option value="16dp">16dp (Medium)</option>
                </select>
              </div>

              {/* Background Color */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 block font-semibold">android:background</label>
                <div className="flex space-x-1.5">
                  <input
                    id="attr_field_bg"
                    type="text"
                    value={activeElement.attributes['android:background'] || activeElement.attributes['app:cardBackgroundColor'] || ''}
                    onChange={(e) => {
                      const attrKey = activeElement!.type === 'CardView' ? 'app:cardBackgroundColor' : 'android:background';
                      handleUpdateAttribute(attrKey, e.target.value);
                    }}
                    className="flex-1 text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-200 outline-none focus:border-[#3DDC84] font-mono"
                    placeholder="#3DDC84"
                  />
                  {/* Preset quick colors */}
                  <div className="flex space-x-1">
                    {['#3DDC84', '#4285F4', '#0F172A', '#FFFFFF'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          const attrKey = activeElement!.type === 'CardView' ? 'app:cardBackgroundColor' : 'android:background';
                          handleUpdateAttribute(attrKey, color);
                        }}
                        style={{ backgroundColor: color }}
                        className="w-5 h-5 rounded border border-slate-700 cursor-pointer shadow-inner"
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions at bottom */}
            <div className="pt-4">
              <button
                type="button"
                id="btn_inspector_delete"
                onClick={() => handleDeleteElement(activeElement!.id)}
                className="w-full py-2 bg-rose-550 hover:bg-rose-650 text-white font-semibold text-xs rounded transition flex items-center justify-center space-x-1.5 shadow"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected Element</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center select-none text-slate-500">
            <Monitor className="w-12 h-12 text-slate-600 mb-3" />
            <p className="text-xs font-semibold">No node selected</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Tap any view module on the blueprint phone to modify parameters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
