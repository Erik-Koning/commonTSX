import { isSubset } from '../utils/objectManipulation';
import { useState, useEffect, useCallback, MutableRefObject, useRef } from "react";
import { debug } from "util";

export interface TextSelectionInfo {
  fieldId?: string;
  startOffset: number | null;
  endOffset: number | null;
  text: string;
}

/**
 * useTextSelection tracks the current text selection when the
 * user selects text in the document.
 *
 * If you pass an external ref (created with useRef<TextSelectionInfo | null>(null)),
 * the hook updates that ref's .current value on selection changes without triggering re-renders.
 *
 * If no external ref is provided, the hook falls back to internal state and returns
 * both the reactive state and the ref.
 *
 * @param externalRef Optional external ref to store the current text selection (object or null). Avoids re-renders when the selection changes.
 * @returns If externalRef is provided, returns the ref; otherwise, returns an object
 *          with { selection, selectionRef }.
 */
function useTextSelection(externalRef?: MutableRefObject<TextSelectionInfo | null>, debounceMs: number = 240) {
  // Internal state used only if external ref is not provided.
  const [selectionInfo, setSelectionInfo] = useState<TextSelectionInfo | null>(null);
  const internalRef = useRef<TextSelectionInfo | null>(null);
  // effectiveRef will be the external ref if provided; otherwise, the internal ref.
  const effectiveRef = externalRef ?? internalRef;

  const debouncedListener = useRef<NodeJS.Timeout | null>(null);

  const handleSelectionChange = () => {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString();
    const range = selection.getRangeAt(0);
    let { startOffset, endOffset } = range;

    let newInfo: TextSelectionInfo | null = null;

    // Determine if the selection is within an input or textarea field.
    let fieldValue = "";
    let fieldId: string | undefined = undefined;
    const anchorNode = selection.anchorNode;
    if (anchorNode) {
      // The parent element of the anchor node is the input field.
      // nodeType is a numeric value indicating what kind of DOM node this is.
      // Every node in the DOM has a nodeType corresponding to a nodeType value, and it can be one of the following:
      // Node.ELEMENT_NODE (1)
      // Node.ATTRIBUTE_NODE (2)
      // Node.TEXT_NODE (3)
      // Node.CDATA_SECTION_NODE (4)
      // Node.COMMENT_NODE (8) ETC...
      let inputFieldParent: HTMLElement | null =
        anchorNode.nodeType === Node.TEXT_NODE ? anchorNode.parentElement ?? null : (anchorNode as HTMLElement) ?? null;
      // The last child of the input field is the text holding node. Can be accessed from parent via lastChild or lastElementChild.
      let inputFieldChild: HTMLElement | null = (anchorNode.lastChild as HTMLElement) ?? null;

      let inputField = inputFieldChild ?? inputFieldParent;

      if (inputField) {
        fieldId = inputField.id;
        if (inputField.tagName === "INPUT" || inputField.tagName === "TEXTAREA") {
          // If the selection is inside an input or textarea, use its selection properties.
          const field = inputField as HTMLInputElement | HTMLTextAreaElement;
          // Override with the field's selectionStart and selectionEnd, if available.
          startOffset = field.selectionStart ?? startOffset; //0 indexed from start of value
          endOffset = field.selectionEnd ?? endOffset; //0 indexed from start of value
          fieldValue = field.value ?? field.textContent ?? field.defaultValue ?? field.innerText ?? field.innerHTML ?? field.placeholder ?? "";
        } else {
          // Otherwise, use the element's text content - if any.
          fieldValue = inputField ? inputField.textContent || "" : "";
        }
        newInfo = {
          fieldId: inputField ? inputField.id : fieldId,
          startOffset: startOffset,
          endOffset: endOffset,
          text: fieldValue,
        };
      } else {
        newInfo = {
          fieldId: "",
          startOffset: null,
          endOffset: null,
          text: "",
        };
      }
    }

    if (newInfo) {
      effectiveRef.current = newInfo;
      if (externalRef) {
        externalRef.current = newInfo;
      } else {
        // Only update state if the selection has actually changed
        if (!isSubset(newInfo, selectionInfo)) {
          setSelectionInfo(newInfo);
        }
      }
    }
  };

  const handleSelectionChangeDebounced = useCallback(() => {
    if (debouncedListener.current) {
      clearTimeout(debouncedListener.current);
      debouncedListener.current = null;
    }
    debouncedListener.current = setTimeout(() => {
      handleSelectionChange();
    }, debounceMs);
  }, [handleSelectionChange]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChangeDebounced);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChangeDebounced);
    };
  }, [handleSelectionChange, externalRef]);

  return { selectionInfo: effectiveRef.current, selectionRef: effectiveRef };
}

export default useTextSelection;
