import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <rect width={24} height={24} fill="#324C52" rx={8} />
    <path
      fill="#fff"
      d="M17.27 7.353a.8.8 0 0 1 .177 1.117l-6.4 8.8a.801.801 0 0 1-1.212.095l-3.2-3.2a.801.801 0 0 1 1.132-1.132l2.538 2.537 5.85-8.042a.8.8 0 0 1 1.117-.178l-.002.003Z"
    />
  </svg>
)
export { SvgComponent as CircleChecked }
