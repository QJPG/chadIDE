/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Layers, 
  Database, 
  Plus, 
  Trash2, 
  FolderPlus, 
  CheckCircle2, 
  ShieldAlert, 
  Sliders, 
  Cpu, 
  Lock, 
  User, 
  Key, 
  RefreshCw, 
  FileCode, 
  Wrench,
  Sparkles,
  Info,
  Shield,
  Smartphone,
  ChevronRight,
  Code
} from 'lucide-react';
import { SdkVersionConfig } from '../utils/androidLibraries';
import { IDFile } from './IdeSidebar';

interface ProjectManagerProps {
  appName: string;
  setAppName: (name: string) => void;
  appPackage: string;
  setAppPackage: (pkg: string) => void;
  appVersion: string;
  setAppVersion: (ver: string) => void;
  appIcon: string;
  setAppIcon: (icon: string) => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
  sdkConfig: SdkVersionConfig;
  setSdkConfig: React.Dispatch<React.SetStateAction<SdkVersionConfig>>;
  files: IDFile[];
  setFiles: React.Dispatch<React.SetStateAction<IDFile[]>>;
  activeFile: string;
  setActiveFile: (path: string) => void;
  onAddLogcat: (log: string) => void;
  triggerGradleSync: () => void;
}

interface SimulatedModule {
  name: string;
  type: 'library' | 'feature' | 'app';
  packageName: string;
  compileSdk: number;
  dependencies: string[]; // List of other module names it depends on
  description: string;
}

