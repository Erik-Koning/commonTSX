import * as React from "react";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from '../../components/ui/Button';

type ExpandButtonProps = {
  onClick?: () => void;
};

export function ExpandButton({ onClick }: ExpandButtonProps) {
  return (
    <Button variant="ghost" size="sm" className="expand-button m-0.5 mr-1 flex h-auto w-auto justify-center" onClick={onClick}>
      <ChevronRightIcon />
    </Button>
  );
}
