//doesnt work, cant get the selection
export const openContextMenuForSelection = () => {
  const selection = window.getSelection();

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const event = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: viewportWidth / 2,
      clientY: viewportHeight / 2,
    });

    document.dispatchEvent(event);
  }
};
