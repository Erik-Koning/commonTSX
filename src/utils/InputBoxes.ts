// Pass the input element and the text to insert at the cursor position, useful for inserting or pasting text in input boxes.
export function insertAtCursor(inputElement: HTMLInputElement | HTMLTextAreaElement | null, textToInsert: string) {
  if (!inputElement) return;

  const startPos = inputElement.selectionStart ?? inputElement.value.length;
  const endPos = inputElement.selectionEnd ?? inputElement.value.length;
  const originalText = inputElement.value;

  // Insert or replace text
  const newText = originalText.substring(0, startPos) + textToInsert + originalText.substring(endPos);

  // Update the input's value
  inputElement.value = newText;

  // Set the cursor just after the inserted text
  inputElement.selectionStart = inputElement.selectionEnd = startPos + textToInsert.length;
}

// Usage example
// insertAtCursor(localInputRef.current, 'Your text');
