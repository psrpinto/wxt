import { describe, it, expect } from 'vitest';
import { TestProject } from '../utils';

describe('TypeScript Project', () => {
  it('should generate defined constants correctly', async () => {
    const project = new TestProject();
    project.addFile('entrypoints/unlisted.html');

    await project.build();

    const output = await project.serializeFile('.wxt/types/globals.d.ts');
    expect(output).toMatchInlineSnapshot(`
      ".wxt/types/globals.d.ts
      ----------------------------------------
      // Generated by wxt
      export {}
      declare global {
        const __MANIFEST_VERSION__: 2 | 3;
        const __BROWSER__: string;
        const __IS_CHROME__: boolean;
        const __IS_FIREFOX__: boolean;
        const __IS_SAFARI__: boolean;
        const __IS_EDGE__: boolean;
        const __IS_OPERA__: boolean;
        const __COMMAND__: "build" | "serve";
        const __ENTRYPOINT__: string;
      }
      "
    `);
  });

  it('should augment the types for browser.runtime.getURL', async () => {
    const project = new TestProject();
    project.addFile('entrypoints/popup.html');
    project.addFile('entrypoints/options.html');
    project.addFile('entrypoints/sandbox.html');

    await project.build();

    const output = await project.serializeFile('.wxt/types/paths.d.ts');
    expect(output).toMatchInlineSnapshot(`
      ".wxt/types/paths.d.ts
      ----------------------------------------
      // Generated by wxt
      import "wxt/browser";

      declare module "wxt/browser" {
        export type PublicPath =
          | "/options.html"
          | "/popup.html"
          | "/sandbox.html"
        export interface WxtRuntime extends Runtime.Static {
          getURL(path: PublicPath): string;
        }
      }
      "
    `);
  });

  it('should augment the types for browser.i18n.getMessage', async () => {
    const project = new TestProject();
    project.addFile('entrypoints/unlisted.html');
    project.addFile(
      'locales/en.json',
      JSON.stringify({
        prompt_for_name: {
          message: "What's your name?",
          description: "Ask for the user's name",
        },
        hello: {
          message: 'Hello, $USER$',
          description: 'Greet the user',
          placeholders: {
            user: {
              content: '$1',
              example: 'Cira',
            },
          },
        },
        bye: {
          message: 'Goodbye, $USER$. Come back to $OUR_SITE$ soon!',
          description: 'Say goodbye to the user',
          placeholders: {
            our_site: {
              content: 'Example.com',
            },
            user: {
              content: '$1',
              example: 'Cira',
            },
          },
        },
      }),
    );
    project.setConfigFileConfig({
      manifest: {
        default_locale: 'en',
      },
    });

    await project.build();

    const output = await project.serializeFile('.wxt/types/i18n.d.ts');
    expect(output).toMatchInlineSnapshot(`
      ".wxt/types/i18n.d.ts
      ----------------------------------------
      // Generated by wxt
      import "wxt/browser";

      declare module "wxt/browser" {
        /**
         * See https://developer.chrome.com/docs/extensions/reference/i18n/#method-getMessage
         */
        interface GetMessageOptions {
          /**
           * See https://developer.chrome.com/docs/extensions/reference/i18n/#method-getMessage
           */
          escapeLt?: boolean
        }

        export interface WxtI18n extends I18n.Static {
          /**
           * Ask for the user's name
           *
           * "What's your name?"
           */
          getMessage(
            messageName: "prompt_for_name",
            substitutions?: string | string[],
            options?: GetMessageOptions,
          ): string;
          /**
           * Greet the user
           *
           * "Hello, $USER$"
           */
          getMessage(
            messageName: "hello",
            substitutions?: string | string[],
            options?: GetMessageOptions,
          ): string;
          /**
           * Say goodbye to the user
           *
           * "Goodbye, $USER$. Come back to $OUR_SITE$ soon!"
           */
          getMessage(
            messageName: "bye",
            substitutions?: string | string[],
            options?: GetMessageOptions,
          ): string;
          /**
           * The extension or app ID; you might use this string to construct URLs for resources inside the extension. Even unlocalized extensions can use this message.
      Note: You can't use this message in a manifest file.
           *
           * "<browser.runtime.id>"
           */
          getMessage(
            messageName: "@@extension_id",
            substitutions?: string | string[],
            options?: GetMessageOptions,
          ): string;
          /**
           * No message description.
           *
           * "<browser.i18n.getUiLocale()>"
           */
          getMessage(
            messageName: "@@ui_locale",
            substitutions?: string | string[],
            options?: GetMessageOptions,
          ): string;
          /**
           * The text direction for the current locale, either "ltr" for left-to-right languages such as English or "rtl" for right-to-left languages such as Japanese.
           *
           * "<ltr|rtl>"
           */
          getMessage(
            messageName: "@@bidi_dir",
            substitutions?: string | string[],
            options?: GetMessageOptions,
          ): string;
          /**
           * If the @@bidi_dir is "ltr", then this is "rtl"; otherwise, it's "ltr".
           *
           * "<rtl|ltr>"
           */
          getMessage(
            messageName: "@@bidi_reversed_dir",
            substitutions?: string | string[],
            options?: GetMessageOptions,
          ): string;
          /**
           * If the @@bidi_dir is "ltr", then this is "left"; otherwise, it's "right".
           *
           * "<left|right>"
           */
          getMessage(
            messageName: "@@bidi_start_edge",
            substitutions?: string | string[],
            options?: GetMessageOptions,
          ): string;
          /**
           * If the @@bidi_dir is "ltr", then this is "right"; otherwise, it's "left".
           *
           * "<right|left>"
           */
          getMessage(
            messageName: "@@bidi_end_edge",
            substitutions?: string | string[],
            options?: GetMessageOptions,
          ): string;
        }
      }

      declare module "wxt/i18n" {
        export interface WxtMessageSchema {
          t: {
            "prompt_for_name": any;
            "hello": any;
            "bye": any;
            "@@extension_id": any;
            "@@ui_locale": any;
            "@@bidi_dir": any;
            "@@bidi_reversed_dir": any;
            "@@bidi_start_edge": any;
            "@@bidi_end_edge": any;
          };
          tp: {

          };
        }
      }
      "
    `);
  });

  it('should reference all the required types in a single declaration file', async () => {
    const project = new TestProject();
    project.addFile('entrypoints/unlisted.html');

    await project.build();

    const output = await project.serializeFile('.wxt/wxt.d.ts');
    expect(output).toMatchInlineSnapshot(`
      ".wxt/wxt.d.ts
      ----------------------------------------
      // Generated by wxt
      /// <reference types="wxt/vite-builder-env" />
      /// <reference types="./types/imports.d.ts" />
      /// <reference types="./types/paths.d.ts" />
      /// <reference types="./types/i18n.d.ts" />
      /// <reference types="./types/globals.d.ts" />
      "
    `);
  });

  it('should generate a TSConfig file for the project', async () => {
    const project = new TestProject();
    project.addFile('entrypoints/unlisted.html');

    await project.build();

    const output = await project.serializeFile('.wxt/tsconfig.json');
    expect(output).toMatchInlineSnapshot(`
      ".wxt/tsconfig.json
      ----------------------------------------
      {
        "compilerOptions": {
          "target": "ESNext",
          "module": "ESNext",
          "moduleResolution": "Bundler",
          "noEmit": true,
          "esModuleInterop": true,
          "forceConsistentCasingInFileNames": true,
          "resolveJsonModule": true,
          "strict": true,
          "skipLibCheck": true,
          "paths": {
            "@": [".."],
            "@/*": ["../*"],
            "~": [".."],
            "~/*": ["../*"],
            "@@": [".."],
            "@@/*": ["../*"],
            "~~": [".."],
            "~~/*": ["../*"]
          }
        },
        "include": [
          "../**/*",
          "./wxt.d.ts"
        ],
        "exclude": ["../.output"]
      }"
    `);
  });

  it('should generate correct path aliases for a custom srcDir', async () => {
    const project = new TestProject();
    project.addFile('src/entrypoints/unlisted.html');
    project.setConfigFileConfig({
      srcDir: 'src',
    });

    await project.build();

    const output = await project.serializeFile('.wxt/tsconfig.json');
    expect(output).toMatchInlineSnapshot(`
      ".wxt/tsconfig.json
      ----------------------------------------
      {
        "compilerOptions": {
          "target": "ESNext",
          "module": "ESNext",
          "moduleResolution": "Bundler",
          "noEmit": true,
          "esModuleInterop": true,
          "forceConsistentCasingInFileNames": true,
          "resolveJsonModule": true,
          "strict": true,
          "skipLibCheck": true,
          "paths": {
            "@": ["../src"],
            "@/*": ["../src/*"],
            "~": ["../src"],
            "~/*": ["../src/*"],
            "@@": [".."],
            "@@/*": ["../*"],
            "~~": [".."],
            "~~/*": ["../*"]
          }
        },
        "include": [
          "../**/*",
          "./wxt.d.ts"
        ],
        "exclude": ["../.output"]
      }"
    `);
  });

  it('should add additional path aliases listed in the alias config, preventing defaults from being overridden', async () => {
    const project = new TestProject();
    project.addFile('src/entrypoints/unlisted.html');
    project.setConfigFileConfig({
      srcDir: 'src',
      alias: {
        example: 'example',
        '@': 'ignored-path',
      },
    });

    await project.build();

    const output = await project.serializeFile('.wxt/tsconfig.json');
    expect(output).toMatchInlineSnapshot(`
      ".wxt/tsconfig.json
      ----------------------------------------
      {
        "compilerOptions": {
          "target": "ESNext",
          "module": "ESNext",
          "moduleResolution": "Bundler",
          "noEmit": true,
          "esModuleInterop": true,
          "forceConsistentCasingInFileNames": true,
          "resolveJsonModule": true,
          "strict": true,
          "skipLibCheck": true,
          "paths": {
            "example": ["../example"],
            "example/*": ["../example/*"],
            "@": ["../src"],
            "@/*": ["../src/*"],
            "~": ["../src"],
            "~/*": ["../src/*"],
            "@@": [".."],
            "@@/*": ["../*"],
            "~~": [".."],
            "~~/*": ["../*"]
          }
        },
        "include": [
          "../**/*",
          "./wxt.d.ts"
        ],
        "exclude": ["../.output"]
      }"
    `);
  });
});
