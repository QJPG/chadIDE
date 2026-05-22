/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Settings, 
  Download, 
  Trash2, 
  Plus, 
  Braces, 
  GitFork, 
  Check, 
  Loader2, 
  RefreshCw,
  ClipboardCheck,
  Clipboard,
  Sliders,
  FolderSync
} from 'lucide-react';
import { 
  AndroidLibrary, 
  POPULAR_LIBRARIES, 
  SdkVersionConfig,
  SDK_PLATFORMS
} from '../utils/androidLibraries';

interface GradleManagerProps {
  dependencies: { group: string; artifact: string; version: string; config: string }[];
  setDependencies: React.Dispatch<React.SetStateAction<{ group: string; artifact: string; version: string; config: string }[]>>;
  sdkConfig: SdkVersionConfig;
  setSdkConfig: (cfg: SdkVersionConfig) => void;
  useVersionCatalog: boolean;
  setUseVersionCatalog: (val: boolean) => void;
  dslLanguage: 'groovy' | 'kotlin';
  setDslLanguage: (val: 'groovy' | 'kotlin') => void;
  triggerGradleSync: () => void;
  isSyncing: boolean;
  gradleLogs: string[];
}

export default function GradleManager({
  dependencies,
  setDependencies,
  sdkConfig,
  setSdkConfig,
  useVersionCatalog,
  setUseVersionCatalog,
  dslLanguage,
  setDslLanguage,
  triggerGradleSync,
  isSyncing,
  gradleLogs,
}: GradleManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'libraries' | 'scripts' | 'sdk_platforms'>('libraries');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Custom dependency form state
  const [customGroup, setCustomGroup] = useState('');
  const [customArtifact, setCustomArtifact] = useState('');
  const [customVersion, setCustomVersion] = useState('');
  const [customConfig, setCustomConfig] = useState('implementation');
  const [formError, setFormError] = useState('');

  // Sdk install simulation state
  const [downloadingSdkLevel, setDownloadingSdkLevel] = useState<number | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [localSdkPlatforms, setLocalSdkPlatforms] = useState(SDK_PLATFORMS);

  // Copy clips state
  const [copiedScript, setCopiedScript] = useState(false);

  // Popular library categories
  const categories = ['All', 'Core & UI', 'Jetpack Compose', 'Networking & IO', 'Storage', 'Concurrency & Architecture', 'Hilt & DI', 'Firebase', 'Testing'];

  // Handle adding a popular library
  const handleAddLibrary = (lib: AndroidLibrary) => {
    // Check if copy already exists
    const exists = dependencies.some(
      (dep) => dep.group === lib.group && dep.artifact === lib.artifact
    );

    if (exists) {
      alert(`Library "${lib.name}" (${lib.group}:${lib.artifact}) has already been added to your app dependencies list.`);
      return;
    }

    setDependencies((prev) => [
      ...prev,
      {
        group: lib.group,
        artifact: lib.artifact,
        version: lib.version,
        config: lib.defaultConfig,
      },
    ]);
  };

  // Add custom coordinate library
  const handleAddCustomDependency = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customGroup || !customArtifact || !customVersion) {
      setFormError('All fields (groupId, artifactId, and version) are required!');
      return;
    }

    // Coordinates check
    const exists = dependencies.some(
      (dep) => dep.group === customGroup && dep.artifact === customArtifact
    );

    if (exists) {
      setFormError('This custom library package coordinates are already declared.');
      return;
    }

    setDependencies((prev) => [
      ...prev,
      {
        group: customGroup,
        artifact: customArtifact,
        version: customVersion,
        config: customConfig,
      },
    ]);

    // Clear custom form fields
    setCustomGroup('');
    setCustomArtifact('');
    setCustomVersion('');
  };

  // Delete matching index
  const handleDeleteDependency = (index: number) => {
    setDependencies((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Update dependent compile configuration
  const handleUpdateConfig = (index: number, newConfig: string) => {
    setDependencies((prev) => {
      const copy = [...prev];
      copy[index].config = newConfig;
      return copy;
    });
  };

  // Simulate SDK download
  const handleInstallSdk = (apiLevel: number) => {
    if (downloadingSdkLevel !== null) return;
    
    setDownloadingSdkLevel(apiLevel);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLocalSdkPlatforms((prevList) =>
              prevList.map((platform) =>
                platform.apiLevel === apiLevel 
                  ? { ...platform, installed: true, status: 'Installed' } 
                  : platform
              )
            );
            setDownloadingSdkLevel(null);
            // Auto update SDK Config compile version to the newly downloaded level
            setSdkConfig({
              ...sdkConfig,
              compileSdk: Math.max(sdkConfig.compileSdk, apiLevel),
              targetSdk: Math.max(sdkConfig.targetSdk, apiLevel),
            });
            triggerGradleSync();
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  // Filter libraries search index
  const filteredPopularLibs = POPULAR_LIBRARIES.filter((lib) => {
    const matchesCategory = selectedCategory === 'All' || lib.category === selectedCategory;
    const matchesQuery = 
      lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lib.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${lib.group}:${lib.artifact}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // --- TRANSITIVE TREE BUILDER ---
  // Calculates direct and indirect packages
  const generateResolveTreeString = (): string => {
    const lines: string[] = [];
    lines.push('Resolved Dependencies Tree:');
    
    if (dependencies.length === 0) {
      lines.push('└── (No dependencies declared)');
      return lines.join('\n');
    }

    dependencies.forEach((dep, idx) => {
      const isLastRoot = idx === dependencies.length - 1;
      const rootPrefix = isLastRoot ? '└── ' : '├── ';
      const subPrefix = isLastRoot ? '    ' : '│   ';
      
      lines.push(`${rootPrefix}${dep.config} "${dep.group}:${dep.artifact}:${dep.version}"`);

      // Find matching popular library to extract transitive dependencies
      const matchPopular = POPULAR_LIBRARIES.find(
        (pop) => pop.group === dep.group && pop.artifact === dep.artifact
      );

      if (matchPopular && matchPopular.transitiveDependencies && matchPopular.transitiveDependencies.length > 0) {
        matchPopular.transitiveDependencies.forEach((transitiveDep, transIdx) => {
          const isLastSub = transIdx === matchPopular.transitiveDependencies!.length - 1;
          const subBranch = isLastSub ? '└── ' : '├── ';
          lines.push(`${subPrefix}${subBranch}${transitiveDep} (transitive dependency)`);
        });
      }
    });

    return lines.join('\n');
  };

  // --- GRADLE BUILD SCRIPT GENERATOR ---
  const generateGradleBuildScript = (): string => {
    const isKts = dslLanguage === 'kotlin';

    let script = `// Top-level Android Build Configuration script
plugins {
    id(${isKts ? '"com.android.application"' : "'com.android.application'"})
    id(${isKts ? '"org.jetbrains.kotlin.android"' : "'org.jetbrains.kotlin.android'"}) version ${isKts ? `"${sdkConfig.kotlinVersion}"` : `'${sdkConfig.kotlinVersion}'`}
}

android {
    namespace = "com.example.android.sandbox"
    compileSdk = ${sdkConfig.compileSdk}

    defaultConfig {
        applicationId = "com.example.android.sandbox"
        minSdk = ${sdkConfig.minSdk}
        targetSdk = ${sdkConfig.targetSdk}
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
`;

    dependencies.forEach((dep) => {
      if (useVersionCatalog) {
        // Convert com.squareup.retrofit2:retrofit to libs.retrofit catalog reference representation
        const matchPopular = POPULAR_LIBRARIES.find(
          (pop) => pop.group === dep.group && pop.artifact === dep.artifact
        );
        const catalogAlias = matchPopular ? matchPopular.id : dep.artifact.replace(/-/g, '.');

        if (isKts) {
          script += `    ${dep.config}(libs.${catalogAlias})\n`;
        } else {
          script += `    ${dep.config} libs.${catalogAlias}\n`;
        }
      } else {
        // String coordinate standard style
        if (isKts) {
          script += `    ${dep.config}("${dep.group}:${dep.artifact}:${dep.version}")\n`;
        } else {
          script += `    ${dep.config} '${dep.group}:${dep.artifact}:${dep.version}'\n`;
        }
      }
    });

    script += `}`;
    return script;
  };

  // --- VERSION CATALOG TOML GENERATOR ---
  const generateVersionCatalogString = (): string => {
    let toml = `[versions]
kotlin = "${sdkConfig.kotlinVersion}"
`;

    const librariesSection: string[] = [];

    dependencies.forEach((dep) => {
      const matchPopular = POPULAR_LIBRARIES.find(
        (pop) => pop.group === dep.group && pop.artifact === dep.artifact
      );
      const catalogAlias = matchPopular ? matchPopular.id : dep.artifact.replace(/-/g, '.');
      
      // Capitalize version key for elegance e.g. "retrofit = '2.9.0'"
      const versionKey = catalogAlias.replace(/\./g, '-');
      toml += `${versionKey} = "${dep.version}"\n`;

      librariesSection.push(`${catalogAlias} = { group = "${dep.group}", name = "${dep.artifact}", version.ref = "${versionKey}" }`);
    });

    toml += '\n[libraries]\n';
    librariesSection.forEach((lib) => {
      toml += `${lib}\n`;
    });

    toml += `\n[plugins]
android-application = { id = "com.android.application", version = "8.2.2" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`;

    return toml;
  };

  // Copy selection script text helper
  const handleCopyScript = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="flex-1 flex overflow-hidden h-full bg-[#1A1C20] select-none text-slate-300 font-sans">
      
      {/* LEFT AREA: Configurator and Popular Modules lists */}
      <div className="w-[60%] flex flex-col border-r border-[#2B2D30] overflow-hidden">
        
        {/* Sync Status Banner */}
        <div className="bg-[#212429] border-b border-[#2D3035] p-3 p-y-2 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSyncing ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSyncing ? 'bg-amber-500' : 'bg-cyan-400'}`}></span>
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {isSyncing ? 'Gradle Engine is compiling...' : 'Gradle System State: Active Sync Ready'}
            </span>
          </div>

          <button
            type="button"
            id="btn_gradle_trigger_sync"
            onClick={triggerGradleSync}
            disabled={isSyncing}
            className="px-3 py-1 bg-[#3DDC84] hover:bg-[#3DDC84]/80 disabled:bg-slate-700 text-slate-950 font-bold text-xs rounded transition flex items-center space-x-1.5 shadow"
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
            )}
            <span>Sync Gradle</span>
          </button>
        </div>

        {/* Sub Navigation Bar Tabs */}
        <div className="flex border-b border-[#2D3035] bg-[#1E2024] select-none text-xs">
          <button
            type="button"
            id="tab_opt_libraries"
            onClick={() => setActiveSubTab('libraries')}
            className={`px-4 py-2.5 font-bold transition-all ${activeSubTab === 'libraries' ? 'border-b-2 border-[#3DDC84] text-[#3DDC84] bg-slate-900/10' : 'text-slate-400 hover:text-slate-100'}`}
          >
            SDK & Library Search
          </button>
          <button
            type="button"
            id="tab_opt_sdk_platforms"
            onClick={() => setActiveSubTab('sdk_platforms')}
            className={`px-4 py-2.5 font-bold transition-all ${activeSubTab === 'sdk_platforms' ? 'border-b-2 border-[#3DDC84] text-[#3DDC84] bg-slate-900/10' : 'text-slate-400 hover:text-slate-100'}`}
          >
            SDK Platform Manager
          </button>
          <button
            type="button"
            id="tab_opt_scripts"
            onClick={() => setActiveSubTab('scripts')}
            className={`px-4 py-2.5 font-bold transition-all ${activeSubTab === 'scripts' ? 'border-b-2 border-[#3DDC84] text-[#3DDC84] bg-slate-900/10' : 'text-slate-400 hover:text-slate-100'}`}
          >
            Config scripts (.gradle)
          </button>
        </div>

        {/* Dynamic Inner Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          
          {activeSubTab === 'libraries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100">Browse Gradle Catalogues</h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Maven Sync</span>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="md:col-span-2 relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                  <input
                    id="lib_search_query"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search com.google.android or 'Room' database..."
                    className="w-full text-xs bg-slate-950 px-8 py-2.5 rounded border border-slate-800 text-slate-200 outline-none focus:border-[#3DDC84] placeholder-slate-600"
                  />
                </div>
                <select
                  id="lib_search_category_filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300 focus:border-[#3DDC84]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Grid cards for libraries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                {filteredPopularLibs.map((lib) => {
                  const isAdded = dependencies.some(
                    (dep) => dep.group === lib.group && dep.artifact === lib.artifact
                  );

                  return (
                    <div
                      key={lib.id}
                      className="p-3 bg-[#1C1E22] rounded border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[#3DDC84] uppercase">
                            {lib.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[120px]">{lib.version}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mt-2">{lib.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-3 leading-relaxed">{lib.description}</p>
                        <p className="text-[9px] font-mono text-slate-500 mt-2 select-all select-text truncate">{lib.group}:{lib.artifact}</p>
                      </div>

                      <div className="mt-3.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Def Scope: <b className="text-slate-400">{lib.defaultConfig}</b></span>
                        <button
                          type="button"
                          id={`btn_add_lib_${lib.id}`}
                          onClick={() => handleAddLibrary(lib)}
                          disabled={isAdded}
                          className={`text-[10px] px-2.5 py-1 rounded font-bold cursor-pointer transition ${
                            isAdded 
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                              : 'bg-[#3DDC84]/15 hover:bg-[#3DDC84]/25 text-[#3DDC84]'
                          }`}
                        >
                          {isAdded ? 'Added' : 'Add SDK'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom manual Dependency submission form */}
              <div className="p-4 bg-slate-900/30 rounded border border-slate-800 space-y-3 pb-5">
                <div className="flex items-center space-x-2">
                  <Braces className="w-4 h-4 text-slate-400" />
                  <h4 className="text-xs font-bold text-slate-200">Submit Custom Gradle Coordinates</h4>
                </div>
                <p className="text-[10px] text-slate-500">If you need an internal company package or specific Maven SDK, declare coordinates manually here.</p>

                <form onSubmit={handleAddCustomDependency} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      id="custom_dep_group"
                      type="text"
                      value={customGroup}
                      onChange={(e) => setCustomGroup(e.target.value)}
                      placeholder="e.g. com.google.gson"
                      className="text-xs bg-slate-950 px-2.5 py-2 rounded border border-slate-800 text-slate-200 outline-none focus:border-[#3DDC84]"
                    />
                    <input
                      id="custom_dep_artifact"
                      type="text"
                      value={customArtifact}
                      onChange={(e) => setCustomArtifact(e.target.value)}
                      placeholder="e.g. gson"
                      className="text-xs bg-slate-950 px-2.5 py-2 rounded border border-slate-800 text-slate-200 outline-none focus:border-[#3DDC84]"
                    />
                    <input
                      id="custom_dep_version"
                      type="text"
                      value={customVersion}
                      onChange={(e) => setCustomVersion(e.target.value)}
                      placeholder="e.g. 2.10.1"
                      className="text-xs bg-slate-950 px-2.5 py-2 rounded border border-slate-800 text-slate-200 outline-none focus:border-[#3DDC84]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400 font-semibold">Scope:</span>
                      <select
                        id="custom_dep_config"
                        value={customConfig}
                        onChange={(e) => setCustomConfig(e.target.value)}
                        className="text-[10px] bg-slate-950 px-1 py-1 rounded border border-slate-800 text-slate-300"
                      >
                        <option value="implementation">implementation</option>
                        <option value="api">api</option>
                        <option value="testImplementation">testImplementation</option>
                        <option value="kapt">kapt (apt)</option>
                        <option value="ksp">ksp (kotlin symbols)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      id="btn_custom_dep_submit"
                      className="px-4 py-1.5 bg-[#3DDC84] text-slate-950 text-xs font-bold rounded hover:bg-[#3DDC84]/95 transition cursor-pointer"
                    >
                      Inject Coordinate
                    </button>
                  </div>

                  {formError && (
                    <p className="text-[10.5px] text-rose-400 font-semibold">{formError}</p>
                  )}
                </form>
              </div>
            </div>
          )}

          {activeSubTab === 'sdk_platforms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Android SDK Platform Tools</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Toggle local API packages to expand code compatibility triggers.</p>
                </div>
                <Settings className="w-4 h-4 text-slate-500 animate-spin" />
              </div>

              {/* Base editable properties */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#1C1E22] p-4 rounded border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">compileSdk</span>
                  <select
                    id="sdk_select_compile"
                    value={sdkConfig.compileSdk}
                    onChange={(e) => setSdkConfig({ ...sdkConfig, compileSdk: parseInt(e.target.value, 10) })}
                    className="w-full text-xs bg-slate-950 px-1.5 py-1 rounded border border-slate-800"
                  >
                    {[34, 33, 31, 30, 29, 28].map((v) => (
                      <option key={v} value={v}>API {v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">targetSdk</span>
                  <select
                    id="sdk_select_target"
                    value={sdkConfig.targetSdk}
                    onChange={(e) => setSdkConfig({ ...sdkConfig, targetSdk: parseInt(e.target.value, 10) })}
                    className="w-full text-xs bg-slate-950 px-1.5 py-1 rounded border border-slate-800"
                  >
                    {[34, 33, 31, 30].map((v) => (
                      <option key={v} value={v}>API {v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">minSdk</span>
                  <select
                    id="sdk_select_min"
                    value={sdkConfig.minSdk}
                    onChange={(e) => setSdkConfig({ ...sdkConfig, minSdk: parseInt(e.target.value, 10) })}
                    className="w-full text-xs bg-slate-950 px-1.5 py-1 rounded border border-slate-800"
                  >
                    {[21, 24, 26, 28, 30].map((v) => (
                      <option key={v} value={v}>API {v}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Kotlin JDK</span>
                  <select
                    id="sdk_select_kotlin"
                    value={sdkConfig.kotlinVersion}
                    onChange={(e) => setSdkConfig({ ...sdkConfig, kotlinVersion: e.target.value })}
                    className="w-full text-xs bg-slate-950 px-1.5 py-1 rounded border border-slate-800"
                  >
                    <option value="1.9.22">1.9.22</option>
                    <option value="1.8.20">1.8.20</option>
                    <option value="1.7.10">1.7.10</option>
                  </select>
                </div>
              </div>

              {/* Status table */}
              <div className="bg-[#1C1E22] rounded border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#2B2D30]/30 text-slate-400 border-b border-slate-800 p-2">
                      <th className="p-3 font-semibold text-[11px]">API Level</th>
                      <th className="p-3 font-semibold text-[11px]">Platform Package Name</th>
                      <th className="p-3 font-semibold text-[11px]">Status State</th>
                      <th className="p-3 font-semibold text-[11px] text-right">Action Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {localSdkPlatforms.map((platform) => (
                      <tr key={platform.apiLevel} className="hover:bg-slate-900/10 transition-colors">
                        <td className="p-3 font-mono font-bold text-cyan-400">API {platform.apiLevel}</td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-200">{platform.name}</span>
                          <span className="block text-[10px] text-slate-500">Codename: {platform.codename}</span>
                        </td>
                        <td className="p-3">
                          {downloadingSdkLevel === platform.apiLevel ? (
                            <div className="space-y-1.5 w-32">
                              <span className="text-[9px] text-slate-400 flex items-center">
                                <Loader2 className="w-2.5 h-2.5 animate-spin mr-1.5 text-[#3DDC84]" />
                                Downloading ({downloadProgress}%)
                              </span>
                              <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                                <div className="bg-[#3DDC84] h-full transition-all duration-100" style={{ width: `${downloadProgress}%` }} />
                              </div>
                            </div>
                          ) : platform.installed ? (
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                              Installed
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              Available
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {!platform.installed && downloadingSdkLevel !== platform.apiLevel && (
                            <button
                              type="button"
                              id={`btn_install_sdk_level_${platform.apiLevel}`}
                              onClick={() => handleInstallSdk(platform.apiLevel)}
                              className="px-2.5 py-1 bg-slate-850 hover:bg-[#3DDC84]/20 text-slate-300 hover:text-[#3DDC84] rounded font-semibold text-[10.5px] border border-slate-850 transition"
                            >
                              Get Update
                            </button>
                          )}
                          {platform.installed && (
                            <span className="text-[10px] text-slate-500 font-semibold text-right block pr-2">Sys Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSubTab === 'scripts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Live Generated Files</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Toggle catalog structures to sync compiler DSL mappings.</p>
                </div>
              </div>

              {/* Interactive switches */}
              <div className="p-4 bg-[#1C1E22] rounded border border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200">Catalog structure (libs.versions.toml)</span>
                    <p className="text-[10px] text-slate-500">Maps library references and lock-files inside a Version Catalog schema.</p>
                  </div>
                  <div className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${useVersionCatalog ? 'bg-[#3DDC84]' : 'bg-slate-700'}`}>
                    <div 
                      id="opt_use_catalog_toggle"
                      onClick={() => setUseVersionCatalog(!useVersionCatalog)}
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-150 ${useVersionCatalog ? 'translate-x-[20px]' : 'translate-x-0'}`} 
                    />
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-200">Build script syntax dialect</span>
                    <p className="text-[10px] text-slate-500">Choose between traditional Apache Groovy format and Kotlin .kts formats.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 bg-[#141518] p-1 rounded border border-slate-800">
                    <button
                      type="button"
                      id="opt_dsl_groovy"
                      onClick={() => setDslLanguage('groovy')}
                      className={`text-[10px] font-bold py-1 px-2.5 rounded transition ${dslLanguage === 'groovy' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Groovy (.gradle)
                    </button>
                    <button
                      type="button"
                      id="opt_dsl_kotlin"
                      onClick={() => setDslLanguage('kotlin')}
                      className={`text-[10px] font-bold py-1 px-2.5 rounded transition ${dslLanguage === 'kotlin' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Kotlin (.kts)
                    </button>
                  </div>
                </div>
              </div>

              {/* Output raw viewer */}
              <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#3DDC84]">
                    {useVersionCatalog 
                      ? 'gradle/libs.versions.toml' 
                      : dslLanguage === 'kotlin' 
                        ? 'build.gradle.kts (App)' 
                        : 'build.gradle (App)'
                    }
                  </span>
                  
                  <button
                    type="button"
                    id="btn_copy_script"
                    onClick={() => handleCopyScript(useVersionCatalog ? generateVersionCatalogString() : generateGradleBuildScript())}
                    className="p-1 px-2 bg-slate-800/50 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-150 transition flex items-center space-x-1.5"
                    title="Copy Code"
                  >
                    {copiedScript ? (
                      <>
                        <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Copy code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-[11px] font-mono text-cyan-200 select-all leading-relaxed max-h-[280px]">
                  {useVersionCatalog ? generateVersionCatalogString() : generateGradleBuildScript()}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT AREA: Declared dependencies panel and Transitive Dependency Tree graph */}
      <div className="w-[40%] flex flex-col overflow-hidden bg-[#15171A]">
        
        {/* Header header */}
        <div className="p-3 border-b border-[#2D3035] bg-[#1A1C20] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Active Dependencies ({dependencies.length})</span>
          <span className="text-[9px] text-[#3DDC84] font-medium font-mono uppercase">build.gradle files</span>
        </div>

        {/* List of declared dependencies */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 border-b border-[#2B2D30] scrollbar-thin">
          {dependencies.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 pt-16">
              <FolderSync className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs font-semibold">No SDKs declared</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[180px]">Your build.gradle is clean. Search libraries on the left to inject dependencies.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {dependencies.map((dep, idx) => (
                <div
                  key={dep.group + dep.artifact}
                  className="p-2.5 rounded bg-[#1C1E22] border border-slate-800 hover:border-slate-705 flex items-center justify-between space-x-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200 truncate">{dep.artifact}</p>
                    <p className="text-[9px] font-mono text-slate-500 truncate">{dep.group}:{dep.version}</p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* Direct selector for scope config */}
                    <select
                      id={`dep_scope_select_${idx}`}
                      value={dep.config}
                      onChange={(e) => handleUpdateConfig(idx, e.target.value)}
                      className="text-[9.5px] bg-[#141518] px-1 py-1 rounded border border-slate-800 text-slate-400"
                    >
                      <option value="implementation">impl</option>
                      <option value="api">api</option>
                      <option value="testImplementation">test</option>
                      <option value="kapt">kapt</option>
                      <option value="ksp">ksp</option>
                    </select>

                    <button
                      type="button"
                      id={`btn_delete_dep_${idx}`}
                      onClick={() => handleDeleteDependency(idx)}
                      className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-550 hover:text-white transition cursor-pointer"
                      title="Remove Dependency"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Transitive tree visual graph */}
        <div className="h-64 bg-[#121316] flex flex-col">
          <div className="px-3 py-2 bg-[#17181c] border-b border-[#2B2D30] flex items-center justify-between select-none">
            <div className="flex items-center space-x-1.5">
              <GitFork className="w-3.5 h-3.5 text-indigo-400 rotate-90" />
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Transitive Resolution Tree</span>
            </div>
            <span className="text-[9px] text-slate-600">Simulate transitive compile maps</span>
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-[10.5px] text-indigo-200 leading-relaxed scrollbar-thin select-all">
            <pre className="whitespace-pre">{generateResolveTreeString()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
