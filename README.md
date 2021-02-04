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
    -
