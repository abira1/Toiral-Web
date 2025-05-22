/**
 * Utilities for safely accessing content properties
 */

import { ContentSettings } from '../types';

/**
 * Safely gets a property from the content object with proper typing
 * @param content The content object
 * @param path The path to the property (e.g., 'toiral.settings.theme')
 * @param defaultValue The default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function getContentProperty<T>(
  content: ContentSettings | undefined | null,
  path: string,
  defaultValue: T
): T {
  if (!content) return defaultValue;
  
  const parts = path.split('.');
  let current: any = content;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }
  
  return current !== undefined && current !== null ? current as T : defaultValue;
}

/**
 * Safely gets a nested property from an object with proper typing
 * @param obj The object
 * @param path The path to the property (e.g., 'settings.theme')
 * @param defaultValue The default value to return if the property doesn't exist
 * @returns The property value or the default value
 */
export function getNestedProperty<T>(
  obj: Record<string, any> | undefined | null,
  path: string,
  defaultValue: T
): T {
  if (!obj) return defaultValue;
  
  const parts = path.split('.');
  let current: any = obj;
  
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }
  
  return current !== undefined && current !== null ? current as T : defaultValue;
}

/**
 * Type-safe way to check if a property exists in the content object
 * @param content The content object
 * @param key The property key
 * @returns True if the property exists
 */
export function hasContentProperty(
  content: ContentSettings | undefined | null,
  key: string
): boolean {
  return content !== undefined && content !== null && key in content;
}

/**
 * Creates a type-safe proxy for accessing content properties
 * @param content The content object
 * @returns A proxy that provides type-safe access to content properties
 */
export function createContentProxy(content: ContentSettings | undefined | null): ContentSettings {
  if (!content) {
    return {} as ContentSettings;
  }
  
  return new Proxy(content, {
    get(target, prop) {
      const key = prop.toString();
      if (key in target) {
        return target[key];
      }
      
      // Return empty objects for missing properties to prevent null reference errors
      if (typeof prop === 'string') {
        console.warn(`Accessing undefined property: ${prop} in content object`);
        return {};
      }
      
      return undefined;
    }
  });
}