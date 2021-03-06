import React from 'react'
import tw from 'twin.macro'
import { Button, Header, Layout, Logo } from '.'

export default {
  title: 'ExampleTypescriptStory',
}

export const exampleTypescriptStory = () => (
  <Layout
    css={[
      tw`flex flex-col items-center justify-center h-screen`,
      tw`bg-gradient-to-b from-electric to-ribbon`,
    ]}
  >
    <div tw="flex flex-col justify-center h-full space-y-5">
      <Header />
      <Button isPrimary>Submit</Button>
      <Button isSecondary>Cancel</Button>
      <Button isSmall>Close</Button>
    </div>
    <Logo />
  </Layout>
)
