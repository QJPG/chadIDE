/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AndroidLibrary {
  id: string; // unique key (e.g. "retrofit", "room-runtime")
  group: string;
  artifact: string;
  version: string;
  name: string;
  description: string;
  category: 'Core & UI' | 'Networking & IO' | 'Storage' | 'Concurrency & Architecture' | 'Testing' | 'Hilt & DI' | 'Jetpack Compose' | 'Firebase';
  defaultConfig: 'implementation' | 'api' | 'compileOnly' | 'runtimeOnly' | 'testImplementation' | 'androidTestImplementation' | 'kapt' | 'ksp';
  transitiveDependencies?: string[]; // Transitively loaded libraries (for tree visualization)
  logo?: string;
}

export const POPULAR_LIBRARIES: AndroidLibrary[] = [
  // Core & UI
  {
    id: 'appcompat',
    group: 'androidx.appcompat',
    artifact: 'appcompat',
    version: '1.6.1',
    name: 'AppCompat',
    description: 'Allow access to new APIs on older API versions of Android (backward compatibility).',
    category: 'Core & UI',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'androidx.core:core:1.9.0',
      'androidx.activity:activity:1.6.1',
      'androidx.fragment:fragment:1.3.6',
      'androidx.emoji2:emoji2:1.2.0',
    ],
  },
  {
    id: 'material',
    group: 'com.google.android.material',
    artifact: 'material',
    version: '1.11.0',
    name: 'Material Components',
    description: 'Material Design components for Android, providing cards, buttons, dialogs, and themes.',
    category: 'Core & UI',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'androidx.cardview:cardview:1.0.0',
      'androidx.recyclerview:recyclerview:1.2.1',
      'androidx.transition:transition:1.4.1',
    ],
  },
  {
    id: 'constraintlayout',
    group: 'androidx.constraintlayout',
    artifact: 'constraintlayout',
    version: '2.1.4',
    name: 'ConstraintLayout',
    description: 'Build flexible and responsive layouts with flat view structures (no nested panels).',
    category: 'Core & UI',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'androidx.constraintlayout:constraintlayout-solver:2.1.4',
    ],
  },
  // Jetpack Compose
  {
    id: 'compose-ui',
    group: 'androidx.compose.ui',
    artifact: 'ui',
    version: '1.6.0',
    name: 'Compose UI',
    description: 'The fundamental visual building blocks of Jetpack Compose declaratives.',
    category: 'Jetpack Compose',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'androidx.compose.runtime:runtime:1.6.0',
      'androidx.compose.ui:ui-geometry:1.6.0',
      'androidx.compose.ui:ui-graphics:1.6.0',
      'androidx.compose.ui:ui-text:1.6.0',
    ],
  },
  {
    id: 'compose-material3',
    group: 'androidx.compose.material3',
    artifact: 'material3',
    version: '1.2.0',
    name: 'Compose Material 3',
    description: 'Material Design 3 library components for building declarative screens with Kotlin.',
    category: 'Jetpack Compose',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'androidx.compose.ui:ui:1.6.0',
      'androidx.compose.material:material-icons-core:1.6.0',
    ],
  },
  {
    id: 'compose-navigation',
    group: 'androidx.navigation',
    artifact: 'navigation-compose',
    version: '2.7.6',
    name: 'Compose Navigation',
    description: 'Enables structured page transitions and nav-graphs in declarative UI apps.',
    category: 'Jetpack Compose',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'androidx.navigation:navigation-runtime:2.7.6',
      'androidx.navigation:navigation-common:2.7.6',
      'androidx.activity:activity-compose:1.8.2',
    ],
  },
  // Networking & IO
  {
    id: 'retrofit',
    group: 'com.squareup.retrofit2',
    artifact: 'retrofit',
    version: '2.9.0',
    name: 'Retrofit',
    description: 'Typesafe REST HTTP client for Android and Java by Square.',
    category: 'Networking & IO',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'com.squareup.okhttp3:okhttp:4.10.0',
    ],
  },
  {
    id: 'retrofit-gson',
    group: 'com.squareup.retrofit2',
    artifact: 'converter-gson',
    version: '2.9.0',
    name: 'Retrofit GSON Converter',
    description: 'Converter factory for serialization and parsing between JSON and Kotlin objects under Retrofit.',
    category: 'Networking & IO',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'com.google.code.gson:gson:2.10.1',
    ],
  },
  {
    id: 'okhttp',
    group: 'com.squareup.okhttp3',
    artifact: 'okhttp',
    version: '4.10.0',
    name: 'OkHttp Client',
    description: 'An efficient, secure HTTP & HTTP/2 client wrapper for network interceptors and cache control.',
    category: 'Networking & IO',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'com.squareup.okio:okio:3.0.0',
    ],
  },
  {
    id: 'glide',
    group: 'com.github.bumptech.glide',
    artifact: 'glide',
    version: '4.16.0',
    name: 'Glide',
    description: 'Media planning and image loading library for Android, highly responsive & smooth.',
    category: 'Networking & IO',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'com.github.bumptech.glide:gifdecoder:4.16.0',
      'androidx.vectordrawable:vectordrawable-animated:1.1.0',
    ],
  },
  {
    id: 'coil',
    group: 'io.coil-kt',
    artifact: 'coil',
    version: '2.5.0',
    name: 'Coil Library',
    description: 'Kotlin-first image loading library for Android, optimized for fast rendering and memory footprint.',
    category: 'Networking & IO',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'com.squareup.okhttp3:okhttp:4.10.0',
      'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3',
    ],
  },
  // Storage
  {
    id: 'room-runtime',
    group: 'androidx.room',
    artifact: 'room-runtime',
    version: '2.6.1',
    name: 'Room SQLite Database',
    description: 'Enterprise SQLite abstraction library providing robust database access with full compile inspection.',
    category: 'Storage',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'androidx.sqlite:sqlite-framework:2.4.0',
      'androidx.sqlite:sqlite:2.4.0',
      'androidx.room:room-common:2.6.1',
    ],
  },
  {
    id: 'room-compiler',
    group: 'androidx.room',
    artifact: 'room-compiler',
    version: '2.6.1',
    name: 'Room Compiler',
    description: 'Annotation processor compiler to generate SQLite query classes from interfaces.',
    category: 'Storage',
    defaultConfig: 'ksp',
    transitiveDependencies: [],
  },
  {
    id: 'datastore',
    group: 'androidx.datastore',
    artifact: 'datastore-preferences',
    version: '1.0.0',
    name: 'Jetpack DataStore Preferences',
    description: 'Perfect key-value storage mechanism designed to replace SharedPreferences reactively.',
    category: 'Storage',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'androidx.datastore:datastore:1.0.0',
      'org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3',
    ],
  },
  // Concurrency & DI
  {
    id: 'coroutines',
    group: 'org.jetbrains.kotlinx',
    artifact: 'kotlinx-coroutines-android',
    version: '1.7.3',
    name: 'Kotlin Coroutines Android',
    description: 'Provides Dispatchers.Main and UI-thread scheduling constraints for smooth operations.',
    category: 'Concurrency & Architecture',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3',
    ],
  },
  {
    id: 'lifecycle-viewmodel',
    group: 'androidx.lifecycle',
    artifact: 'lifecycle-viewmodel-ktx',
    version: '2.7.0',
    name: 'Jetpack Lifecycle ViewModel',
    description: 'Stores and manages UI-related data in a lifecycle-conscious way, persisting across rotation resizes.',
    category: 'Concurrency & Architecture',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'androidx.lifecycle:lifecycle-common:2.7.0',
      'androidx.lifecycle:lifecycle-runtime:2.7.0',
    ],
  },
  {
    id: 'hilt-android',
    group: 'com.google.dagger',
    artifact: 'hilt-android',
    version: '2.50',
    name: 'Dagger Hilt',
    description: 'De facto dependency injection wrapper on top of Dagger, streamlining DI across Android blocks.',
    category: 'Hilt & DI',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'com.google.dagger:dagger:2.50',
      'javax.inject:javax.inject:1',
    ],
  },
  {
    id: 'hilt-compiler',
    group: 'com.google.dagger',
    artifact: 'hilt-compiler',
    version: '2.50',
    name: 'Hilt Compiler',
    description: 'Generates boilerplates and inject paths needed for Hilt Dagger components.',
    category: 'Hilt & DI',
    defaultConfig: 'kapt',
    transitiveDependencies: [],
  },
  // Firebase
  {
    id: 'firebase-bom',
    group: 'com.google.firebase',
    artifact: 'firebase-bom',
    version: '32.7.2',
    name: 'Firebase Bill of Materials (BoM)',
    description: 'Configure and lock versions across all Google Firebase plugins without version specifications.',
    category: 'Firebase',
    defaultConfig: 'api',
    transitiveDependencies: [],
  },
  {
    id: 'firebase-analytics',
    group: 'com.google.firebase',
    artifact: 'firebase-analytics-ktx',
    version: '21.5.0',
    name: 'Firebase Analytics',
    description: 'Real-time telemetry and user interaction profiling dashboards.',
    category: 'Firebase',
    defaultConfig: 'implementation',
    transitiveDependencies: [
      'com.google.android.gms:play-services-measurement:21.5.0',
    ],
  },
  // Testing
  {
    id: 'junit',
    group: 'junit',
    artifact: 'junit',
    version: '4.13.2',
    name: 'JUnit 4',
    description: 'Simple unit testing compile engine to write Kotlin test structures.',
    category: 'Testing',
    defaultConfig: 'testImplementation',
    transitiveDependencies: [
      'org.hamcrest:hamcrest-core:1.3',
    ],
  },
  {
    id: 'espresso',
    group: 'androidx.test.espresso',
    artifact: 'espresso-core',
    version: '3.5.1',
    name: 'Espresso Core UI Test',
    description: 'Write whitebox UI tests to click and inspect emulator states programmatically.',
    category: 'Testing',
    defaultConfig: 'androidTestImplementation',
    transitiveDependencies: [
      'androidx.test:runner:1.5.2',
      'androidx.test:rules:1.5.2',
      'androidx.test.services:storage:1.4.2',
    ],
  },
];

