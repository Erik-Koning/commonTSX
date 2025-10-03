import { convertSpacesToTabs, customCompress, customStringify } from '../../utils/fileParsing';
import React, { useContext, useEffect, useRef, useState, forwardRef } from "react";
import ValidContext from "../../contexts/ValidContext";
import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { linter, Diagnostic } from "@codemirror/lint";
import jsonlint from "jsonlint-mod";

interface JSONCodeMirrorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  json?: string;
  url?: string;
  onClear?: () => void;
}

export const JSONCodeMirror = forwardRef<HTMLDivElement, JSONCodeMirrorProps>(({ className, json, url, onClear, ...props }, ref) => {
  const { isValid, setIsValid } = useContext(ValidContext);
  const [isPretty, setIsPretty] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);
  const errorMarkerRef = useRef<any | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  //const errorDeco = Decoration.mark({ className: "cm-error-highlight" });

  // Define a state effect for setting error decorations
  //const setErrorHighlight = StateEffect.define<DecorationSet>();

  const handleValidate = (jsonToValidate = input) => {
    if (errorMarkerRef.current) {
      errorMarkerRef.current.clear();
      errorMarkerRef.current = null;
    }

    try {
      const parsed = jsonlint.parse(jsonToValidate);
      const indentedJson = customStringify(parsed, true);
      setOutput(indentedJson);
      setInput(indentedJson);
      setError("");
      setIsValid(true);
      document.body.classList.add("valid");
      document.body.classList.remove("invalid");
    } catch (e: any) {
      console.error(e.toString());
      setOutput("");
      setError(e.toString());
      setIsValid(false);
      document.body.classList.add("invalid");
      document.body.classList.remove("valid");
      const match = e.toString().match(/line (\d+)/);
      if (match && editorRef.current?.editor) {
        const lineNumber = parseInt(match[1], 10) - 1;
        /*errorMarkerRef.current = editorRef.current.state.(
          { line: lineNumber, ch: 0 },
          { line: lineNumber + 1, ch: 0 },
          { className: "cm-error-highlight" }
        );
        */
        setDiagnostics((prev) => {
          return [
            ...prev,
            {
              from: lineNumber,
              to: lineNumber + 1,
              severity: "error",
              message: e.toString(),
              actions: [
                {
                  name: "Remove",
                  apply(view, from, to) {
                    view.dispatch({ changes: { from, to } });
                  },
                },
              ],
            },
          ];
        });

        /*
        //For CodeMirror 6
        if (match && editorRef.current) {
          const lineNumber = parseInt(match[1], 10) - 1;
          const { doc } = editorRef.current.state;
          const pos = doc.line(lineNumber).from; // Calculate position from line number
  
          // Create a decoration set with the error decoration
          const decoration = Decoration.set([errorDeco.range(pos, pos + doc.line(lineNumber).length)], true);
  
          // Store the decoration in a ref to clear it later
          errorMarkerRef.current = decoration;
  
          // Dispatch the transaction to apply the decoration
          editorRef.current.dispatch({
            effects: setErrorHighlight.of(decoration),
          });
        }
        */
      }
    }
  };

  const handleFormatting = () => {
    try {
      let formattedJson;
      if (isPretty) {
        formattedJson = customStringify(jsonlint.parse(input), true);
        formattedJson = convertSpacesToTabs(formattedJson, 4);
      } else {
        formattedJson = customCompress(input);
      }
      setInput(formattedJson);
      setIsPretty(!isPretty);
    } catch (error: any) {
      setError(`Failed to format JSON: ${error.message}`);
    }
  };

  const handleClear = () => {
    if (editorRef.current) {
      //editorRef.current.setValue("");
      setInput("");
      setError("");
      setOutput("");
      setIsValid(false);
      setDiagnostics([]);
      document.body.classList.remove("valid", "invalid");
    }
    // Check if the onClear callback from the parent component exists
    if (typeof onClear === "function") {
      onClear();
    }
  };

  const handleCopy = () => {
    //copy(input);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  useEffect(() => {
    if (json) {
      let decodedJson = json;
      try {
        decodedJson = decodeURIComponent(json);
      } catch (e) {
        console.log("Error decoding JSON", e);
      }
      setInput(decodedJson);
      setTimeout(() => handleValidate(decodedJson), 0);
    } else if (url) {
      fetch(decodeURIComponent(url))
        .then((response) => response.json())
        .then((data) => {
          const fetchedJson = JSON.stringify(data, null, 4);
          setInput(fetchedJson);
          setTimeout(() => handleValidate(fetchedJson), 0);
        })
        .catch((error) => {
          setError(`Failed to fetch JSON from URL: ${error.message}`);
          setIsValid(false);
        });
    }
  }, [json, url]);
  return (
    <>
      <div className="relative border border-slate-200 dark:border-slate-600">
        <CodeMirror
          width="auto"
          height="40"
          className=""
          extensions={[
            linter((view) => {
              return diagnostics;
            }),
          ]}
          value={input}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            bracketMatching: true,
            autocompletion: true,
            closeBrackets: true,
            highlightSelectionMatches: true,
            syntaxHighlighting: true,
          }}
          ref={editorRef}
          onChange={(value: string) => {
            setInput(value);
          }}
        />
        <button
          className="absolute right-6 top-2 border border-slate-200 bg-slate-50 p-1 text-slate-400 hover:bg-slate-100 dark:border-slate-400 dark:bg-slate-500"
          //onClick={handleCopy}
          title="Copy to clipboard"
        >
          {false ? (
            // Checkmark SVG if copied
            <svg width="24" height="24" className="text-green-500 px-1 py-1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="currentColor"
                stroke="currentColor"
                d="M480 128c0 8.188-3.125 16.38-9.375 22.62l-256 256C208.4 412.9 200.2 416 192 416s-16.38-3.125-22.62-9.375l-128-128C35.13 272.4 32 264.2 32 256c0-18.28 14.95-32 32-32c8.188 0 16.38 3.125 22.62 9.375L192 338.8l233.4-233.4C431.6 99.13 439.8 96 448 96C465.1 96 480 109.7 480 128z"
              />
            </svg>
          ) : (
            // Copy SVG
            <svg width="24" height="24" className="px-1 py-1" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="currentColor"
                stroke="currentColor"
                d="M448 0H224C188.7 0 160 28.65 160 64v224c0 35.35 28.65 64 64 64h224c35.35 0 64-28.65 64-64V64C512 28.65 483.3 0 448 0zM464 288c0 8.822-7.178 16-16 16H224C215.2 304 208 296.8 208 288V64c0-8.822 7.178-16 16-16h224c8.822 0 16 7.178 16 16V288zM304 448c0 8.822-7.178 16-16 16H64c-8.822 0-16-7.178-16-16V224c0-8.822 7.178-16 16-16h64V160H64C28.65 160 0 188.7 0 224v224c0 35.35 28.65 64 64 64h224c35.35 0 64-28.65 64-64v-64h-48V448z"
              />
            </svg>
          )}
        </button>
      </div>
      <div>
        <button className="primary-button" onClick={() => handleValidate()}>
          Validate JSON
        </button>
        <button className="secondary-button" onClick={handleClear}>
          Clear
        </button>
        <button className="secondary-button" onClick={handleFormatting}>
          {isPretty ? "Prettify" : "Compress"}
        </button>

        {isValid === true && <div className="bg-green-100 border-green-200 text-green-700 mt-4 border px-4 py-2">JSON is valid!</div>}

        {isValid === false && (
          <div className="mt-4 border border-red-200 bg-red-100 px-4 py-2 text-red-700">
            <span className="mb-2 block pt-1 font-semibold">Invalid JSON!</span>
            {error && <pre className="border-t border-dashed border-red-300 py-4 text-xs">{error}</pre>}
          </div>
        )}
      </div>
    </>
  );
});

JSONCodeMirror.displayName = "JSONCodeMirror";
