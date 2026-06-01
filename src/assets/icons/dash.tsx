import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <rect width={24} height={24} fill="#324C51" fillOpacity={0.1} rx={12} />
    <path
      fill="#324C51"
      d="M7 13.5s0-3 3-3c2 0 2.25 1.75 3.75 1.75 2 0 2-1.75 2-1.75H17s0 3-3 3c-2 0-2.75-1.75-3.75-1.75-2 0-2 1.75-2 1.75H7Z"
    />
  </svg>
)
export { SvgComponent as Dash }
