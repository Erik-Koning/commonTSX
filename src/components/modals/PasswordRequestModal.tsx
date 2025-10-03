import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { BaseModal } from "./BaseModal";
import { Input } from '../../components/inputs/Input';
import { useAuthenticatePassword } from '../../../../app-core/src/hooks/useAuthenticatePassword';
import { resIsSuccess } from '../../utils/httpStatus';

interface PasswordRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
  passwordRestrictedCallback?: () => void;
  action1Title?: string;
  onAction2Callback?: () => void;
  action2Title?: string;
  allowCloseButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const PasswordRequestModal: React.FC<PasswordRequestModalProps> = ({ isOpen, onClose, isLoading, passwordRestrictedCallback }) => {
  const [password, setPassword] = useState("");
  const [isLoadingInt, setIsLoadingInt] = useState(false);
  const [shakeModal, setShakeModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const setShakeModalInt = (value: boolean) => {
    setShakeModal(value);
    setTimeout(() => {
      setShakeModal(false);
    }, 500);
  };

  //check the password when the button is loading / clicked
  const { data, isLoading: isFetchLoading, isFetched, isError } = useAuthenticatePassword(password, isLoadingInt);

  // An effect to check the password response
  useEffect(() => {
    if (isFetchLoading || !data) return;
    if (password === "") {
      setIsLoadingInt(false);
      return;
    }

    //console.log("data", data);
    if (resIsSuccess(data)) {
      setIsLoadingInt(false);
      setErrorMsg("");
      //Do the thing the password was protecting
      if (passwordRestrictedCallback) passwordRestrictedCallback();
      onClose();
    } else {
      setShakeModalInt(true);
      setErrorMsg("Incorrect Password");
    }
    setIsLoadingInt(false);
  }, [data, password, isFetched]); // Include `data` in the dependency array

  const checkPassword = async (password: string): Promise<boolean> => {
    //console.log("password", password);
    //fake delay of 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return false;
  };

  const handlePasswordChange = (e: any) => {
    setPassword(e.target.value);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      isLoading={isLoading}
      shakeModal={shakeModal}
      liftModalToCloud={isLoadingInt}
      onClose={onClose}
      title={"Security Check"}
      description={"Password Required"}
    >
      <div className="flex flex-col gap-y-1 pt-2">
        <Input
          id="password"
          placeholder="Enter your password"
          otherType="password"
          size="slim"
          disabled={isLoadingInt}
          value={password}
          onChange={(e: any) => {
            handlePasswordChange(e);
          }}
          error={errorMsg}
        />
        <Button
          className="mt-4"
          variant="purple"
          size="fullLine"
          isLoading={isLoadingInt}
          onClick={() => {
            if (!(password.length > 0)) {
              return;
            } else {
              //enables fetching also
              setIsLoadingInt(true);
            }
          }}
        />
      </div>
    </BaseModal>
  );
};

PasswordRequestModal.displayName = "PasswordRequestModal";

export { PasswordRequestModal };
