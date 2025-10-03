import React, { forwardRef, useState } from "react";
import { InputArray } from "./InputArray";

interface Validate2FAArrayProps {
  className?: string;
  title?: string;
  length?: number;
  token?: string;
  onChange?: (value: string) => void;
  onSuccess?: () => void;
  onFail?: () => void;
  showLoadingWhenValidating?: boolean;
  postValidate2FAToken?: (value: string) => Promise<boolean>;
}

export const Validate2FAArray = forwardRef<HTMLDivElement, Validate2FAArrayProps>(
  ({ className, title, length = 6, token, onChange, onSuccess, onFail, showLoadingWhenValidating, postValidate2FAToken, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(false);

    const onChangeHandler = async (value: string) => {
      if (showLoadingWhenValidating && value.length === length) {
        setIsLoading(true);
      }
      if (onChange) {
        onChange(value);
        if (showLoadingWhenValidating && value.length === length) {
          setTimeout(() => {
            setIsLoading(false);
          }, 5000);
        }
      } else {
        setTimeout(async () => {
          if (value.length === length) {
            const resSuccess = await postValidate2FAToken?.(value);
            if (resSuccess) {
              setIsLoading(false);
              if (onSuccess) onSuccess();
            } else {
              setTimeout(() => {
                setIsLoading(false);
                if (onFail) onFail();
              }, 5000);
            }
          }
        }, 1);
      }
    };

    return <InputArray isLoading={isLoading} className={className} title={title} length={length} token={token} onChange={onChangeHandler} />;
  }
);

Validate2FAArray.displayName = "Validate2FAArray";
