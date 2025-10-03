import useComputedStyles from '../../hooks/useComputedStyle';
import useElementStyles from '../../hooks/useElementStyles';
import { useHoverState } from '../../hooks/useHovered';
import { useIsFocusedCallback } from '../../hooks/useIsFocusedCallback';
import { useKeysPressed } from '../../hooks/useKeysPressed';
import { cn } from '../../lib/utils';
import autofillTooltipText from '../../utils/autofillTooltipText';
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import { mergeKeepNonNullOrUndefined, renameKeys } from '../../utils/objectManipulation';
import { mergeRefs } from '../../utils/ref';
import { anonymizeStringWithReferencedFields, charInWord, stringIsWhitespace } from '../../utils/stringManipulation';
import { isDef } from '../../utils/types';
import { CloseOutlined } from "@mui/icons-material";
import AutoModeOutlined from "@mui/icons-material/AutoModeOutlined";
import RedoOutlinedIcon from "@mui/icons-material/RedoOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import UndoOutlined from "@mui/icons-material/UndoOutlined";
import axios from "axios";
import {
  BaseSyntheticEvent,
  ChangeEvent,
  FocusEvent,
  ReactNode,
  Ref,
  SyntheticEvent,
  TextareaHTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { InnerOuterAnimatedGlow } from "../gradients/innerOuterAnimatedGlow/InnerOuterAnimatedGlow";
import { AITextActionItems, AITextActions, AITextItem, AITextString } from "../inputs/AITextActions";
import { AlternateAIFieldValueIcon } from "../inputs/AlternateAIFieldValueIcon";
import { FeatureIcons } from "../inputs/FeatureIcons";
import { HoverCardClickable } from "../inputs/HoverCardClickable";
import { Input } from "../inputs/Input";
import { Button } from "./Button";
import { CuteWordOrb } from "./CuteWordOrb";
import { LabelAbove } from "./LabelAbove";
import TextCarousel from "./TextCarousel";
import { FuzzySearchList } from "./FuzzySearchList";
import { toast } from "./sonner";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  name?: string;
  labelAbove?: string | boolean;
  labelIcons?: ReactNode;
  parents?: string[];
  dependents?: string[];
  options?: string[] | undefined;
  separateBy?: string;
  showLabelIconsOnlyOnFocus?: boolean | null;
  size?: string;
  rows?: number;
  value?: string;
  defaultValue?: string;
  allowDictation?: boolean;
  aiEdits?: boolean;
  aiActions?: AITextString[];
  aiActionsOnBottom?: boolean;
  hideAiActions?: AITextString[];
  aiActionsClassNames?: string;
  defaultPreAIValue?: string;
  historicValuesEnabled?: boolean;
  historicValues?: string[];
  historicValueLabels?: string[];
  onChange?: (e: any) => void;
  fieldChangeDebounce?: number;
  onPreAIValueChange?: (field: string, value: string) => void;
  onBlur?: (e: any) => void;
  ref?: Ref<HTMLTextAreaElement>;
  register?: UseFormRegister<FieldValues>;
  innerRef?: Ref<HTMLTextAreaElement>;
  required?: boolean;
  validationSchema?: RegisterOptions;
  errors?: FieldErrors<any>;
  hidden?: boolean;
  showRefBoxButtonsInitial?: boolean;
  showExpandUpwardsButton?: boolean;
  showExpandSideButton?: boolean;
  getReferenceableFieldKeys?: () => string[];
  processText?: (text: string) => string;
  getUserEditedFields?: () => string;
  getKeysAICanUse?: () => string[];
  anonymizeFields?: Record<string, string>;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      id,
      name,
      className,
      size,
      rows,
      labelAbove,
      labelIcons,
      parents = [],
      dependents = [],
      options = undefined,
      separateBy = "\n",
      showLabelIconsOnlyOnFocus = true,
      innerRef,
      value,
      defaultValue,
      allowDictation = false,
      aiEdits,
      aiActions,
      hideAiActions,
      aiActionsOnBottom = true,
      aiActionsClassNames,
      defaultPreAIValue = "",
      historicValuesEnabled = false,
      historicValues = [],
      historicValueLabels = [],
      onChange,
      fieldChangeDebounce,
      onPreAIValueChange,
      onFocus,
      onBlur,
      onKeyDown,
      onPaste,
      register,
      required,
      validationSchema,
      errors,
      hidden = false,
      showRefBoxButtonsInitial = true,
      showExpandUpwardsButton = false,
      showExpandSideButton = true,
      getReferenceableFieldKeys,
      processText,
      getUserEditedFields,
      getKeysAICanUse,
      anonymizeFields,
      ...props
    },
    ref
  ) => {
    const [showLabelIcons, setShowLabelIcons] = useState<boolean>(showLabelIconsOnlyOnFocus !== null ? !showLabelIconsOnlyOnFocus : true);
    //const [firstValue, setFirstValue] = useState<boolean>(true);
    const [showRefBoxButtons, setShowRefBoxButtons] = useState<boolean>(showRefBoxButtonsInitial);
    const [textValueState, setTextValueState] = useState<string>(value ?? defaultValue ?? "");
    const [avoidedFirstOnChange, setAvoidedFirstOnChange] = useState<boolean>(false);
    const [AIEditMode, setAIEditMode] = useState<boolean>(false);
    const [aiResponseLoading, setAIResponseLoading] = useState<boolean>(false);
    const [aiActionsAdded, setAIActionsAdded] = useState<AITextItem[]>([]);
    const [aiPromptInput, setAIPromptInput] = useState<string>("");
    const [preAIValue, setPreAIValue] = useState<string>(defaultPreAIValue);
    const [undoIsRedo, setUndoIsRedo] = useState<boolean>(false);
    const [autoFocusTextArea, setAutoFocusTextArea] = useState<boolean | undefined>(undefined);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [textIsSelected, setTextIsSelected] = useState<boolean>(false);
    const [insertReferencedFieldMode, setInsertReferencedFieldMode] = useState<boolean>(false);
    const [popupPositionStyles, setPopupPositionStyles] = useState<React.CSSProperties>({});
    const [referenceableFieldKeys, setReferenceableFieldKeys] = useState<string[]>([]);
    const [referenceableFieldSearchQuery, setReferenceableFieldSearchQuery] = useState<string>("");
    const mirroredEleRef = useRef<HTMLDivElement | null>(null);
    const insertReferencedFieldInitialCursorPositionRef = useRef<number | undefined>(undefined);
    const insertReferencedFieldNumNewLines = useRef<number | undefined>(undefined);

    const { isFocused, onFocusSetter, onBlurSetter } = useIsFocusedCallback();

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const cursorPositionRef = useRef(0);
    const isBackspaceRef = useRef(false);
    const hasError = errors && errors[id];

    const divRef = useRef<HTMLDivElement>(null);

    const styleProperties = ["border-radius", "height", "width"];
    const styles = useElementStyles(true, textareaRef, styleProperties, 160, false); //this creates a re-render when the height changes
    const computedStyles = useComputedStyles((isDef(AIEditMode) ?? false) && AIEditMode, textareaRef, styleProperties, [AIEditMode]);
    //const computedStyles = {};
    //console.log("***computedStyles", computedStyles);
    //console.log("***styles", styles);

    const mergedStyles = renameKeys(mergeKeepNonNullOrUndefined(computedStyles, styles), { "border-radius": "borderRadius" });
    //console.log("***mergedStyles", mergedStyles);

    const LabelAboveString = typeof labelAbove === "boolean" ? camelOrSnakeToTitleCase(name ?? id) : labelAbove;

    //What os?
    const isMac = typeof window !== "undefined" && window.navigator.userAgent.includes("Mac");

    const fillByPromptString: AITextString = "Custom Prompt";

    let debouncedChange = useRef<NodeJS.Timeout>(null);

    useHoverState([divRef], {
      setSettersEnterTrue: [setShowLabelIcons, setShowRefBoxButtons, setIsHovered],
      setSettersLeaveFalse: [setShowLabelIcons, setShowRefBoxButtons, setIsHovered],
      disableSettersEnter: false,
      disableSettersLeave: false,
      disableSetters: false,
    });

    const labelIconsClassNames = "text-tertiary-dark hover:text-skyBlue hover:cursor-pointer";
    const aiActionPromptMode = aiActionsAdded.length === 1 && aiActionsAdded[0].text === fillByPromptString;

    const handleSetAIEditModeWithActionByFirstLetter = (e?: KeyboardEvent) => {
      setAIEditMode(true);
      const firstLetter = e?.key;

      if (firstLetter) {
        const action = AITextActionItems?.find((item) => item.text[0].toLowerCase() === firstLetter.toLowerCase());
        if (action) {
          handleAIActionClick(action);
        }
      }
    };

    const handleWindowVisibilityChange = (isVisible: boolean) => {
      if (!isVisible) {
        setAIEditMode(false);
      }
    };

    useEffect(() => {
      if (!isFocused) {
        setInsertReferencedFieldMode(false);
      }
    }, [isFocused]);

    // TODO possible to use a Imperative API with useImperativeHandle to set when compoennt is hovered or focused to avoid re-renders
    useKeysPressed(
      [
        (e: KeyboardEvent) => {
          if (!isFocused) {
            //focus the textarea
            //textareaRef.current?.focus(); //uncomment
          }
          setAIEditMode((prev) => !prev); //This is causing  Error: Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.
        },
        (e: KeyboardEvent) => {
          handleSetAIEditModeWithActionByFirstLetter(e);
        },
        (e: KeyboardEvent) => {
          setAIEditMode(false);
        },
      ] as any,
      [[isMac ? "Meta" : "Control"], [isMac ? "Meta" : "Control", /[a-zA-Z]/], ["Escape"]],
      isHovered || isFocused || AIEditMode,
      undefined,
      undefined,
      undefined,
      textIsSelected ? (isMac ? ["Meta"] : ["Control"]) : undefined, //discard key cmd/meta + Control key presses if there is highlighted text indicating the user wants to copy or paste
      ["Escape", ...(isMac ? ["Meta"] : ["Control"])], //ignore unless starts with these
      undefined,
      2000,
      handleWindowVisibilityChange,
      undefined,
      undefined
      // [false, [false, false, true]] //default must match
    );

    if (!validationSchema && required) {
      validationSchema = { required: "This field is required" };
    }

    if (options) {
    }

    // Compute the effective validation schema.
    const effectiveSchema = !validationSchema && required ? { required: "This field is required" } : validationSchema;

    // Memoize the register result.
    const registerResult = useMemo(() => {
      if (!register) return undefined;
      return register(id, effectiveSchema);
    }, [register, id, effectiveSchema]);

    // Destructure the register result.
    const registerOnChange: ((e: ChangeEvent<HTMLTextAreaElement>) => void) | undefined = registerResult?.onChange;
    const registerOnBlur: ((e: FocusEvent<HTMLTextAreaElement>) => void) | undefined = registerResult?.onBlur;
    const registerName: string | undefined = registerResult?.name;
    const registerRef: Ref<HTMLTextAreaElement> | undefined = registerResult?.ref;

    const adjustTextareaHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto"; // Reset the height to auto to recalculate the scrollHeight
        textarea.style.height = `${textarea.scrollHeight}px`; // Set the height to match the scrollHeight
      }
    };

    //having a state variable "value" passed does not trigger rerender of this component when set to be initial value of useState
    //this is workaround - not a fan but it works.

    useEffect(() => {
      const x = getUserEditedFields?.();
      setAvoidedFirstOnChange(false);
      if (typeof defaultValue === "string" || typeof defaultValue === "number") {
        setTextValueState(String(value));
      } else {
        setTextValueState("");
      }
    }, [defaultValue]);

    useEffect(() => {
      if (value !== undefined && value !== null) {
        // If registerOnChange is a function, create a synthetic event and pass it
        // Please note that this approach assumes that registerOnChange only uses the value and name from the event object. If registerOnChange uses other properties from the event object (like event.target.type or event.currentTarget), you'll need to include those in the synthetic event as well.
        const event = {
          target: {
            value: value,
            name: registerName, // Assuming registerName is the name of the input
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(event);
      }
    }, [value]);

    useEffect(() => {
      // move cursor to the end of the textarea if content is autofilled
      if (isBackspaceRef.current && textareaRef.current) {
        //textareaRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
      }
    }, [textValueState]);

    let waitToCallOnChange: NodeJS.Timeout | undefined = undefined;

    const toggleAIEditMode = () => {
      setAIEditMode((prev) => !prev);
    };

    const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      const target = e.target as HTMLTextAreaElement;
      // Update state based on whether any text is selected (selectionStart !== selectionEnd)
      setTextIsSelected(target.selectionStart !== target.selectionEnd);
    };

    // Call the adjustTextareaHeight function whenever the value changes
    const handleInputChange = (e: any) => {
      if (typeof e === "string") e = { target: { value: e } };
      let newValue: string = e.target.value;
      //newValue = newValue.trimStart(); // Remove leading whitespace

      const isBackspace = textValueState.length > newValue.length;
      isBackspaceRef.current = isBackspace;

      cursorPositionRef.current = e.target.selectionStart;

      const prevLines = textValueState.split("\n");
      const newLines = newValue.split("\n");
      const isLinesSameLength = prevLines.length === newLines.length;

      let nextNumber = 1;

      if (!isLinesSameLength) {
        let lineIndex = -1;
        let firstBlankLineInStreak = -1;

        for (let i = 0; i < newLines.length; i++) {
          if (newLines[i] === "" && i > 0 && newLines[i - 1] !== "") {
            firstBlankLineInStreak = i;
          }
          if (prevLines[i] !== newLines[i]) {
            if (newLines[i] === "" && i > 0) {
              lineIndex = firstBlankLineInStreak;
              break;
            }
            lineIndex = i;
            break;
          }
        }

        if (lineIndex > 0) {
          const prevLine = prevLines[lineIndex - 1];
          const newLine = newLines[lineIndex];

          if (/^\d+\.\s?.*/m.test(prevLine)) {
            const match = prevLine.match(/^\d+/);
            if (match && match[0]) {
              nextNumber = parseInt(match[0], 10) + 1;
            }

            if (isBackspace) {
              newLines[lineIndex] = `${nextNumber}. ${newLine.replace(/^\d+\.\s/, "")}`;
            } else {
              newLines[lineIndex] = `${nextNumber}. `;
              cursorPositionRef.current = newValue.indexOf(prevLine) + newLines[lineIndex].length;
            }

            for (let i = lineIndex + 1; i < newLines.length; i++) {
              const line = newLines[i];
              if (/^\d+\.\s/.test(line)) {
                nextNumber += 1;
                newLines[i] = `${nextNumber}. ${line.replace(/^\d+\.\s/, "")}`;
              } else {
                break;
              }
            }
          }
        } else if (isBackspace) {
          let prevNumber = 0;
          for (let i = 0; i < newLines.length; i++) {
            const match = newLines[i].match(/^\d+/);
            if (match && match[0]) {
              const currentNumber = parseInt(match[0], 10);
              if (currentNumber !== prevNumber + 1) {
                newLines[i] = `${prevNumber + 1}. ${newLines[i].replace(/^\d+\.\s/, "")}`;
              }
              prevNumber += 1;
            }
          }
        }
      }

      if (!newLines || newLines.length === 0 || (newLines.length === 1 && newLines[0] === "")) {
        newValue = "";
      } else {
        newValue = newLines.join("\n");
      }

      if (textareaRef.current) {
        //textareaRef.current.value = value; // Set the updated value back to the textarea
        //adjustTextareaHeight();
      }

      if (processText) {
        // Process the text based on the processText function, for example look for dynamic fields and format them
        newValue = processText(newValue);
      }

      // Set the new value to the state, not doing this before the onChange leading to having to input the value twice
      setTextValueState(newValue);
      //update the textarea presented internal string value
      if (textareaRef.current) {
        textareaRef.current.value = newValue;
      }

      //Trigger onChange functions when value changes
      // create a synthetic event/artificial event and pass it
      const event = {
        target: {
          value: newValue,
          name: registerName ?? id ?? name, // Assuming registerName is the name of the input
        },
      } as unknown as ChangeEvent<HTMLTextAreaElement>;
      //was a valid string passed as initial value and is the current value the same as the initial value? If so we should not trigger onChange
      if (defaultValue !== undefined && defaultValue === newValue && !avoidedFirstOnChange) {
        setAvoidedFirstOnChange(true);
        return;
      }

      if (waitToCallOnChange) clearTimeout(waitToCallOnChange);
      waitToCallOnChange = undefined;

      if (typeof onChange === "function") {
        onChange(event);
      }
      if (typeof registerOnChange === "function") {
        registerOnChange(event);
      }
    };
    ////console.log("WHAT IS NAME", name);
    ////console.log("Show Label Icons textarea", showLabelIcons);

    const handleTextChange = (e: any, text: string, scrollToBottom = true) => {
      //process text if needed
      if (processText) {
        text = processText(text);
      }

      const event = {
        target: {
          value: text,
          name: registerName ?? id ?? name, // Assuming registerName is the name of the input
        },
      } as unknown as ChangeEvent<HTMLTextAreaElement>;

      handleInputChange(event);

      //Scroll to the bottom of the textarea
      if (scrollToBottom) {
        setTimeout(() => {
          const textareaElement = textareaRef.current;
          if (textareaElement) {
            //textareaElement.scrollTop = textareaElement.scrollHeight;
            textareaElement.scrollTo(0, textareaElement.scrollHeight);
          }
          //timeout is needed to wait for text update so scrollHeight is correct
        }, 1);
      }
    };

    const handleAIActionClick = (item: AITextItem) => {
      if (aiActionsAdded.length === 0) {
        //check if the textarea has room to place the ai action label in the bottom of the  textarea
        const textareaElement = textareaRef.current;
        if (textareaElement) {
          //skip
        }
      }

      if (item.text === fillByPromptString) {
        autoFocusTextArea && setAutoFocusTextArea(undefined);
      }

      setAIActionsAdded((prev) => {
        //check if remove is needed
        if (prev.find((element) => element.text === item.text)) {
          return prev.filter((element) => element.text !== item.text);
        }
        //else its an add

        //if one of the existing items is an forceSingleAction, return
        if (prev.find((element) => element.forceSingleAction)) {
          return prev;
        }

        //add the new action to the list, only if one with the same text does not already exist
        if (prev.find((element) => element.text === item.text)) {
          //remove it
          return prev.filter((element) => element.text !== item.text);
        } else {
          if (item.forceSingleAction) {
            return [item];
          }
          //add it
          return [...prev, item];
        }
      });
    };

    const handleAIActionRemove = (e: any, text?: any) => {
      setAIActionsAdded((prev) => {
        //remove the action from the list
        return prev.filter((element) => element.text !== text);
      });
    };

    useEffect(() => {
      onPreAIValueChange && onPreAIValueChange(id, preAIValue);
    }, [preAIValue]);

    useEffect(() => {
      if (!textareaRef.current || !divRef.current) return; // divRef is the main wrapper of your component

      const textarea = textareaRef.current;
      const container = divRef.current; // Use the existing outer div of your component as the container

      // Create the mirrored div
      const mirroredDiv = document.createElement("div");
      mirroredEleRef.current = mirroredDiv;

      // Essential styles for the mirrored div to make it behave like the textarea
      mirroredDiv.style.position = "absolute";
      mirroredDiv.style.visibility = "hidden"; // Keep it hidden
      mirroredDiv.style.top = "0"; // Position it at the top-left of the container
      mirroredDiv.style.left = "0";
      mirroredDiv.style.pointerEvents = "none"; // Ensure it doesn't interfere with mouse events

      const textareaStyles = textarea && window.getComputedStyle(textarea);
      const propertiesToMirror: (keyof CSSStyleDeclaration)[] = [
        "boxSizing",
        "fontFamily",
        "fontSize",
        "fontWeight",
        "letterSpacing",
        "lineHeight",
        "textDecoration",
        "textIndent",
        "textTransform",
        "whiteSpace",
        "wordSpacing",
        "wordWrap",
        "paddingTop",
        "paddingRight",
        "paddingBottom",
        "paddingLeft",
        "borderTopWidth",
        "borderRightWidth",
        "borderBottomWidth",
        "borderLeftWidth",
        "borderTopStyle",
        "borderRightStyle",
        "borderBottomStyle",
        "borderLeftStyle",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        // Width and height will be handled by ResizeObserver
      ];

      propertiesToMirror.forEach((property) => {
        // @ts-ignore
        mirroredDiv.style[property] = textareaStyles[property];
      });

      // The container (divRef.current) needs a non-static position for absolute children to be relative to it.
      // Ensure its style has position: relative or similar.
      // You might want to add this to the className of divRef using cn() or set it directly if sure.
      // For example, in the divRef element: className={cn("relative", className)}
      if (container && window.getComputedStyle(container).position === "static") {
        container.style.position = "relative"; // Or add a class that does this
      }

      container.appendChild(mirroredDiv); // Prepend or append to the container

      // ResizeObserver to keep mirrored div dimensions in sync with textarea's client area
      const ro = new ResizeObserver(() => {
        if (textareaRef.current && mirroredEleRef.current) {
          mirroredEleRef.current.style.width = `${textareaRef.current.clientWidth}px`;
          mirroredEleRef.current.style.height = `${textareaRef.current.clientHeight}px`;
        }
      });
      ro.observe(textarea);

      // Scroll synchronization
      const handleScroll = () => {
        if (textareaRef.current && mirroredEleRef.current) {
          mirroredEleRef.current.scrollTop = textareaRef.current.scrollTop;
        }
      };
      textarea.addEventListener("scroll", handleScroll);

      // Initial sync
      if (textareaRef.current && mirroredEleRef.current) {
        mirroredEleRef.current.style.width = `${textareaRef.current.clientWidth}px`;
        mirroredEleRef.current.style.height = `${textareaRef.current.clientHeight}px`;
      }

      return () => {
        ro.disconnect();
        textarea.removeEventListener("scroll", handleScroll);
        if (mirroredEleRef.current && mirroredEleRef.current.parentNode === container) {
          container.removeChild(mirroredEleRef.current);
        }
        mirroredEleRef.current = null;
      };
    }, []); // Empty dependency array to run once on mount and clean up on unmount

    useEffect(() => {
      if (insertReferencedFieldMode && textareaRef.current && mirroredEleRef.current && divRef.current) {
        const textarea = textareaRef.current;

        // Use selectionStart to get current cursor position.
        // If your mode is triggered by typing '{', selectionStart will be *after* the '{'.
        // If you need to position relative to the '{' itself, you might use selectionStart - 1
        // or a state variable that specifically stores the index of the opening '{'.
        // Let's assume placeholderStartIndex (if you implement it) holds the index of the char
        // you want to position relative to (e.g., the '{').
        // For now, using textarea.selectionStart directly. Adjust as needed.
        let cursorPos = textarea.selectionStart;
        // const triggerCharPos = placeholderStartIndex !== null ? placeholderStartIndex : cursorPos -1; // Example if using placeholderStartIndex
        if (insertReferencedFieldInitialCursorPositionRef.current === undefined) {
          //set the initial cursor position to be the position immediately after the '{'
          while (cursorPos > 0 && textarea.value[cursorPos - 1] !== "{" && !stringIsWhitespace(textarea.value[cursorPos - 1])) {
            cursorPos--;
          }
          insertReferencedFieldInitialCursorPositionRef.current = cursorPos;
          insertReferencedFieldNumNewLines.current = textarea.value.substring(0, cursorPos).split("\n").length - 1;
        }
        //If numNewLines has changed, we need to update the cursor position
        else if (insertReferencedFieldNumNewLines.current !== textarea.value.substring(0, cursorPos).split("\n").length - 1) {
          insertReferencedFieldNumNewLines.current = textarea.value.substring(0, cursorPos).split("\n").length - 1;
        } else {
          //no need for recalculation
          return;
        }

        const mirroredDiv = mirroredEleRef.current;
        const container = divRef.current;

        // Ensure mirrored div's content and scroll position are up-to-date
        mirroredDiv.textContent = textarea.value; // Keep it simple with textContent
        mirroredDiv.scrollTop = textarea.scrollTop;

        const bonusNewLine = "\n";

        const textBeforeCursor = textarea.value.substring(0, cursorPos) + bonusNewLine;
        const textAfterCursor = textarea.value.substring(cursorPos);

        const pre = document.createTextNode(textBeforeCursor);
        const post = document.createTextNode(textAfterCursor);
        const caretEle = document.createElement("span");
        caretEle.innerHTML = "&nbsp;"; // To give it dimensions

        mirroredDiv.innerHTML = ""; // Clear previous content
        mirroredDiv.append(pre, caretEle, post);

        const caretRect = caretEle.getBoundingClientRect(); // Viewport-relative coordinates
        const containerRect = container.getBoundingClientRect(); // Viewport-relative coordinates

        //Adjust for scroll position
        const scrollTop = textareaRef.current?.scrollTop ?? 0;
        const scrollLeft = textareaRef.current?.scrollLeft ?? 0;

        // Calculate position relative to the container (divRef.current)
        const popupTop = caretRect.top - containerRect.top + caretEle.offsetHeight + 4 - scrollTop;
        const popupLeft = caretRect.left - containerRect.left + 5 - scrollLeft;

        setPopupPositionStyles({
          position: "absolute",
          top: `${popupTop}px`,
          left: `${popupLeft}px`,
          zIndex: 110, // Ensure it's above other elements like AIEditMode's div
          width: "fit-content",
          //backgroundColor: "var(--faintPurple)",
          borderRadius: "8px",
          // Add any other styles for your popup div
        });

        //Get the referenced fields
        const referenceableFieldKeys = getReferenceableFieldKeys ? getReferenceableFieldKeys() : [];
        setReferenceableFieldKeys(referenceableFieldKeys);
      } else if (!insertReferencedFieldMode) {
        // Reset or hide styles when not in insert mode
        insertReferencedFieldInitialCursorPositionRef.current = undefined;
        insertReferencedFieldNumNewLines.current = undefined;
        setPopupPositionStyles({});
      }
    }, [insertReferencedFieldMode, textValueState]); // Re-calculate if mode changes or text changes

    const handleInsertTextToField = (item: string) => {
      console.log("handleInsertTextToField", item);
      console.log("insertReferencedFieldInitialCursorPositionRef", insertReferencedFieldInitialCursorPositionRef.current);
      console.log(
        "text at position",
        insertReferencedFieldInitialCursorPositionRef.current
          ? textValueState.substring(insertReferencedFieldInitialCursorPositionRef.current)
          : "undefined"
      );

      if (!insertReferencedFieldInitialCursorPositionRef.current) return;

      if (!processText) return;

      const textToProcess = "{" + item + "}";
      const textToInsert = processText(textToProcess);
      if (textToProcess === textToInsert) {
        //no need to insert
        toast({
          title: "Cannot insert",
          message: "Sorry, this field does not have an associated value to insert",
          type: "default",
        });
        return;
      }

      if (debouncedChange.current) {
        clearTimeout(debouncedChange.current);
      }

      let newText = textValueState;
      const cursorPos = insertReferencedFieldInitialCursorPositionRef.current;

      // Find the start of the word (go left from cursor until whitespace or start of string)
      let wordStart = cursorPos;
      while (wordStart > 0 && !/\s/.test(newText[wordStart - 1])) {
        wordStart--;
      }

      // Find the end of the word (go right from cursor until whitespace or end of string)
      let wordEnd = cursorPos;
      while (wordEnd < newText.length && !/\s/.test(newText[wordEnd])) {
        wordEnd++;
      }

      // Replace the word with the new text
      newText = newText.substring(0, wordStart) + textToInsert + newText.substring(wordEnd);

      // Update the text value
      handleTextChange(null, newText, false);

      // Close the insert referenced field mode
      setInsertReferencedFieldMode(false);
    };

    const undoAIAction = () => {
      //set the old value back
      setTextValueState(preAIValue);
      //save the new value
      setPreAIValue(textValueState);
      //is a redo now
      setUndoIsRedo(!undoIsRedo);
    };

    const generateFieldValueAI = async (prompt: string = "", systemPrompt?: string) => {
      if (aiActionsAdded.length === 0) return;
      setAIResponseLoading(true);

      const anonymizedTextValue = anonymizeStringWithReferencedFields(textValueState, anonymizeFields);

      //if the aiActionsAdded is text = "Prompt"
      if (aiActionsAdded.length === 1 && aiActionsAdded[0].text === fillByPromptString) {
        if (!prompt) {
          //if no prompt passed, assume we are using the textBox value
          prompt += aiActionsAdded[0].prompt;
          prompt += "\nThe text to be modified: " + anonymizedTextValue;
        } else {
          //The user made their own prompt
          prompt +=
            "\nUsing the above command execute it on the following text, modify the text as much as necessary for the request:" + anonymizedTextValue;
        }
        prompt +=
          "\nDo not include the field title in response but for reference it is: " +
          (LabelAboveString ? LabelAboveString : camelOrSnakeToTitleCase(id ?? name ?? ""));
        prompt += "\n\nFor extra context, here are all the other field values that may relate:\n";
        //We add all userEditedFields to the prompt
        prompt += getUserEditedFields ? getUserEditedFields() : "";
      } else {
        prompt =
          "For the following text modify it based on the instructions and only return back the resulting text, do not quote it or give any other response relating to the resulting text, ";
        for (let i = 0; i < aiActionsAdded.length; i++) {
          if (i > 0) prompt += " also ";
          prompt += aiActionsAdded[i].prompt ?? aiActionsAdded[i].text;
        }
        prompt += ".\n\n";
        prompt += anonymizeStringWithReferencedFields(textValueState, anonymizeFields);
      }

      if (!systemPrompt) {
        systemPrompt = "You are a professional dental assistant, filling out a consult form\n";
      }

      if (getKeysAICanUse) {
        systemPrompt +=
          'You can use any of the following fields as placeholders if you do not have the content available, these placeholders must be wrapped in curly braces "{}": ';
        const keys = getKeysAICanUse();
        for (let i = 0; i < keys.length; i++) {
          if (i > 0) systemPrompt += ", ";
          systemPrompt += keys[i];
        }
      }

      try {
        //console.log("jsonResponseSchema", jsonResponseSchema);
        //get a token to use to call lambda instead of using nextRequest and nextAuth cookies
        let token = "";
        try {
          token = (await axios.get("/api/getVerificationToken")).data.jwt;
          if (!token) {
            throw new Error("No token found");
          }
        } catch (error) {
          console.error("Error getting token", error);
          toast({
            title: "Authentication Required",
            message: "Please make sure you are signed in",
            type: "error",
          });
          setAIResponseLoading(false);
          return;
        }
        // Call the Lambda Function URL
        const url = process.env.NEXT_PUBLIC_LONG_RUNNING_AI_RESPONSE_URL;
        console.log("url", url);

        if(!url) {
          throw new Error("No URL found");
        }

        const payload: any = {
          systemPrompt,
          userPrompt: prompt,
        };

        const response = await axios.post(url, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          //withCredentials: true, // Ensures cookies are sent if needed
        });

        console.log("AI response", response.data);

        /*
        const response2 = await axios.post("/api/getAISchemaFill", {
          schema: schema,
          formId: entryState.id,
          inputText: additionalPromptText + "transcript: " + importDataValue,
        });
        console.log("response1", response);
        console.log("response2", response2);
        */

        // Log the response payload
        if (!response.data.data) {
          toast({
            title: "Text not modified",
            message: "Try again, if the problem persists please contact support",
            type: "default",
          });
          return;
        }

        //save old value
        setPreAIValue(textValueState);

        //set the new value
        handleTextChange(null, response.data.data);

        //close the ai edit mode
        setAIEditMode(false);
      } catch (error) {
        console.error("Error calling AI", error);
      }
      setAIResponseLoading(false);
    };

    const debouncedHandleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Clear any existing timeout
        if (debouncedChange.current) {
          clearTimeout(debouncedChange.current);
        }

        // Clone the event since it will be nullified by the time the timeout runs
        const event = { ...e, target: { ...e.target } };

        // Set new timeout
        debouncedChange.current = setTimeout(() => {
          console.log("debouncedHandleChange", event.target.value);
          handleInputChange(event);
          debouncedChange.current = null;
        }, fieldChangeDebounce);
      },
      [handleInputChange, fieldChangeDebounce]
    );

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (debouncedChange.current) {
          clearTimeout(debouncedChange.current);
        }
      };
    }, []);

    return (
      <div ref={divRef} className={cn("relative", className)}>
        <div className={cn("relative", className)}>
          <div className="flex gap-x-1 pb-[2px] text-primary">
            <LabelAbove label={LabelAboveString} className={cn({ "-mb-[3px]": options && options.length > 0 })} />
            {showLabelIcons && (
              <div className="flex items-center gap-x-2">
                {historicValuesEnabled && (
                  <AlternateAIFieldValueIcon
                    handleAlternativeSelect={(value) => handleInputChange(value)}
                    textState={textValueState}
                    alternateValues={historicValues}
                    alternateValuesLabels={historicValueLabels}
                    triggerClassName={labelIconsClassNames}
                  />
                )}
                <FeatureIcons
                  tooltipText={autofillTooltipText(parents, dependents)}
                  numRelated={parents?.length > dependents?.length ? parents?.length : dependents?.length}
                  iconClassName={cn(labelIconsClassNames)}
                  className="w-[260px]"
                  side="top"
                  iconSize={16}
                />
                {aiEdits && (
                  <HoverCardClickable
                    sideOffset={-4}
                    side={"top"}
                    //forceOpen={true}
                    triggerJSX={<AutoModeOutlined style={{ fontSize: 14 }} className={labelIconsClassNames} onClick={toggleAIEditMode} />}
                    //className={cn("text-tertiary-dark hover:text-skyBlue", className)}
                  >
                    <div className="flex items-center gap-x-1 px-2 py-1 text-sm text-primary-dark">
                      <p>AI Actions</p>
                      <span className="h-fit rounded-md bg-faintPurple p-0.5 px-1 text-xs">{isMac ? "⌘" : "Ctrl"}</span>
                      <span className="h-fit rounded-md bg-faintPurple p-0.5 px-1 text-xs">{isMac ? "⌘ + C" : "Ctrl + C"}</span>
                    </div>
                  </HoverCardClickable>
                )}
              </div>
            )}
          </div>
          {options && options.length > 0 && (
            <TextCarousel
              maxItemWidthPX={160}
              showButtons={showRefBoxButtons}
              showExpandUpwardsButton={showExpandUpwardsButton}
              showExpandSideButton={showExpandSideButton}
              textFieldText={textValueState}
              handleTextChange={handleTextChange}
              options={options}
              optionsClassName="px-0.5"
              processText={processText}
            />
          )}
        </div>
        {true && (
          <InnerOuterAnimatedGlow
            style={mergedStyles}
            //elementRef={textareaRef}
            innerGlowEnabled={true}
            outerGlowEnabled={AIEditMode}
            borderWidthPX={AIEditMode ? 1 : undefined}
            insetPX={aiResponseLoading ? 3 : AIEditMode ? 0 : undefined}
            featherInnerPX={aiResponseLoading ? 17 : AIEditMode ? 0 : undefined}
            backgroundBlurPX={aiResponseLoading ? 0 : AIEditMode ? 12 : undefined}
            visible={AIEditMode ? true : false}
          />
        )}
        <div>
          {/* This is needed to wrap the ai edit mode div so it can be highlighted and avoid react reconcilation errors */}
          {AIEditMode && (
            <div key={`${id}-textarea-ai-edit-mode`}>
              <div style={{ position: "absolute", zIndex: 10, ...mergedStyles }} className="pointer-events-none flex items-end p-1">
                <div
                  style={{ maskImage: false ? `linear-gradient(to right, transparent, rgba(0, 0, 0, 1) 80px)` : undefined }}
                  className={cn("flex flex-wrap gap-0.5", aiActionPromptMode && "w-full")}
                >
                  {aiActionsAdded.map((item, index) => {
                    if (aiActionPromptMode) {
                      //The AI Actions set for submitting
                      return (
                        <Input
                          key={index}
                          size={"slim"}
                          id="promptInput"
                          placeholder={textValueState ? "How should this field be modified" : "How should this field be filled"}
                          className={cn("pointer-events-auto w-full transition-all", aiResponseLoading && "")}
                          inputBoxClassName={cn(
                            "w-full",
                            item.containerClassName,
                            "bg-background/95 shadow-xl",
                            aiResponseLoading && "text-secondary-dark"
                          )}
                          labelAbove={""}
                          value={aiPromptInput}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              generateFieldValueAI(aiPromptInput);
                            }
                          }}
                          focusTrigger={true}
                          onChange={(e) => {
                            setAIPromptInput(e.target.value);
                          }}
                          TailJSX={
                            <div className="flex gap-x-1.5">
                              <Button
                                variant="ghost"
                                size={"slim"}
                                onClick={(e: any) => {
                                  setAIActionsAdded([]);
                                  setTimeout(() => {
                                    setAutoFocusTextArea(true);
                                  }, 100);
                                }}
                              >
                                <CloseOutlined className={cn("h-4 w-4 transition-all duration-200 dark:text-white")} />
                              </Button>
                              <Button
                                variant="ghost"
                                size={"slim"}
                                onClick={(e: any) => {
                                  generateFieldValueAI(aiPromptInput);
                                }}
                              >
                                <AutoModeOutlined
                                  className={cn(
                                    "h-4 w-4 transition-all duration-200 dark:text-white"
                                    //aiPromptInput ? "scale-100 opacity-100" : "scale-95 opacity-30"
                                  )}
                                />
                              </Button>
                            </div>
                          }
                        />
                      );
                    }
                    return (
                      <CuteWordOrb
                        key={index}
                        icon={item.icon}
                        clickToRemove={true}
                        iconStyle={{ fontSize: 10 }}
                        iconClassName={cn(item.iconClassName, "")}
                        text={item.shortText ?? item.text}
                        maxWidthPX={125}
                        onClick={(e: any) => handleAIActionRemove(e, item.text)}
                        className={cn("h-fit w-fit bg-background/80 px-0 py-0 text-sm opacity-95", item.containerClassName)}
                      />
                    );
                  })}
                </div>
                <div
                  className={cn(
                    "absolute flex gap-x-1.5",
                    !aiActionPromptMode && aiActionsOnBottom ? "bottom-2 right-2" : "right-2 top-2",
                    aiActionsClassNames
                  )}
                >
                  {preAIValue && preAIValue !== textValueState && (
                    <Button id="undoButton" className={cn("", textValueState && "bg-background/75")} variant="ghost" onClick={undoAIAction}>
                      {undoIsRedo ? (
                        <RedoOutlinedIcon className={cn(" h-4 w-4 transition-all duration-200 dark:text-white")} />
                      ) : (
                        <UndoOutlined className={cn(" h-4 w-4 transition-all duration-200 dark:text-white")} />
                      )}
                    </Button>
                  )}
                  {!aiActionPromptMode && aiActionsAdded.length > 0 && (
                    <Button
                      className={cn("", textValueState && "bg-background/75")}
                      variant="ghost"
                      disabled={!textValueState}
                      onClick={generateFieldValueAI}
                    >
                      <AutoModeOutlined
                        className={cn(
                          "h-4 w-4 transition-all duration-200 dark:text-white",
                          textValueState ? "scale-100 opacity-100" : "scale-95 opacity-30"
                        )}
                      />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <textarea
          id={id}
          name={name || registerName || id}
          key={`${id}-textarea`}
          style={{
            borderRadius: "6px",
          }}
          className={cn(
            "peer h-full w-full appearance-none border border-primary bg-background p-2 outline outline-1 outline-transparent transition-all hover:border-neutral-400 focus:outline-skyBlue disabled:cursor-not-allowed disabled:bg-secondary-light disabled:text-secondary-dark disabled:opacity-75 disabled:hover:border-border",
            {
              "border-rose-500": hasError,
              "border-border": !hasError,
              "focus:border-rose-500": hasError,
              "focus:border-skyBlue": !hasError,
              // "relative": true, // Uncomment this line if "relative" is always required
              // [undefined]: type === ("checkbox" || "radio") // Uncomment this line if "type === ('checkbox' || 'radio')" condition needs to be checked
            },
            className,
            { "text-tertiary-dark": aiResponseLoading }
          )}
          autoFocus={autoFocusTextArea}
          disabled={aiResponseLoading}
          rows={rows || 1} //sets the number of lines the textarea is tall
          defaultValue={textValueState} //Initial rendered value
          //value={textValueState}        //We comment out value so it is uncontrolled, yet we will update it via its ref.current.value when the value is processed
          onChange={(e: any) => {
            const newText = e.target.value;
            const cursorPos = e.target.selectionStart;

            //we have backspaced past the initial cursor position, so we can no longer insert a referenced field
            if (
              insertReferencedFieldMode &&
              insertReferencedFieldInitialCursorPositionRef.current &&
              cursorPos < insertReferencedFieldInitialCursorPositionRef.current
            ) {
              insertReferencedFieldInitialCursorPositionRef.current = undefined;
              setInsertReferencedFieldMode(false);
            }

            if (e.nativeEvent.data === "{") {
              setInsertReferencedFieldMode(true);
            } else if (insertReferencedFieldMode && e.nativeEvent.data) {
              //Closing the insert referenced field mode
              if (e.nativeEvent.data === "}" || e.nativeEvent.data === " ") {
                setInsertReferencedFieldMode(false);
              } else {
                //narrowing the search results
                //Get the text from insertReferencedFieldInitialCursorPositionRef untill first whitespace
                const referencedFieldString = newText.substring(insertReferencedFieldInitialCursorPositionRef.current).split(/\s+/)[0];
                console.log("insertReferencedFieldInitialCursorPositionRef.current", insertReferencedFieldInitialCursorPositionRef.current);
                console.log("newText", newText);
                console.log("textAfterCursor", referencedFieldString);
                setReferenceableFieldSearchQuery(referencedFieldString);
              }
            } else if (!insertReferencedFieldMode) {
              // recover from a previous started insert referenced field intention
              // check for an opening brace before the cursor within the current word
              const referencedFieldSpecified = charInWord(newText, "{", undefined, cursorPos);
              if (referencedFieldSpecified) {
                setInsertReferencedFieldMode(true);
                setReferenceableFieldSearchQuery(referencedFieldSpecified);
              }
            }

            //always set the text value state to the new value immediately
            //setTextValueState(e.target.value);
            //only debounce if currently debouncing and the
            //if the change is greater than 5 characters and not currently debouncing, then handle the change immediately
            if (fieldChangeDebounce && (!(Math.abs(newText.length - textValueState.length) > 5) || debouncedChange.current)) {
              // Clone the event since it will be nullified by the time debounce runs
              debouncedHandleChange(e);
            } else {
              handleInputChange(e);
            }
          }}
          onClick={(e) => {
            if (insertReferencedFieldMode) {
              //setInsertReferencedFieldMode(false);
            }
          }}
          onFocus={(e) => {
            onFocusSetter(e);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            onBlurSetter(e);
            onBlur?.(e);
            registerOnBlur?.(e);
          }}
          onSelect={handleTextSelect}
          ref={(node) => {
            mergeRefs(node, textareaRef, ref, registerRef);
          }}
          {...props}
        />
        {AIEditMode && (
          <AITextActions
            handleItemClick={handleAIActionClick}
            aiActions={aiActionsAdded?.length === 1 && aiActionsAdded[0]?.forceSingleAction ? [aiActionsAdded[0].text] : aiActions}
            hideAiActions={[
              ...aiActionsAdded.map((item) => {
                return item.text;
              }),
              ...(hideAiActions ?? []),
            ]} //hide the actions that are already added, as well as additional hideAiActions actions that should not be shown
          />
        )}
        {insertReferencedFieldMode && Object.keys(popupPositionStyles).length > 0 && (
          <div style={popupPositionStyles} className="z-50 overflow-y-scroll">
            <FuzzySearchList
              className="px-1 py-1 bg-faintPurple rounded-lg"
              items={Object.fromEntries(referenceableFieldKeys.map((key) => [key, key]))}
              query={referenceableFieldSearchQuery}
              iconsMap={{ default: HistoryEduOutlinedIcon, "^rel.*$": CorporateFareOutlinedIcon }}
              onSelectCallback={handleInsertTextToField}
              hideKeysRegexs={[/^relOwner_/]}
              maxWidthPX={400}
              onHoverFeatures={false}
            />
          </div>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export { Textarea };
