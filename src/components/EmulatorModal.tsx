/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Play, 
  RotateCw, 
  Wifi, 
  Battery, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Bot,
  Rocket,
  Heart,
  Cpu,
  Gamepad2,
  Shield,
  MessageSquare,
  Home,
  ChevronLeft
} from 'lucide-react';
import { VisualElement } from '../utils/androidXmlTemplates';

interface EmulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutTree: VisualElement;
  deviceTheme: 'light' | 'dark';
  sdkConfig: {
    compileSdk: number;
    minSdk: number;
    kotlinVersion: string;
  };
  appName: string;
  appVersion: string;
  appPackage: string;
  appIcon: string; // 'android' | 'rocket' | 'heart' | 'cpu' | 'controller' | 'shield' | 'chat'
  themeColor: string; // e.g. '#3DDC84'
  onAddLogcat: (log: string) => void;
}

export default function EmulatorModal({
  isOpen,
  onClose,
  layoutTree,
  deviceTheme,
  sdkConfig,
  appName,
  appVersion,
  appPackage,
  appIcon,
  themeColor,
  onAddLogcat
}: EmulatorModalProps) {
  // Input binders: maps elementId to active value state
  const [deviceValues, setDeviceValues] = useState<Record<string, any>>({});
  
  // Simulated Emulator actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'app' | 'home'>('app');

  // Load initial element defaults when layout tree is provided
  useEffect(() => {
    const values: Record<string, any> = {};
    const extractDefaults = (node: VisualElement) => {
      if (node.type === 'Switch') {
        values[node.id] = node.attributes['android:checked'] === 'true';
      } else if (node.type === 'EditText') {
        values[node.id] = '';
      } else if (node.type === 'Slider' || node.type === 'ProgressBar') {
        values[node.id] = parseInt(node.attributes['android:progress'] || '0', 10);
      }
      if (node.children) {
        node.children.forEach(extractDefaults);
      }
    };
    extractDefaults(layoutTree);
    setDeviceValues(values);

    if (isOpen) {
      onAddLogcat(`I/ActivityManager: Boot device emulator API ${sdkConfig.compileSdk} running package ${appPackage}`);
      onAddLogcat(`I/Choreographer: Rendering layout hierarchy for App "${appName}" (version ${appVersion})`);
    }
  }, [layoutTree, isOpen, appName, appVersion, appPackage]);

  // Custom alert/toast popup
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    onAddLogcat(`D/AndroidToast: Toast bubble generated: "${msg}"`);
  };

  useEffect(() => {
    if (toastVisible) {
      const timer = setTimeout(() => {
        setToastVisible(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  // Handle emulator widget updates
  const handleInputChange = (id: string, value: any) => {
    setDeviceValues((prev) => ({
      ...prev,
      [id]: value,
    }));
    onAddLogcat(`D/WidgetState: Input updated [${id}] = ${JSON.stringify(value)}`);
  };

  // Process clicking buttons to enact business rules inside our simulator
  const handleEmulatorButtonClick = (id: string, text: string) => {
    onAddLogcat(`I/ViewRootImpl: Button ID [${id}] clicked - Caption: "${text}"`);

    // 1. If it's a Login button
    if (id.toLowerCase().includes('login') || text.toLowerCase().includes('sign in') || text.toLowerCase().includes('entrar')) {
      // Find credentials
      let email = '';
      let password = '';
      
      const findCredentials = (node: VisualElement) => {
        if (node.type === 'EditText') {
          const isEmail = node.attributes['android:inputType']?.toLowerCase().includes('email') || node.id.toLowerCase().includes('email');
          const isPass = node.attributes['android:inputType']?.toLowerCase().includes('password') || node.id.toLowerCase().includes('password') || node.id.toLowerCase().includes('pass');
          if (isEmail) email = deviceValues[node.id] || '';
          if (isPass) password = deviceValues[node.id] || '';
        }
        if (node.children) node.children.forEach(findCredentials);
      };
      findCredentials(layoutTree);

      if (!email || !password) {
        showToast('Preencha os campos de Email e Senha!');
        return;
      }

      setIsLoading(true);
      showToast('Conectando ao servidor de autenticação...');
      onAddLogcat(`D/OkHttp: POST --> https://api.auth.${appPackage}/v1/login (Payload: ${email})`);

      setTimeout(() => {
        setIsLoading(false);
        showToast(`Bem-vindo! Usuário ${email} autenticado.`);
        onAddLogcat(`D/OkHttp: <-- 200 OK Login Success (JWT Token Received)`);
      }, 1500);
      return;
    }

    // 2. Clear or build button
    if (id.toLowerCase().includes('rebuild') || text.toLowerCase().includes('clean') || text.toLowerCase().includes('recompilar')) {
      setIsLoading(true);
      showToast('Limpando cache do compilador sandbox...');
      setTimeout(() => {
        setIsLoading(false);
        showToast('Compilação rápida concluída com sucesso!');
      }, 1200);
      return;
    }

    if (id.toLowerCase().includes('save') || text.toLowerCase().includes('apply') || text.toLowerCase().includes('salvar')) {
      showToast('Configurações salvas no dispositivo!');
      return;
    }

    // Fallback general action Toast
    showToast(`Botão "${text}" acionado!`);
  };

  const getLauncherIconComponent = (sizeClass = 'w-6 h-6', customColor = '#FFFFFF') => {
    switch (appIcon) {
      case 'rocket':
        return <Rocket className={`${sizeClass}`} style={{ color: customColor }} />;
      case 'heart':
        return <Heart className={`${sizeClass}`} style={{ color: customColor }} />;
      case 'cpu':
        return <Cpu className={`${sizeClass}`} style={{ color: customColor }} />;
      case 'controller':
        return <Gamepad2 className={`${sizeClass}`} style={{ color: customColor }} />;
      case 'shield':
        return <Shield className={`${sizeClass}`} style={{ color: customColor }} />;
      case 'chat':
        return <MessageSquare className={`${sizeClass}`} style={{ color: customColor }} />;
      case 'android':
      default:
        return <Bot className={`${sizeClass}`} style={{ color: customColor }} />;
    }
  };

  // --- RECURSIVE INTERACTIVE RENDERER FOR EMULATOR WINDOW ---
  const renderInteractiveElement = (node: VisualElement): React.ReactNode => {
    const padding = node.attributes['android:padding'] || '';
    const background = node.attributes['android:background'] || '';
    const orientation = node.attributes['android:orientation'] || 'vertical';
    const textStyle = node.attributes['android:textStyle'] || '';

    const parseDpToRem = (value: string) => {
      if (!value) return '';
      const numbers = parseInt(value, 10);
      if (isNaN(numbers)) return '';
      if (numbers < 12) return 'p-1';
      if (numbers < 18) return 'p-3';
      return 'p-5';
    };

    const padClass = parseDpToRem(padding);

    let customBgStyle: React.CSSProperties = {};
    if (background.startsWith('#')) {
      customBgStyle.backgroundColor = background;
    }

    switch (node.type) {
      case 'ConstraintLayout': {
        const bgVal = background || (deviceTheme === 'dark' ? '#0F172A' : '#F8F9FA');
        return (
          <div
            style={{ backgroundColor: bgVal, ...customBgStyle }}
            className={`w-full min-h-full flex-grow relative ${padClass} flex flex-col space-y-4`}
          >
            {/* Dynamic Application Action Bar */}
            <div 
              style={{ backgroundColor: themeColor }}
              className="w-full -mx-4 -mt-4 px-4 py-2.5 flex items-center justify-between text-white shadow-md z-10 select-none"
            >
              <div className="flex items-center space-x-2">
                {getLauncherIconComponent('w-4 h-4', '#ffffff')}
                <span className="text-[11px] font-extrabold uppercase tracking-widest">{appName}</span>
              </div>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded text-white font-semibold font-mono">v{appVersion}</span>
            </div>

            {/* Inner dynamic widgets */}
            <div className="flex-1 flex flex-col space-y-4">
              {node.children && node.children.map((child) => (
                <React.Fragment key={child.id}>
                  {renderInteractiveElement(child)}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      }

      case 'LinearLayout': {
        const isVertical = orientation !== 'horizontal';
        return (
          <div
            style={customBgStyle}
            className={`flex ${isVertical ? 'flex-col space-y-3' : 'flex-row items-center space-x-3'} ${padClass} w-full`}
          >
            {node.children && node.children.map((child) => (
              <React.Fragment key={child.id}>
                {renderInteractiveElement(child)}
              </React.Fragment>
            ))}
          </div>
        );
      }

      case 'RelativeLayout':
      case 'FrameLayout': {
        return (
          <div style={customBgStyle} className={`w-full relative ${padClass}`}>
            {node.children && node.children.map((child) => (
              <React.Fragment key={child.id}>
                {renderInteractiveElement(child)}
              </React.Fragment>
            ))}
          </div>
        );
      }

      case 'ScrollView': {
        return (
          <div className="w-full overflow-y-auto max-h-[380px] h-full scrollbar-none">
            <div className="space-y-4 pb-4">
              {node.children && node.children.map((child) => (
                <React.Fragment key={child.id}>
                  {renderInteractiveElement(child)}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      }

      case 'CardView': {
        const cardBg = node.attributes['app:cardBackgroundColor'] || (deviceTheme === 'dark' ? '#1E293B' : '#FFFFFF');
        return (
          <div
            style={{ backgroundColor: cardBg }}
            className="w-full p-4 rounded-xl shadow-md border border-slate-200/10"
          >
            <div className="flex flex-col space-y-2">
              {node.children && node.children.map((child) => (
                <React.Fragment key={child.id}>
                  {renderInteractiveElement(child)}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      }

      case 'View': {
        const heightVal = node.attributes['android:layout_height'] || '1dp';
        const bgColor = background || '#e2e8f0';
        return (
          <div
            style={{ 
              height: heightVal.includes('dp') ? `${parseInt(heightVal, 10)}px` : '1px',
              backgroundColor: bgColor
            }}
            className="w-full my-2 opacity-30"
          />
        );
      }

      case 'TextView': {
        const textValue = node.attributes['android:text'] || 'TextView';
        const rawSize = node.attributes['android:textSize'] || '14sp';
        const sizeVal = parseInt(rawSize, 10) || 14;
        const colorVal = node.attributes['android:textColor'] || (deviceTheme === 'dark' ? '#FFFFFF' : '#1C1B1F');

        return (
          <p
            style={{ 
              color: colorVal, 
              fontSize: `${sizeVal}px`,
              fontWeight: textStyle === 'bold' ? 'bold' : 'normal',
            }}
            className="truncate px-1 select-none leading-relaxed"
          >
            {textValue}
          </p>
        );
      }

      case 'Button': {
        const textValue = node.attributes['android:text'] || 'Submit';
        const bgVal = background.startsWith('#') ? background : themeColor;
        const textColors = node.attributes['android:textColor'] || '#ffffff';

        return (
          <button
            type="button"
            id={`emu_click_btn_${node.id}`}
            onClick={() => handleEmulatorButtonClick(node.id, textValue)}
            disabled={isLoading}
            style={{ backgroundColor: bgVal, color: textColors }}
            className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-center shadow-md hover:opacity-90 active:scale-[0.97] transition cursor-pointer"
          >
            {textValue}
          </button>
        );
      }

      case 'ImageView': {
        const srcVal = node.attributes['android:src'] || 'android_robot';

        const getAssetSvg = (src: string) => {
          if (src === 'android_robot' || src === 'android_logo') {
            return (
              <div className="py-2.5 flex justify-center">
                <div style={{ backgroundColor: `${themeColor}20` }} className="p-4 rounded-full animate-pulse">
                  {getLauncherIconComponent('w-12 h-12', themeColor)}
                </div>
              </div>
            );
          } else if (src.includes('avatar_unlocked')) {
            return (
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center">
                {getLauncherIconComponent('w-8 h-8', themeColor)}
              </div>
            );
          } else if (src.includes('avatar_profile')) {
            return (
              <div 
                style={{ backgroundColor: themeColor }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
              >
                {appName.substring(0, 2).toUpperCase()}
              </div>
            );
          } else if (src.includes('cpu')) {
            return (
              <div style={{ borderColor: `${themeColor}40`, backgroundColor: `${themeColor}15` }} className="w-10 h-10 rounded border flex items-center justify-center">
                <Cpu className="w-6 h-6" style={{ color: themeColor }} />
              </div>
            );
          } else {
            return (
              <div style={{ color: themeColor }} className="flex justify-center py-2">
                {getLauncherIconComponent('w-8 h-8', themeColor)}
              </div>
            );
          }
        };

        return <div className="py-1">{getAssetSvg(srcVal)}</div>;
      }

      case 'EditText': {
        const hint = node.attributes['android:hint'] || 'Enter text...';
        const isPassword = node.attributes['android:inputType'] === 'textPassword';
        const currentVal = deviceValues[node.id] || '';

        return (
          <div className="w-full flex flex-col space-y-1">
            <input
              type={isPassword ? 'password' : 'text'}
              value={currentVal}
              id={`emu_input_field_${node.id}`}
              onChange={(e) => handleInputChange(node.id, e.target.value)}
              placeholder={hint}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 focus:border-slate-600 rounded-lg text-xs text-white outline-none transition focus:ring-1 focus:ring-slate-750"
            />
          </div>
        );
      }

      case 'ProgressBar': {
        const isSpinned = !node.attributes['android:progress'];
        const progressVal = deviceValues[node.id] || parseInt(node.attributes['android:progress'] || '0', 10);
        const maxVal = parseInt(node.attributes['android:max'] || '100', 10);
        const percentage = Math.round((progressVal / maxVal) * 100);

        return (
          <div className="w-full py-2 flex justify-center">
            {isSpinned || isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: themeColor }} />
            ) : (
              <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full p-0.5 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%`, backgroundColor: themeColor }}
                />
              </div>
            )}
          </div>
        );
      }

      case 'Switch': {
        const textVal = node.attributes['android:text'] || 'Option';
        const isChecked = !!deviceValues[node.id];

        const toggleSwitch = (e: React.MouseEvent) => {
          e.stopPropagation();
          handleInputChange(node.id, !isChecked);
          showToast(`${textVal} is now ${!isChecked ? 'ON' : 'OFF'}`);
        };

        return (
          <div
            id={`emu_click_switch_${node.id}`}
            onClick={toggleSwitch}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-850 hover:border-slate-800 cursor-pointer transition select-none"
          >
            <span className="text-xs font-semibold text-slate-300">{textVal}</span>
            <div 
              style={{ backgroundColor: isChecked ? themeColor : '#334155' }}
              className="w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200"
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow transform duration-200 ${isChecked ? 'translate-x-[16px]' : 'translate-x-0'}`} />
            </div>
          </div>
        );
      }

      case 'Slider': {
        const progressVal = deviceValues[node.id] || 50;
        return (
          <div className="w-full py-2 flex flex-col justify-center space-y-1">
            <input
              type="range"
              min="0"
              max="100"
              value={progressVal}
              id={`emu_slider_field_${node.id}`}
              onChange={(e) => handleInputChange(node.id, parseInt(e.target.value, 10))}
              style={{ accentColor: themeColor }}
              className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-slate-500 px-0.5 select-none">
              <span>0%</span>
              <span style={{ color: themeColor }} className="font-semibold">Valor: {progressVal}%</span>
              <span>100%</span>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div 
        id="emulator_modal_container" 
        className="w-[820px] h-[580px] bg-[#121316] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Device Emulator Toolbar header */}
        <div className="p-3.5 bg-[#18191D] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-[#3DDC84]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-100 flex items-center font-mono">
                <span>PIXEL 8 SIMULATOR</span>
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold font-mono">
                  Level {sdkConfig.compileSdk} ART
                </span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Executando emulador com suporte a classes Java e Kotlin compiled dex.</p>
            </div>
          </div>

          <button
            type="button"
            id="btn_close_emulator"
            onClick={onClose}
            className="p-1 border border-slate-800 rounded bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic split body layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: Phone Frame */}
          <div className="w-[42%] border-r border-slate-800 flex flex-col items-center justify-center bg-[#0C0D0F] p-4 relative shrink-0">
            <div className="absolute top-2 left-3 text-[9px] font-mono text-slate-600">
              ADB HOST: localhost:5554
            </div>

            {/* Smartphone Bezel */}
            <div className="w-[245px] h-[450px] border-8 border-slate-950 rounded-[30px] shadow-2xl relative bg-[#090D16] flex flex-col overflow-hidden">
              
              {/* Phone Status bar */}
              <div className="h-5.5 w-full bg-slate-950 flex justify-center items-center relative z-20 shrink-0">
                <div className="w-20 h-3 flex items-center justify-between px-2 text-[8px] text-slate-400 font-mono">
                  <span>14:00</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-850" />
                  <div className="flex items-center space-x-1">
                    <Wifi className="w-2 h-2 text-slate-400" />
                    <Battery className="w-2.5 h-2.5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Central device desktop/apps container */}
              <div className="flex-1 overflow-hidden relative flex flex-col bg-[#0F1115]">
                
                {activeScreen === 'app' ? (
                  <div className="flex-1 overflow-y-auto bg-[#0F172A] p-4 flex flex-col scrollbar-none">
                    {renderInteractiveElement(layoutTree)}
                  </div>
                ) : (
                  /* Launcher Home Screen desktop background */
                  <div className="flex-1 p-4 bg-gradient-to-b from-slate-900 to-indigo-950 flex flex-col justify-end items-center pb-8 relative">
                    <div className="absolute top-4 left-4 text-white text-3xl font-extralight font-mono select-none">14:00</div>
                    
                    {/* Centered Launcher App Grid */}
                    <div className="flex flex-col items-center">
                      <div 
                        id="launcher_app_icon"
                        onClick={() => {
                          setActiveScreen('app');
                          showToast(`Iniciando ${appName}...`);
                        }}
                        style={{ backgroundColor: themeColor }}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 active:scale-95 transition cursor-pointer"
                      >
                        {getLauncherIconComponent('w-6 h-6', '#FFFFFF')}
                      </div>
                      <span className="text-[9.5px] font-extrabold text-[#FFFFFF] mt-1.5 font-sans drop-shadow tracking-wider truncate max-w-[80px]">
                        {appName}
                      </span>
                    </div>

                    <div className="absolute bottom-2 text-[7px] text-slate-400 uppercase tracking-widest font-bold">Launchpad Home</div>
                  </div>
                )}

                {/* Toast Bubble */}
                {toastVisible && toastMessage && (
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-slate-900/95 border border-slate-800 text-[9.5px] font-semibold text-slate-100 px-3 py-1.5 rounded-full shadow-2xl z-40 text-center max-w-[85%] truncate">
                    {toastMessage}
                  </div>
                )}
              </div>

              {/* Navigation bottom buttons */}
              <div className="h-6 w-full bg-slate-950 flex items-center justify-center space-x-10 shrink-0 z-20 border-t border-slate-900/20">
                <button
                  type="button"
                  onClick={() => {
                    setActiveScreen('app');
                    showToast('Transição para MainActivity.kt');
                  }}
                  className="w-2.5 h-2.5 border-l-2 border-b-2 border-slate-500 transform rotate-45 hover:border-white transition"
                />
                <button
                  type="button"
                  onClick={() => {
                    setActiveScreen('home');
                    onAddLogcat('I/ActivityManager: Minimizing activity Main; saving state vector');
                  }}
                  className="w-3.5 h-3.5 rounded-full border-2 border-slate-500 hover:border-white transition"
                />
                <button
                  type="button"
                  onClick={() => showToast('Multitask manager: App Sandbox is running (PID 8399)')}
                  className="w-2.5 h-2.5 border-2 border-slate-500 rounded-sm hover:border-white transition"
                />
              </div>

            </div>
          </div>

          {/* RIGHT: System Sandbox settings & Interactive Logs */}
          <div className="flex-1 flex flex-col bg-[#141519] p-4 space-y-4 overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
              <h3 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Metadados e Diagnósticos</h3>
              <span className="text-[9.5px] font-mono text-slate-400">package: <span className="text-cyan-400">{appPackage}</span></span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 font-mono text-[11px]">
                <span className="text-[9px] text-slate-500 uppercase font-bold">App Package Info:</span>
                <p className="font-bold text-slate-200 mt-1">Version: {appVersion} (Code {parseInt(appVersion, 10) || 1})</p>
                <div className="mt-1.5 text-[8.5px] text-slate-400 flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#3DDC84] rounded-full mr-1.5"></span>
                  APK builds align correct signature
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 font-mono text-[11px]">
                <span className="text-[9px] text-slate-500 uppercase font-bold">Tema / Cor Principal:</span>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-4 h-4 rounded border border-white/20" style={{ backgroundColor: themeColor }} />
                  <span className="font-bold text-slate-200">{themeColor}</span>
                </div>
                <div className="mt-1 text-[8.5px] text-indigo-400 flex items-center">
                  Material Design 3 Engine
                </div>
              </div>
            </div>

            {/* Sandbox details guide */}
            <div className="p-3.5 bg-slate-900/30 rounded-xl border border-slate-800/80 space-y-2 select-text">
              <div className="flex items-center space-x-1.5 text-[10px] font-extrabold text-slate-300 uppercase tracking-widest pb-1 border-b border-slate-800 font-mono">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Instruções de Interação e Teste</span>
              </div>
              <ul className="space-y-1 text-slate-450 text-[10.5px] leading-relaxed list-disc pl-4 font-mono">
                <li>Escreva campos de dados no formulário e clique nos botões para disparar eventos.</li>
                <li>Clique no <span className="text-white hover:underline">botão de círculo</span> do celular para simular a minimização.</li>
                <li>Abra as configurações do app e observe a correspondência da sincronização.</li>
                <li>Qualquer clique ou input registra alertas e Logs instantâneos na aba de Logcat geral.</li>
              </ul>
            </div>
            
            <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-950/45 text-[10px] text-indigo-300 flex items-center space-x-2">
              <Bot className="w-4 h-4 shrink-0" />
              <span>O emulador reflete em tempo real o arquivo editado <b className="text-white">activity_main.xml</b> utilizando o renderizador de compilação Dalvik do Sandbox.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
