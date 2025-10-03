import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from "../ui/Button";
import { cn } from '../../lib/utils';
import { BaseModal } from "./BaseModal";

interface dialogProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  title: string;
  description: string;
  onAction1Callback?: () => void;
  action1Title?: string;
  onAction2Callback?: () => void;
  action2Title?: string;
  allowCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  buttonClassName?: string;
  modal?: boolean;
}

const ActionNeededModal: React.FC<dialogProps> = ({
  isOpen,
  onClose,
  isLoading,
  title,
  description,
  onAction1Callback,
  action1Title,
  onAction2Callback,
  action2Title,
  allowCloseButton = false,
  className = "",
  overlayClassName = "",
  buttonClassName = "",
  modal = true,
}) => {
  const [isOpenState, setIsOpenState] = useState(isOpen);
  const allowPointerDownOutside = () => {
    if (allowCloseButton) {
      onClose();
    } else {
      setIsOpenState(true);
    }
  };
  const handleOpenChange = (open: boolean) => {
    setIsOpenState(open);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      allowCloseButton={allowCloseButton}
      title={title}
      description={description}
      overlayClassName={overlayClassName}
      className={className}
      modal={modal}
    >
      <div className="flex w-full items-end justify-between gap-x-4 pt-6">
        <div className="w-full">
          <Button
            onClick={onAction1Callback}
            isLoading={isLoading}
            variant="light"
            size="full"
            className={cn("items-center justify-center border-none outline-none ring-transparent hover:bg-neutral-300/95", buttonClassName)}
          >
            {action1Title}
          </Button>
        </div>
        <div className="w-full">
          <Button
            onClick={onAction2Callback}
            isLoading={isLoading}
            variant="light"
            size="full"
            className={cn(
              "items-center justify-center border-none bg-purple text-white outline-none ring-transparent hover:bg-darkPurple",
              buttonClassName
            )}
          >
            {action2Title}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
};

export { ActionNeededModal };
