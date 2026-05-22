/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VisualElement {
  id: string; // e.g., "@+id/textView1"
  type:
    | 'LinearLayout'
    | 'RelativeLayout'
    | 'ConstraintLayout'
    | 'FrameLayout'
    | 'ScrollView'
    | 'TextView'
    | 'Button'
    | 'ImageView'
    | 'EditText'
    | 'ProgressBar'
    | 'Switch'
    | 'CardView'
    | 'View'
    | 'Slider';
  attributes: Record<string, string>;
  children?: VisualElement[];
}

// Visual layout helper elements
export interface PaletteItem {
  type: VisualElement['type'];
  name: string;
  category: 'Layouts' | 'Widgets' | 'Containers' | 'Helpers';
  icon: string; // Represent icon name from lucide
  defaultAttributes: Record<string, string>;
}

export const PALETTE_ITEMS: PaletteItem[] = [
  // Layouts
  {
    type: 'LinearLayout',
    name: 'LinearLayout (Vertical)',
    category: 'Layouts',
    icon: 'AlignVerticalJustifyStart',
    defaultAttributes: {
      'android:id': '@+id/linearLayout',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'wrap_content',
      'android:orientation': 'vertical',
      'android:padding': '16dp',
    },
  },
  {
    type: 'LinearLayout',
    name: 'LinearLayout (Horizontal)',
    category: 'Layouts',
    icon: 'AlignHorizontalJustifyStart',
    defaultAttributes: {
      'android:id': '@+id/linearLayoutHorizontal',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'wrap_content',
      'android:orientation': 'horizontal',
      'android:padding': '8dp',
    },
  },
  {
    type: 'RelativeLayout',
    name: 'RelativeLayout',
    category: 'Layouts',
    icon: 'LayoutGrid',
    defaultAttributes: {
      'android:id': '@+id/relativeLayout',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'match_parent',
      'android:padding': '16dp',
    },
  },
  {
    type: 'ConstraintLayout',
    name: 'ConstraintLayout',
    category: 'Layouts',
    icon: 'LayoutDashboard',
    defaultAttributes: {
      'android:id': '@+id/constraintLayout',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'match_parent',
    },
  },
  {
    type: 'FrameLayout',
    name: 'FrameLayout',
    category: 'Layouts',
    icon: 'Layers',
    defaultAttributes: {
      'android:id': '@+id/frameLayout',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'match_parent',
    },
  },
  {
    type: 'ScrollView',
    name: 'ScrollView',
    category: 'Layouts',
    icon: 'Scroll',
    defaultAttributes: {
      'android:id': '@+id/scrollView',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'match_parent',
      'android:fillViewport': 'true',
    },
  },
  // Widgets
  {
    type: 'TextView',
    name: 'TextView',
    category: 'Widgets',
    icon: 'Type',
    defaultAttributes: {
      'android:id': '@+id/textView',
      'android:layout_width': 'wrap_content',
      'android:layout_height': 'wrap_content',
      'android:text': 'Hello TextView',
      'android:textColor': '#1c1b1f',
      'android:textSize': '18sp',
    },
  },
  {
    type: 'Button',
    name: 'Button',
    category: 'Widgets',
    icon: 'SquarePlay',
    defaultAttributes: {
      'android:id': '@+id/button',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'wrap_content',
      'android:text': 'Submit',
      'android:background': '#3DDC84',
      'android:textColor': '#ffffff',
    },
  },
  {
    type: 'ImageView',
    name: 'ImageView',
    category: 'Widgets',
    icon: 'Image',
    defaultAttributes: {
      'android:id': '@+id/imageView',
      'android:layout_width': '120dp',
      'android:layout_height': '120dp',
      'android:src': 'android_robot', // Placeholder image keyword
      'android:layout_gravity': 'center_horizontal',
    },
  },
  {
    type: 'EditText',
    name: 'EditText',
    category: 'Widgets',
    icon: 'TextCursorInput',
    defaultAttributes: {
      'android:id': '@+id/editText',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'wrap_content',
      'android:hint': 'Enter text...',
      'android:inputType': 'text',
    },
  },
  {
    type: 'ProgressBar',
    name: 'ProgressBar',
    category: 'Widgets',
    icon: 'Loader2',
    defaultAttributes: {
      'android:id': '@+id/progressBar',
      'android:layout_width': 'wrap_content',
      'android:layout_height': 'wrap_content',
      'android:layout_gravity': 'center',
      'android:progress': '60',
      'android:max': '100',
    },
  },
  {
    type: 'Switch',
    name: 'Switch',
    category: 'Widgets',
    icon: 'ToggleLeft',
    defaultAttributes: {
      'android:id': '@+id/switchCheck',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'wrap_content',
      'android:text': 'Enable Feature',
      'android:checked': 'true',
    },
  },
  {
    type: 'Slider',
    name: 'Slider',
    category: 'Widgets',
    icon: 'Sliders',
    defaultAttributes: {
      'android:id': '@+id/slider',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'wrap_content',
      'android:progress': '40',
    },
  },
  // Containers
  {
    type: 'CardView',
    name: 'CardView',
    category: 'Containers',
    icon: 'CreditCard',
    defaultAttributes: {
      'android:id': '@+id/cardView',
      'android:layout_width': 'match_parent',
      'android:layout_height': 'wrap_content',
      'app:cardCornerRadius': '8dp',
      'app:cardElevation': '4dp',
      'android:layout_margin': '8dp',
      'app:cardBackgroundColor': '#ffffff',
    },
  },
  {
    type: 'View',
    name: 'Divider / Separator',
    category: 'Helpers',
    icon: 'Minus',
    defaultAttributes: {
      'android:id': '@+id/divider',
      'android:layout_width': 'match_parent',
      'android:layout_height': '1dp',
      'android:background': '#e0e0e0',
      'android:layout_margin': '8dp',
    },
  },
];

