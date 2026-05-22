/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RefreshCw, 
  FileCode, 
  Settings2, 
  Database,
  Terminal,
  Activity,
  ChevronRight,
  Eye,
  Plus,
  Compass,
  AlertTriangle,
  Heart,
  ChevronDown,
  Layout,
  Code,
  Sparkles,
  Download,
  Cpu,
  Shield,
  Bot,
  Save,
  CheckCircle2,
  Rocket,
  Gamepad2,
  MessageSquare,
  Wrench
} from 'lucide-react';

import IdeSidebar, { IDFile } from './components/IdeSidebar';
import LayoutDesigner from './components/LayoutDesigner';
import GradleManager from './components/GradleManager';
import EmulatorModal from './components/EmulatorModal';
import ProjectManager from './components/ProjectManager';

// Utilities
import { VisualElement, TEMPLATES } from './utils/androidXmlTemplates';
import { serializeToXml, parseXmlToTree } from './utils/xmlParser';
import { DEFAULT_DEPENDENCIES, DEFAULT_SDK_CONFIG, POPULAR_LIBRARIES } from './utils/androidLibraries';

export default function App() {
  const [appName, setAppName] = useState('My Cool App');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [appPackage, setAppPackage] = useState('com.example.android.sandbox');
  const [appIcon, setAppIcon] = useState('android'); // 'android' | 'rocket' | 'heart' | 'cpu' | 'controller' | 'shield' | 'chat'
  const [themeColor, setThemeColor] = useState('#3DDC84'); // Emerald Green


  // Layout XML Tree state
  const [layoutTree, setLayoutTree] = useState<VisualElement>(TEMPLATES.blank.root);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [xmlText, setXmlText] = useState<string>('');
  const [xmlParseWarning, setXmlParseWarning] = useState<string | null>(null);

  // Active highlighted file in workspace
  const [activeFile, setActiveFile] = useState<string>('app/src/main/res/layout/activity_main.xml');

  // Dynamic files registry
  const [files, setFiles] = useState<IDFile[]>([
    {
      name: 'activity_main.xml',
      path: 'app/src/main/res/layout/activity_main.xml',
      type: 'xml',
      content: '' // populated on init
    },
    {
      name: 'strings.xml',
      path: 'app/src/main/res/values/strings.xml',
      type: 'xml',
      content: '' // populated dynamically
    },
    {
      name: 'AndroidManifest.xml',
      path: 'app/src/main/AndroidManifest.xml',
      type: 'xml',
      content: '' // populated dynamically
    },
    {
      name: 'MainActivity.kt',
      path: 'app/src/main/java/com/example/android/sandbox/MainActivity.kt',
      type: 'kt',
      content: '' // populated dynamically
    },
    {
      name: 'DatabaseHelper.java',
      path: 'app/src/main/java/com/example/android/sandbox/DatabaseHelper.java',
      type: 'java',
      content: `package com.example.android.sandbox;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

/**
 * SQLite Local Storage database helper.
 * Manages cache entries for Android Sandbox runtime loops.
 */
public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "sandbox_cache.db";
    private static final int DATABASE_VERSION = 1;

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE IF NOT EXISTS telemetry (id INTEGER PRIMARY KEY, key TEXT, value TEXT)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS telemetry");
        onCreate(db);
    }
}`
    },
    {
      name: 'build.gradle',
      path: 'app/build.gradle',
      type: 'gradle',
      content: '' // populated dynamically
    },
    {
      name: 'libs.versions.toml',
      path: 'gradle/libs.versions.toml',
      type: 'toml',
      content: `[versions]
kotlin = "1.9.22"
appcompat = "1.6.1"

[libraries]
androidx-appcompat = { group = "androidx.appcompat", name = "appcompat", version = "1.6.1" }
google-material = { group = "com.google.android.material", name = "material", version = "1.11.0" }
`
    },
    {
      name: 'gradle.properties',
      path: 'gradle.properties',
      type: 'properties',
      content: `# Enable Android Jetpack compat boundaries
android.useAndroidX=true
android.enableJetifier=true
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
`
    },
    {
      name: 'local.properties',
      path: 'local.properties',
      type: 'properties',
      content: `## This file is managed by layout studio and contains machine specific file paths.
sdk.dir=/home/developer/Android/Sdk
`
    },
    {
      name: 'proguard-rules.pro',
      path: 'app/proguard-rules.pro',
      type: 'pro',
      content: `# Shrinking release build optimizations
-keep class com.example.android.sandbox.** { *; }
-keepattributes *Annotation*,Signature
-dontwarn retrofit2.**
`
    }
  ]);

  // Gradle configs state
  const [dependencies, setDependencies] = useState(DEFAULT_DEPENDENCIES);
  const [sdkConfig, setSdkConfig] = useState(DEFAULT_SDK_CONFIG);
  const [useVersionCatalog, setUseVersionCatalog] = useState(false);
  const [dslLanguage, setDslLanguage] = useState<'groovy' | 'kotlin'>('kotlin');

  // Emulator configuration
  const [emulatorOpen, setEmulatorOpen] = useState(false);
  const [deviceTheme, setDeviceTheme] = useState<'light' | 'dark'>('dark');
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [layoutViewMode, setLayoutViewMode] = useState<'design' | 'split' | 'code'>('design');

  // Gradle Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncRequired, setSyncRequired] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'gradle' | 'logcat'>('gradle');
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);

  // Master console logs stream
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    'Welcome to Android IDE Gradle Sandbox Studio V3.0.',
    'Dispositivo ativo associado: Pixel 8 Emulator (localhost:5554).',
    'JVM 17.0.1 Compiler is online. Pronto para compilação local de arquivos Kotlin/Java.',
  ]);

  const [logcatLogs, setLogcatLogs] = useState<string[]>([
    '[INIT] Logcat debugger stream active. Awaiting application bootstrap metrics.'
  ]);

  // Custom APK Compiler Modal states
  const [showCompileModal, setShowCompileModal] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileStep, setCompileStep] = useState(0);
  const [compiledApkLogs, setCompiledApkLogs] = useState<string[]>([]);
  const [compileSuccess, setCompileSuccess] = useState(false);

  const addLogcat = (log: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setLogcatLogs((prev) => [...prev, `[${timestamp}] ${log}`]);
  };



  // --- 1. DYNAMIC STRING/MANIFEST/GRADLE SYNC LOOP ---
  useEffect(() => {
    // Generate active activity XML layout
    const xml = serializeToXml(layoutTree);
    setXmlText(xml);

    // Update the layoutTree file content in files registry
    setFiles((prev) => 
      prev.map((f) => 
        f.name === 'activity_main.xml' 
          ? { ...f, content: xml } 
          : f
      )
    );
    setXmlParseWarning(null);
  }, [layoutTree]);

  // Handle auto code templates when settings change
  useEffect(() => {
    const updatedStrings = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${appName}</string>
    <string name="welcome_message">Bem-vindo ao ${appName}!</string>
    <string name="version_label">Versão compilada: ${appVersion}</string>
</resources>`;

    const updatedManifest = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${appPackage}">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MyApplication">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

    const clickHooks = generateWidgetKotlinHooks();
    const updatedKotlin = `package ${appPackage}

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import ${appPackage}.databinding.ActivityMainBinding

/**
 * Android IDE Auto-Generated Activity Binding
 * Sincronizado dinamicamente com seu activity_main.xml
 */
class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Inflate view bindings layouts
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Eventos acionados do seu layout visual:
${clickHooks || '        // (Adicione botões, switches ou inputs na visualização e clique neles!)'}
        Toast.makeText(this, "Iniciando ${appName}!", Toast.LENGTH_LONG).show()
    }
}`;

    const updatedGradle = `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android' version '${sdkConfig.kotlinVersion}'
}

