import React from "react";
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from "./Button";

interface arrayOfCheckBoxProps {
  titles: string[];
  allowCreate?: boolean;
  selectedItems: string[];
  onChange: (selectedItems: string[]) => void;
}

const ArrayOfCheckBox: React.FC<arrayOfCheckBoxProps> = ({ titles, allowCreate, selectedItems, onChange }) => {
  const handleCheckboxChange = (index: number) => {
    const title = titles[index];
    const updatedSelection = selectedItems.includes(title) ? selectedItems.filter((item) => item !== title) : [...selectedItems, title];

    onChange(updatedSelection);
  };

  const handleSelectAll = () => {
    if (selectedItems.length === titles.length) {
      onChange([]); // De-select all
    } else {
      onChange(titles); // Select all
    }
  };

  return (
    <div className="w-fit justify-center">
      <Button
        variant="ghost"
        size="fit"
        //size="tight"
        className="-ml-2 mb-1 items-center justify-center text-purple hover:text-darkPurple"
        onClick={handleSelectAll}
      >
        Select all
      </Button>

      {titles.map((title, index) => (
        <div key={title} className="flex items-center" onClick={() => handleCheckboxChange(index)}>
          <Checkbox checked={selectedItems.includes(title)} onChange={() => handleCheckboxChange(index)} />
          <label className="ml-2">{title}</label>
        </div>
      ))}
    </div>
  );
};

export default ArrayOfCheckBox;
