"use client";

import React, { useState, useEffect, ReactElement } from "react";
//import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import { Button } from "../ui/Button";
import { cn } from '../../lib/utils';
import { BaseModal, BaseModalProps } from "./BaseModal";
import { Dispatch } from "redux";

export interface ModalMessage {
  title: string;
  desc?: string;
  jsx?: ReactElement | string;
  confirmText?: string;
  dismissText?: string;
  onConfirm?: string;
  onClose?: () => void;
  onCancel?: () => void;
  modalProps?: BaseModalProps;
  className?: string;
  showDismissButton?: boolean;
  onCloseOnDismiss?: boolean;
  dismissRetainsModal?: boolean;
  openOnAdd?: boolean;
}

export interface ReduxPopupModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
  onConfirm?: (onConfirm?: string) => void;
  isLoading?: boolean;
  allowCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  buttonClassName?: string;
  modal?: boolean;
  modalOpen: boolean;
  modalMessages: ModalMessage[];
  dispatch: Dispatch<any>;
  setModalOpen: (modalOpen: boolean) => void;
  setModalMessages: (modalMessages: ModalMessage[]) => void;
  jsxMapping?: Record<string, ReactElement>;
}

const ReduxPopupModal: React.FC<ReduxPopupModalProps> = ({
  forceOpen,
  onClose,
  onConfirm,
  isLoading,
  allowCloseButton = true,
  className = "",
  overlayClassName = "",
  buttonClassName = "",
  modal = true,
  modalOpen, // Use props instead of useSelector
  modalMessages, // Use props instead of useSelector
  dispatch, // Use props instead of useDispatch
  setModalOpen, // Use props instead of useDispatch
  setModalMessages, // Use props instead of useDispatch
  jsxMapping,
}) => {
  const [modalTitle, setModalTitle] = useState<string | undefined>("");
  const [modalDescription, setModalDescription] = useState<string | undefined>(undefined);
  const [modalObj, setModalObj] = useState<ModalMessage | undefined>(undefined);
  const [currentModalIndex, setCurrentModalIndex] = useState<number | undefined>(undefined);
  const [enableNavLeft, setEnableNavLeft] = useState<boolean>(false);
  const [enableNavRight, setEnableNavRight] = useState<boolean>(false);

  useEffect(() => {
    if (!modalOpen || !modalMessages) return;
    console.log("modalMessages", modalMessages);
    if (modalMessages.length === 0) {
      //no messages to show
      dispatch(setModalOpen(false));
      return;
    }
    //show the length -1 modal message
    const currentModalIdx = modalMessages.length - 1;
    setCurrentModalIndex(currentModalIdx);
  }, [modalOpen]);

  useEffect(() => {
    if (currentModalIndex === undefined) return;
    if (modalMessages.length === 0) {
      handleOnClose();
      return;
    }
    if (currentModalIndex > modalMessages.length - 1) {
      //show the most recent modal message
      setCurrentModalIndex(modalMessages.length - 1);
      return;
    }
    if (currentModalIndex < 0) {
      setCurrentModalIndex(0);
      return;
    }
    //is there a left modal message to show (older)
    if (currentModalIndex > 0) {
      setEnableNavLeft(true);
    } else {
      setEnableNavLeft(false);
    }
    //is there a right modal message to show (newer)
    if (modalMessages.length - 1 > currentModalIndex) {
      setEnableNavRight(true);
    } else {
      setEnableNavRight(false);
    }
    console.log("currentModalIndex just set", currentModalIndex);
    const currentModal = modalMessages[currentModalIndex];
    setModalTitle(currentModal?.title ?? "");
    setModalDescription(currentModal.desc ?? undefined);
    setModalObj(currentModal);
  }, [currentModalIndex, modalMessages]);

  //when not interacting with a button and clicking background
  const handleOnClose = () => {
    console.log("handleOnClose");
    modalObj?.onClose && modalObj.onClose();
    onClose && onClose();
    if (modalObj?.onCloseOnDismiss) {
      // to remove the modal from saved list when closed
      handleOnDismiss();
    } else {
      dispatch(setModalOpen(false));
    }
  };

  //on confirm button
  const handleOnConfirm = () => {
    onConfirm && onConfirm(modalObj?.onConfirm);
    setTimeout(() => {
      handleOnDismiss();
    }, 5);
  };

  //on dismiss button
  const handleOnDismiss = () => {
    if (currentModalIndex === undefined) return;
    const currentModalIdx = currentModalIndex;
    if (modalObj?.dismissRetainsModal) {
      dispatch(setModalOpen(false));
    } else {
      if (modalMessages.length === 0) dispatch(setModalOpen(false));
      else dispatch(setModalMessages(modalMessages.filter((_, idx) => idx !== currentModalIdx)));
    }
  };

  const handleNavLeft = () => {
    if (currentModalIndex === undefined) return;
    if (currentModalIndex === 0) return;
    setCurrentModalIndex(currentModalIndex - 1);
  };
  const handleNavRight = () => {
    if (currentModalIndex === undefined) return;
    if (currentModalIndex === modalMessages.length - 1) return;
    setCurrentModalIndex(currentModalIndex + 1);
  };

  return (
    <BaseModal
      {...modalObj?.modalProps}
      isOpen={forceOpen ?? modalOpen}
      title={modalTitle}
      description={modalDescription}
      onClose={handleOnClose}
      allowCloseButton={false}
      onNavLeft={enableNavLeft ? handleNavLeft : undefined}
      onNavRight={enableNavRight ? handleNavRight : undefined}
      currentMessageIndex={currentModalIndex}
      numberOfMessages={modalMessages.length}
      overlayClassName={cn(overlayClassName, modalObj?.modalProps?.overlayClassName)}
      className={cn("", className, modalObj?.modalProps?.className)}
      modal={modal}
    >
      <div className={cn("relative w-full items-end justify-between gap-x-4 p-0.5", modalObj?.className)}>
        {/*<SimpleObjList obj={modalObj} className="text-red-500" keyClassName="text-red-600" />*/}
        {modalObj && modalObj.jsx && typeof modalObj.jsx === "string" && jsxMapping?.[modalObj.jsx] ? (
          <div>{jsxMapping[modalObj.jsx]}</div>
        ) : (
          <div className="flex justify-between gap-x-2">
            <Button onClick={handleOnDismiss} className={cn("", buttonClassName)} variant="outline" size="md">
              {modalObj?.dismissText || "Dismiss"}
            </Button>
            <Button onClick={handleOnConfirm} className={cn("", buttonClassName)} variant="purple" size="md">
              {modalObj?.confirmText || "Confirm"}
            </Button>
          </div>
        )}
        {modalObj?.showDismissButton && (
          <div className="absolute bottom-1 right-0 flex w-full items-end justify-end">
            <Button onClick={handleOnDismiss} className={cn("", buttonClassName)} variant="destructive" size="md">
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export { ReduxPopupModal };