export const TEMPLATES: Record<string, { name: string; description: string; root: VisualElement }> = {
  blank: {
    name: 'Blank Activity',
    description: 'Empty single layout with a headline',
    root: {
      id: 'root_constraint_layout',
      type: 'ConstraintLayout',
      attributes: {
        'xmlns:android': 'http://schemas.android.com/apk/res/android',
        'xmlns:app': 'http://schemas.android.com/apk/res-auto',
        'android:id': '@+id/main_layout',
        'android:layout_width': 'match_parent',
        'android:layout_height': 'match_parent',
        'android:background': '#F8F9FA',
        'android:padding': '24dp',
      },
      children: [
        {
          id: 'title_text',
          type: 'TextView',
          attributes: {
            'android:id': '@+id/titleText',
            'android:layout_width': 'wrap_content',
            'android:layout_height': 'wrap_content',
            'android:text': 'Android App Sandbox',
            'android:textSize': '24sp',
            'android:textColor': '#0F172A',
            'android:textStyle': 'bold',
            'app:layout_constraintTop_toTopOf': 'parent',
            'app:layout_constraintLeft_toLeftOf': 'parent',
            'app:layout_constraintRight_toRightOf': 'parent',
            'android:layout_marginTop': '48dp',
          },
        },
        {
          id: 'subtitle_text',
          type: 'TextView',
          attributes: {
            'android:id': '@+id/subtitleText',
            'android:layout_width': 'wrap_content',
            'android:layout_height': 'wrap_content',
            'android:text': 'Drag blocks from the palette into the canvas or component tree to customize your layout.',
            'android:textSize': '14sp',
            'android:textColor': '#64748B',
            'android:gravity': 'center',
            'app:layout_constraintTop_toBottomOf': '@id/titleText',
            'app:layout_constraintLeft_toLeftOf': 'parent',
            'app:layout_constraintRight_toRightOf': 'parent',
            'android:layout_marginTop': '12dp',
          },
        },
        {
          id: 'android_logo',
          type: 'ImageView',
          attributes: {
            'android:id': '@+id/androidLogo',
            'android:layout_width': '140dp',
            'android:layout_height': '140dp',
            'android:src': 'android_robot',
            'app:layout_constraintTop_toBottomOf': '@id/subtitleText',
            'app:layout_constraintLeft_toLeftOf': 'parent',
            'app:layout_constraintRight_toRightOf': 'parent',
            'android:layout_marginTop': '40dp',
          },
        },
        {
          id: 'start_btn',
          type: 'Button',
          attributes: {
            'android:id': '@+id/startBtn',
            'android:layout_width': 'match_parent',
            'android:layout_height': 'wrap_content',
            'android:text': 'Get Started',
            'android:textColor': '#ffffff',
            'android:background': '#3DDC84',
            'app:layout_constraintBottom_toBottomOf': 'parent',
            'android:layout_marginBottom': '32dp',
          },
        },
      ],
    },
  },

  login: {
    name: 'Login Form Layout',
    description: 'Perfect for setting up user authentication views',
    root: {
      id: 'login_root_scroll',
      type: 'ScrollView',
      attributes: {
        'xmlns:android': 'http://schemas.android.com/apk/res/android',
        'xmlns:app': 'http://schemas.android.com/apk/res-auto',
        'android:id': '@+id/login_scroll_container',
        'android:layout_width': 'match_parent',
        'android:layout_height': 'match_parent',
        'android:background': '#0F172A', // Slate 900
        'android:fillViewport': 'true',
      },
      children: [
        {
          id: 'login_linear_layout',
          type: 'LinearLayout',
          attributes: {
            'android:id': '@+id/login_linear_layout',
            'android:layout_width': 'match_parent',
            'android:layout_height': 'wrap_content',
            'android:orientation': 'vertical',
            'android:padding': '24dp',
            'android:gravity': 'center_horizontal',
          },
          children: [
            {
              id: 'avatar_img',
              type: 'ImageView',
              attributes: {
                'android:id': '@+id/app_logo',
                'android:layout_width': '96dp',
                'android:layout_height': '96dp',
                'android:src': 'avatar_unlocked',
                'android:layout_marginTop': '48dp',
                'android:layout_marginBottom': '16dp',
              },
            },
            {
              id: 'welcome_title',
              type: 'TextView',
              attributes: {
                'android:id': '@+id/welcomeTitle',
                'android:layout_width': 'wrap_content',
                'android:layout_height': 'wrap_content',
                'android:text': 'Welcome Back',
                'android:textSize': '28sp',
                'android:textColor': '#FFFFFF',
                'android:textStyle': 'bold',
                'android:layout_marginBottom': '4dp',
              },
            },
            {
              id: 'welcome_subtitle',
              type: 'TextView',
              attributes: {
                'android:id': '@+id/welcomeSubtitle',
                'android:layout_width': 'wrap_content',
                'android:layout_height': 'wrap_content',
                'android:text': 'Sign in to access secure development logs',
                'android:textSize': '13sp',
                'android:textColor': '#94A3B8', // Slate 400
                'android:layout_marginBottom': '32dp',
              },
            },
            {
              id: 'card_form',
              type: 'CardView',
              attributes: {
                'android:id': '@+id/card_form',
                'android:layout_width': 'match_parent',
                'android:layout_height': 'wrap_content',
                'app:cardCornerRadius': '12dp',
                'app:cardElevation': '8dp',
                'app:cardBackgroundColor': '#1E293B', // Slate 800
                'android:layout_marginBottom': '16dp',
              },
              children: [
                {
                  id: 'form_fields_layout',
                  type: 'LinearLayout',
                  attributes: {
                    'android:id': '@+id/form_fields_layout',
                    'android:layout_width': 'match_parent',
                    'android:layout_height': 'wrap_content',
                    'android:orientation': 'vertical',
                    'android:padding': '16dp',
                  },
                  children: [
                    {
                      id: 'email_label',
                      type: 'TextView',
                      attributes: {
                        'android:id': '@+id/emailLabel',
                        'android:layout_width': 'wrap_content',
                        'android:layout_height': 'wrap_content',
                        'android:text': 'Email Address',
                        'android:textSize': '12sp',
                        'android:textColor': '#3DDC84',
                        'android:textStyle': 'bold',
                        'android:layout_marginBottom': '4dp',
                      },
                    },
                    {
                      id: 'email_input',
                      type: 'EditText',
                      attributes: {
                        'android:id': '@+id/emailInput',
                        'android:layout_width': 'match_parent',
                        'android:layout_height': 'wrap_content',
                        'android:hint': 'developer@android.com',
                        'android:inputType': 'textEmailAddress',
                        'android:layout_marginBottom': '16dp',
                      },
                    },
                    {
                      id: 'password_label',
                      type: 'TextView',
                      attributes: {
                        'android:id': '@+id/passwordLabel',
                        'android:layout_width': 'wrap_content',
                        'android:layout_height': 'wrap_content',
                        'android:text': 'Password',
                        'android:textSize': '12sp',
                        'android:textColor': '#3DDC84',
                        'android:textStyle': 'bold',
                        'android:layout_marginBottom': '4dp',
                      },
                    },
                    {
                      id: 'password_input',
                      type: 'EditText',
                      attributes: {
                        'android:id': '@+id/passwordInput',
                        'android:layout_width': 'match_parent',
                        'android:layout_height': 'wrap_content',
                        'android:hint': '••••••••',
                        'android:inputType': 'textPassword',
                        'android:layout_marginBottom': '12dp',
                      },
                    },
                    {
                      id: 'remember_switch',
                      type: 'Switch',
                      attributes: {
                        'android:id': '@+id/rememberSwitch',
                        'android:layout_width': 'match_parent',
                        'android:layout_height': 'wrap_content',
                        'android:text': 'Remember developer token',
                        'android:textColor': '#FFFFFF',
                        'android:checked': 'true',
                      },
                    },
                  ],
                },
              ],
            },
            {
              id: 'action_btn',
              type: 'Button',
              attributes: {
                'android:id': '@+id/loginBtn',
                'android:layout_width': 'match_parent',
                'android:layout_height': 'wrap_content',
                'android:text': 'Sign In',
                'android:textColor': '#0F172A',
                'android:background': '#3DDC84',
                'android:layout_marginTop': '8dp',
              },
            },
            {
              id: 'footer_link',
              type: 'TextView',
              attributes: {
                'android:id': '@+id/forgotPasswordLink',
                'android:layout_width': 'wrap_content',
                'android:layout_height': 'wrap_content',
                'android:text': 'Forgot token or certificate?',
                'android:textColor': '#94A3B8',
                'android:textSize': '13sp',
                'android:layout_marginTop': '24dp',
              },
            },
          ],
        },
      ],
    },
  },

  dashboard: {
    name: 'Dashboard Bento Grid',
    description: 'Dynamic device layout with modern visual grids',
    root: {
      id: 'dashboard_root',
      type: 'ConstraintLayout',
      attributes: {
        'xmlns:android': 'http://schemas.android.com/apk/res/android',
        'xmlns:app': 'http://schemas.android.com/apk/res-auto',
        'android:id': '@+id/dashboard_main',
        'android:layout_width': 'match_parent',
        'android:layout_height': 'match_parent',
        'android:background': '#F1F5F9', // Slates 100
      },
      children: [
        {
          id: 'dashboard_header',
          type: 'View',
          attributes: {
            'android:id': '@+id/header_background',
            'android:layout_width': 'match_parent',
            'android:layout_height': '160dp',
            'android:background': '#4285F4', // Google Blue
            'app:layout_constraintTop_toTopOf': 'parent',
          },
        },
        {
          id: 'dashboard_avatar',
          type: 'ImageView',
          attributes: {
            'android:id': '@+id/profile_avatar',
            'android:layout_width': '48dp',
            'android:layout_height': '48dp',
            'android:src': 'avatar_profile',
            'app:layout_constraintTop_toTopOf': 'parent',
            'app:layout_constraintRight_toRightOf': 'parent',
            'android:layout_marginTop': '24dp',
            'android:layout_marginRight': '24dp',
          },
        },
        {
          id: 'dashboard_greeting',
          type: 'TextView',
          attributes: {
            'android:id': '@+id/greet_text',
            'android:layout_width': 'wrap_content',
            'android:layout_height': 'wrap_content',
            'android:text': 'Hello, Android Dev',
            'android:textColor': '#FFFFFF',
            'android:textSize': '18sp',
            'android:textStyle': 'bold',
            'app:layout_constraintTop_toTopOf': 'parent',
            'app:layout_constraintLeft_toLeftOf': 'parent',
            'android:layout_marginTop': '24dp',
            'android:layout_marginLeft': '24dp',
          },
        },
        {
          id: 'dashboard_subgreeting',
          type: 'TextView',
          attributes: {
            'android:id': '@+id/sub_greet_text',
            'android:layout_width': 'wrap_content',
            'android:layout_height': 'wrap_content',
            'android:text': 'Project Sandbox is sync-ready.',
            'android:textColor': '#D1E2FF',
            'android:textSize': '12sp',
            'app:layout_constraintTop_toBottomOf': '@id/greet_text',
            'app:layout_constraintLeft_toLeftOf': 'parent',
            'android:layout_marginLeft': '24dp',
            'android:layout_marginTop': '4dp',
          },
        },
        {
          id: 'card_metric_1',
          type: 'CardView',
          attributes: {
            'android:id': '@+id/metric_card_cpu',
            'android:layout_width': '155dp',
            'android:layout_height': '140dp',
            'app:cardCornerRadius': '12dp',
            'app:cardBackgroundColor': '#FFFFFF',
            'app:layout_constraintTop_toBottomOf': '@id/header_background',
            'app:layout_constraintLeft_toLeftOf': 'parent',
            'android:layout_marginTop': '-30dp',
            'android:layout_marginLeft': '20dp',
          },
          children: [
            {
              id: 'cpu_linear',
              type: 'LinearLayout',
              attributes: {
                'android:id': '@+id/cpu_linear',
                'android:layout_width': 'match_parent',
                'android:layout_height': 'match_parent',
                'android:orientation': 'vertical',
                'android:padding': '16dp',
              },
              children: [
                {
                  id: 'cpu_icon',
                  type: 'ImageView',
                  attributes: {
                    'android:id': '@+id/cpu_icon',
                    'android:layout_width': '28dp',
                    'android:layout_height': '28dp',
                    'android:src': 'icon_cpu',
                    'android:layout_marginBottom': '12dp',
                  },
                },
                {
                  id: 'cpu_label',
                  type: 'TextView',
                  attributes: {
                    'android:id': '@+id/cpu_label',
                    'android:layout_width': 'wrap_content',
                    'android:layout_height': 'wrap_content',
                    'android:text': 'CPU Performance',
                    'android:textColor': '#64748B',
                    'android:textSize': '11sp',
                  },
                },
                {
                  id: 'cpu_value',
                  type: 'TextView',
                  attributes: {
                    'android:id': '@+id/cpu_val',
                    'android:layout_width': 'wrap_content',
                    'android:layout_height': 'wrap_content',
                    'android:text': '2.4 GHz (32%)',
                    'android:textColor': '#1e293b',
                    'android:textSize': '14sp',
                    'android:textStyle': 'bold',
                    'android:layout_marginTop': '4dp',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'card_metric_2',
          type: 'CardView',
          attributes: {
            'android:id': '@+id/metric_card_mem',
            'android:layout_width': '155dp',
            'android:layout_height': '140dp',
            'app:cardCornerRadius': '12dp',
            'app:cardBackgroundColor': '#FFFFFF',
            'app:layout_constraintTop_toBottomOf': '@id/header_background',
            'app:layout_constraintRight_toRightOf': 'parent',
            'android:layout_marginTop': '-30dp',
            'android:layout_marginRight': '20dp',
          },
          children: [
            {
              id: 'mem_linear',
              type: 'LinearLayout',
              attributes: {
                'android:id': '@+id/mem_linear',
                'android:layout_width': 'match_parent',
                'android:layout_height': 'match_parent',
                'android:orientation': 'vertical',
                'android:padding': '16dp',
              },
              children: [
                {
                  id: 'mem_icon',
                  type: 'ImageView',
                  attributes: {
                    'android:id': '@+id/mem_icon',
                    'android:layout_width': '28dp',
                    'android:layout_height': '28dp',
                    'android:src': 'icon_database',
                    'android:layout_marginBottom': '12dp',
                  },
                },
                {
                  id: 'mem_label',
                  type: 'TextView',
                  attributes: {
                    'android:id': '@+id/mem_label',
                    'android:layout_width': 'wrap_content',
                    'android:layout_height': 'wrap_content',
                    'android:text': 'Memory Scope',
                    'android:textColor': '#64748B',
                    'android:textSize': '11sp',
                  },
                },
                {
                  id: 'mem_progressbar',
                  type: 'ProgressBar',
                  attributes: {
                    'android:id': '@+id/mem_progress',
                    'android:layout_width': 'match_parent',
                    'android:layout_height': '12dp',
                    'android:progress': '74',
                    'android:layout_marginTop': '8dp',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'wide_card_stats',
          type: 'CardView',
          attributes: {
            'android:id': '@+id/wide_card_stats',
            'android:layout_width': 'match_parent',
            'android:layout_height': 'wrap_content',
            'app:cardCornerRadius': '12dp',
            'app:cardBackgroundColor': '#FFFFFF',
            'app:layout_constraintTop_toBottomOf': '@id/metric_card_cpu',
            'android:layout_marginTop': '16dp',
            'android:layout_marginLeft': '20dp',
            'android:layout_marginRight': '20dp',
          },
          children: [
            {
              id: 'stats_linear',
              type: 'LinearLayout',
              attributes: {
                'android:id': '@+id/stats_linear',
                'android:layout_width': 'match_parent',
                'android:layout_height': 'wrap_content',
                'android:orientation': 'vertical',
                'android:padding': '16dp',
              },
              children: [
                {
                  id: 'stats_title',
                  type: 'TextView',
                  attributes: {
                    'android:id': '@+id/statsTitle',
                    'android:layout_width': 'wrap_content',
                    'android:layout_height': 'wrap_content',
                    'android:text': 'Gradle Diagnostics',
                    'android:textColor': '#1e293b',
                    'android:textSize': '14sp',
                    'android:textStyle': 'bold',
                    'android:layout_marginBottom': '4dp',
                  },
                },
                {
                  id: 'stats_desc',
                  type: 'TextView',
                  attributes: {
                    'android:id': '@+id/statsDesc',
                    'android:layout_width': 'wrap_content',
                    'android:layout_height': 'wrap_content',
                    'android:text': 'Verify Android API endpoints under custom networks.',
                    'android:textColor': '#64748B',
                    'android:textSize': '12sp',
                    'android:layout_marginBottom': '16dp',
                  },
                },
                {
                  id: 'network_switch',
                  type: 'Switch',
                  attributes: {
                    'android:id': '@+id/networkSwitch',
                    'android:layout_width': 'match_parent',
                    'android:layout_height': 'wrap_content',
                    'android:text': 'Simulate 5G Throttle Mode',
                    'android:checked': 'false',
                  },
                },
                {
                  id: 'diag_divider',
                  type: 'View',
                  attributes: {
                    'android:id': '@+id/diagDivider',
                    'android:layout_width': 'match_parent',
                    'android:layout_height': '1dp',
                    'android:background': '#f1f5f9',
                    'android:layout_marginTop': '12dp',
                    'android:layout_marginBottom': '12dp',
                  },
                },
                {
                  id: 'rebuild_button',
                  type: 'Button',
                  attributes: {
                    'android:id': '@+id/rebuildBtn',
                    'android:layout_width': 'match_parent',
                    'android:layout_height': 'wrap_content',
                    'android:text': 'Trigger Quick Clean Build',
                    'android:textColor': '#FFFFFF',
                    'android:background': '#4285F4',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },

  settings: {
    name: 'Standard Settings Panel',
    description: 'Visual rows with headers and switch fields',
    root: {
      id: 'settings_linear_root',
      type: 'LinearLayout',
      attributes: {
        'xmlns:android': 'http://schemas.android.com/apk/res/android',
        'xmlns:app': 'http://schemas.android.com/apk/res-auto',
        'android:id': '@+id/settings_root',
        'android:layout_width': 'match_parent',
        'android:layout_height': 'match_parent',
        'android:orientation': 'vertical',
        'android:background': '#FFFFFF',
        'android:padding': '20dp',
      },
      children: [
        {
          id: 'title',
          type: 'TextView',
          attributes: {
            'android:id': '@+id/settingsTitle',
            'android:layout_width': 'wrap_content',
            'android:layout_height': 'wrap_content',
            'android:text': 'Device Preferences',
            'android:textSize': '22sp',
            'android:textColor': '#1C1B1F',
            'android:textStyle': 'bold',
            'android:layout_marginBottom': '12dp',
          },
        },
        {
          id: 'subtitle',
          type: 'TextView',
          attributes: {
            'android:id': '@+id/settingsSubtitle',
            'android:layout_width': 'wrap_content',
            'android:layout_height': 'wrap_content',
            'android:text': 'Adjust underlying SDK and layout engine simulation',
            'android:textSize': '13sp',
            'android:textColor': '#49454E',
            'android:layout_marginBottom': '28dp',
          },
        },
        {
          id: 'category_1',
          type: 'TextView',
          attributes: {
            'android:id': '@+id/cat1Header',
            'android:layout_width': 'wrap_content',
            'android:layout_height': 'wrap_content',
            'android:text': 'COMMUNICATIONS',
            'android:textSize': '12sp',
            'android:textColor': '#3DDC84',
            'android:textStyle': 'bold',
            'android:layout_marginBottom': '12dp',
          },
        },
        {
          id: 'switch_wifi',
          type: 'Switch',
          attributes: {
            'android:id': '@+id/wifiSwitch',
            'android:layout_width': 'match_parent',
            'android:layout_height': 'wrap_content',
            'android:text': 'Wi-Fi Connection Enabled',
            'android:checked': 'true',
            'android:layout_marginBottom': '12dp',
          },
        },
        {
          id: 'switch_bt',
          type: 'Switch',
          attributes: {
            'android:id': '@+id/btSwitch',
            'android:layout_width': 'match_parent',
            'android:layout_height': 'wrap_content',
            'android:text': 'Bluetooth Developer Mode',
            'android:checked': 'false',
            'android:layout_marginBottom': '20dp',
          },
        },
        {
          id: 'div1',
          type: 'View',
          attributes: {
            'android:id': '@+id/div1',
            'android:layout_width': 'match_parent',
            'android:layout_height': '1dp',
            'android:background': '#e0e0e0',
            'android:layout_marginBottom': '20dp',
          },
        },
        {
          id: 'category_2',
          type: 'TextView',
          attributes: {
            'android:id': '@+id/cat2Header',
            'android:layout_width': 'wrap_content',
            'android:layout_height': 'wrap_content',
            'android:text': 'USER INTERFACE & LAYOUT',
            'android:textSize': '12sp',
            'android:textColor': '#3DDC84',
            'android:textStyle': 'bold',
            'android:layout_marginBottom': '12dp',
          },
        },
        {
          id: 'switch_dark',
          type: 'Switch',
          attributes: {
            'android:id': '@+id/darkModeSwitch',
            'android:layout_width': 'match_parent',
            'android:layout_height': 'wrap_content',
            'android:text': 'Force Dark Material Theme',
            'android:checked': 'false',
            'android:layout_marginBottom': '16dp',
          },
        },
        {
          id: 'slider_label',
          type: 'TextView',
          attributes: {
            'android:id': '@+id/sliderLabel',
            'android:layout_width': 'wrap_content',
            'android:layout_height': 'wrap_content',
            'android:text': 'Interface Scale Density',
            'android:textSize': '14sp',
            'android:textColor': '#1C1B1F',
            'android:layout_marginBottom': '4dp',
          },
        },
        {
          id: 'slider_scale',
          type: 'Slider',
          attributes: {
            'android:id': '@+id/scaleSlider',
            'android:layout_width': 'match_parent',
            'android:layout_height': 'wrap_content',
            'android:progress': '65',
            'android:layout_marginBottom': '24dp',
          },
        },
        {
          id: 'save_button',
          type: 'Button',
          attributes: {
            'android:id': '@+id/saveBtn',
            'android:layout_width': 'match_parent',
            'android:layout_height': 'wrap_content',
            'android:text': 'Apply UI Configurations',
            'android:textColor': '#FFFFFF',
            'android:background': '#1C1B1F',
          },
        },
      ],
    },
  },
};
