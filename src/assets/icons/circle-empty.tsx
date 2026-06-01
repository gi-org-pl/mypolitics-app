import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <rect width={24} height={24} fill="#324C51" fillOpacity={0.1} rx={8} />
  </svg>
)
export { SvgComponent as CircleEmpty }
