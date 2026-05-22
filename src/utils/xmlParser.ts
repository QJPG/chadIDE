/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VisualElement } from './androidXmlTemplates';

/**
 * Serializes a VisualElement layout tree into a beautiful Android XML string
 */
export function serializeToXml(element: VisualElement, level = 0): string {
  const indent = '    '.repeat(level);
  const tag = element.type;
  
  let xml = `${indent}<${tag}`;

  // Collect and sort attributes for professional layout structure
  const attrs = { ...element.attributes };
  
  // Ensure layout namespaces are at the root element
  if (level === 0) {
    if (!attrs['xmlns:android']) {
      attrs['xmlns:android'] = 'http://schemas.android.com/apk/res/android';
    }
    if (!attrs['xmlns:app']) {
      attrs['xmlns:app'] = 'http://schemas.android.com/apk/res-auto';
    }
  }

  // Sort attributes to put ID first, then layout params, then others
  const sortedKeys = Object.keys(attrs).sort((a, b) => {
    if (a === 'android:id') return -1;
    if (b === 'android:id') return 1;
    if (a.startsWith('xmlns:')) return -1;
    if (b.startsWith('xmlns:')) return 1;
    if (a.startsWith('android:layout_width')) return -1;
    if (b.startsWith('android:layout_width')) return 1;
    if (a.startsWith('android:layout_height')) return -1;
    if (b.startsWith('android:layout_height')) return 1;
    return a.localeCompare(b);
  });

  const attrStrings = sortedKeys.map((key) => {
    return `${key}="${attrs[key]}"`;
  });

  if (attrStrings.length > 0) {
    if (attrStrings.length === 1) {
      xml += ` ${attrStrings[0]}`;
    } else {
      xml += '\n' + attrStrings.map((str) => `${indent}    ${str}`).join('\n');
    }
  }

  const hasChildren = element.children && element.children.length > 0;

  if (hasChildren) {
    xml += '>\n';
    element.children!.forEach((child) => {
      xml += serializeToXml(child, level + 1);
    });
    xml += `${indent}</${tag}>\n`;
  } else {
    if (attrStrings.length > 1) {
      xml += `\n${indent}/>\n`;
    } else {
      xml += ' />\n';
    }
  }

  return xml;
}

/**
 * Parses an Android XML string back into our internal VisualElement layout tree
 */
export function parseXmlToTree(xml: string): VisualElement | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    
    // Check for parse errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.warn('XML Parse Error:', parserError.textContent);
      return null;
    }

    const rootNode = doc.documentElement;
    if (!rootNode) return null;

    return domNodeToVisualElement(rootNode);
  } catch (error) {
    console.error('Failed to parse XML back to layout tree:', error);
    return null;
  }
}

function domNodeToVisualElement(node: Element): VisualElement {
  // Translate element tag names
  let type = node.tagName as VisualElement['type'];
  
  // Some standard Android paths
  if (node.tagName.includes('CardView')) {
    type = 'CardView';
  } else if (node.tagName === 'View') {
    type = 'View';
  }

  // Parse attributes
  const attributes: Record<string, string> = {};
  for (let i = 0; i < node.attributes.length; i++) {
    const attr = node.attributes[i];
    attributes[attr.name] = attr.value;
  }

  // Extract ID or assign a persistent one
  let id = attributes['android:id'] || '';
  if (id) {
    // clean "@+id/myView" to just key string representation
    id = id.replace('@+id/', '').replace('@id/', '');
  } else {
    // Generate fallback unique ID
    id = `view_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Recursively process children
  const children: VisualElement[] = [];
  const childNodes = node.children;
  for (let j = 0; j < childNodes.length; j++) {
    children.push(domNodeToVisualElement(childNodes[j]));
  }

  const result: VisualElement = {
    id,
    type,
    attributes,
  };

  if (children.length > 0) {
    result.children = children;
  }

  return result;
}
