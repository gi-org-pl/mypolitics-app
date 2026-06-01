import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
    <rect width={24} height={24} fill="#22A274" rx={12} />
    <path
      fill="#fff"
      d="M17.749 7.965a.858.858 0 0 1 0 1.213l-6.856 6.857a.858.858 0 0 1-1.214 0l-3.428-3.429a.858.858 0 0 1 1.213-1.213l2.823 2.82 6.251-6.248a.858.858 0 0 1 1.214 0h-.003Z"
    />
  </svg>
)
export { SvgComponent as CheckmarkStrong }
