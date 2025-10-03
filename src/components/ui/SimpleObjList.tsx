import { FC } from "react";

interface SimpleObjListProps {
  obj: Record<string, any>;
  className?: string;
  keyClassName?: string;
  valueClassName?: string;
}

const SimpleObjList: FC<SimpleObjListProps> = ({ obj, className, keyClassName, valueClassName }) => {
  return (
    <ul hidden={Object.entries(obj).length === 0}>
      {Object.entries(obj).map(([key, value]) => (
        <li key={key} className={className}>
          <b className={keyClassName}>{key}:</b> <span className={valueClassName}>{value}</span>
        </li>
      ))}
    </ul>
  );
};

export default SimpleObjList;
