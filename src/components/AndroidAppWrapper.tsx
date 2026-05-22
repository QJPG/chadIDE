/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  BatteryCharging, 
  Settings, 
  Chrome, 
  ChevronRight,
  ArrowLeft,
  Check,
  Power,
  Volume2,
  Copy,
  ExternalLink,
  Sliders,
  Cpu,
  Layers,
  Sparkles,
  Smartphone,
  Play,
  RotateCcw,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Grid,
  Search,
  Download,
  Info,
  QrCode,
  ShieldAlert,
  Terminal,
  Volume1
} from 'lucide-react';
import { IDFile } from './IdeSidebar';

interface AndroidAppWrapperProps {
  appName: string;
  appPackage: string;
  appVersion: string;
  appIcon: string;
  themeColor: string;
  files: IDFile[];
  onAddLogcat: (log: string) => void;
  children: React.ReactNode; // The entire Web IDE React children tree
}

export default function AndroidAppWrapper({
  appName,
  appPackage,
  appVersion,
  appIcon,
  themeColor,
  files,
  onAddLogcat,
  children
}: AndroidAppWrapperProps) {
  // Simulator State
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [activeApp, setActiveApp] = useState<'ide' | 'launcher' | 'play_store' | 'chrome' | 'settings' | 'export_suite'>('ide');
  const [appHistory, setAppHistory] = useState<('ide' | 'launcher' | 'play_store' | 'chrome' | 'settings' | 'export_suite')[]>(['ide']);
  const [currentTime, setCurrentTime] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [isCharging, setIsCharging] = useState(false);
  const [volume, setVolume] = useState(70);
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [copiarFeed, setCopiarFeed] = useState<string | null>(null);

  // App Installation State inside Simulator
  const [installedApps, setInstalledApps] = useState<string[]>(['ide', 'chrome', 'settings', 'export_suite']);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);

  // App History Management (Overview)
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);

  // Web Browser Simulator inputs
  const [browserUrl, setBrowserUrl] = useState('https://google.com');
  const [browserIframeUrl, setBrowserIframeUrl] = useState('https://google.com');

  // Load custom fonts or layout styles if needed
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (app: typeof activeApp) => {
    if (app === activeApp) return;
    setAppHistory(prev => [...prev, activeApp]);
    setActiveApp(app);
    setIsOverviewOpen(false);
    onAddLogcat(`I/AndroidOS: Abrindo App Simulador: [${app.toUpperCase()}]`);
  };

  const handleBack = () => {
    if (isOverviewOpen) {
      setIsOverviewOpen(false);
      return;
    }
    if (appHistory.length > 0) {
      const prev = appHistory[appHistory.length - 1];
      setAppHistory(history => history.slice(0, -1));
      setActiveApp(prev);
      onAddLogcat(`I/AndroidOS: Voltar acionado. Novo estado: [${prev.toUpperCase()}]`);
    } else {
      setActiveApp('launcher');
    }
  };

  const handleHome = () => {
    setIsOverviewOpen(false);
    if (activeApp === 'launcher') return;
    navigateTo('launcher');
    onAddLogcat('I/AndroidOS: Evento de toque no botão Home.');
  };

  const handleOverview = () => {
    setIsOverviewOpen(!isOverviewOpen);
    onAddLogcat('I/AndroidOS: Evento de toque no botão Multitasking App Switcher.');
  };

  const handleInstallAppSim = () => {
    if (installedApps.includes('user_app')) return;
    setIsInstalling(true);
    setInstallProgress(0);
    onAddLogcat(`I/PlayStore: Iniciando download de ${appName}...`);

    const interval = setInterval(() => {
      setInstallProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsInstalling(false);
          setInstalledApps(prev => [...prev, 'user_app']);
          onAddLogcat(`I/PlayStore: Instalação concluída de ${appName}. Ícone adicionado na Tela de Início.`);
          return 100;
        }
        return p + 25;
      });
    }, 300);
  };

  const showNotification = (msg: string) => {
    onAddLogcat(`W/NotificationManager: ${msg}`);
  };

  const triggerCopy = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiarFeed(id);
    setTimeout(() => setCopiarFeed(null), 2500);
  };

  // Icon Render utilities
  const getAppIcon = (iconName: string, sizeClass = "w-6 h-6") => {
    switch(iconName) {
      case 'rocket': return <Play className={`${sizeClass} text-rose-400`} />;
      case 'heart': return <Layers className={`${sizeClass} text-purple-400`} />;
      case 'cpu': return <Cpu className={`${sizeClass} text-cyan-400`} />;
      case 'shield': return <ChevronRight className={`${sizeClass} text-emerald-400`} />;
      default: return <Smartphone className={`${sizeClass} text-[#3DDC84]`} />;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#111317] flex flex-col items-center justify-center p-3 sm:p-5 select-none font-sans overflow-x-hidden md:py-6 relative">
      
      {/* Dynamic Glow effects in background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#3DDC84]/5 blur-3xl rounded-full pointer-events-none" />

      {/* Title bar of wrapper page */}
      <div className="w-full max-w-7xl mb-4 flex flex-col md:flex-row md:items-center md:justify-between px-3 shrink-0">
        <div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#3DDC84] font-mono flex items-center space-x-2">
            <Smartphone className="w-4.5 h-4.5 text-[#3DDC84]" />
            <span>AMBIENTE VIRTUAL ANDROID 15 (PIXEL TABLET SHELL)</span>
          </h2>
          <p className="text-[10px] text-slate-400 mt-1">Sua IDE Android Studio Sandbox agora roda inteira mockada de forma segura dentro de um ecossistema mobile nativo.</p>
        </div>

        {/* Quick controls info badge */}
        <div className="flex gap-2 items-center mt-3 md:mt-0">
          <div className="text-[10px] rounded-xl bg-slate-900 border border-slate-800 p-1 px-3 text-slate-400 flex items-center gap-1.5 font-mono select-text">
            <span>Dispositivo:</span>
            <span className="text-[#3DDC84] font-bold">Pixel Pro Tablet (Android 15 API 35)</span>
          </div>
          <button 
            type="button"
            onClick={() => {
              setIsLocked(!isLocked);
              onAddLogcat(isLocked ? "I/AndroidOS: Dispositivo Desbloqueado." : "I/AndroidOS: Dispositivo Bloqueado.");
            }}
            className="text-[10px] uppercase font-bold text-slate-300 hover:text-white bg-slate-800 border border-slate-750 rounded-lg p-1.5 px-3 transition cursor-pointer"
          >
            {isLocked ? "🔓 Desbloquear" : "🔒 Desbloquear/Bloquear"}
          </button>
        </div>
      </div>

      {/* OUTER GALAXY DEVICE HARDWARE CABINET CHASSIS */}
      <div className="w-full max-w-[1240px] bg-[#1d1f24] rounded-[42px] p-4.5 border-4 border-slate-750 shadow-2xl relative select-none flex flex-col md:flex-row gap-5">
        
        {/* Hardware side physical volume and power controls */}
        <div className="absolute top-20 -right-1 flex flex-col gap-3 z-35">
          {/* Power Button */}
          <button
            onClick={() => {
              setIsPowerOn(!isPowerOn);
              onAddLogcat(isPowerOn ? "W/AndroidOS: Dispositivo Suspenso." : "I/AndroidOS: Dispositivo Iniciando...");
            }}
            title="Botão Liga/Desliga"
            className="w-1 h-11 bg-slate-700 hover:bg-slate-650 rounded-l active:translate-x-0.5 border border-slate-800 shadow cursor-pointer"
          />
          {/* Volume Up */}
          <button
            onClick={() => {
              setVolume(v => Math.min(100, v + 10));
              onAddLogcat(`I/AudioManager: Volume aumentado para ${Math.min(100, volume + 10)}%`);
            }}
            title="Volume +"
            className="w-1.2 h-8 bg-slate-750 hover:bg-slate-700 rounded-l active:translate-x-0.5 border border-slate-800 shadow cursor-pointer mt-3"
          />
          {/* Volume Down */}
          <button
            onClick={() => {
              setVolume(v => Math.max(0, v - 10));
              onAddLogcat(`I/AudioManager: Volume reduzido para ${Math.max(0, volume - 10)}%`);
            }}
            title="Volume -"
            className="w-1.2 h-8 bg-slate-750 hover:bg-slate-700 rounded-l active:translate-x-0.5 border border-slate-800 shadow cursor-pointer"
          />
        </div>

        {/* --- MAIN GLASS DISPLAY GLASS MATRIX SCREEN CONTAINER --- */}
        <div className="flex-1 bg-slate-950 rounded-[28px] border-8 border-black shadow-inner overflow-hidden flex flex-col relative min-h-[580px] md:min-h-[720px]">
          
          {/* Screen Off state Overlay */}
          {!isPowerOn ? (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-48 select-none">
              <button 
                onClick={() => setIsPowerOn(true)}
                className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#3DDC84] transition shadow cursor-pointer animate-pulse"
              >
                <Power className="w-8 h-8" />
              </button>
              <span className="text-[10px] text-slate-500 font-mono mt-3 uppercase tracking-wider">Dispositivo Suspenso • Toque para ligar</span>
            </div>
          ) : isLocked ? (
            /* Locked screen state mockup showing dynamic background wallpaper */
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-between p-12 z-47 select-none">
              <div className="flex flex-col items-center mt-10">
                <span className="text-slate-400 text-xs font-semibold tracking-widest font-mono uppercase">MISTY WALLPAPER</span>
                <h1 className="text-5xl font-black font-sans text-slate-100 flex items-center gap-1.5 mt-2">
                  {currentTime || '12:00'}
                </h1>
                <span className="text-xs text-indigo-400 font-bold font-mono tracking-wide mt-1.5">Sexta-feira, 22 de Maio</span>
              </div>

              {/* Slide to open simulator widgets */}
              <div className="w-full max-w-sm bg-slate-900/60 p-5 rounded-2xl border border-white/5 backdrop-blur flex flex-col gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3DDC84]/20 flex items-center justify-center border border-[#3DDC84]/35">
                    {getAppIcon(appIcon, 'w-5 h-5')}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-200">{appName}</h3>
                    <p className="text-[9.5px] text-slate-400 font-mono italic">{appPackage}</p>
                  </div>
                </div>
                <div className="text-[10px] text-indigo-300 font-mono font-bold leading-relaxed bg-indigo-950/40 p-2 rounded border border-indigo-900/40 mt-1">
                  💡 Sandbox IDE Online e integrada! Toque no botão Desbloquear abaixo para prosseguir.
                </div>
              </div>

              <button
                onClick={() => setIsLocked(false)}
                className="py-3 px-8 rounded-full border border-[#3DDC84]/30 bg-[#3DDC84]/10 hover:bg-[#3DDC84]/20 text-[#3DDC84] font-bold text-xs font-mono tracking-widest uppercase transition transform hover:scale-[1.02] cursor-pointer"
              >
                🔓 Deslizar para Desbloquear
              </button>
            </div>
          ) : null}

          {/* SIMULATED ANDROID 15 TOP BAR STATUS ROW */}
          <div className="h-7 bg-[#0b0c0f] border-b border-slate-950 flex items-center justify-between px-5 select-none shrink-0 text-slate-400 text-[10px] font-semibold font-mono z-45">
            <span className="text-slate-300 font-bold animate-pulse">{currentTime || '12:00'}</span>
            
            <div className="flex items-center gap-3">
              {/* Notifications bell icon inside bar */}
              <button 
                onClick={() => setNotificationsExpanded(!notificationsExpanded)}
                className="text-indigo-400 hover:text-white transition relative cursor-pointer font-bold uppercase tracking-wider text-[8px]"
              >
                [🔔 Alertas]
                {notificationsExpanded && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
              </button>
              
              <div className="flex items-center space-x-1">
                <span>SIM_1</span>
                <Wifi className="w-3.5 h-3.5 text-slate-300" />
              </div>

              <div className="flex items-center space-x-1 bg-slate-900/80 px-1.5 py-0.2 rounded border border-slate-800">
                {isCharging ? <BatteryCharging className="w-3.5 h-3.5 text-[#3DDC84] animate-bounce" /> : <Battery className="w-3.5 h-3.5 text-amber-500" />}
                <span className={isCharging ? "text-[#3DDC84]" : "text-amber-500"}>{batteryLevel}%</span>
              </div>
            </div>
          </div>

          {/* Dropdown for dynamic android notifications center */}
          {notificationsExpanded && (
            <div className="absolute top-7 inset-x-0 bg-[#121316]/95 border-b border-indigo-500/20 shadow-2xl p-4 z-46 animate-slide-down flex flex-col gap-2 backdrop-blur select-text">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">CENTRO DE CONTROLES E NOTIFICAÇÕES (ANDROID 15)</span>
                <button 
                  onClick={() => setNotificationsExpanded(false)}
                  className="text-slate-500 hover:text-slate-200 text-xs font-bold"
                >
                  Fechar [X]
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1.5">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[8.5px] uppercase font-bold text-indigo-400 font-mono tracking-widest block">SYSTEM CONTROLS</span>
                  
                  <div className="space-y-2.5 text-[10.5px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Bateria ({batteryLevel}%)</span>
                      <input 
                        type="range" min="1" max="100" 
                        value={batteryLevel} 
                        onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
                        className="w-24 accent-[#3DDC84]" 
                      />
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Carregar Conexão acesa</span>
                      <input 
                        type="checkbox" checked={isCharging} 
                        onChange={(e) => setIsCharging(e.target.checked)}
                        className="rounded accent-[#3DDC84]" 
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                  <span className="text-[8.5px] uppercase font-bold text-amber-500 font-mono tracking-widest block">CONDIÇÕES ATIVAS DO COMPILADOR</span>
                  <div className="text-[10px] text-slate-300 leading-relaxed space-y-1.5">
                    <div className="flex items-center gap-1.5 text-teal-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Nome: com.android.application</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Arquivos na IDE: {files.length} declarados</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPLICATION SWITCHBOARD CHASSIS ROUTER VIEWS */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* OVERVIEW COMPONENT SCREEN SWITCHER (TASK CARD LAYOUT) */}
            {isOverviewOpen && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur p-6 z-42 flex flex-col justify-between overflow-y-auto">
                <div className="pb-3 border-b border-slate-850">
                  <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-widest flex items-center">
                    <Grid className="w-4 h-4 text-[#3DDC84] mr-2" />
                    Multitask Launcher (Histórico de Apps Concorrentes)
                  </h3>
                  <p className="text-[10px] text-slate-500">Alterne instantaneamente as telas virtuais em segundo plano no Android 15.</p>
                </div>

                {/* Horizontal carousel of windows */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
                  
                  {/* IDE app card */}
                  <div 
                    onClick={() => navigateTo('ide')}
                    className={`p-4 rounded-2xl border cursor-pointer ${
                      activeApp === 'ide' ? 'border-[#3DDC84] bg-slate-900/80 shadow-md shadow-[#3DDC84]/5' : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider block">1. Layout IDE</span>
                      <Smartphone className="w-4 h-4 text-[#3DDC84]" />
                    </div>
                    <p className="text-[10px] text-slate-400 h-10 overflow-hidden text-ellipsis line-clamp-2">Editor visual Kotlin/Java, árvore XML e ferramentas de Sync.</p>
                  </div>

                  {/* Launcher app card */}
                  <div 
                    onClick={() => navigateTo('launcher')}
                    className={`p-4 rounded-2xl border cursor-pointer ${
                      activeApp === 'launcher' ? 'border-indigo-400 bg-slate-900/80' : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider block">2. Home Screen</span>
                      <Grid className="w-4 h-4 text-indigo-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 h-10 overflow-hidden text-ellipsis">A Área de Trabalho do Tablet Android com os atalhos visuais integrados.</p>
                  </div>

                  {/* Play Store app card */}
                  <div 
                    onClick={() => navigateTo('play_store')}
                    className={`p-4 rounded-2xl border cursor-pointer ${
                      activeApp === 'play_store' ? 'border-amber-400 bg-slate-900/80' : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider block">3. Play Store</span>
                      <Info className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-[10px] text-slate-400 h-10 overflow-hidden text-ellipsis">Página de distribuição simulada da Google Play com feedback e downloads.</p>
                  </div>

                  {/* PWA/Capacitor setup suite app card */}
                  <div 
                    onClick={() => navigateTo('export_suite')}
                    className={`p-4 rounded-2xl border cursor-pointer ${
                      activeApp === 'export_suite' ? 'border-teal-400 bg-slate-900/80' : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider block">4. Capacitor Export</span>
                      <Download className="w-4 h-4 text-teal-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 h-10 overflow-hidden text-ellipsis">Ferramenta para envelopar de forma definitiva a IDE em um APK de produção.</p>
                  </div>

                </div>

                <button 
                  onClick={() => setIsOverviewOpen(false)}
                  className="w-full py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-bold text-xs"
                >
                  Fechar Overview [Voltar ao App Atual]
                </button>
              </div>
            )}

            {/* A. VIEWPORT APP: THE MAIN IDE COMPILATOR (MOUNTED HERE!) */}
            {activeApp === 'ide' && (
              <div className="flex-grow flex flex-col h-full overflow-hidden relative">
                {children}
              </div>
            )}

            {/* B. VIEWPORT APP: THE LAUNCHER SCREEN (ANDROID HOME SCREEN COAT!) */}
            {activeApp === 'launcher' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#121317] via-[#1c1d24] to-[#252834] p-8 flex flex-col justify-between overflow-y-auto">
                
                {/* Search Android Assistant Bar Mockup */}
                <div className="w-full max-w-lg mx-auto bg-slate-900/50 p-3 rounded-full border border-slate-800 flex items-center justify-between select-text mt-4">
                  <div className="flex items-center space-x-3.5 pl-2">
                    <Search className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                    <span className="text-xs text-slate-500 font-medium">Ok Google, pesquisar sandbox compilado...</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-[#3DDC84]/15 px-3 py-1 rounded-full border border-[#3DDC84]/25">
                    <Sparkles className="w-3.5 h-3.5 text-[#3DDC84]" />
                    <span className="text-[10.5px] font-black uppercase text-[#3DDC84] font-mono leading-none tracking-wide">Gemini 1.5 Ready</span>
                  </div>
                </div>

                {/* GRID OF APPS LAUNCHER */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-6 max-w-5xl mx-auto py-10 w-full select-none justify-items-center">
                  
                  {/* IDE app shortcut */}
                  <div 
                    onClick={() => navigateTo('ide')}
                    style={{ '--theme-shadow': `${themeColor}20` } as React.CSSProperties}
                    className="flex flex-col items-center gap-2 group cursor-pointer transition transform hover:scale-[1.05]"
                  >
                    <div className="w-16 h-16 rounded-[22px] bg-slate-950 border-2 border-slate-800 group-hover:border-[#3DDC84] flex items-center justify-center shadow-lg transition duration-300 transform group-hover:rotate-6">
                      <div className="w-11 h-11 rounded-xl bg-[#3DDC84]/15 text-[#3DDC84] flex items-center justify-center border border-[#3DDC84]/35 font-extrabold uppercase font-mono text-[11px] select-none tracking-wider">
                        IDE
                      </div>
                    </div>
                    <span className="text-xs text-slate-200 font-bold tracking-wide select-none">Studio Sandbox</span>
                  </div>

                  {/* Play store app shortcut */}
                  <div 
                    onClick={() => navigateTo('play_store')}
                    className="flex flex-col items-center gap-2 group cursor-pointer transition transform hover:scale-[1.05]"
                  >
                    <div className="w-16 h-16 rounded-[22px] bg-slate-950 border-2 border-slate-850 group-hover:border-indigo-400 flex items-center justify-center shadow-lg transition duration-300">
                      <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 font-black font-mono text-center text-xs">
                        🛒
                      </div>
                    </div>
                    <span className="text-xs text-slate-200 font-bold tracking-wide select-none">Google Play</span>
                  </div>

                  {/* Google Chrome simulator app shortcut */}
                  <div 
                    onClick={() => navigateTo('chrome')}
                    className="flex flex-col items-center gap-2 group cursor-pointer transition transform hover:scale-[1.05]"
                  >
                    <div className="w-16 h-16 rounded-[22px] bg-slate-950 border-2 border-slate-850 group-hover:border-amber-400 flex items-center justify-center shadow-lg transition">
                      <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <Chrome className="w-6 h-6 animate-pulse" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-200 font-bold tracking-wide select-none">Navegador Web</span>
                  </div>

                  {/* Android Core settings shortcut */}
                  <div 
                    onClick={() => navigateTo('settings')}
                    className="flex flex-col items-center gap-2 group cursor-pointer transition transform hover:scale-[1.05]"
                  >
                    <div className="w-16 h-16 rounded-[22px] bg-slate-950 border-2 border-slate-850 group-hover:border-slate-400 flex items-center justify-center shadow-lg transition">
                      <div className="w-11 h-11 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center border border-slate-700">
                        <Settings className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-200 font-bold tracking-wide select-none">Config Gerais</span>
                  </div>

                  {/* Native IDE wrapper setup suite shortcut */}
                  <div 
                    onClick={() => navigateTo('export_suite')}
                    className="flex flex-col items-center gap-2 group cursor-pointer transition transform hover:scale-[1.05]"
                  >
                    <div className="w-16 h-16 rounded-[22px] bg-slate-950 border-2 border-slate-850 group-hover:border-teal-400 flex items-center justify-center shadow-lg transition">
                      <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/25">
                        <Download className="w-5 h-5 text-teal-400" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-200 font-bold tracking-wide font-mono text-[10.5px]">Wrapper APK</span>
                  </div>

                  {/* Dynamic Published/Previewed app launcher */}
                  {installedApps.includes('user_app') && (
                    <div 
                      onClick={() => navigateTo('chrome')} // Opens development simulator!
                      className="flex flex-col items-center gap-2 group cursor-pointer transition transform hover:scale-[1.05]"
                    >
                      <div className="w-16 h-16 rounded-[22px] bg-[#121315] border-2 border-[#3DDC84]/40 group-hover:border-[#3DDC84] flex items-center justify-center shadow-lg transition duration-300 animate-fade-in">
                        <div 
                          style={{ backgroundColor: `${themeColor}20` }}
                          className="w-11 h-11 rounded-xl flex items-center justify-center border text-[#3DDC84]"
                        >
                          {getAppIcon(appIcon, 'w-6 h-6')}
                        </div>
                      </div>
                      <span className="text-xs text-slate-200 font-bold tracking-wide select-none truncate max-w-[80px] text-center block">{appName}</span>
                    </div>
                  )}

                </div>

                {/* Dock bar background representing Android Tablet style */}
                <div className="w-full max-w-xl mx-auto bg-slate-950/60 p-4.5 rounded-[28px] border border-white/5 backdrop-blur flex justify-around select-none mb-6 shrink-0 relative items-center shadow-inner">
                  
                  {/* Small launcher design items */}
                  <div className="w-12 h-12 rounded-[16px] bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center hover:scale-105 transition cursor-pointer" onClick={() => navigateTo('ide')}>
                    <Layers className="w-5.5 h-5.5 text-indigo-400" />
                  </div>
                  
                  <div className="w-12 h-12 rounded-[16px] bg-teal-500/15 border border-teal-500/20 flex items-center justify-center hover:scale-105 transition cursor-pointer" onClick={() => navigateTo('export_suite')}>
                    <Download className="w-5.5 h-5.5 text-teal-400" />
                  </div>

                  <div className="w-10 h-1 border-t-2 border-slate-700/60 mt-1 self-end absolute bottom-1.5 inset-x-1/2 -transform -translate-x-1/2 w-8" />
                </div>

              </div>
            )}

            {/* C. VIEWPORT APP: PLAY STORE SIMULATOR (HIGH-FIDELITY MARKETING EXPERIENCE) */}
            {activeApp === 'play_store' && (
              <div className="absolute inset-0 bg-[#0d0f12] text-slate-100 p-6 flex flex-col justify-between overflow-y-auto scrollbar-thin select-text">
                
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-full bg-[#3DDC84] w-2.5 h-2.5 animate-pulse" />
                    <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Google Play Console Simulator V2</span>
                  </div>
                  <button 
                    onClick={() => navigateTo('launcher')}
                    className="text-indigo-400 hover:text-white transition text-[11px] font-bold"
                  >
                    &larr; Voltar à Tela de Início
                  </button>
                </div>

                {/* Publish details box representing store listing page */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-800">
                  
                  {/* App Visual badge info */}
                  <div className="md:col-span-1 flex flex-col items-center text-center p-4 bg-[#14161B] rounded-2xl border border-slate-850 h-fit">
                    <div className="w-24 h-24 rounded-[32px] bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-lg relative mb-4">
                      <div 
                        style={{ backgroundColor: `${themeColor}20` }}
                        className="w-18 h-18 rounded-2xl flex items-center justify-center border text-[#3DDC84]"
                      >
                        {getAppIcon(appIcon, 'w-10 h-10')}
                      </div>
                    </div>

                    <h1 className="text-base font-extrabold text-slate-100">{appName}</h1>
                    <span className="text-xs text-indigo-400 font-mono tracking-wide mt-1 block">{appPackage}</span>

                    {/* Dynamic Installation triggers */}
                    {installedApps.includes('user_app') ? (
                      <span className="w-full mt-5 py-2.5 bg-slate-900 text-slate-400 rounded-xl text-xs font-bold font-mono border border-slate-800 block">
                        ✔️ Aplicativo Instalado no Dispositivo
                      </span>
                    ) : (
                      <button
                        onClick={handleInstallAppSim}
                        disabled={isInstalling}
                        className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-2"
                      >
                        {isInstalling ? (
                          <>
                            <span className="animate-spin text-white">⏳</span>
                            <span>Baixando {installProgress}%...</span>
                          </>
                        ) : (
                          <span>⚡ Instalar no Emulador</span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* App description and reviews */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="p-4 bg-[#14161B] rounded-2xl border border-slate-850 space-y-3">
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[#3DDC84] font-mono">LISTAGEM DE PROCESSO DA PLAY STORE</span>
                      <h3 className="text-xs font-bold text-slate-100">Como funciona a publicação simulada?</h3>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">
                        Qualquer alteração feita no layout, ícone, cores, ou pacotes do <b>Android Studio Web Sandbox</b> atualiza este painel em tempo real. Pressione o botão para instalar no dispositivo e adicione instantaneamente seu atalho interativo customizado na Área de Trabalho!
                      </p>

                      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Downloads:</span>
                          <span className="text-xs font-mono font-bold text-slate-200">244K [Simulado]</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Versão:</span>
                          <span className="text-xs font-mono font-bold text-teal-400">v{appVersion}</span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase text-slate-500 font-bold block mb-1">Status:</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">Qualificado</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#14161B] rounded-2xl border border-slate-850 space-y-3">
                      <span className="text-[9px] text-slate-400 uppercase font-mono tracking-widest block font-bold">AVALIAÇÕES DE DESENVOLVEDOR AUTOMÁTICAS</span>
                      
                      <div className="space-y-2 text-[10px] leading-relaxed">
                        <div className="p-2.5 bg-slate-950/60 rounded border border-slate-850/80">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">alissonbinho980@gmail.com</span>
                            <span className="text-amber-400">★★★★★</span>
                          </div>
                          <p className="text-slate-400 mt-1">"Gerador de layouts extremamente limpo e robusto. Os arquivos Gradle e manifesto sincronizam na hora!"</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* D. VIEWPORT APP: DYNAMIC DEVELOPMENT CHROMIUM CLIENT MOCK */}
            {activeApp === 'chrome' && (
              <div className="absolute inset-0 bg-[#0f1115] p-5 flex flex-col justify-between overflow-y-auto">
                
                <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-105 flex items-center font-mono">
                      <Chrome className="text-[#3DDC84] w-4 h-4 mr-2" />
                      Chromium Developer client sandbox
                    </h3>
                    <p className="text-[9.5px] text-slate-500">Simule a execução web responsiva do aplicativo e visualize logs da WebView.</p>
                  </div>
                  <div className="bg-[#17191E] border border-slate-750 rounded-xl p-1 px-3 text-[10.5px] font-mono text-cyan-300 select-all">
                    ● App Executando em: http://localhost:5173
                  </div>
                </div>

                {/* Fully interactive mock of active parsed XML viewport simulation */}
                <div className="my-8 bg-slate-950 rounded-2xl border border-slate-850 p-6 flex-grow flex items-center justify-center">
                  <div className="w-full max-w-sm rounded-[32px] border-6 border-slate-800 bg-slate-900 p-4 shadow-xl select-none">
                    
                    {/* Embedded preview interface reflecting layouts changes */}
                    <div className="rounded-[22px] bg-[#121316] py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
                      
                      {/* Interactive Visual launcher icon */}
                      <div className="w-14 h-14 rounded-2xl bg-[#3DDC84]/15 text-[#3DDC84] flex items-center justify-center border border-[#3DDC84]/35 relative mb-2 shadow">
                        {getAppIcon(appIcon, 'w-8 h-8')}
                      </div>

                      <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide leading-none">{appName}</h3>
                      <p className="text-[10px] text-slate-400 font-mono select-text">{appPackage}</p>
                      
                      <div className="w-full h-[1px] bg-slate-800" />

                      <p className="text-[11px] text-slate-500 leading-relaxed leading-normal">
                        Simulação estrita da interface client compilada para o {appName}. Todos os inputs visuais e tags XML alterados na IDE interligam este preview automaticamente.
                      </p>

                      <div className="flex justify-center w-full pt-4">
                        <button 
                          onClick={() => alert(`Iniciando ${appName} Sandbox WebView client!`)}
                          className="py-1.8 px-5 bg-[#3DDC84]/15 border border-[#3DDC84]/30 hover:bg-[#3DDC84]/20 text-[#3DDC84] text-[10.5px] font-bold rounded-lg transition transform active:scale-95 cursor-pointer"
                        >
                          Atuar na WebView
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* E. VIEWPORT APP: tablet internal configurations summary */}
            {activeApp === 'settings' && (
              <div className="absolute inset-0 bg-[#0d0e11] p-6 flex flex-col justify-between overflow-y-auto select-text">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center font-mono">
                    <Settings className="w-4 h-4 text-[#3DDC84] mr-2" />
                    CONFIGURAÇÕES DO SISTEMA OPERACIONAL ANDROID 15
                  </h3>
                  <p className="text-[10px] text-slate-500">Monitore estatísticas de VM, depure drivers Gráficos e analise pacotes locais.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6">
                  
                  {/* System statistics */}
                  <div className="p-4 bg-[#14151a] rounded-xl border border-slate-850 space-y-3 font-mono text-[10.5px]">
                    <span className="text-[8.5px] uppercase font-bold text-indigo-400 tracking-wider font-sans">RAM & PROCESSADOR</span>
                    
                    <div className="flex justify-between border-b border-slate-800/50 pb-1.5 pt-1">
                      <span className="text-slate-400">Platform OS:</span>
                      <span className="text-slate-200">Android 15 (Upside-Down-Cake)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                      <span className="text-slate-400 font-mono">VM Runtime:</span>
                      <span className="text-slate-200 font-mono text-[#3DDC84]">ART (Android Runtime) Core</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/50 pb-1.5">
                      <span className="text-slate-400">Total Simulated RAM:</span>
                      <span className="text-slate-250">8.0 GB LPDDR5X</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">GPU Renderer:</span>
                      <span className="text-slate-200">Adreno Gen 7 Vulkan 1.3</span>
                    </div>
                  </div>

                  {/* Android developer commands */}
                  <div className="p-4 bg-[#14151a] rounded-xl border border-slate-850 space-y-3">
                    <span className="text-[8.5px] uppercase font-bold text-amber-500 tracking-wider font-mono">DEVELOPER OPTIONS OVERLAY</span>
                    
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-850">
                        <div>
                          <span className="text-slate-200 font-bold block text-[10.5px]">USB Debugging: Ativado</span>
                          <span className="text-[9.2px] text-slate-500 font-mono">Conexão ADB ativa com localhost:5554</span>
                        </div>
                        <input type="checkbox" defaultChecked className="accent-[#3DDC84]" />
                      </div>

                      <div className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-850">
                        <div>
                          <span className="text-slate-200 font-bold block text-[10.5px]">Force Edge-to-Edge: Ativo</span>
                          <span className="text-[9.2px] text-slate-500 font-mono">Compatibilidade visual com Android 15</span>
                        </div>
                        <input type="checkbox" defaultChecked className="accent-[#3DDC84]" />
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* F. CAPACITOR WRAPPER EXPORTER SUITE (ACTUAL ANDROID APP TRANSFORMER!) */}
            {activeApp === 'export_suite' && (
              <div className="absolute inset-0 bg-[#0c0d10] p-6 flex flex-col justify-between overflow-y-auto select-text scrollbar-thin">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center font-mono uppercase tracking-widest">
                    <Download className="w-4 h-4 text-teal-400 mr-2" />
                    BOTO DE EXPORTAÇÃO CAPACITOR NATIVE SUITE
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">Gere, configure e instale este Web IDE Android Studio Sandbox como um aplicativo nativo usando os wrappers do Capacitor.</p>
                </div>

                <div className="space-y-5 py-5 select-text">
                  
                  {/* Banner summary */}
                  <div className="p-4 bg-teal-500/5 rounded-xl border border-teal-500/15 flex items-start space-x-3 select-text">
                    <Info className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" />
                    <div className="text-[11px] leading-relaxed text-slate-300">
                      <span className="font-extrabold text-teal-300 block mb-1">Como transformar esta IDE em aplicativo Android Nativo (.apk / .aab)</span>
                      Para envelopar e gerar o binário de compilação da IDE e executá-lo em seu celular real, você pode usar o <b>Capacitor da Ionic</b>. O Capacitor é o envelopamento nativo mais leve para converter projetos React/Vite de forma performática.
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    
                    {/* Setup commands step-by-step checklist */}
                    <div className="p-4 bg-[#131519] rounded-xl border border-slate-850 space-y-3.5 select-text select-all">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Passo a Passo: Comandos para Executar no Terminal</span>
                      
                      <div className="space-y-2 font-mono text-[10px]">
                        <div className="p-2 bg-slate-950 rounded border border-slate-850">
                          <div className="flex items-center justify-between text-indigo-400 font-extrabold text-[8.5px] mb-1">
                            <span>PASSO 1: INSTALAR WRAPPER CORE</span>
                            <button onClick={() => triggerCopy('npm install @capacitor/core @capacitor/cli', 'p1')} className="text-slate-400 hover:text-white transition">Copiar</button>
                          </div>
                          <code>npm install @capacitor/core @capacitor/cli</code>
                          {copiarFeed === 'p1' && <span className="text-[8px] text-emerald-400 font-bold block mt-1">✓ Copiado!</span>}
                        </div>

                        <div className="p-2 bg-slate-950 rounded border border-slate-850">
                          <div className="flex items-center justify-between text-indigo-400 font-extrabold text-[8.5px] mb-1">
                            <span>PASSO 2: INICIALIZAR CAPACITOR</span>
                            <button onClick={() => triggerCopy(`npx cap init "${appName}" "${appPackage}" --web-dir=dist`, 'p2')} className="text-slate-400 hover:text-white transition">Copiar</button>
                          </div>
                          <code>npx cap init "{appName}" "{appPackage}" --web-dir=dist</code>
                          {copiarFeed === 'p2' && <span className="text-[8px] text-emerald-400 font-bold block mt-1">✓ Copiado!</span>}
                        </div>

                        <div className="p-2 bg-slate-950 rounded border border-slate-850">
                          <div className="flex items-center justify-between text-indigo-400 font-extrabold text-[8.5px] mb-1">
                            <span>PASSO 3: ADICIONAR PLATAFORMA ANDROID</span>
                            <button onClick={() => triggerCopy('npm install @capacitor/android && npx cap add android', 'p3')} className="text-slate-400 hover:text-white transition">Copiar</button>
                          </div>
                          <code>npm install @capacitor/android && npx cap add android</code>
                          {copiarFeed === 'p3' && <span className="text-[8px] text-emerald-400 font-bold block mt-1">✓ Copiado!</span>}
                        </div>

                        <div className="p-2 bg-slate-950 rounded border border-slate-850">
                          <div className="flex items-center justify-between text-indigo-400 font-extrabold text-[8.5px] mb-1">
                            <span>PASSO 4: COMPILAR E ABRIR NO ANDROID STUDIO</span>
                            <button onClick={() => triggerCopy('npm run build && npx cap sync && npx cap open android', 'p4')} className="text-slate-400 hover:text-white transition">Copiar</button>
                          </div>
                          <code>npm run build && npx cap sync && npx cap open android</code>
                          {copiarFeed === 'p4' && <span className="text-[8px] text-emerald-400 font-bold block mt-1">✓ Copiado!</span>}
                        </div>
                      </div>
                    </div>

                    {/* Downloadable Capacitor config files visualizer */}
                    <div className="p-4 bg-[#131519] rounded-xl border border-slate-850 space-y-3 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Download: Capacitor Config Manifest</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                          Consiga o código-fonte gerado em tempo real do arquivo de configuração para incluir em seu diretório de instalação:
                        </p>

                        <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[9px] text-cyan-300 select-all leading-normal mt-3 whitespace-pre scrollbar-thin max-h-40 overflow-y-auto">
{`{
  "appId": "${appPackage}",
  "appName": "${appName}",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "android": {
    "allowMixedContent": true
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1500,
      "backgroundColor": "#131519"
    }
  }
}`}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const conf = `{
  "appId": "${appPackage}",
  "appName": "${appName}",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "android": {
    "allowMixedContent": true
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1500,
      "backgroundColor": "#131519"
    }
  }
}`;
                          const blob = new Blob([conf], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'capacitor.config.json';
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center space-x-1.8 cursor-pointer mt-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Baixar capacitor.config.json</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>

          {/* SIMULATED ANDROID 15 SOFT KEYS INTERACTIVE NAVIGATION ROW */}
          <div className="h-10 bg-[#07080a] border-t border-slate-950 flex items-center justify-center space-x-14 md:space-x-24 select-none shrink-0 z-45">
            
            {/* Soft Back: Triangle (with small rotation) */}
            <button 
              onClick={handleBack}
              title="Voltar / Retornar"
              className="w-8 h-8 rounded-full hover:bg-slate-900 active:bg-slate-850 flex items-center justify-center transition cursor-pointer"
            >
              <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-slate-400" />
            </button>

            {/* Soft Home: Circle */}
            <button 
              onClick={handleHome}
              title="Home (Tela de Início)"
              className="w-8 h-8 rounded-full hover:bg-slate-900 active:bg-slate-850 flex items-center justify-center transition cursor-pointer"
            >
              <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-400" />
            </button>

            {/* Soft Overview/Apps: Square */}
            <button 
              onClick={handleOverview}
              title="Multitask Switcher (Overview)"
              className="w-8 h-8 rounded-full hover:bg-slate-900 active:bg-slate-850 flex items-center justify-center transition cursor-pointer"
            >
              <div className="w-3 h-3 border-2 border-slate-400 rounded-sm" />
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}
