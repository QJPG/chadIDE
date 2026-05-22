/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileCode, 
  Settings2, 
  Database, 
  Code,
  Layout,
  Terminal,
  FileText,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export interface IDFile {
  name: string;
  path: string;
  content: string;
  type: 'kt' | 'java' | 'xml' | 'gradle' | 'toml' | 'properties' | 'pro' | 'txt' | 'json';
}

interface IdeSidebarProps {
  files: IDFile[];
  activeFile: string;
  setActiveFile: (path: string) => void;
  onCreateFile: (name: string, folder: string, type: 'kt' | 'java' | 'xml' | 'gradle' | 'toml' | 'properties' | 'pro' | 'txt' | 'json') => void;
  onRenameFile: (path: string, newName: string) => void;
  onDeleteFile: (path: string) => void;
  gradleSyncRequired: boolean;
  isSyncing: boolean;
}

export default function IdeSidebar({
  files,
  activeFile,
  setActiveFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  gradleSyncRequired,
  isSyncing
}: IdeSidebarProps) {
  // Folder expansion map
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
    app: true,
    src: true,
    main: true,
    res: true,
    layout: true,
    values: true,
    java: true,
    gradle: true,
  });

  // Custom modals toggles
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'kt' | 'java' | 'xml' | 'gradle' | 'toml' | 'properties' | 'pro' | 'txt' | 'json'>('kt');
  const [newFileFolder, setNewFileFolder] = useState('app/src/main/java/com/example/android/sandbox');

  // Rename states
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleFolder = (folderName: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    // Check extensions and append if missing
    let cleanName = newFileName.trim();
    const desiredExt = `.${newFileType}`;
    if (!cleanName.endsWith(desiredExt)) {
      cleanName += desiredExt;
    }

    onCreateFile(cleanName, newFileFolder, newFileType);
    setNewFileName('');
    setShowCreateModal(false);
  };

  const triggerRename = (file: IDFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingPath(file.path);
    setRenameValue(file.name);
  };

  const saveRename = (path: string) => {
    if (renameValue.trim() && renameValue.trim() !== path.split('/').pop()) {
      onRenameFile(path, renameValue.trim());
    }
    setRenamingPath(null);
  };

  const triggerDelete = (file: IDFile, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Safety check on critical layout/manifest files
    if (file.name === 'activity_main.xml' || file.name === 'AndroidManifest.xml' || file.name === 'strings.xml' || file.name === 'build.gradle') {
      alert(`O arquivo '${file.name}' é um componente de estrutura central e não pode ser deletado!`);
      return;
    }

    const consent = window.confirm(`Deseja realmente deletar o arquivo '${file.name}'? Esta alteração é irreversível.`);
    if (consent) {
      onDeleteFile(file.path);
    }
  };

  const getFileIcon = (file: IDFile) => {
    switch (file.type) {
      case 'kt':
        return <FileCode className="w-4 h-4 text-amber-500" />;
      case 'java':
        return <FileCode className="w-4 h-4 text-orange-400" />;
      case 'xml':
        if (file.name.includes('layout')) {
          return <Layout className="w-4 h-4 text-[#3DDC84]" />;
        }
        return <Code className="w-4 h-4 text-teal-400" />;
      case 'gradle':
        return <Settings2 className="w-4 h-4 text-indigo-400" />;
      case 'toml':
        return <Database className="w-4 h-4 text-sky-450" />;
      case 'properties':
        return <Settings2 className="w-4 h-4 text-slate-450" />;
      case 'pro':
        return <FileText className="w-4 h-4 text-slate-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  // Traversal lists grouped by directories
  const filterFilesInFolder = (folderPath: string) => {
    return files.filter(f => {
      const parts = f.path.split('/');
      parts.pop(); // remove file name
      const currentFolder = parts.join('/');
      return currentFolder === folderPath;
    });
  };

  const renderFileRow = (file: IDFile, plClass: string) => {
    const isSelected = activeFile === file.path;
    const isRenaming = renamingPath === file.path;

    return (
      <div
        id={`file_row_${file.path.replace(/\//g, '_').replace(/\./g, '_')}`}
        key={file.path}
        onClick={() => setActiveFile(file.path)}
        className={`group flex items-center px-4 py-1 cursor-pointer text-sm font-medium transition-colors border-l-2 select-none ${
          isSelected 
            ? 'bg-[#2E3138] text-[#3DDC84] border-[#3DDC84]' 
            : 'text-slate-300 hover:bg-[#22252a] hover:text-white border-transparent'
        } ${plClass}`}
      >
        <span className="mr-2 shrink-0">{getFileIcon(file)}</span>
        
        {isRenaming ? (
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => saveRename(file.path)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveRename(file.path);
              if (e.key === 'Escape') setRenamingPath(null);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            className="bg-[#1A1C20] text-[#3DDC84] text-xs font-semibold px-1 py-0.5 border border-[#3DDC84] rounded outline-none w-28"
          />
        ) : (
          <span className="truncate flex-grow text-xs leading-none py-1">{file.name}</span>
        )}

        {/* Sync Indicator */}
        {file.name === 'build.gradle' && gradleSyncRequired && !isSyncing && (
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse" title="Gradle Sync Required" />
        )}

        {/* Edit & Delete operations */}
        {!isRenaming && (
          <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1.5 ml-2 transition-opacity duration-150 shrink-0">
            <button
              type="button"
              onClick={(e) => triggerRename(file, e)}
              className="p-0.5 hover:text-white text-slate-550 rounded"
              title="Renomear"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => triggerDelete(file, e)}
              className="p-0.5 hover:text-rose-450 text-slate-555 rounded"
              title="Excluir"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderFolderHeader = (folderName: string, folderKey: string, plClass: string) => {
    const isExpanded = expandedFolders[folderKey];
    return (
      <div
        id={`folder_hdr_${folderKey}`}
        onClick={(e) => toggleFolder(folderKey, e)}
        className={`flex items-center px-3 py-1 cursor-pointer text-sm text-slate-400 hover:text-slate-100 hover:bg-[#22252a] select-none ${plClass}`}
      >
        <span className="mr-1.5">
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-sky-400" />
          ) : (
            <Folder className="w-4 h-4 text-sky-400" />
          )}
        </span>
        <span className="font-bold text-[10.5px] uppercase tracking-wider text-slate-500 font-mono flex-grow truncate">{folderName}</span>
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-[#1A1C20] border-r border-[#2B2D30] flex flex-col select-none relative shrink-0">
      
      {/* Sidebar header row */}
      <div className="p-3.5 border-b border-[#2B2D30] bg-[#1E2024] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-[#3DDC84] flex items-center justify-center">
            <span className="text-[10px] text-[#0F172A] font-extrabold font-mono">IDE</span>
          </div>
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">Explorer</span>
        </div>

        {/* Create File visual trigger */}
        <button
          type="button"
          id="btn_create_file"
          onClick={() => setShowCreateModal(true)}
          className="p-1.5 bg-[#2E3138] hover:bg-slate-800 text-[#3DDC84] rounded-lg transition-all border border-slate-700/50 flex items-center justify-center"
          title="Novo arquivo de código"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Traversal Tree Area */}
      <div className="flex-grow overflow-y-auto py-2.5 space-y-1.5 scrollbar-thin">
        
        {/* Project directory head */}
        <div className="px-3 py-0.5 flex items-center text-[10px] font-extrabold text-slate-550 text-indigo-400 select-none font-mono">
          <span>PROJECT: /home/android/sandbox</span>
        </div>

        {/* Collapsible App Folder */}
        <div>
          {renderFolderHeader('app', 'app', 'pl-2')}
          {expandedFolders['app'] && (
            <div className="mt-1 space-y-1">
              
              {/* app/src */}
              {renderFolderHeader('src', 'src', 'pl-4')}
              {expandedFolders['src'] && (
                <div className="mt-1 space-y-1">

                  {/* app/src/main */}
                  {renderFolderHeader('main', 'main', 'pl-6')}
                  {expandedFolders['main'] && (
                    <div className="mt-1 space-y-1">

                      {/* java/kotlin package folder */}
                      {renderFolderHeader('java / kotlin', 'java', 'pl-8')}
                      {expandedFolders['java'] && (
                        <div className="mt-1 pl-2">
                          {filterFilesInFolder('app/src/main/java/com/example/android/sandbox').map(file => renderFileRow(file, 'pl-8'))}
                        </div>
                      )}

                      {/* res resources folder */}
                      {renderFolderHeader('res (resources)', 'res', 'pl-8')}
                      {expandedFolders['res'] && (
                        <div className="mt-1 space-y-1">

                          {/* layouts */}
                          {renderFolderHeader('layout', 'layout', 'pl-10')}
                          {expandedFolders['layout'] && (
                            <div className="mt-1 pl-2">
                              {filterFilesInFolder('app/src/main/res/layout').map(file => renderFileRow(file, 'pl-10'))}
                            </div>
                          )}

                          {/* values folder */}
                          {renderFolderHeader('values', 'values', 'pl-10')}
                          {expandedFolders['values'] && (
                            <div className="mt-1 pl-2">
                              {filterFilesInFolder('app/src/main/res/values').map(file => renderFileRow(file, 'pl-10'))}
                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  )}

                </div>
              )}

              {/* app-level files */}
              <div className="mt-1">
                {files
                  .filter(f => f.path.startsWith('app/') && !f.path.includes('src/'))
                  .map(file => renderFileRow(file, 'pl-6'))}
              </div>

            </div>
          )}
        </div>

        {/* Gradle scripts folder */}
        <div>
          {renderFolderHeader('Gradle Tools', 'gradle', 'pl-2')}
          {expandedFolders['gradle'] && (
            <div className="mt-1 space-y-1">
              {files
                .filter(f => !f.path.startsWith('app/') && f.path.includes('gradle'))
                .map(file => renderFileRow(file, 'pl-4'))}
              
              {/* Root-level remaining files */}
              {files
                .filter(f => !f.path.startsWith('app/') && !f.path.includes('gradle') && f.path !== activeFile)
                .map(file => renderFileRow(file, 'pl-4'))}
            </div>
          )}
        </div>

      </div>

      {/* Create File Modal PopUp Overlay */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-[#0F1115]/95 z-50 p-4 shrink-0 flex flex-col justify-center animate-fade-in text-slate-200">
          <form onSubmit={handleCreateSubmit} className="space-y-4 p-4 rounded-xl border border-slate-750 bg-[#15171B]">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <Sparkles className="w-4 h-4 text-[#3DDC84]" />
              <h4 className="text-xs font-bold text-slate-150 uppercase tracking-widest leading-none">Criar Novo Código</h4>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Nome do Arquivo</label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g., NetworkService, strings"
                required
                className="w-full px-3 py-1.8 bg-slate-950 border border-slate-750 focus:border-[#3DDC84] text-xs rounded-lg text-white outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Tipo / Linguagem</label>
              <select
                value={newFileType}
                onChange={(e) => {
                  const type = e.target.value as any;
                  setNewFileType(type);
                  // Update path depending on type
                  if (type === 'kt' || type === 'java') {
                    setNewFileFolder('app/src/main/java/com/example/android/sandbox');
                  } else if (type === 'xml') {
                    if (newFileName.toLowerCase().includes('layout')) {
                      setNewFileFolder('app/src/main/res/layout');
                    } else {
                      setNewFileFolder('app/src/main/res/values');
                    }
                  } else if (type === 'gradle' || type === 'toml' || type === 'properties') {
                    setNewFileFolder('gradle');
                  } else {
                    setNewFileFolder('app');
                  }
                }}
                className="w-full px-2.5 py-1.8 bg-slate-950 border border-slate-750 text-xs rounded-lg text-slate-200 outline-none"
              >
                <option value="kt">Kotlin Class / File (.kt)</option>
                <option value="java">Java Source code (.java)</option>
                <option value="xml">XML Layout / Resource (.xml)</option>
                <option value="gradle">Gradle Build script (.gradle)</option>
                <option value="toml">Version Catalog (.toml)</option>
                <option value="properties">Properties configuration (.properties)</option>
                <option value="pro">Proguard Rules (.pro)</option>
                <option value="txt">Plain Text File (.txt)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400">Diretório Interno (Destino)</label>
              <select
                value={newFileFolder}
                onChange={(e) => setNewFileFolder(e.target.value)}
                className="w-full px-2.5 py-1.8 bg-slate-950 border border-slate-750 text-xs rounded-lg text-slate-400 outline-none"
              >
                <option value="app/src/main/java/com/example/android/sandbox">com.example.android.sandbox (java/kotlin source)</option>
                <option value="app/src/main/res/layout">app/src/main/res/layout (Layout views)</option>
                <option value="app/src/main/res/values">app/src/main/res/values (Resources, labels)</option>
                <option value="app">app submodule root (manifest or rules)</option>
                <option value="gradle">gradle build resources</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="submit"
                className="flex-grow py-2 bg-[#3DDC84] text-slate-950 font-bold rounded-lg text-xs hover:brightness-105 transition"
              >
                Criar Arquivo
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating status metadata details */}
      <div className="p-3 bg-[#131417] border-t border-[#2B2D30] text-[11px] text-slate-500 space-y-1 shrink-0 font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span>Target Platform:</span>
          <span className="text-[#3DDC84] font-bold">Android 14 (34)</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Project Files:</span>
          <span>{files.length} nodes</span>
        </div>
      </div>
    </div>
  );
}
