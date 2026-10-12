// Opens an address in the same tab, as an ordinary navigation: the page that
// is left stays in the history of the browser.
export const openAddress = (address: string): void => {
  window.location.assign(address);
};
