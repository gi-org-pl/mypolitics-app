import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <rect width={24} height={24} fill="#EB5760" fillOpacity={0.1} rx={12} />
    <path
      fill="#EB5760"
      d="M17.645 8.05a1.201 1.201 0 0 0-1.698-1.699L12 10.302 8.05 6.355A1.201 1.201 0 0 0 6.35 8.053L10.302 12l-3.947 3.95a1.201 1.201 0 0 0 1.698 1.699L12 13.698l3.95 3.947a1.201 1.201 0 0 0 1.699-1.698L13.698 12l3.947-3.95Z"
    />
  </svg>
)
export { SvgComponent as X }
