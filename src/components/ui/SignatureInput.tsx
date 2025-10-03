import { forwardRef, useEffect, useRef, useState } from "react";
import { Border } from "./Border";
import SignaturePad from "react-signature-canvas";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "./dialog";
import { Heading } from '../../components/ui/Heading';
import { Button } from "./Button";
import { cn } from '../../lib/utils';
import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import { BaseModal } from "../modals/BaseModal";

interface SignatureInputProps {
  id: string;
  hideBorder?: boolean;
  value?: string;
  defaultValue?: string;
  register?: UseFormRegister<FieldValues>;
  validationSchema?: RegisterOptions;
  errors?: FieldErrors<any>;
}

export const SignatureInput = forwardRef<HTMLDivElement, SignatureInputProps>(
  ({ id, hideBorder = false, value, defaultValue, register, validationSchema, errors }, ref) => {
    let sigCanvas = useRef<SignaturePad>(null);
    const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
    const [newToSave, setNewToSave] = useState(false);

    const formatIntoPng = (sigCanvasProp?: any) => {
      if (sigCanvasProp) {
        return sigCanvasProp.toDataURL("image/png");
      } else if (sigCanvas.current) {
        return sigCanvas.current.toDataURL("image/png");
      }
    };

    const trimCanvas = () => {
      if (sigCanvas.current) {
        return sigCanvas.current.getTrimmedCanvas();
      }
    };

    const clearCanvas = () => {
      if (sigCanvas.current) {
        sigCanvas.current.clear();
      }
    };

    const hasErrors = errors && errors[id];
    let errorMessage;
    if (errors && errors[id] && errors.hasOwnProperty(id)) {
      const errorMessageTmp = errors[id]?.message;

      // Check if errorMessage is a string before setting the state
      if (typeof errorMessageTmp === "string" && errorMessageTmp.length > 0) {
        ////console.log("Setting error message", id, errorMessageTmp, errors, errors[id]);
        errorMessage = errorMessageTmp;
      } else {
        // Handle other types or reset the state as needed
        errorMessage = "Field Required";
      }
    } else {
      errorMessage = undefined;
    }

    let registerOnChange: ((e: React.ChangeEvent<HTMLInputElement>) => void) | undefined;
    let registerOnBlur: ((e: React.FocusEvent<HTMLInputElement>) => void) | undefined;
    let registerName: string | undefined;
    let registerRef: React.Ref<HTMLInputElement> | undefined;
    // Check if the register function exists before invoking it
    if (register) {
      const registerResult = register(id, validationSchema);
      registerOnChange = registerResult.onChange;
      registerOnBlur = registerResult.onBlur;
      registerName = registerResult.name;
      registerRef = registerResult.ref;
    }

    const handleNewSignature = (newValue: string) => {
      //console.log("$$$$newvalue", newValue);
      if (newValue) {
        //setInputValue(value);
        // If registerOnChange is a function, create a synthetic event and pass it
        // Please note that this approach assumes that registerOnChange only uses the value and name from the event object. If registerOnChange uses other properties from the event object (like event.target.type or event.currentTarget), you'll need to include those in the synthetic event as well.
        if (registerOnChange && typeof registerOnChange === "function" && registerName) {
          const event = {
            target: {
              value: newValue,
              name: registerName, // Assuming registerName is the name of the input
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          registerOnChange(event);
        }
      }
    };

    useEffect(() => {
      if (defaultValue) {
        handleNewSignature(defaultValue);
      }
    }, [defaultValue]);

    const handleSave = () => {
      if (newToSave) {
        handleNewSignature(formatIntoPng(trimCanvas()));
      }
      setSignatureDialogOpen(false);
    };

    return (
      <div>
        <Border className="overflow-hidden rounded-lg" hideBorder={hideBorder}>
          <div
            className="group relative min-h-[50px] w-fit min-w-[200px] cursor-pointer px-4"
            onClick={() => {
              setSignatureDialogOpen(true);
            }}
          >
            {value && value.length > 0 && (
              <img
                className="h-auto max-h-[80px] w-auto scale-[96%] object-contain transition duration-300 ease-in-out group-hover:scale-[100%] group-hover:opacity-70"
                src={value}
                alt="Users Signature"
              />
            )}
            <Button
              variant="ghost"
              size="fit"
              className={cn(
                "absolute left-1/2 top-1/2 min-w-[192px] -translate-x-1/2 -translate-y-1/2 transform whitespace-nowrap opacity-0 transition duration-300 ease-in-out group-hover:opacity-100",
                {
                  "opacity-100": sigCanvas.current?.isEmpty(),
                },
                "font-normal"
              )}
              style={{
                zIndex: 10,
                opacity: !value ? 100 : undefined,
              }}
            >
              Edit Signature
            </Button>
          </div>
          <BaseModal
            onOpenAutoFocus={() => {
              sigCanvas.current?.fromDataURL(value ?? "");
            }}
            onPointerDownOutside={() => {
              setSignatureDialogOpen(false);
            }}
            allowCloseButton={true}
            isOpen={signatureDialogOpen}
            onOpenChange={setSignatureDialogOpen}
            title="Draw your Signature"
            size={"md"}
            className="max-w-[622px]"
          >
            <SignaturePad
              ref={sigCanvas}
              //onEnd={() => field.onChange(formatIntoPng(trimCanvas()))}
              penColor="black"
              onBegin={() => {
                setNewToSave(true);
              }}
              canvasProps={{
                style: {
                  border: "1px solid",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "10px",
                  width: "550px",
                  height: "200px",
                },
              }}
            />
            <div className="flex flex-row justify-between pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  clearCanvas();
                }}
              >
                Clear
              </Button>
              <Button variant="purple" size="md" onClick={handleSave}>
                Save
              </Button>
            </div>
          </BaseModal>
        </Border>
        {hasErrors && (
          <div className="">
            <span className="left-0 z-40 my-1 text-sm text-rose-500">{String(errorMessage ?? "Field invalid")}</span>
          </div>
        )}
      </div>
    );
  }
);

SignatureInput.displayName = "SignatureInput";