export const DEFAULT_DEPENDENCIES: { group: string; artifact: string; version: string; config: string }[] = [
  { group: 'androidx.core', artifact: 'core-ktx', version: '1.12.0', config: 'implementation' },
  { group: 'androidx.appcompat', artifact: 'appcompat', version: '1.6.1', config: 'implementation' },
  { group: 'com.google.android.material', artifact: 'material', version: '1.11.0', config: 'implementation' },
  { group: 'androidx.constraintlayout', artifact: 'constraintlayout', version: '2.1.4', config: 'implementation' },
  { group: 'junit', artifact: 'junit', version: '4.13.2', config: 'testImplementation' },
  { group: 'androidx.test.ext', artifact: 'junit', version: '1.1.5', config: 'androidTestImplementation' },
  { group: 'androidx.test.espresso', artifact: 'espresso-core', version: '3.5.1', config: 'androidTestImplementation' },
];

export interface SdkVersionConfig {
  compileSdk: number;
  targetSdk: number;
  minSdk: number;
  buildToolsVersion: string;
  kotlinVersion: string;
}

export const DEFAULT_SDK_CONFIG: SdkVersionConfig = {
  compileSdk: 34,
  targetSdk: 34,
  minSdk: 26,
  buildToolsVersion: '34.0.0',
  kotlinVersion: '1.9.22',
};

