/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POSTHOG_PROJECT_KEY_WEB?: string
  readonly VITE_POSTHOG_PROJECT_KEY_DESKTOP?: string
  readonly VITE_POSTHOG_PROJECT_KEY_POCKET?: string
  readonly VITE_POSTHOG_PROJECT_KEY_DOCS?: string

  /**
   * URL of a custom VRM model to register as a built-in preset.
   * Can be a remote HTTPS URL or a path relative to the app's `public/` directory.
   *
   * Example: https://example.com/my-avatar.vrm
   * Example: /models/my-avatar.vrm  (file placed in public/models/)
   */
  readonly VITE_CUSTOM_VRM_MODEL_URL?: string

  /**
   * Display name shown in the model selector for the custom VRM preset.
   * Defaults to "Custom Model" when not set.
   */
  readonly VITE_CUSTOM_VRM_MODEL_NAME?: string

  /**
   * URL of a preview image (PNG/JPEG) for the custom VRM preset.
   * Shown as the thumbnail in the model selector dialog.
   */
  readonly VITE_CUSTOM_VRM_MODEL_PREVIEW_URL?: string

  /**
   * ID of the model preset to select by default on first launch.
   * Built-in preset IDs: preset-live2d-1, preset-live2d-2, preset-vrm-1, preset-vrm-2.
   * When VITE_CUSTOM_VRM_MODEL_URL is set the custom preset is registered as preset-vrm-custom.
   * Defaults to preset-vrm-custom when a custom VRM URL is provided, otherwise preset-live2d-1.
   */
  readonly VITE_DEFAULT_MODEL_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
