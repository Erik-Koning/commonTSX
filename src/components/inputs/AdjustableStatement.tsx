import { useUserUnengaged } from '../../hooks/useUserUnengage';
import { cn } from '../../lib/utils';
import { DateFormat, dateToFriendlyTimeFromNow } from '../../utils/dateManipulation';
import { isDef } from '../../utils/types';
import { cva, VariantProps } from "class-variance-authority";
import { Edit } from "lucide-react";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { FieldErrors, FieldValues, RegisterOptions, UseFormRegister } from "react-hook-form";
import DateInput from "./DateInput";
import { DateTimeInput } from "./DateTimeInput";
import { NumericSelect } from "./NumericSelect";
import TimeInput from "./TimeInput";
import { ErrorLabel } from "../ui/ErrorLabel";

const AdjustableStatementVariants = cva("flex items-center gap-1", {
  variants: {
    variant: {
      default: "text-sm",
    },
    size: {
      default: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface AdjustableStatementProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof AdjustableStatementVariants> {
  ids: string[];
  id?: string;
  className?: string;
  coverClassName?: string;
  statement: string;
  register?: UseFormRegister<FieldValues>;
  validationSchemas?: RegisterOptions[];
  dateFormat?: DateFormat;
  defaultValues: any[];
  componentProps?: Record<string, any>[];
  coverStatement?: string;
  allowAdjust?: boolean;
  errors?: FieldErrors;
}

type PlaceholderType = "N" | "d" | "T" | "D";
// Define a constant array of PlaceholderType values
const placeholderTypes: PlaceholderType[] = ["N", "d", "T", "D"];
// Construct the regex pattern dynamically
const placeholderPattern = new RegExp(`(\\{[${placeholderTypes.join("")}]\\})`);

export const AdjustableStatement = forwardRef<HTMLDivElement, AdjustableStatementProps>(
  (
    {
      id,
      ids,
      coverStatement,
      allowAdjust = true,
      coverClassName,
      className,
      variant,
      size,
      statement,
      defaultValues,
      register,
      validationSchemas,
      dateFormat,
      onChange,
      componentProps,
      errors,
      ...props
    },
    ref
  ) => {
    const [values, setValues] = useState<any[]>(defaultValues);
    const [isEditing, setIsEditing] = useState(false);
    const [parts, setParts] = useState<string[]>([]);
    const [partsMatchArr, setPartsMatchArr] = useState<PlaceholderType[]>([]);

    const divRef = useRef<HTMLDivElement>(null);
    const calRef = useRef<HTMLDivElement>(null);

    const errorId = errors && ids.find((id) => errors[id]?.message);
    const hasErrors = !!errorId;

    useEffect(() => {
      if (statement) {
        // Split the statement into parts based on {} placeholders
        const parts = statement.split(placeholderPattern);
        setParts(parts);
        setPartsMatchArr((prev) => {
          let newArr: PlaceholderType[] = [];
          parts.map((part) => {
            if (part.match(placeholderPattern)) {
              newArr.push(part[1] as PlaceholderType);
            }
          });
          return newArr;
        });
      }
    }, [statement]);

    const generateCoverStatementText = (coverStatement: string, values: any[]) => {
      const parts = coverStatement.split(placeholderPattern);
      return parts
        .map((part) => {
          if (part.match(placeholderPattern)) {
            const placeholderType = part[1] as PlaceholderType;
            const index = partsMatchArr.indexOf(placeholderType);
            if (index !== -1) {
              const value = values[index];
              switch (placeholderType) {
                case "N":
                  return String(value);
                case "d":
                  return value.toLocaleDateString();
                case "T":
                  return value.toLocaleTimeString();
                case "D":
                  return dateToFriendlyTimeFromNow(value);
                default:
                  return String(value);
              }
            }
            return "";
          }
          return part;
        })
        .join("");
    };

    const handleValueChange = (index: number, value: any) => {
      const newValues = [...values];
      newValues[index] = value;
      setValues(newValues);
    };

    const renderInlineComponent = (index: number, type: PlaceholderType) => {
      const id = ids[index];
      const validationSchema = validationSchemas?.[index];
      console.log("validationSchema for", id, validationSchema);
      switch (type) {
        case "N":
          return (
            <NumericSelect
              id={id ?? "numericSelectInput"}
              className="outline-none outline-0"
              register={register}
              validationSchema={validationSchema}
              buttonProps={{ variant: "outline", size: "sm_xs", bg: "default", className: "h-[28px] min-w-[28px]" }}
              {...(componentProps && componentProps[index])}
              defaultValue={defaultValues[index]}
              inputProps={{ inputBoxClassName: "h-fit py-1", bg: "default" }}
              onChange={(e) => handleValueChange(index, parseInt(e.target.value))}
            />
          );
        case "D":
          return (
            <DateTimeInput
              id={id}
              calRef={calRef}
              register={register}
              validationSchema={validationSchema}
              defaultDate={defaultValues[index]}
              {...(componentProps && componentProps[index])}
              className="max-w-[96px] text-sm"
              DateInputProps={{ id: "dateInput" }}
              TimeInputProps={{ id: "timeinput" }}
            />
          );
        case "d":
          return (
            <DateInput
              id={id}
              register={register}
              validationSchema={validationSchema}
              {...(componentProps && componentProps[index])}
              className="w-fit"
              defaultDate={defaultValues[index]}
              onChange={(date) => handleValueChange(index, date)}
              format={dateFormat}
            />
          );
        case "T":
          return (
            <TimeInput
              id={id}
              register={register}
              validationSchema={validationSchema}
              {...(componentProps && componentProps[index])}
              defaultDate={defaultValues[index]}
              inputProps={{ size: "md", width: "fit" }}
              buttonProps={{ size: "md", widthVariant: "fit" }}
            />
          );
        default:
          return null;
      }
    };

    useUserUnengaged(
      [divRef, calRef],
      () => {
        setIsEditing(false);
      },
      7000,
      isDef(coverStatement) && isEditing
    );

    let componentIndex = -1;

    return (
      <div ref={divRef}>
        <div {...props} className={cn(AdjustableStatementVariants({ variant, size }), className)}>
          {coverStatement && !isEditing && !hasErrors ? (
            <div
              className="flex cursor-pointer items-center gap-1"
              onClick={() => {
                if (allowAdjust) setIsEditing(true);
              }}
            >
              <span className={cn("text-md", coverClassName)}>
                {generateCoverStatementText(coverStatement, values)}
                {allowAdjust && <Edit className="mx-1 inline-flex items-center" size={14} />}
              </span>
            </div>
          ) : (
            parts.map((part, index) => {
              if (part.match(placeholderPattern)) {
                const type = part[1] as PlaceholderType; // Extract the type of placeholder
                componentIndex++;
                return <React.Fragment key={index}>{renderInlineComponent(componentIndex, type)}</React.Fragment>;
              } else if (part)
                return (
                  <span className="" key={index}>
                    {part}
                  </span>
                );
              else return null;
            })
          )}
        </div>
        {errors && errorId && <ErrorLabel show={hasErrors}>{`${errors?.[errorId]?.message}`}</ErrorLabel>}
      </div>
    );
  }
);

AdjustableStatement.displayName = "AdjustableStatement";