export const SDK_PLATFORMS = [
  { apiLevel: 35, name: 'Android 15 (VanillaIceCream)', codename: 'VanillaIceCream', installed: true, status: 'Installed' },
  { apiLevel: 34, name: 'Android 14 (UpsideDownCake)', codename: 'UpsideDownCake', installed: true, status: 'Installed' },
  { apiLevel: 33, name: 'Android 13 (Tiramisu)', codename: 'Tiramisu', installed: true, status: 'Installed' },
  { apiLevel: 32, name: 'Android 12L (Sv2)', codename: 'SnowConev2', installed: false, status: 'Not Installed' },
  { apiLevel: 31, name: 'Android 12 (S)', codename: 'SnowCone', installed: false, status: 'Not Installed' },
  { apiLevel: 30, name: 'Android 11 (R)', codename: 'RedVelvetCake', installed: false, status: 'Not Installed' },
  { apiLevel: 29, name: 'Android 10 (Q)', codename: 'QuinceTart', installed: false, status: 'Not Installed' },
  { apiLevel: 28, name: 'Android 9.0 (Pie)', codename: 'Pie', installed: false, status: 'Not Installed' },
  { apiLevel: 26, name: 'Android 8.0 (Oreo)', codename: 'Oreo', installed: false, status: 'Not Installed' },
];
