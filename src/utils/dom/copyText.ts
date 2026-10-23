// Puts a text on the clipboard with the Clipboard API. It never throws: it
// answers whether the text was copied. It was not when the browser has no
// Clipboard API - a page that is not served over a secure connection, an old
// browser - or refuses to write to it.
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);

    return true;
  } catch {
    return false;
  }
};