export default function ProjectManager({
  appName,
  setAppName,
  appPackage,
  setAppPackage,
  appVersion,
  setAppVersion,
  appIcon,
  setAppIcon,
  themeColor,
  setThemeColor,
  sdkConfig,
  setSdkConfig,
  files,
  setFiles,
  activeFile,
  setActiveFile,
  onAddLogcat,
  triggerGradleSync
}: ProjectManagerProps) {
  const [activeTab, setActiveTab] = useState<'platform' | 'modules' | 'activities' | 'signing'>('platform');

  // --- 1. SIMULATED MODULES STATE ---
  const [modules, setModules] = useState<SimulatedModule[]>([
    {
      name: ':app',
      type: 'app',
      packageName: appPackage,
      compileSdk: sdkConfig.compileSdk,
      dependencies: [],
      description: 'Módulo principal do aplicativo Android. Contém as views e o fluxo principal de execução.'
    },
    {
      name: ':core-database',
      type: 'library',
      packageName: `${appPackage}.database`,
      compileSdk: sdkConfig.compileSdk,
      dependencies: [],
      description: 'Biblioteca local para persistência de dados. Encapsula o SQLite e cache local.'
    }
  ]);

  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleType, setNewModuleType] = useState<'library' | 'feature'>('library');
  const [newModulePackage, setNewModulePackage] = useState(`${appPackage}.module`);
  const [newModuleDesc, setNewModuleDesc] = useState('');

  // Keep :app packageName sync'd with parent appPackage
  useEffect(() => {
    setModules(prev => prev.map(m => m.name === ':app' ? { ...m, packageName: appPackage } : m));
  }, [appPackage]);

  // Keep :app compileSdk sync'd with parent compileSdk
  useEffect(() => {
    setModules(prev => prev.map(m => m.name === ':app' ? { ...m, compileSdk: sdkConfig.compileSdk } : m));
  }, [sdkConfig.compileSdk]);

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    let cleanName = newModuleName.trim();
    if (!cleanName.startsWith(':')) {
      cleanName = `:${cleanName}`;
    }

    // Replace spaces or special chars
    cleanName = cleanName.toLowerCase().replace(/[^a-z0-9:-]/g, '');

    if (modules.some(m => m.name === cleanName)) {
      alert(`Módulo "${cleanName}" já existe!`);
      return;
    }

    const newModule: SimulatedModule = {
      name: cleanName,
      type: newModuleType,
      packageName: newModulePackage.trim() || `${appPackage}.${cleanName.substring(1)}`,
      compileSdk: sdkConfig.compileSdk,
      dependencies: [],
      description: newModuleDesc.trim() || `Biblioteca auxiliar para isolação de escopo do submódulo ${cleanName}.`
    };

    setModules(prev => [...prev, newModule]);
    onAddLogcat(`I/ProjectManager: Criado novo submódulo Gradle: ${cleanName}`);
    
    // Add virtual folder file structure
    const virtualFilesToAdd: IDFile[] = [
      {
        name: 'build.gradle',
        path: `${cleanName.substring(1)}/build.gradle`,
        type: 'gradle',
        content: `plugins {
    id 'com.android.library'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${newModule.packageName}'
    compileSdk ${newModule.compileSdk}

    defaultConfig {
        minSdk ${sdkConfig.minSdk}
        consumerProguardFiles "consumer-rules.pro"
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
}`
      }
    ];

    setFiles(prev => [...prev, ...virtualFilesToAdd]);
    triggerGradleSync();

    // Reset module inputs
    setNewModuleName('');
    setNewModuleDesc('');
    setNewModulePackage(`${appPackage}.module`);
  };

  const handleDeleteModule = (moduleName: string) => {
    if (moduleName === ':app') {
      alert('Você não pode remover o submódulo raiz ":app"!');
      return;
    }
    if (window.confirm(`Tem certeza de que deseja deletar o módulo "${moduleName}" e todas as suas configurações virtuais?`)) {
      setModules(prev => prev.filter(m => m.name !== moduleName));
      setFiles(prev => prev.filter(f => !f.path.startsWith(`${moduleName.substring(1)}/`)));
      onAddLogcat(`W/ProjectManager: Removido submódulo Gradle: ${moduleName}`);
      triggerGradleSync();
    }
  };

  const handleToggleModuleDependency = (targetModuleName: string, dependsOnName: string) => {
    if (targetModuleName === dependsOnName) return;

    setModules(prev => prev.map(m => {
      if (m.name === targetModuleName) {
        const isDependent = m.dependencies.includes(dependsOnName);
        const updatedDependencies = isDependent
          ? m.dependencies.filter(d => d !== dependsOnName)
          : [...m.dependencies, dependsOnName];

        onAddLogcat(`I/ProjectManager: Atualizado dependências de ${targetModuleName} --> [${updatedDependencies.join(', ')}]`);
        return {
          ...m,
          dependencies: updatedDependencies
        };
      }
      return m;
    }));

    // Update the app's build.gradle in case it affects :app
    if (targetModuleName === ':app') {
      setTimeout(() => {
        triggerGradleSync();
      }, 200);
    }
  };

  // --- 2. SIGNING KEYSTORE GENERATOR STATE ---
  const [keystoreExists, setKeystoreExists] = useState(false);
  const [keystoreAlias, setKeystoreAlias] = useState('androiddebugkey');
  const [keystorePass, setKeystorePass] = useState('android');
  const [keyValidity, setKeyValidity] = useState(25);
  const [ownerName, setOwnerName] = useState('Android Developer');
  const [orgUnit, setOrgUnit] = useState('Sandbox Laboratory');
  const [signingType, setSigningType] = useState<'debug' | 'release'>('debug');

  const handleGenerateKeystore = (e: React.FormEvent) => {
    e.preventDefault();
    setKeystoreExists(true);
    onAddLogcat(`I/ProjectSigning: Keystore criptografada gerada com sucesso! Alvo: sha256withRSA de 2048 bits.`);
    onAddLogcat(`I/ProjectSigning: Assinatura adicionada nas configurações do build.gradle (${signingType} buildType).`);
    
    // Add proguard/signing dummy reference in proguard rules or build gradle virtual settings if needed
    setFiles(prev => prev.map(f => {
      if (f.name === 'proguard-rules.pro') {
        return {
          ...f,
          content: `${f.content}\n# Adicionadas diretivas de integridade para a Keystore de ${ownerName}\n-keepattributes Signature`
        };
      }
      return f;
    }));
  };

  // --- 3. PLATFORMS & COMPATIBILITY CHECKERS ---
  const handleFeatureToggle = (apiLevel: number, flagName: string, enabled: boolean) => {
    onAddLogcat(`I/AndroidManifest: Toggled compliance flag for API ${apiLevel} --> ${flagName}: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    
    // Inject permission or helper tags dynamically in AndroidManifest.xml
    setFiles(prev => prev.map(f => {
      if (f.name === 'AndroidManifest.xml') {
        let content = f.content;
        
        if (flagName === 'scopedStorage' && enabled) {
          // Add legacy storage option
          if (!content.includes('android:requestLegacyExternalStorage')) {
            content = content.replace('<application', '<application android:requestLegacyExternalStorage="true"');
          }
        } else if (flagName === 'scopedStorage' && !enabled) {
          content = content.replace(' android:requestLegacyExternalStorage="true"', '');
        }

        if (flagName === 'notificationPermission' && enabled) {
          if (!content.includes('android.permission.POST_NOTIFICATIONS')) {
            content = content.replace('</manifest>', '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n</manifest>');
          }
        } else if (flagName === 'notificationPermission' && !enabled) {
          content = content.replace('    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n', '');
        }

        if (flagName === 'photoSelection' && enabled) {
          if (!content.includes('android.permission.READ_MEDIA_VISUAL_USER_SELECTED')) {
            content = content.replace('</manifest>', '    <uses-permission android:name="android.permission.READ_MEDIA_VISUAL_USER_SELECTED" />\n</manifest>');
          }
        } else if (flagName === 'photoSelection' && !enabled) {
          content = content.replace('    <uses-permission android:name="android.permission.READ_MEDIA_VISUAL_USER_SELECTED" />\n', '');
        }

        return { ...f, content };
      }
      return f;
    }));
  };

  // --- 4. ACTIVITIES LIST & MANIFEST MANIPULATOR ---
  const [activitiesList, setActivitiesList] = useState<{name: string, isLauncher: boolean, fileExists: boolean}[]>([
    { name: 'MainActivity', isLauncher: true, fileExists: true }
  ]);

  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityLauncher, setNewActivityLauncher] = useState(false);

  // Sync activities from AndroidManifest.xml parsed
  useEffect(() => {
    const manifestFile = files.find(f => f.name === 'AndroidManifest.xml');
    if (!manifestFile) return;

    // Fetch activities matching names
    const matches = Array.from(manifestFile.content.matchAll(/<activity\s+android:name="\.([^"]+)"/g));
    if (matches.length > 0) {
      const newList = matches.map(m => {
        const name = m[1];
        
        // Check if launcher intent exists inside this visual activity tags
        const fullManifest = manifestFile.content;
        const activityStartIdx = fullManifest.indexOf(`<activity android:name=".${name}"`);
        let activityEndIdx = fullManifest.indexOf('</activity>', activityStartIdx);
        if (activityEndIdx === -1) {
          // Self closing
          activityEndIdx = fullManifest.indexOf('/>', activityStartIdx);
        }

        const activityBlock = fullManifest.substring(activityStartIdx, activityEndIdx);
        const holdsLauncher = activityBlock.includes('android.intent.action.MAIN') && activityBlock.includes('android.intent.category.LAUNCHER');

        // Check if java or kotlin file exists
        const kFileExists = files.some(f => f.name === `${name}.kt` || f.name === `${name}.java`);

        return {
          name,
          isLauncher: holdsLauncher,
          fileExists: kFileExists
        };
      });

      // Avoid infinite cycles if they are identical
      const listA = JSON.stringify(activitiesList.map(a => a.name + a.isLauncher));
      const listB = JSON.stringify(newList.map(a => a.name + a.isLauncher));
      if (listA !== listB) {
        setActivitiesList(newList);
      }
    }
  }, [files]);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityName.trim()) return;

    const trimmedName = newActivityName.trim().replace(/\s+/g, '');
    const cleanName = trimmedName.endsWith('Activity') ? trimmedName : `${trimmedName}Activity`;

    if (activitiesList.some(a => a.name === cleanName)) {
      alert(`Uma Activity com o nome "${cleanName}" já existe!`);
      return;
    }

    onAddLogcat(`I/ProjectManager: Criando nova Activity: ${cleanName}`);

    // 1. Rewrite strings or layouts if needed
    // Add layout file activity_sub.xml
    const newLayoutName = `activity_${cleanName.toLowerCase().replace('activity', '')}.xml`;
    const newLayoutPath = `app/src/main/res/layout/${newLayoutName}`;

    // Create companion files
    const newActivityClassFile: IDFile = {
      name: `${cleanName}.kt`,
      path: `app/src/main/java/com/example/android/sandbox/${cleanName}.kt`,
      type: 'kt',
      content: `package com.example.android.sandbox

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import android.widget.TextView
import android.widget.LinearLayout
import android.view.Gravity

/**
 * Android Studio Sandbox Generated secondary activity.
 * Target compilation: Android 11+
 */
class ${cleanName} : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Simulated Dynamic Layout Binding
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(android.graphics.Color.parseColor("#15171B"))
        }

        val text = TextView(this).apply {
            text = "Ecrã Visual da activity: ${cleanName}"
            textSize = 18f
            setTextColor(android.graphics.Color.WHITE)
            gravity = Gravity.CENTER
        }
        
        root.addView(text)
        setContentView(root)
        
        android.util.Log.i("AndroidSandbox", "[LAUNCH] Activity inicializada: ${cleanName}")
    }
}`
    };

    const newLayoutFile: IDFile = {
      name: newLayoutName,
      path: newLayoutPath,
      type: 'xml',
      content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_match"
    android:layout_height="match_match"
    android:orientation="vertical"
    android:gravity="center"
    android:background="#15171B">

    <TextView
        android:id="@+id/textViewTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Boilerplate layout para ${cleanName}"
        android:textColor="#FFFFFF"
        android:textSize="18sp"
        android:textStyle="bold" />

</LinearLayout>`
    };

    // 2. Insert into AndroidManifest.xml
    setFiles(prev => {
      let updatedFiles = [...prev, newActivityClassFile, newLayoutFile];
      
      const manifestIdx = updatedFiles.findIndex(f => f.name === 'AndroidManifest.xml');
      if (manifestIdx !== -1) {
        const manifest = updatedFiles[manifestIdx];
        
        // If this activity wants to be the Launcher, we should remove the intent filter from other activities
        let manifestContent = manifest.content;
        
        let newActivityXml = '';
        if (newActivityLauncher) {
          // Stripper: remove existing intent filters with Launcher
          manifestContent = manifestContent.replace(
            /<intent-filter>[\s\S]*?android\.intent\.category\.LAUNCHER[\s\S]*?<\/intent-filter>/g, 
            ''
          );
          
          newActivityXml = `        <activity android:name=".${cleanName}"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>\n`;
        } else {
          newActivityXml = `        <activity android:name=".${cleanName}" android:exported="false" />\n`;
        }

        // Insert new activity right before </application>
        manifestContent = manifestContent.replace('</application>', `${newActivityXml}    </application>`);
        
        updatedFiles[manifestIdx] = {
          ...manifest,
          content: manifestContent
        };
      }

      return updatedFiles;
    });

    onAddLogcat(`I/AndroidManifest: Registada a classe .${cleanName} no Manifesto Android.`);
    setNewActivityName('');
    setNewActivityLauncher(false);
  };

  const setLauncherActivity = (activityName: string) => {
    setFiles(prev => {
      const manifestIdx = prev.findIndex(f => f.name === 'AndroidManifest.xml');
      if (manifestIdx === -1) return prev;

      const manifest = prev[manifestIdx];
      let content = manifest.content;

      // 1. Remove all launcher intent blocks completely first
      content = content.replace(/<intent-filter>[\s\S]*?android.intent.category.LAUNCHER[\s\S]*?<\/intent-filter>/g, '');

      // 2. Make all activities simple tags
      content = content.replace(/<activity\s+android:name="\.([^"]+)"[\s\S]*?>/g, (match, p1) => {
        return `<activity android:name=".${p1}" android:exported="false">`;
      });
      // also remove closing activity code matching if it was parsed as layout blocks
      content = content.replace(/<\/activity>/g, '');
      
      // 3. Re-inject all activity closing tags nicely apart from launcher
      content = content.replace(/<activity android:name="\.([^"]+)" android:exported="false">/g, (match, p1) => {
        if (p1 === activityName) {
          return `<activity android:name=".${p1}" android:exported="true">\n            <intent-filter>\n                <action android:name="android.intent.action.MAIN" />\n                <category android:name="android.intent.category.LAUNCHER" />\n            </intent-filter>\n        </activity>`;
        } else {
          return match + `\n        </activity>`;
        }
      });

      // Cleanup duplicated tags if any
      content = content.replace(/<\/activity>\s*<\/activity>/g, '</activity>');

      onAddLogcat(`I/AndroidManifest: Definido Launcher padrão para a classe .${activityName}`);

      const updated = [...prev];
      updated[manifestIdx] = {
        ...manifest,
        content
      };
      return updated;
    });
  };

  // Build target summaries
  const getSelectedApiDescription = () => {
    switch(sdkConfig.targetSdk) {
      case 30: return { name: 'Android 11 (R)', level: 'API 30', features: 'Scoped Storage reforçado, controle de mídias nativo e permissões de uso único de sensores.' };
      case 31: return { name: 'Android 12 (S)', level: 'API 31', features: 'Visual Material You, Splash Screen API padrão, alarmes exatos e permissão de localização aproximada.' };
      case 32: return { name: 'Android 12L (Sv2)', level: 'API 32', features: 'Otimizações visuais de grande ecrã para Tablets, telas dobráveis e modo multi-janela avançado.' };
      case 33: return { name: 'Android 13 (Tiramisu)', level: 'API 33', features: 'Requisito obrigatório de permissão para notificações, seletor de fotos restrito e preferência de idioma individualizado por app.' };
      case 34: return { name: 'Android 14 (UpsideDownCake)', level: 'API 34', features: 'Seletor de mídias restrito com acesso parcial, back-gestures preditivos e políticas rígidas de serviços em segundo plano.' };
      case 35: return { name: 'Android 15 (VanillaIceCream)', level: 'API 35', features: 'Visual Edge-to-Edge habilitado por padrão em todos os layouts, gravação parcial de ecrã e desempenho dinâmico de frame rates.' };
      default: return { name: 'Custom Platform', level: `API ${sdkConfig.targetSdk}`, features: 'Parâmetros de compilação SDK customizados.' };
    }
  };

  const currentPlat = getSelectedApiDescription();

  return (
    <div className="flex-grow h-full overflow-hidden bg-[#131519] flex select-none text-slate-100 font-sans">
      
      {/* Sub tabs project manager bar */}
      <div className="w-56 bg-[#17191E] border-r border-[#2B2D30] flex flex-col p-3.5 space-y-2 shrink-0">
        <div className="pb-3 border-b border-slate-800 mb-2">
          <div className="flex items-center space-x-1.8 text-[#3DDC84] font-mono text-[10.5px] uppercase font-bold tracking-widest pl-1">
            <Layers className="w-4 h-4" />
            <span>ESTRUTURA DE PROJETO</span>
          </div>
          <p className="text-[10px] text-slate-400 pl-1 mt-1 leading-relaxed">Gerencie compiladores, submódulos, chaves de assinatura e atividades.</p>
        </div>

        <button
          onClick={() => setActiveTab('platform')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all ${
            activeTab === 'platform'
              ? 'bg-gradient-to-r from-indigo-500/15 to-indigo-600/5 text-indigo-400 border border-indigo-500/30 font-bold'
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Smartphone className="w-4 h-4 shrink-0 shrink-0" />
          <span>Plataforma Alvo (Compatibility)</span>
        </button>

        <button
          onClick={() => setActiveTab('modules')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all ${
            activeTab === 'modules'
              ? 'bg-gradient-to-r from-indigo-500/15 to-indigo-600/5 text-indigo-400 border border-indigo-500/30 font-bold'
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Cpu className="w-4 h-4 shrink-0" />
          <span>Módulos de Código Gradle</span>
        </button>

        <button
          onClick={() => setActiveTab('activities')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all ${
            activeTab === 'activities'
              ? 'bg-gradient-to-r from-indigo-500/15 to-indigo-600/5 text-indigo-400 border border-indigo-500/30 font-bold'
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <FileCode className="w-4 h-4 shrink-0" />
          <span>Activities & Manifest</span>
        </button>

        <button
          onClick={() => setActiveTab('signing')}
          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-all ${
            activeTab === 'signing'
              ? 'bg-gradient-to-r from-indigo-500/15 to-indigo-600/5 text-indigo-400 border border-indigo-500/30 font-bold'
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 border border-transparent'
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" />
          <span>Keystore & Assinatura</span>
        </button>

        <div className="flex-grow" />

        {/* Current target platform status box */}
        <div className="bg-slate-950/85 p-3 rounded-xl border border-slate-800/80 space-y-1 select-text">
          <span className="text-[8.5px] uppercase font-mono font-bold text-slate-500 tracking-widest block">TARGET COMPILATION</span>
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-bold text-slate-200 font-mono">{currentPlat.name}</span>
          </div>
          <span className="text-[9px] text-[#3DDC84] font-mono leading-none flex items-center">
            ● compileSdk = {sdkConfig.compileSdk}
          </span>
          <span className="text-[9px] text-amber-500 font-mono leading-none flex items-center">
            ● minSdk = {sdkConfig.minSdk}
          </span>
        </div>
      </div>

      {/* Main active container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin select-text">
        
        {/* TAB 1: PLATFORM COMPATIBILITY AND COMPILING SCOPES */}
        {activeTab === 'platform' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
              <Smartphone className="w-5 h-5 text-indigo-400 animate-pulse" />
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wide font-mono">PARÂMETROS DE COMPILAÇÃO E REQUISITOS (ANDROID 11+)</h2>
                <p className="text-[10px] text-slate-400 mt-1">Defina quais APIs do Android 11 para cima se aplicam ao código gerado e ative patches de conformidade visual.</p>
              </div>
            </div>

            {/* Target SDK levels selection */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 p-5 bg-[#17191E] border border-slate-805 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wide flex items-center">
                  <Sliders className="w-4 h-4 text-emerald-400 mr-2" />
                  Alvo e Compilação dos Arquivos Fonte
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Min SDK Level (Compatibilidade Mínima)</label>
                    <select
                      value={sdkConfig.minSdk}
                      onChange={(e) => {
                        const newMin = parseInt(e.target.value);
                        setSdkConfig(prev => ({ 
                          ...prev, 
                          minSdk: newMin,
                          // Sane limits
                          targetSdk: Math.max(prev.targetSdk, newMin),
                          compileSdk: Math.max(prev.compileSdk, prev.targetSdk, newMin)
                        }));
                        onAddLogcat(`I/ProjectManager: Configurado minSdk para nível de API ${newMin}`);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white selection:bg-slate-800 outline-none focus:border-[#3DDC84]"
                    >
                      <option value={21}>Android 5.0 Lollipop (API 21)</option>
                      <option value={24}>Android 7.0 Nougat (API 24)</option>
                      <option value={26}>Android 8.0 Oreo (API 26)</option>
                      <option value={28}>Android 9.0 Pie (API 28)</option>
                      <option value={29}>Android 10 Q (API 29)</option>
                      <option value={30}>Android 11 R (API 30)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Target SDK Level (Versão Otimizada)</label>
                    <select
                      value={sdkConfig.targetSdk}
                      onChange={(e) => {
                        const newTarget = parseInt(e.target.value);
                        setSdkConfig(prev => ({
                          ...prev,
                          targetSdk: newTarget,
                          compileSdk: Math.max(prev.compileSdk, newTarget)
                        }));
                        onAddLogcat(`I/ProjectManager: Configurado targetSdk para nível de API ${newTarget}`);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-[#3DDC84]"
                    >
                      <option value={30}>Android 11 R (API 30)</option>
                      <option value={31}>Android 12 S (API 31)</option>
                      <option value={32}>Android 12L Sv2 (API 32)</option>
                      <option value={33}>Android 13 Tiramisu (API 33)</option>
                      <option value={34}>Android 14 UpsideDownCake (API 34)</option>
                      <option value={35}>Android 15 VanillaIceCream (API 35)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <div className="flex bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/10 items-start space-x-2.5">
                    <Info className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-relaxed text-slate-300">
                      <span className="font-bold text-indigo-300 block mb-0.5">Visão geral sobre o {currentPlat.name} ({currentPlat.level}):</span>
                      {currentPlat.features}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target guidelines checklist */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 flex flex-col justify-between shrink-0 space-y-3">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">STATUS DO COMPILADOR D8/R8</h3>
                  <div className="space-y-2 mt-3 text-xs">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-[#3DDC84]" />
                      <span>JDK 17 Compiler: Activo</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-[#3DDC84]" />
                      <span>Desaçucaramento (Desugaring): Sim</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-[#3DDC84]" />
                      <span>Versão Gradle: 8.2 (KT DSL)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[9.5px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Target SDK:</span>
                    <span className="text-[#3DDC84] font-bold">API {sdkConfig.targetSdk}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Build Schema:</span>
                    <span>Multi-Dex Config</span>
                  </div>
                </div>
              </div>
            </div>

            {/* API Guidelines Patch controllers */}
            <div className="p-5 bg-[#17191E] border border-slate-805 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wide flex items-center">
                <ShieldAlert className="w-4 h-4 text-amber-500 mr-2" />
                Patches de Conformidade para Plataformas Modernas (Android 11+)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Legacy external storage toggle */}
                <div className="p-3.5 rounded-xl border border-slate-805 bg-slate-950 flex flex-col justify-between h-36">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 font-mono">Scoped Storage</span>
                      <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-mono">Android 11</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Permite desativar o Scoped Storage estrito injetando <code className="text-cyan-300">requestLegacyExternalStorage</code> no Manifesto.</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <span className="text-[10px] text-slate-300 mr-2">Adicionar Patch</span>
                      <input 
                        type="checkbox" 
                        id="check_scoped_storage_patch"
                        onChange={(e) => handleFeatureToggle(30, 'scopedStorage', e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[80px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#3DDC84] peer-checked:after:bg-slate-950"></div>
                    </label>
                  </div>
                </div>

                {/* Notifications permission toggle */}
                <div className="p-3.5 rounded-xl border border-slate-805 bg-slate-950 flex flex-col justify-between h-36">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 font-mono">POST_NOTIFICATIONS</span>
                      <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 font-mono">Android 13</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Injeta de forma automática no manifesto a permissão obrigatória em tempo de execução para gerar Push Notifications.</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <span className="text-[10px] text-slate-300 mr-2">Adicionar Patch</span>
                      <input 
                        type="checkbox" 
                        id="check_notification_patch"
                        onChange={(e) => handleFeatureToggle(33, 'notificationPermission', e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[80px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#3DDC84] peer-checked:after:bg-slate-950"></div>
                    </label>
                  </div>
                </div>

                {/* Selected photos access */}
                <div className="p-3.5 rounded-xl border border-slate-805 bg-slate-950 flex flex-col justify-between h-36">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 font-mono">User Selected Media</span>
                      <span className="text-[8.5px] font-bold px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-400 font-mono">Android 14</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Emite a permissão de mídias parciais no manifesto para evitar travamento de carregamento de galerias.</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <span className="text-[10px] text-slate-300 mr-2">Adicionar Patch</span>
                      <input 
                        type="checkbox" 
                        id="check_photo_selection_patch"
                        onChange={(e) => handleFeatureToggle(34, 'photoSelection', e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[80px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#3DDC84] peer-checked:after:bg-slate-950"></div>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-MODULES CONFIGURATOR */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
              <Cpu className="w-5 h-5 text-[#3DDC84]" />
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wide font-mono">MÓDULOS DE PROJETO GRADLE (MULTI-MÓDULO INTERATIVO)</h2>
                <p className="text-[10px] text-slate-400 mt-1">Simule o ecossistema Gradle adicionando módulos separados (Application / Android Libraries) e encadeando dependências locais.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: List Modules */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wide">Módulos Registrados ({modules.length})</h3>
                
                <div className="space-y-3.5">
                  {modules.map((m) => (
                    <div key={m.name} className="p-4 rounded-xl border border-slate-800 bg-[#17191E] space-y-3 select-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className={`px-2 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider font-mono ${
                            m.type === 'app' ? 'bg-[#3DDC84]/15 text-[#3DDC84] border border-[#3DDC84]/20' : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {m.type === 'app' ? 'App Module' : 'Library Module'}
                          </div>
                          <span className="text-sm font-extrabold text-slate-100 font-mono">{m.name}</span>
                        </div>

                        {m.name !== ':app' && (
                          <button
                            onClick={() => handleDeleteModule(m.name)}
                            className="p-1 px-2 text-[10px] font-bold rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remover</span>
                          </button>
                        )}
                      </div>

                      <p className="text-[10.5px] text-slate-400 leading-relaxed">{m.description}</p>
                      
                      <div className="pt-2.5 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10.5px]">
                        <div>
                          <span className="text-slate-500 uppercase font-bold text-[8.5px]">Pacote / ID:</span>
                          <span className="text-cyan-300 font-mono ml-1.5 tracking-wider block sm:inline">{m.packageName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase font-bold text-[8.5px]">Versão Compilação:</span>
                          <span className="text-[#3DDC84] font-mono ml-1.5">API {m.compileSdk}</span>
                        </div>
                      </div>

                      {/* Dependency Management within modules */}
                      <div className="pt-3 border-t border-slate-800/40">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1.5 font-mono">Inter-Module Dependencies:</span>
                        <div className="flex flex-wrap gap-2.5">
                          {modules
                            .filter(other => other.name !== m.name)
                            .map((other) => {
                              const isLinked = m.dependencies.includes(other.name);
                              return (
                                <button
                                  key={other.name}
                                  onClick={() => handleToggleModuleDependency(m.name, other.name)}
                                  className={`p-1 px-2.5 rounded-lg border text-[10px] font-semibold transition flex items-center space-x-1.5 ${
                                    isLinked
                                      ? 'bg-indigo-500/15 border-indigo-550 text-indigo-400 font-bold'
                                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-500'
                                  }`}
                                >
                                  <span>{isLinked ? '✓ Implementa' : '+ Implementar'} {other.name}</span>
                                </button>
                              );
                            })}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Add Module Form */}
              <div className="p-4.5 rounded-xl border border-slate-850 bg-[#15171B] h-fit space-y-4">
                <h3 className="text-xs font-extrabold text-slate-200 flex items-center font-mono uppercase tracking-wide">
                  <FolderPlus className="w-4 h-4 text-[#3DDC84] mr-1.5" />
                  Criar Novo Submódulo
                </h3>

                <form onSubmit={handleAddModule} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Nome do Módulo</label>
                    <input
                      type="text"
                      value={newModuleName}
                      onChange={(e) => {
                        const name = e.target.value;
                        setNewModuleName(name);
                        // Auto-fill subpackage
                        const safePkg = name.toLowerCase().replace(/[^a-z0-9]/g, '');
                        setNewModulePackage(`${appPackage}.${safePkg}`);
                      }}
                      placeholder="Ex: core-network, ui-components"
                      required
                      className="w-full px-3 py-1.8 bg-slate-950 border border-slate-800 focus:border-[#3DDC84] rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Tipo de Módulo</label>
                    <select
                      value={newModuleType}
                      onChange={(e) => setNewModuleType(e.target.value as any)}
                      className="w-full px-2.5 py-1.8 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none"
                    >
                      <option value="library">Android Library (com.android.library)</option>
                      <option value="feature">Dynamic Feature Module</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Namespace Pacote</label>
                    <input
                      type="text"
                      value={newModulePackage}
                      onChange={(e) => setNewModulePackage(e.target.value)}
                      placeholder="com.example.app.submodule"
                      className="w-full px-3 py-1.8 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-cyan-300 tracking-wide outline-none focus:border-[#3DDC84]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Breve Descrição (Opcional)</label>
                    <textarea
                      value={newModuleDesc}
                      onChange={(e) => setNewModuleDesc(e.target.value)}
                      placeholder="Para encapsulamento de APIs retrocompatíveis..."
                      className="w-full h-16 p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none resize-none focus:border-[#3DDC84]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#3DDC84] hover:brightness-105 text-slate-950 font-bold rounded-lg text-xs transition"
                  >
                    Adicionar Submódulo Gradle
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: ACTIVITIES & INTENTS */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
              <FileCode className="w-5 h-5 text-amber-500 animate-pulse" />
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wide font-mono">CLASSES INTERACTIVAS E COMPONENTES NO MANIFESTO</h2>
                <p className="text-[10px] text-slate-400 mt-1">Visualize componentes declarados no seu AndroidManifest.xml. Crie novas classes e defina de forma facilitada qual janela será carregada por primeiro no Boot.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Registered Activities */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wide">Activities Declaradas ({activitiesList.length})</h3>
                
                <div className="space-y-3">
                  {activitiesList.map((act) => (
                    <div key={act.name} className="p-4 rounded-xl border border-slate-800 bg-[#17191E] flex items-center justify-between">
                      <div className="space-y-1.5 select-none">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-sm font-extrabold text-[#3DDC84] font-mono leading-none">.{act.name}</span>
                          
                          {act.isLauncher ? (
                            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-bold font-mono text-[8px] uppercase tracking-wider">
                              Launcher (Start Point)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-850 font-mono text-[8px] uppercase tracking-wider">
                              Secondary Activity
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-400 space-y-1">
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-550 mr-1">Ficheiro de Code:</span>
                            {act.fileExists ? (
                              <span className="text-teal-400 font-mono">app/src/main/java/../{act.name}.kt (OK)</span>
                            ) : (
                              <span className="text-rose-450 font-mono">Falta ficheiro correspondente!</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Make Launcher Selector */}
                      {!act.isLauncher ? (
                        <button
                          type="button"
                          onClick={() => setLauncherActivity(act.name)}
                          className="p-1 px-3 text-[10px] font-bold rounded-lg border border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-400 transition"
                        >
                          Definir Inicial (Launcher)
                        </button>
                      ) : (
                        <div className="text-[10.5px] text-emerald-400 flex items-center font-bold px-2.5 py-1 bg-[#3DDC84]/10 rounded-lg">
                          ✓ Editor Launcher Ativo
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Add activity form */}
              <div className="p-4.5 rounded-xl border border-slate-850 bg-[#15171B] h-fit space-y-4">
                <h3 className="text-xs font-extrabold text-slate-200 flex items-center font-mono uppercase tracking-wide">
                  <Plus className="w-4 h-4 text-[#3DDC84] mr-1.5" />
                  Criar Nova Activity
                </h3>

                <form onSubmit={handleCreateActivity} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Nome da Activity (CamelCase)</label>
                    <input
                      type="text"
                      value={newActivityName}
                      onChange={(e) => setNewActivityName(e.target.value)}
                      placeholder="Ex: Login, Profile, Settings"
                      required
                      className="w-full px-3 py-1.8 bg-slate-950 border border-slate-800 focus:border-[#3DDC84] rounded-lg text-xs font-semibold text-slate-100 outline-none"
                    />
                    <p className="text-[8px] text-slate-500 pl-0.5 leading-none mt-0.5">Note: "Activity" será anexado autonomamente no final do nome se omitido.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="relative flex items-center cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={newActivityLauncher}
                        onChange={(e) => setNewActivityLauncher(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-7 h-3.5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-[#3DDC84] peer-checked:after:bg-slate-950"></div>
                      <span className="text-[10px] text-slate-300 ml-2">Definir como Launch Activity</span>
                    </label>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[10px] leading-relaxed text-slate-400">
                    Ao confirmar, o aplicativo irá injetar a classe <code className="text-[#3DDC84]">.kt</code> em Kotlin e o layout <code className="text-[#3DDC84]">.xml</code> correspondente integrados às declarações do Manifesto.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-gradient-to-r from-[#3DDC84] to-emerald-500 hover:brightness-105 text-slate-950 font-bold rounded-lg text-xs transition"
                  >
                    Gerar Activity & Recursos
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: KEYSTORE PASSWORD GENERATOR AND RELEASE SIGNINGS */}
        {activeTab === 'signing' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800">
              <Shield className="w-5 h-5 text-indigo-400 animate-pulse" />
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-wide font-mono">CHAVES DE CRIPTOGRAFIA E ASSINATURA (DEVELOPER JKS)</h2>
                <p className="text-[10px] text-slate-400 mt-1">A assinatura PKCS/JKS é essencial de forma mandatória em APKs compilados para o Android 11+. Configure ou simule chaves auto-assinadas locais.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Left Column: Register Keystore configs */}
              <div className="lg:col-span-3 p-5 bg-[#17191E] border border-slate-805 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wide flex items-center">
                  <Wrench className="w-4 h-4 text-[#3DDC84] mr-2" />
                  Parâmetros de Criptografia do Certificado
                </h3>

                <form onSubmit={handleGenerateKeystore} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-indigo-400" />
                        <span>Keystore Password</span>
                      </label>
                      <input
                        type="password"
                        value={keystorePass}
                        onChange={(e) => setKeystorePass(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3 py-1.8 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300 tracking-widest outline-none focus:border-[#3DDC84]"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                        <Key className="w-3 h-3 text-indigo-400" />
                        <span>Key Alias Name</span>
                      </label>
                      <input
                        type="text"
                        value={keystoreAlias}
                        onChange={(e) => setKeystoreAlias(e.target.value)}
                        placeholder="androiddebugkey"
                        required
                        className="w-full px-3 py-1.8 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white outline-none focus:border-[#3DDC84]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                        <User className="w-3 h-3 text-indigo-400" />
                        <span>Nome Proprietário / CN</span>
                      </label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        placeholder="Android Developer"
                        required
                        className="w-full px-3 py-1.8 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-white outline-none focus:border-[#3DDC84]"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-405 flex items-center space-x-1">
                        <Sliders className="w-3 h-3 text-indigo-400" />
                        <span>Validade (Years)</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={keyValidity}
                        onChange={(e) => setKeyValidity(parseInt(e.target.value) || 25)}
                        className="w-full px-3 py-1.8 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white outline-none focus:border-[#3DDC84]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Organizational Unit (OU)</label>
                      <input
                        type="text"
                        value={orgUnit}
                        onChange={(e) => setOrgUnit(e.target.value)}
                        placeholder="Sandbox Lab"
                        className="w-full px-3 py-1.8 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-350 outline-none focus:border-[#3DDC84]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Schema Versão Assinatura</label>
                      <select
                        value={signingType}
                        onChange={(e) => setSigningType(e.target.value as any)}
                        className="w-full px-2.5 py-1.8 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none focus:border-[#3DDC84]"
                      >
                        <option value="debug">Debug Config (V1 + V2 Scheme)</option>
                        <option value="release">Release Signed (V2 + V3 mandatory)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#3DDC84] text-slate-950 font-bold rounded-lg text-xs hover:brightness-105 transition flex items-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Gerar Keystore jks e Injetar no Build</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Keystore status visualization */}
              <div className="lg:col-span-2 p-5 bg-slate-950 border border-slate-800 rounded-xl flex flex-col justify-between h-80">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">STATUS DO CONTAINER DE ASSINATURA</h3>
                  
                  {keystoreExists ? (
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2.5 text-xs">
                      <div className="flex items-center space-x-2 text-[#3DDC84] font-bold">
                        <CheckCircle2 className="w-4 h-4 animate-pulse" />
                        <span>JKS CARREGADO COM SUCESSO</span>
                      </div>
                      <div className="text-[10.5px] leading-relaxed text-slate-300 font-mono space-y-1">
                        <div><strong className="text-slate-500">CN Owner:</strong> {ownerName}</div>
                        <div><strong className="text-slate-500">Validity:</strong> {keyValidity} years</div>
                        <div><strong className="text-slate-500">Hash MD5/SHA1:</strong> f7:b0:1f:a2... (self-signed)</div>
                        <div><strong className="text-slate-500">Alias Tag:</strong> {keystoreAlias}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 text-center py-7 text-slate-450 space-y-3">
                      <Lock className="w-7 h-7 mx-auto text-indigo-400 opacity-60 animate-bounce" />
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">Sem Assinatura Registada</div>
                      <p className="text-[10px] leading-relaxed text-slate-450">Ao compilar em Release, lembre-se de configurar e emitir uma Keystore de segurança.</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-850 text-[10px] text-slate-400">
                  <strong className="text-indigo-400 block mb-0.5">Segurança Android:</strong>
                  APKs sem assinaturas válidas em formato JKS não podem ser instalados do Android 11 para cima.
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
