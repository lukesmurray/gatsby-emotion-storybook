# Gatsby Emotion Storybook

## Steps to create this repo

- npx degit https://github.com/ben-rogerson/twin.examples/gatsby-emotion
  - commit: caabf69
- Follow [storybook setup from gatsby](https://www.gatsbyjs.com/docs/how-to/testing/visual-testing-with-storybook/)
  - `npx -p @storybook/cli sb init`
    - This is the generic storybook setup
    - The buttons work but the css and tw macros don't work
- Add the macros to use css and tw props

  - `npm install @emotion/babel-plugin-jsx-pragmatic babel-plugin-macros`
  - add the file
    ```js
    // babel-plugin-macros.config.js
    module.exports = {
      twin: {
        preset: 'emotion',
      },
    }
    ```
  - add a custom babelrc

    - first [extend gatsby](https://www.gatsbyjs.com/docs/how-to/custom-configuration/babel/)
    - `npm install --save-dev babel-preset-gatsby`
    - then add our plugins
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
    - at this point the storybook works! But we haven't finished the gatsby storybook setup
    - Finish the gatsby storybook setup by adding `webpackFinal` to `storybook/main.js`
      ```js
        webpackFinal: async config => {
        // Transpile Gatsby module because Gatsby includes un-transpiled ES6 code.
        config.module.rules[0].exclude = [/node_modules\/(?!(gatsby)\/)/]
        // use installed babel-loader which is v8.0-beta (which is meant to work with @babel/core@7)
        config.module.rules[0].use[0].loader = require.resolve('babel-loader')
        // use @babel/preset-react for JSX and env (instead of staged presets)
        config.module.rules[0].use[0].options.presets = [
          require.resolve('@babel/preset-react'),
          require.resolve('@babel/preset-env'),
        ]
        config.module.rules[0].use[0].options.plugins = [
          // use @babel/plugin-proposal-class-properties for class arrow functions
          require.resolve('@babel/plugin-proposal-class-properties'),
          // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
          require.resolve('babel-plugin-remove-graphql-queries'),
        ]
        // Prefer Gatsby ES6 entrypoint (module) over commonjs (main) entrypoint
        config.resolve.mainFields = ['browser', 'module', 'main']
        return config
        },
      ```
    - then add link overrides to `preview.js`

      ```js
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
      ```

  - finally add typescript support
    - install `@types/react` and `babel-preset-react-app`
    - create a tsconfig.json
      ```json
      {
        "include": ["twin.d.ts"]
      }
      ```
    - add `twin.d.ts`
    - add the following to the end of `storybook/main.js`
      ```js
      // add typescript support
      config.module.rules.push({
        test: /\.(ts|tsx)$/,
        loader: require.resolve('babel-loader'),
        options: {
          presets: [['react-app', { flow: false, typescript: true }]],
          plugins: [
            require.resolve('@babel/plugin-proposal-class-properties'),
            // use babel-plugin-remove-graphql-queries to remove static queries from components when rendering in storybook
            require.resolve('babel-plugin-remove-graphql-queries'),
          ],
        },
      })
      config.resolve.extensions.push('.ts', '.tsx')
      ```
    - I tried to get static queries working in storybook but there seems to be issues using static queries and the latest version of storybook as documented [here](https://github.com/gatsbyjs/gatsby/issues/26099)
