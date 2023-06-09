'use client'

import { useTheme } from 'next-themes'
import { Highlight, themes, Prism } from "prism-react-renderer"
import { FC, useEffect, useState } from 'react'




interface CodeProps {
  code: string
  show: boolean
  language: string
  animationDelay?: number
  animated?: boolean
}

const Code: FC<CodeProps> = ({
  code,
  show,
  animated,
  animationDelay,
  language,
}) => {

  const { theme: applicationTheme } = useTheme()
  const [text, setText] = useState<string>(animated ? '' : code)

  useEffect(() => {
    if (show && animated) {
      let i = 0
      setTimeout(() => {
        const intervalId = setInterval(() => {
          setText(code.slice(0, i))
          i++
          if (i > code.length) {
            clearInterval(intervalId)
          }
        }, 15)

        return () => clearInterval(intervalId)
      }, animationDelay || 150)
    }
  }, [code, show, animated, animationDelay])

  // number of lines
  const lines = text.split(/\r\n|\r|\n/).length

  const theme = applicationTheme === 'light' ? themes.vsLight : themes.vsDark

  return (
    <Highlight
    theme={theme}
    code={text}
    language="tsx"

    >
    {({ className, style, tokens, getLineProps, getTokenProps }) => (
      <pre className={className + " transition-all w-fit bg-transparent duration-100 py-0 no-scrollbar"} style={{maxHeight: show ? lines * 24 : 0, opacity: show ? 1 : 0}}>
        {tokens.map((line, i) => (
          <div key={i} {...getLineProps({ line })}>
            <span>{i + 1 + "   "}</span>
            {line.map((token, key) => (
              <span key={key} {...getTokenProps({ token })} />
            ))}
          </div>
        ))}
      </pre>
    )}
  </Highlight>

  )
}

export default Code

// className={
//   className +
//   'transition-all w-fit bg-transparent duration-100 py-0 no-scrollbar'
// }
// style={{
//   maxHeight: show ? lines * 24 : 0,
//   opacity: show ? 1 : 0,
// }}