android {
    namespace '${appPackage}'
    compileSdk ${sdkConfig.compileSdk}

    defaultConfig {
        applicationId "${appPackage}"
        minSdk ${sdkConfig.minSdk}
        targetSdk ${sdkConfig.targetSdk}
        versionCode ${parseInt(appVersion.split('.')[0]) || 1}
        versionName "${appVersion}"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
${dependencies.map(d => `    ${d.config} '${d.group}:${d.artifact}:${d.version}'`).join('\n')}
}`;

    setFiles((prev) => 
      prev.map((f) => {
        if (f.name === 'strings.xml') return { ...f, content: updatedStrings };
        if (f.name === 'AndroidManifest.xml') return { ...f, content: updatedManifest };
        if (f.name === 'MainActivity.kt') return { ...f, content: updatedKotlin };
        if (f.name === 'build.gradle') return { ...f, content: updatedGradle };
        return f;
      })
    );

    setSyncRequired(true);
  }, [appName, appVersion, appPackage, appIcon, themeColor, dependencies, sdkConfig]);

  // Helper: Extract click handles from visual items to show realistic code output
  const generateWidgetKotlinHooks = (): string => {
    const ids: string[] = [];
    const extractIds = (node: VisualElement) => {
      const androidId = node.attributes['android:id'];
      if (androidId && (node.type === 'Button' || node.type === 'Switch' || node.type === 'Slider')) {
        const cleanId = androidId.replace('@+id/', '').replace('@id/', '');
        if (cleanId) ids.push(cleanId);
      }
      if (node.children) node.children.forEach(extractIds);
    };
    extractIds(layoutTree);

    let clickHooks = '';
    ids.forEach((id) => {
      clickHooks += `        binding.${id}.setOnClickListener {\n            Toast.makeText(this, "Ação acionada em: ${id}!", Toast.LENGTH_SHORT).show()\n        }\n\n`;
    });
    return clickHooks;
  };

  // --- 2. EDITORS CODE RE-PARSER HANDLERS ---
  const handleActiveFileCodeChange = (newCode: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === activeFile ? { ...f, content: newCode } : f))
    );

    // If active edit is on activity_main.xml, re-parse visual elements
    if (activeFile === 'app/src/main/res/layout/activity_main.xml') {
      setXmlText(newCode);
      const parsed = parseXmlToTree(newCode);
      if (parsed) {
        setLayoutTree(parsed);
        setXmlParseWarning(null);
      } else {
        setXmlParseWarning('Aviso de Sintaxe: Tag XML inválida ou elementos sem fechamento. O preview visual está pausado.');
      }
    }
  };

  // --- 3. DYNAMIC DIRECTORY MANAGER OPERATIONS ---
  const handleCreateFile = (name: string, folder: string, type: IDFile['type']) => {
    const filePath = `${folder}/${name}`;
    const fileExists = files.some((f) => f.path === filePath);

    if (fileExists) {
      alert(`O arquivo '${name}' já existe no diretório selecionado!`);
      return;
    }

    // Assign default boilerplates depending on selected type extension
    let codeTemplate = '';
    if (type === 'kt') {
      codeTemplate = `package ${appPackage}

import android.util.Log

class ${name.replace('.kt', '')} {
    fun executeAction() {
        Log.d("CustomClass", "Running dynamic helper logic for ${appName}")
    }
}`;
    } else if (type === 'java') {
      codeTemplate = `package ${appPackage};

import android.util.Log;

public class ${name.replace('.java', '')} {
    public void executeLogic() {
        Log.i("CustomJavaClass", "Java controller initialized successfully.");
    }
}`;
    } else if (type === 'xml') {
      codeTemplate = `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:orientation="vertical">
</LinearLayout>`;
    } else {
      codeTemplate = `## Custom text configuration rules`;
    }

    const newFileNode: IDFile = {
      name,
      path: filePath,
      type,
      content: codeTemplate
    };

    setFiles((prev) => [...prev, newFileNode]);
    setActiveFile(filePath);
    addLogcat(`I/FileSystem: New file node created successfully [${filePath}]`);
  };

  const handleRenameFile = (path: string, newName: string) => {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.path === path) {
          const pathSegments = f.path.split('/');
          pathSegments.pop(); // remove old file name
          const newPath = [...pathSegments, newName].join('/');
          
          if (activeFile === path) {
            setActiveFile(newPath);
          }
          return {
            ...f,
            name: newName,
            path: newPath
          };
        }
        return f;
      })
    );
    addLogcat(`I/FileSystem: File renamed [${path}] --> ${newName}`);
  };

  const handleDeleteFile = (path: string) => {
    setFiles((prev) => prev.filter((f) => f.path !== path));
    if (activeFile === path) {
      // fallback to main layout file
      setActiveFile('app/src/main/res/layout/activity_main.xml');
    }
    addLogcat(`I/FileSystem: File at path deleted [${path}]`);
  };

  // Load predefined ui templates
  const handleLoadTemplate = (key: keyof typeof TEMPLATES) => {
    const consent = window.confirm(`Carregar layout do template "${TEMPLATES[key].name}"? Seu design XML atual será substituído.`);
    if (consent) {
      setLayoutTree(TEMPLATES[key].root);
      setSelectedId(null);
      setActiveFile('app/src/main/res/layout/activity_main.xml');
      addLogcat(`I/LayoutManager: Loaded blueprint preset "${TEMPLATES[key].name}"`);
    }
  };

  // --- 4. GRADLE COMPILER DAEMON TRIGGER ---
  const triggerGradleSync = () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setConsoleCollapsed(false);
    setActiveConsoleTab('gradle');

    const timestamp = () => new Date().toISOString().substring(11, 19);

    setConsoleLogs((prev) => [
      ...prev,
      `[${timestamp()}] Gradle sync daemon iniciado. Resolvendo dependências com base nos SDKs do build.gradle...`,
      `[${timestamp()}] Conectando aos repositórios mavenCentral() e google()...`,
    ]);

    setTimeout(() => {
      const logsToAdd = [
        `[${timestamp()}] Baixando dependências transitivas compatíveis para compileSdk ${sdkConfig.compileSdk}`,
        `[${timestamp()}] Resolvendo buildToolsVersion para o Gradle DSL compilador.`,
      ];

      dependencies.forEach((dep) => {
        logsToAdd.push(`[${timestamp()}] Resolvido: ${dep.group}:${dep.artifact}:${dep.version} (salvo em cache local)`);
      });

      setConsoleLogs((prev) => [...prev, ...logsToAdd]);
    }, 400);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncRequired(false);
      setConsoleLogs((prev) => [
        ...prev,
        `[${timestamp()}] Sincronização Concluída em 1.1s.`,
        `[${timestamp()}] SUCCESS: Gradle compilou as diretrizes de pacotes com sucesso!`,
      ]);
      addLogcat('I/GradleDaemon: Project synchronization completed. No errors found.');
    }, 1100);
  };

  // --- 5. FULL RELEASE APK COMPILATION PIPELINE ---
  const startApkBuild = () => {
    if (isSyncing) return;
    
    setShowCompileModal(true);
    setCompileProgress(0);
    setCompileStep(0);
    setCompileSuccess(false);
    
    const timestamp = () => new Date().toISOString().substring(11, 19);
    
    setCompiledApkLogs([
      `[${timestamp()}] Initializing Android Gradle Build Daemon compiler...`,
      `[${timestamp()}] JDK Directory: /home/developer/openjdk-17-jre-amd64`,
      `[${timestamp()}] Project Scope: ${appPackage} (v${appVersion})`,
    ]);

    const buildSteps = [
      { prg: 10, log: 'Task :app:preBuild STARTED - Checking namespace structures' },
      { prg: 22, log: 'Task :app:processDebugResources - Parsing strings.xml and values catalog via AAPT2' },
      { prg: 35, log: 'Task :app:compileDebugKotlin - Compiling Kotlin Activity Bindings...' },
      { prg: 48, log: 'Task :app:compileDebugJavaWithJavac - Executing Javac on Java source files...' },
      { prg: 60, log: 'Task :app:minifyDebugWithR8 - Optimizing bytecode with Proguard rules...' },
      { prg: 72, log: `Proguard Shrinker: classes compiled reduced from 1160 to 244 (Proguard rules enforced successfully)` },
      { prg: 80, log: 'Task :app:dexBuilderDebug - Translating JVM class structures to Classes.dex via D8' },
      { prg: 88, log: 'Task :app:packageDebug - Packaging manifests, layouts, resources, and dex bytecode into unsigned APK ZIP' },
      { prg: 94, log: `Apksigner Daemon: signing APK align structure using local SHA-256 Android_Developer_Private_Key` },
      { prg: 100, log: `Zipalign Alignment: Successful 4-byte boundaries alignment check on build-release.apk` },
    ];

    let currentStep = 0;
    const runSequence = () => {
      if (currentStep < buildSteps.length) {
        setTimeout(() => {
          const step = buildSteps[currentStep];
          setCompileProgress(step.prg);
          setCompileStep(currentStep + 1);
          setCompiledApkLogs((prev) => [...prev, `[${timestamp()}] ${step.log}`]);
          
          currentStep++;
          runSequence();
        }, 350);
      } else {
        setTimeout(() => {
          setCompileSuccess(true);
          setCompiledApkLogs((prev) => [
            ...prev,
            `[${timestamp()}] BUILD SUCCESSFUL in 3.65 seconds.`,
            `[${timestamp()}] APK Output Saved: /app/build/outputs/apk/release/${appName.toLowerCase().replace(/\s+/g, '_')}-release.apk`
          ]);
          addLogcat(`I/GradleBuild: APK Assembly Completed! File: ${appName}.apk (signed-aligned)`);
        }, 150);
      }
    };

    runSequence();
  };

  const handleDownloadApkFile = () => {
    // Generate actual downloadable apk text container modified with app settings!
    const mockApkData = `Android Compiled Package Container\n=================================\nApplication Name: ${appName}\nApplication ID: ${appPackage}\nPackage Version: v${appVersion}\nAPI Sdk Level: ${sdkConfig.targetSdk}\nLaunch Emblem Choice: [${appIcon}]\nPrimary Color: ${themeColor}\nCompilation Compiler: D8 Dex / R8 Minify Proguard\nSigning Crypt: SHA-256 self-signed Debug Key Certificate v3`;
    const blob = new Blob([mockApkData], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appName.toLowerCase().replace(/\s+/g, '_')}-v${appVersion}-release.apk`;
    link.click();
    URL.revokeObjectURL(url);
    addLogcat(`I/ApkExporter: Custom APK Package downloaded successfully.`);
    setShowCompileModal(false);
  };

  // Helper keyword styles highlightizer
  const renderHighlightedCode = (code: string, fileType: string) => {
    if (!code) return <span className="text-slate-500">// Arquivo vazio</span>;

    if (fileType === 'xml') {
      return (
        <span className="text-teal-300">
          {code.split(/([<> \/\="])/).map((piece, i) => {
            if (piece === 'xmlns:android' || piece === 'android:id' || piece === 'android:text' || piece.startsWith('android:')) {
              return <span key={i} className="text-amber-400">{piece}</span>;
            }
            if (piece.startsWith('http://') || piece.startsWith('@+id/') || piece.startsWith('#')) {
              return <span key={i} className="text-rose-400">{piece}</span>;
            }
            if (piece === 'LinearLayout' || piece === 'TextView' || piece === 'Button' || piece === 'ConstraintLayout' || piece === 'Switch' || piece === 'ScrollView' || piece === 'CardView' || piece === 'ImageView') {
              return <span key={i} className="text-[#3DDC84] font-bold">{piece}</span>;
            }
            return piece;
          })}
        </span>
      );
    }

    if (fileType === 'kt' || fileType === 'java') {
      const keywords = ['package', 'import', 'class', 'fun', 'val', 'var', 'private', 'lateinit', 'override', 'public', 'void', 'return', 'extends', 'implements', 'new', 'static'];
      return (
        <span className="text-amber-200">
          {code.split(/(\b)/).map((p, i) => {
            if (keywords.includes(p)) {
              return <span key={i} className="text-indigo-400 font-extrabold">{p}</span>;
            }
            if (p.startsWith('"') || p.endsWith('"')) {
              return <span key={i} className="text-rose-400">{p}</span>;
            }
            if (p === 'MainActivity' || p === 'DatabaseHelper' || p === 'SQLiteDatabase') {
              return <span key={i} className="text-teal-300 font-bold">{p}</span>;
            }
            return p;
          })}
        </span>
      );
    }

    return <span className="text-slate-300">{code}</span>;
  };

  const getActiveFileContent = (): string => {
    const file = files.find((f) => f.path === activeFile);
    return file ? file.content : '';
  };

  const getActiveFileType = (): string => {
    const file = files.find((f) => f.path === activeFile);
    return file ? file.type : 'txt';
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#1E2024] select-none overflow-hidden text-slate-300 font-sans">
      
      {/* 1. MASTER UPPER TOOLBAR INVENTIVE LAYOUT */}
      <header className="h-14 bg-[#1A1C20] border-b border-[#2B2D30] flex items-center justify-between px-4 shrink-0 select-none shadow">
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#3DDC84] flex items-center justify-center shadow-lg transition duration-300 transform hover:rotate-12">
            <Bot className="w-5 h-5 text-slate-950 fill-current" />
          </div>
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2">
              <span>Android Studio Web Sandbox</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-bold">APK COMPILE READY</span>
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.2">IDE completa com editor Java/Kotlin, Designer XML visual e compilador nativo de pacotes APK</p>
          </div>
        </div>

        {/* Action controllers buttons */}
        <div className="flex items-center space-x-4">
          
          {/* Preset Visual models selector */}
          <div className="flex items-center space-x-1.5 bg-[#2B2D30]/60 p-1 px-2.5 bg-slate-900 rounded border border-slate-750 text-xs">
            <Compass className="w-3.5 h-3.5 text-[#3DDC84]" />
            <span className="text-slate-400 font-mono text-[10.5px]">Template:</span>
            <select
              id="select_preset_template"
              onChange={(e) => handleLoadTemplate(e.target.value as keyof typeof TEMPLATES)}
              className="bg-transparent border-none text-slate-100 font-bold outline-none cursor-pointer text-[10.5px] ml-1 focus:ring-0"
              defaultValue=""
            >
              <option value="" disabled>--- Escolher Preset ---</option>
              {Object.entries(TEMPLATES).map(([key, value]) => (
                <option key={key} value={key}>{value.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 select-none">
            {/* Sync Alert Required indicator */}
            {syncRequired && (
              <div className="flex items-[#10] space-x-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9.5px] uppercase font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Gradle Sync Pendente</span>
              </div>
            )}

            {/* Run emulator button */}
            <button
              type="button"
              id="btn_ide_run_emulator"
              onClick={() => {
                if (syncRequired) {
                  triggerGradleSync();
                }
                setEmulatorOpen(true);
              }}
              style={{ backgroundColor: `${themeColor}15`, color: themeColor, borderColor: `${themeColor}40` }}
              className="px-3 py-1.5 border hover:brightness-110 text-xs font-bold rounded-lg transition transform hover:scale-[1.02] flex items-center space-x-1.8 cursor-pointer shadow-sm shadow-[#000000]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Executar no Emulador</span>
            </button>

            {/* MAIN ACTION: TRIGGER APK COMPILATION BUILD */}
            <button
              type="button"
              id="btn_ide_compile_apk"
              onClick={startApkBuild}
              className="px-4 py-1.5 bg-gradient-to-r from-[#3DDC84] to-emerald-500 hover:from-emerald-400 hover:to-emerald-500/90 text-slate-950 font-extrabold text-xs rounded-lg transition transform hover:scale-[1.03] active:scale-[0.98] outline-none shadow-md flex items-center space-x-2 select-none cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Gerar / Compilar APK</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. CHASSIS CONTAINER: LEFT SIDEBAR + WORKSPACE */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        <IdeSidebar
          files={files}
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          onCreateFile={handleCreateFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          gradleSyncRequired={syncRequired}
          isSyncing={isSyncing}
        />

        {/* RIGHT EDITOR PANEL AREA */}
        <div className="flex-grow flex flex-col overflow-hidden h-full">
          
          {/* Active file tabs details */}
          <div className="h-10 border-b border-[#2B2D30] bg-[#1A1C20] flex items-center justify-between px-4 select-none shrink-0">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-500 font-mono">MyAndroidApp</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="font-semibold text-slate-500 truncate font-mono">src • main</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-[#3DDC84] font-bold font-mono">{activeFile.split('/').pop()}</span>
            </div>

            {/* Layout representation toggle tabs */}
            {activeFile === 'app/src/main/res/layout/activity_main.xml' && (
              <div className="flex bg-[#121316] p-0.5 rounded border border-slate-800">
                <button
                  type="button"
                  id="tab_mode_design"
                  onClick={() => setLayoutViewMode('design')}
                  className={`text-[10px] font-bold py-1 px-3.5 rounded transition-all flex items-center space-x-1.5 ${
                    layoutViewMode === 'design' 
                      ? 'bg-slate-800 text-[#3DDC84] font-bold' 
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Design</span>
                </button>
                <button
                  type="button"
                  id="tab_mode_split"
                  onClick={() => setLayoutViewMode('split')}
                  className={`text-[10px] font-bold py-1 px-3.5 rounded transition-all flex items-center space-x-1.5 ${
                    layoutViewMode === 'split' 
                      ? 'bg-slate-800 text-[#3DDC84] font-bold' 
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visual Split</span>
                </button>
                <button
                  type="button"
                  id="tab_mode_code"
                  onClick={() => setLayoutViewMode('code')}
                  className={`text-[10px] font-bold py-1 px-3.5 rounded transition-all flex items-center space-x-1.5 ${
                    layoutViewMode === 'code' 
                      ? 'bg-slate-800 text-[#3DDC84] font-bold' 
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>XML Source</span>
                </button>
              </div>
            )}

            {/* Persistent Visual Project Manifest settings button */}
            <button
              type="button"
              onClick={() => setActiveFile('settings')}
              className={`p-1.5 px-3 rounded border text-xs font-bold transition flex items-center space-x-1.5 ${
                activeFile === 'settings'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-350 border-slate-750'
              }`}
            >
              <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>⚙️ Configurações do App (Manifest)</span>
            </button>

            {/* Persistent Visual Project Manager dashboard button */}
            <button
              type="button"
              onClick={() => setActiveFile('project_manager')}
              className={`p-1.5 px-3 rounded border text-xs font-bold transition flex items-center space-x-1.5 ${
                activeFile === 'project_manager'
                  ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-[#3DDC84] border-emerald-550/30'
                  : 'bg-slate-800/40 hover:bg-slate-800 text-slate-350 border-slate-750'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#3DDC84]" />
              <span>📊 Gerenciador de Projeto</span>
            </button>
          </div>

          {/* DYNAMIC COMPONENT PANEL CANVAS SWITCH */}
          <div className="flex-grow flex overflow-hidden relative">
            
            {/* A. VISUAL LAYOUT XML SWITCH */}
            {activeFile === 'app/src/main/res/layout/activity_main.xml' && (
              <>
                {layoutViewMode === 'design' && (
                  <LayoutDesigner
                    layoutTree={layoutTree}
                    setLayoutTree={setLayoutTree}
                    selectedId={selectedId}
                    setSelectedId={setSelectedId}
                    deviceTheme={deviceTheme}
                    setDeviceTheme={setDeviceTheme}
                    deviceOrientation={deviceOrientation}
                    setDeviceOrientation={setDeviceOrientation}
                  />
                )}

                {layoutViewMode === 'split' && (
                  <div className="flex-1 flex overflow-hidden h-full">
                    
                    {/* Left pane: Editable Raw XML */}
                    <div className="w-[45%] flex flex-col bg-[#141519] border-r border-[#2B2D30] overflow-hidden shrink-0">
                      <div className="p-2 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-400 select-none">
                        <span>activity_main.xml (XML Editor)</span>
                        <span className="text-[10px] text-emerald-400 animate-pulse font-mono tracking-widest uppercase">Live-Compilation</span>
                      </div>

                      {xmlParseWarning && (
                        <div className="p-2 bg-amber-500/15 border-b border-amber-500/30 text-[10px] text-amber-400 font-medium flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0" />
                          <span>{xmlParseWarning}</span>
                        </div>
                      )}

                      <div className="flex-1 relative font-mono text-[11px] p-2 bg-slate-950 flex select-text overflow-auto">
                        <div className="w-10 text-slate-650 border-r border-slate-800/80 text-right pr-2 select-none space-y-1 pt-1">
                          {Array.from({ length: Math.max(30, xmlText.split('\n').length + 3) }).map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>
                        <textarea
                          id="xml_split_editor"
                          value={xmlText}
                          onChange={(e) => handleActiveFileCodeChange(e.target.value)}
                          spellCheck={false}
                          className="flex-grow bg-transparent resize-none outline-none border-none text-teal-300 leading-relaxed font-mono p-2 pt-1 h-full font-semibold focus:ring-0 w-full"
                        />
                      </div>
                    </div>

                    {/* Right pane: Visual rendering */}
                    <div className="flex-grow h-full bg-[#0F0F12] overflow-hidden">
                      <LayoutDesigner
                        layoutTree={layoutTree}
                        setLayoutTree={setLayoutTree}
                        selectedId={selectedId}
                        setSelectedId={setSelectedId}
                        deviceTheme={deviceTheme}
                        setDeviceTheme={setDeviceTheme}
                        deviceOrientation={deviceOrientation}
                        setDeviceOrientation={setDeviceOrientation}
                      />
                    </div>
                  </div>
                )}

                {layoutViewMode === 'code' && (
                  <div className="flex-1 flex flex-col bg-slate-950 font-mono text-[11.5px] p-4 select-text selection:bg-slate-850 overflow-hidden relative">
                    <div className="flex-1 flex overflow-auto leading-relaxed pt-2">
                      <div className="w-10 text-slate-600 border-r border-slate-850 text-right pr-3 select-none space-y-1">
                        {Array.from({ length: xmlText.split('\n').length }).map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      <textarea
                        value={xmlText}
                        onChange={(e) => handleActiveFileCodeChange(e.target.value)}
                        className="flex-grow bg-transparent resize-none outline-none border-none text-teal-300 pl-4 whitespace-pre outline-none focus:ring-0 font-mono leading-relaxed"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* B. GRADLE BUILD MANAGER TAB */}
            {activeFile === 'app/build.gradle' && (
              <GradleManager
                dependencies={dependencies}
                setDependencies={setDependencies}
                sdkConfig={sdkConfig}
                setSdkConfig={setSdkConfig}
                useVersionCatalog={useVersionCatalog}
                setUseVersionCatalog={setUseVersionCatalog}
                dslLanguage={dslLanguage}
                setDslLanguage={setDslLanguage}
                triggerGradleSync={triggerGradleSync}
                isSyncing={isSyncing}
                gradleLogs={consoleLogs}
              />
            )}

            {/* C. CHASSIS APP CONFIG/MANIFEST BOARD */}
            {activeFile === 'settings' && (
              <div className="flex-grow h-full overflow-y-auto bg-[#131519] p-6 space-y-6">
                
                <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
                  <Settings2 className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-widest font-mono">DADOS DO MANIFEST & CONFIGURAÇÃO DO APK</h2>
                    <p className="text-[10px] text-slate-400 mt-1">Sincroniza automaticamente tags do strings.xml, package namespaces e compiladores do build.gradle.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-text select-all">
                  
                  {/* Left: Metadata configurations inputs */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-[#17191E] space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-[#3DDC84] mr-2" />
                      Identidade Visual e Metadados
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Nome do Aplicativo (App Name)</label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        placeholder="e.g. Galaxy Fighter"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-[#3DDC84] rounded-lg text-xs font-semibold text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Application ID / Pacote (Java Package)</label>
                      <input
                        type="text"
                        value={appPackage}
                        onChange={(e) => setAppPackage(e.target.value)}
                        placeholder="e.g., com.example.coolapp"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-[#3DDC84] rounded-lg text-xs font-mono font-bold text-cyan-300 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Versão (Version Name)</label>
                        <input
                          type="text"
                          value={appVersion}
                          onChange={(e) => setAppVersion(e.target.value)}
                          placeholder="e.g., 1.4.2"
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-750 focus:border-[#3DDC84] rounded-lg text-xs font-mono text-white outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Código da Versão (Version Code)</label>
                        <input
                          type="number"
                          value={parseInt(appVersion.split('.')[0]) || 1}
                          disabled
                          className="w-full px-3 py-2 bg-[#202228] border border-slate-750 rounded-lg text-xs font-mono text-slate-500 cursor-not-allowed outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right: Colors and custom design launch emblems */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-[#17191E] space-y-4">
                    <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center uppercase tracking-wide">
                      <Layout className="w-4 h-4 text-indigo-400 mr-2" />
                      Tema Visual do APK & Ícone de Lançamento
                    </h3>

                    {/* Launch Icon Selection */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Emblema de Lançamento (Launcher Icon)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { key: 'android', label: 'Robô Bot', icon: <Bot className="w-4 h-4 text-[#3DDC84]" /> },
                          { key: 'rocket', label: 'Foguete Space', icon: <Rocket className="w-4 h-4 text-orange-400" /> },
                          { key: 'heart', label: 'Coração Pulse', icon: <Heart className="w-4 h-4 text-rose-500" /> },
                          { key: 'cpu', label: 'Processador CPU', icon: <Cpu className="w-4 h-4 text-blue-400" /> },
                          { key: 'controller', label: 'Controle Game', icon: <Gamepad2 className="w-4 h-4 text-violet-400" /> },
                          { key: 'shield', label: 'Escudo Guard', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
                          { key: 'chat', label: 'Mensageria Chat', icon: <MessageSquare className="w-4 h-4 text-sky-400" /> }
                        ].map((btn) => (
                          <button
                            type="button"
                            key={btn.key}
                            onClick={() => {
                              setAppIcon(btn.key);
                              addLogcat(`I/AppConfig: Changed launch icon package value --> [${btn.key}]`);
                            }}
                            className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center justify-center space-y-1.5 transition ${
                              appIcon === btn.key
                                ? 'bg-indigo-500/10 border-indigo-500 text-white'
                                : 'bg-slate-950 border-slate-750/70 text-slate-400 hover:bg-slate-900'
                            }`}
                          >
                            {btn.icon}
                            <span className="text-[8px] leading-none shrink-0 truncate">{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* App Theme Primary Brand color */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Cor Principal de Marca (Main Theme Highlight)</label>
                      <div className="flex bg-slate-950 px-3 py-2 rounded-lg border border-slate-750 items-center justify-between">
                        <select
                          value={themeColor}
                          onChange={(e) => {
                            setThemeColor(e.target.value);
                            addLogcat(`I/AppConfig: Sincronizado cor de marca com valor hexadecimal: ${e.target.value}`);
                          }}
                          className="bg-transparent border-none outline-none text-slate-200 cursor-pointer font-bold font-mono text-xs focus:ring-0 select-none"
                        >
                          <option value="#3DDC84">Verde Android (#3DDC84)</option>
                          <option value="#3B82F6">Azul Material (#3B82F6)</option>
                          <option value="#EF4444">Vermelho Pixel (#EF4444)</option>
                          <option value="#8B5CF6">Roxo Kotlin (#8B5CF6)</option>
                          <option value="#F59E0B">Âmbar Java (#F59E0B)</option>
                          <option value="#EC4899">Rosa Neon (#EC4899)</option>
                        </select>
                        <div className="w-5 h-5 rounded-md border border-white/20 shadow-inner" style={{ backgroundColor: themeColor }} />
                      </div>
                    </div>

                  </div>

                </div>

                {/* Sdk Platforms Configurations */}
                <div className="p-4 rounded-xl border border-slate-800 bg-[#17191E] space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 font-mono flex items-center uppercase">
                    <Database className="w-4 h-4 text-amber-500 mr-2" />
                    Limites e Requisitos de Compile SDK
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Min SDK Level Required</label>
                      <select
                        value={sdkConfig.minSdk}
                        onChange={(e) => {
                          const newMin = parseInt(e.target.value);
                          setSdkConfig(prev => ({ ...prev, minSdk: newMin }));
                        }}
                        className="w-full px-2.5 py-1.8 bg-slate-950 border border-slate-750 text-xs text-slate-300 rounded-lg outline-none"
                      >
                        <option value={21}>Android 5.0 Lollipop (API 21)</option>
                        <option value={24}>Android 7.0 Nougat (API 24)</option>
                        <option value={26}>Android 8.0 Oreo (API 26)</option>
                        <option value={28}>Android 9.0 Pie (API 28)</option>
                        <option value={29}>Android 10 (API 29)</option>
                        <option value={30}>Android 11 (API 30)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold text-slate-500">Target Framework SDK Level</label>
                      <select
                        value={sdkConfig.targetSdk}
                        onChange={(e) => {
                          const newTarget = parseInt(e.target.value);
                          setSdkConfig(prev => ({
                            ...prev,
                            targetSdk: newTarget,
                            compileSdk: Math.max(prev.compileSdk, newTarget)
                          }));
                        }}
                        className="w-full px-2.5 py-1.8 bg-slate-950 border border-slate-750 text-xs text-slate-300 rounded-lg outline-none"
                      >
                        <option value={30}>Android 11 R (API 30)</option>
                        <option value={31}>Android 12 S (API 31)</option>
                        <option value={32}>Android 12L Sv2 (API 32)</option>
                        <option value={33}>Android 13 Tiramisu (API 33)</option>
                        <option value={34}>Android 14 UpsideDown (API 34)</option>
                        <option value={35}>Android 15 VanillaIceCream (API 35)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>As alterações feitas neste visual manifest atualizam os patches de arquivo automaticamente.</span>
                  <span className="text-[#3DDC84] font-bold">Auto-Salvo</span>
                </div>

              </div>
            )}

            {/* E. ADVANCED INTEGRATED PROJECT STRUCTURE MANAGER */}
            {activeFile === 'project_manager' && (
              <ProjectManager
                appName={appName}
                setAppName={setAppName}
                appPackage={appPackage}
                setAppPackage={setAppPackage}
                appVersion={appVersion}
                setAppVersion={setAppVersion}
                appIcon={appIcon}
                setAppIcon={setAppIcon}
                themeColor={themeColor}
                setThemeColor={setThemeColor}
                sdkConfig={sdkConfig}
                setSdkConfig={setSdkConfig}
                files={files}
                setFiles={setFiles}
                activeFile={activeFile}
                setActiveFile={setActiveFile}
                onAddLogcat={addLogcat}
                triggerGradleSync={triggerGradleSync}
              />
            )}

            {/* D. GENERAL GENERIC CODE EDITOR PANEL */}
            {activeFile !== 'app/src/main/res/layout/activity_main.xml' && 
             activeFile !== 'app/build.gradle' && 
             activeFile !== 'settings' && 
             activeFile !== 'project_manager' && (
              <div className="flex-1 flex flex-col bg-slate-950 font-mono text-[11px] p-4 overflow-hidden relative">
                
                {/* Information badge ribbon */}
                <div className="px-3 py-1.5 bg-slate-900/60 rounded border border-slate-800 flex items-center justify-between select-none mb-3 shrink-0">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-slate-200 font-bold font-mono">{activeFile.split('/').pop()}</span>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">Editando {getActiveFileType().toUpperCase()} • Salvo em Cache</p>
                    </div>
                  </div>

                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Interactive code editor</span>
                </div>

                {/* Main coding workspace editor */}
                <div className="flex-1 overflow-auto flex select-text">
                  
                  {/* Left row labels lines */}
                  <div className="w-10 text-slate-700 border-r border-slate-900 text-right pr-2 select-none space-y-1.2 leading-relaxed pt-1.5">
                    {Array.from({ length: Math.max(10, getActiveFileContent().split('\n').length + 5) }).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Highlighted text layer + Editable area overlap styling */}
                  <div className="flex-grow h-full relative font-mono select-text bg-[#03060E]">
                    <textarea
                      value={getActiveFileContent()}
                      spellCheck={false}
                      onChange={(e) => handleActiveFileCodeChange(e.target.value)}
                      className="absolute inset-0 bg-transparent resize-none overflow-auto font-bold select-text text-transparent caret-white leading-relaxed p-4 pt-1 border-none focus:ring-0 font-mono text-xs w-full h-full z-10"
                    />
                    <pre className="absolute inset-0 select-text overflow-auto font-bold leading-relaxed p-4 pt-1 font-mono text-xs pointer-events-none w-full h-full">
                      {renderHighlightedCode(getActiveFileContent(), getActiveFileType())}
                    </pre>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* 3. TERMINAL BOTTOM LOGGER DRAWER */}
          <div className="bg-[#141517] border-t border-[#2D3035] select-none flex flex-col shrink-0">
            <div 
              onClick={() => setConsoleCollapsed(!consoleCollapsed)}
              className="px-4 py-1.8 hover:bg-[#1C1E22] cursor-pointer flex items-center justify-between border-b border-[#212428]"
            >
              <div className="flex items-center space-x-4 select-none">
                <button
                  type="button"
                  id="tab_console_gradle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConsoleCollapsed(false);
                    setActiveConsoleTab('gradle');
                  }}
                  className={`text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                    activeConsoleTab === 'gradle' && !consoleCollapsed ? 'text-[#3DDC84]' : 'text-slate-450 hover:text-slate-100'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Saída Gradle ({isSyncing ? 'Sincronizando...' : 'Online'})</span>
                </button>
                <button
                  type="button"
                  id="tab_console_logcat"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConsoleCollapsed(false);
                    setActiveConsoleTab('logcat');
                  }}
                  className={`text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                    activeConsoleTab === 'logcat' && !consoleCollapsed ? 'text-[#3DDC84]' : 'text-slate-450 hover:text-slate-100'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-[#3DDC84]" />
                  <span>Active Logcat (Emulador)</span>
                </button>
              </div>

              <div className="text-slate-500 hover:text-slate-300 p-0.5">
                <ChevronDown className={`w-4 h-4 transform transition ${consoleCollapsed ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Scrolling elements logger height */}
            {!consoleCollapsed && (
              <div className="h-40 bg-slate-950 p-3 overflow-y-auto select-text selection:bg-slate-850 font-mono text-[10px] leading-relaxed select-all scrollbar-thin">
                {activeConsoleTab === 'gradle' ? (
                  <div className="space-y-1 text-slate-300">
                    {consoleLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className={
                          log.includes('SUCCESS') 
                            ? 'text-[#3DDC84] font-bold' 
                            : log.includes('error') || log.includes('warning') 
                              ? 'text-amber-400' 
                              : 'text-indigo-200'
                        }
                      >
                        {log}
                      </div>
                    ))}
                    {isSyncing && (
                      <div className="text-slate-500 animate-pulse text-[9.5px] pl-2">
                        ▖ Conectando repositories maven central e parseando libs...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1 text-cyan-300">
                    {logcatLogs.map((log, index) => (
                      <div key={index} className="text-cyan-300 select-all font-semibold select-text">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 4. REALTIME APP DAEMON EXECUTABLE SIMULATION DEVICE */}
      <EmulatorModal
        isOpen={emulatorOpen}
        onClose={() => setEmulatorOpen(false)}
        layoutTree={layoutTree}
        deviceTheme={deviceTheme}
        sdkConfig={sdkConfig}
        appName={appName}
        appVersion={appVersion}
        appPackage={appPackage}
        appIcon={appIcon}
        themeColor={themeColor}
        onAddLogcat={addLogcat}
      />

      {/* 5. SPLENDID HIGH-FIDELITY GRADLE DAEMON APK PACKAGER COMPILER MODAL */}
      {showCompileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="w-[520px] bg-[#121316] rounded-2xl border border-slate-850 shadow-2xl overflow-hidden flex flex-col">
            
            <div className="p-4 bg-[#18191D] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-[#3DDC84] animate-spin" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-widest leading-none font-mono">Gradle Compilation Daemon</span>
              </div>
              {!compileSuccess && (
                <span className="text-[10px] text-slate-400 font-semibold font-mono animate-pulse">Building debug package...</span>
              )}
            </div>

            <div className="p-5 space-y-4 select-text">
              
              {/* Timing log progression bar details */}
              <div className="space-y-1.5 font-mono text-[10px] text-slate-400 flex justify-between select-none">
                <span>Task: app:assemble{compileSuccess ? 'Release' : 'Debug'}</span>
                <span className="text-[#3DDC84] font-bold">{compileProgress}%</span>
              </div>

              {/* Graphical gradient Progress-Bar */}
              <div className="w-full bg-slate-950 border border-slate-850 h-3 rounded-full overflow-hidden p-[2px]">
                <div 
                  style={{ width: `${compileProgress}%`, backgroundColor: themeColor }}
                  className="h-full rounded-full transition-all duration-300 shadow-lg shadow-[#000000]"
                />
              </div>

              {/* Compilation logs feed scroll views */}
              <div className="h-44 bg-slate-950 rounded-xl p-3 overflow-y-auto border border-slate-850 select-text font-mono text-[9.5px] leading-relaxed space-y-1 scrollbar-thin">
                {compiledApkLogs.map((log, index) => (
                  <div key={index} className="text-teal-200">
                    {log}
                  </div>
                ))}
                {!compileSuccess && (
                  <div className="text-slate-500 animate-pulse text-[8.5px] pl-3">
                    ▖ Compiling intermediate bytecode matrix segments...
                  </div>
                )}
              </div>

            </div>

            {/* Action buttons download binaries */}
            <div className="p-4 bg-[#141519] border-t border-slate-850 flex items-center justify-end space-x-2 shrink-0 select-none">
              {compileSuccess ? (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadApkFile}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-[#3DDC84] hover:brightness-105 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar APK Final ({appName}.apk)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCompileModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition cursor-pointer"
                  >
                    Fechar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 bg-slate-850 text-slate-500 font-bold rounded-lg text-xs cursor-not-allowed"
                >
                  Compilando APK... Aguarde
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
