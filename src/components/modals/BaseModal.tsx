import { CustomDialogContentProps, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { cn } from '../../lib/utils';
import React, { useEffect, useState } from "react";
import { ModalLayout, ModalSizeVariantProps, modalSizeVariants } from "./ModalLayout";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface BaseModalProps extends ModalSizeVariantProps, CustomDialogContentProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  onAction1Callback?: () => void;
  action1Title?: string;
  onAction2Callback?: () => void;
  action2Title?: string;
  allowCloseButton?: boolean;
  allowClose?: boolean;
  currentMessageIndex?: number;
  numberOfMessages?: number;
  onNavLeft?: (e: any) => void;
  onNavRight?: (e: any) => void;
  onOpenChange?: (open: boolean) => void;
  isLoading?: boolean;
  shakeModal?: boolean;
  liftModalToCloud?: boolean;
  className?: string;
  headerClassName?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  modal?: boolean;
}

const BaseModal: React.FC<BaseModalProps> = ({
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
  allowClose = true,
  currentMessageIndex,
  numberOfMessages,
  onNavLeft,
  onNavRight,
  onOpenChange,
  shakeModal = false,
  liftModalToCloud = false,
  modal = true,
  className = "",
  headerClassName = "",
  size,
  variant,
  overlayClassName = "",
  children,
  ...props
}) => {
  const [modalOpen, setModalOpen] = useState(isOpen);
  const [actionLoading, setActionLoading] = useState(false);
  const [closeModalAllowed, setCloseModalAllowed] = useState(false);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);

  const allowPointerDownOutside = () => {
    if (allowClose) {
      onClose && onClose();
    }
  };

  useEffect(() => {
    // start a timer so that the modal cannot be closed too quickly
    if (isOpen) {
      setTimeout(() => {
        setCloseModalAllowed(true);
      }, 400);
    } else {
      setCloseModalAllowed(false);
    }
  }, [isOpen]);

  const handleOnOpenChange = (open: boolean) => {
    debugger;
    onOpenChange && onOpenChange(open);
    if (closeModalAllowed && open === false) {
      onClose && onClose();
    }
  };

  return (
    <Dialog open={modalOpen} onOpenChange={handleOnOpenChange} modal={modal}>
      <DialogContent
        allowCloseButton={allowCloseButton}
        onPointerDownOutside={allowPointerDownOutside}
        {...props}
        /*className={cn(
          "m-2 mr-10 max-h-[80vh] w-full max-w-[98%] justify-center justify-self-center rounded-md bg-background-light px-2 py-6 pb-4 shadow-lg transition-all delay-0 duration-200 ease-in-out md:w-3/5 md:px-8 xl:w-2/5 xl:max-w-[900px]",
          {
            "animate-floatToCloud": liftModalToCloud,
            "animate-shake": shakeModal,
          },
          "max-h-[70vh] overflow-scroll p-4",
          className
      )}
      */
        className={cn("border-none", modalSizeVariants({ size, variant }), className)}
        overlayClassName={cn("bg-black/[45%]", overlayClassName)}
        currentMessageIndex={currentMessageIndex}
        numberOfMessages={numberOfMessages}
        onNavLeft={onNavLeft}
        onNavRight={onNavRight}
      >
        {/* TODO This method of overflow-scroll is not ideal, idea is to measure the computed style (height) of the dialog content,
         and the top of the children div, and set the max height to be what would fill that remainder */}
        {title || description ? (
          <DialogHeader className={cn("flex-col pb-2", headerClassName)}>
            <DialogTitle className={cn("text-darkBlue", {})}>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        ) : (
          <VisuallyHidden>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </VisuallyHidden>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
};

BaseModal.displayName = "BaseModal";

export { BaseModal };
