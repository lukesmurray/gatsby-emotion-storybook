# Gatsby Emotion Storybook

## Steps to create this repo

Download the starter code.

- npx degit https://github.com/ben-rogerson/twin.examples/gatsby-emotion
  - commit: caabf69

### Storybook Setup

install storybook `npx -p @storybook/cli sb init`

`.storybook/main.js` should look like this

```js
// .storybook/main.js
module.exports = {
  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-actions', '@storybook/addon-links'],
}
```

Create a file `.storybook/addon-gatsby.js` to hold gatsby specific storybook settings.

```js
// .storybook/addon-gatsby.js
module.exports = {
  webpack: async (config, options) => {
    const babelPlugins = [
      // use @babel/plugin-proposal-class-properties for class arrow functions
      require.resolve('@babel/plugin-proposal-class-properties'),
      // use @babel/plugin-proposal-optional-chaining since Webpack 4 doesn't understand optional chaining
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
      [
        require.resolve('babel-plugin-remove-graphql-queries'),
        {
          stage: config.mode === `development` ? 'develop-html' : 'build-html',
          staticQueryDir: 'page-data/sq/d',
        },
      ],
    ]

    // Transpile Gatsby module because Gatsby includes un-transpiled ES6 code.
    config.module.rules[0].exclude = [/node_modules\/(?!(gatsby)\/)/]

    // use installed babel-loader which is v8.0-beta (which is meant to work with @babel/core@7)
    config.module.rules[0].use[0].loader = require.resolve('babel-loader')

    // use @babel/preset-react for JSX and env (instead of staged presets)
    config.module.rules[0].use[0].options.presets = [
      require.resolve('@babel/preset-react'),
      require.resolve('@babel/preset-env'),
    ]

    config.module.rules[0].use[0].options.plugins = babelPlugins

    // Prefer Gatsby ES6 entrypoint (module) over commonjs (main) entrypoint
    config.resolve.mainFields = ['browser', 'module', 'main']

    // Add TypeScript support
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: [['react-app', { flow: false, typescript: true }]],
        plugins: babelPlugins,
      },
    })

    config.resolve.extensions.push('.ts', '.tsx')

    return config
  },
}
```

Add the addon in `.storybook/main.js`

```js
// .storybook/main.js
path = require('path')

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    path.resolve('./.storybook/addon-gatsby.js'),
  ],
}
```

Create a file `.storybook/preview.js` to mock some gatsby specific settings.

```js
// .storybook/preview.js
import { action } from '@storybook/addon-actions'

// Gatsby's Link overrides:
// Gatsby Link calls the `enqueue` & `hovering` methods on the global variable ___loader.
// This global object isn't set in storybook context, requiring you to override it to empty functions (no-op),
// so Gatsby Link doesn't throw any errors.
global.___loader = {
  enqueue: () => {},
  hovering: () => {},
}

// This global variable is prevents the "__BASE_PATH__ is not defined" error inside Storybook.
global.__BASE_PATH__ = '/'

// Navigating through a gatsby app using gatsby-link or any other gatsby component will use the `___navigate` method.
// In Storybook it makes more sense to log an action than doing an actual navigate. Checkout the actions addon docs for more info: https://github.com/storybookjs/storybook/tree/master/addons/actions.
window.___navigate = pathname => {
  action('NavigateTo:')(pathname)
}

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}
```

## Twin.Macro Setup

Install emotion and babel dependencies.

`npm install @emotion/babel-plugin-jsx-pragmatic babel-plugin-macros`

Create the babel plugin macros config

```js
// babel-plugin-macros.config.js
module.exports = {
  twin: {
    preset: 'emotion',
  },
}
```

Install babel preset for gatsby

`npm install --save-dev babel-preset-gatsby`

Copy the following into your `.babelrc`

```json
{
  "plugins": [
    "babel-plugin-macros",
    [
      "@emotion/babel-plugin-jsx-pragmatic",
      {
        "export": "jsx",
        "import": "__cssprop",
        "module": "@emotion/react"
      }
    ],
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "__cssprop",
        "pragmaFrag": "React.Fragment"
      }
    ]
  ],
  "presets": [
    [
      "babel-preset-gatsby",
      {
        "targets": {
          "browsers": [">0.25%", "not dead"]
        }
      }
    ]
  ]
}
```

## Add Typescript Support

`npm install --save-dev @types/react babel-preset-react-app`

Create a `twin.d.ts` file.

```ts
// twin.d.ts
// twin.d.ts
import 'twin.macro'
import styledImport, { CSSProp, css as cssImport } from 'styled-components'

declare module 'twin.macro' {
  // The styled and css imports
  const styled: typeof styledImport
  const css: typeof cssImport
}

declare module 'react' {
  // The css prop
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    css?: CSSProp
  }
  // The inline svg css prop
  interface SVGProps<T> extends SVGProps<SVGSVGElement> {
    css?: CSSProp
  }
}

// The 'as' prop on styled components
declare global {
  namespace JSX {
    interface IntrinsicAttributes<T> extends DOMAttributes<T> {
      as?: string
    }
  }
}
```

Add the following to you `tsconfig.json`

```json
{
  "include": ["twin.d.ts"]
}
```
