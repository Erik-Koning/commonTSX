import React, { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { Input } from "../inputs/Input";
import { Button } from "./Button";
import { passwordValidation } from "../../lib/validations/reactHookFormValidations";
import { cn } from "../../lib/utils";

interface PasswordChangeFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  setPassword: (passwords: { currentPassword: string; newPassword: string }) => any;
}

export const PasswordChangeForm = forwardRef<HTMLDivElement, PasswordChangeFormProps>(({ className, setPassword, ...props }, ref) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
    setError,
  } = useForm();

  console.log("---rerendering PasswordChangeForm");

  const onSubmit = async (data: Record<string, any>) => {
    if (data.newPassword !== data.confirmNewPassword) {
      console.log("Passwords do not match");
      setError("confirmNewPassword", { type: "custom", message: "Passwords do not match" });
      return;
    }
    await setPassword(data.newPassword);
  };

  return (
    <div {...props} className={cn("grid grid-cols-12 gap-2", className)}>
      <div className="col-span-12 sm:col-span-6">
        <form className="max-w-[350px] lg:max-w-none">
          <div className="flex flex-col gap-4 lg:flex-row">
            <Input
              className="w-full max-w-[350px] flex-[2] self-start"
              id="currentPassword"
              otherType="password"
              variant="shortText"
              size="md"
              labelAbove={true}
              register={register}
              errors={errors}
            />
            <div className="flex flex-[3] flex-col gap-4 2xl:flex-row">
              <Input
                className="w-full max-w-[350px] flex-1 justify-start self-start"
                id="newPassword"
                otherType="password"
                size="md"
                labelAbove={true}
                register={register}
                validationSchema={passwordValidation}
                errors={errors}
              />
              <Input
                className="w-full max-w-[350px] flex-1 justify-start self-start"
                id="confirmNewPassword"
                otherType="password"
                size="md"
                labelAbove={true}
                register={register}
                errors={errors}
              />
            </div>
          </div>
          <div className="flex w-full justify-end">
            <Button
              variant="purple"
              size="md"
              type="submit"
              className="mt-6 w-full lg:w-fit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              Change Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

PasswordChangeForm.displayName = "PasswordChangeForm";
