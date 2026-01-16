/**
 * Create a pro configuration object for the AccessibilityTool component
 * @param {boolean|object} options - Boolean to enable all features, or object with specific options
 * @returns {object} Pro configuration object
 *
 * @example
 * // Enable all pro features
 * const config = createProConfig(true);
 *
 * @example
 * // Enable specific features
 * const config = createProConfig({
 *   enabled: true,
 *   features: {
 *     darkMode: true,
 *     textToSpeech: true
 *   }
 * });
 */
export function createProConfig(options) {
  // If options is a boolean, enable all features
  if (typeof options === "boolean") {
    return {
      enabled: options,
      features: {
        darkMode: options,
        textToSpeech: options,
      },
    };
  }

  // If options is an object or undefined
  return {
    enabled: options?.enabled ?? false,
    features: {
      darkMode: options?.features?.darkMode ?? false,
      textToSpeech: options?.features?.textToSpeech ?? false,
    },
    ...options, // Allow other properties like licenseKey
  };
}
