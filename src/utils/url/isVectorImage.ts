const VECTOR_DATA_ADDRESS = /^data:image\/svg\+xml[;,]/i;
const VECTOR_FILE_NAME = /\.svg$/i;
const QUERY_OR_FRAGMENT = /[?#]/;

// Whether an address leads to a vector image: a file whose name ends in
// ".svg", whatever query or fragment follows it, or an SVG written into the
// address itself. Nothing is fetched and nothing is measured: the address
// alone decides, so the same image is treated the same wherever it is drawn.
export const isVectorImage = (address?: string | null): boolean => {
  if (typeof address !== "string") return false;

  const trimmedAddress = address.trim();
  const [path] = trimmedAddress.split(QUERY_OR_FRAGMENT);

  return (
    VECTOR_DATA_ADDRESS.test(trimmedAddress) || VECTOR_FILE_NAME.test(path)
  );
};
