"use client";

interface MenuItemProps {
  onClick: () => void;
  label: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ onClick, label }) => {
  return (
    <div
      onClick={onClick}
      className="
        bg-white
        px-4 
        py-3 
        font-semibold
        transition
        hover:bg-secondary-light
        dark:hover:bg-background-dark
      "
    >
      {label}
    </div>
  );
};

export default MenuItem;
