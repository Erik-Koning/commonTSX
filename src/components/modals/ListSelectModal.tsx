import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Button } from "../ui/Button";
import { Loader2 } from "lucide-react";
import { ListOfButtons } from "../ui/listOfButtons";

export interface dialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  options: string[];
  onSelect: (choice: number | null) => void;
  abortButtonText: string;
  onCancelCallback?: () => void;
  allowCloseButton?: boolean;
}

const ListSelectModal: React.FC<dialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  options,
  onSelect,
  abortButtonText,
  onCancelCallback,
  allowCloseButton = false,
}) => {
  const [actionLoading, setActionLoading] = useState(false);

  const allowPointerDownOutside = () => {
    if (allowCloseButton) {
      onClose();
    } else {
      isOpen = true;
    }
  };

  //find duplicates in selections and append a number to the end of the duplicate
  const stringCounts: { [key: string]: number } = {};
  options = options.map((string) => {
    if (stringCounts[string] === undefined) {
      stringCounts[string] = 0; // Initialize count
    }

    const count = stringCounts[string]++; // Increment count

    if (count === 0) {
      return `${string}`;
    } else {
      return `${string} (${count})`;
    }
  });
  // loop over again and add (0) for those that have at least one duplicate
  Object.entries(stringCounts).forEach(([key, value]) => {
    if (value >= 2) {
      // find first instance of the key in selections array
      const firstIndex = options.findIndex((string) => string === key);
      if (firstIndex !== -1) {
        // append a (0) to the first instance
        options[firstIndex] = `${key} (0)`;
      }
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent allowCloseButton={allowCloseButton} onPointerDownOutside={allowPointerDownOutside} className="">
        <DialogHeader>
          <DialogTitle className="text-darkBlue">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ListOfButtons options={options} onSelect={onSelect} id="ListSelectModal" />
        <Button
          key={"AbortButton"}
          onClick={() => {
            setActionLoading(true);
            onCancelCallback && onCancelCallback();
          }}
          variant="ghost"
          size="fullLine"
          className="items-center justify-center border-none outline-none ring-transparent"
        >
          {actionLoading ? <Loader2 className="animate-spin" size={24} /> : <div>{abortButtonText}</div>}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export { ListSelectModal };
