import { FC } from "react";
import { number } from "zod";

interface NotificationDotProps {
  numberOfNotifications: number;
  hideDotIfZero?: boolean;
}

const NotificationDot: FC<NotificationDotProps> = ({ numberOfNotifications, hideDotIfZero = false }) => {
  return (
    <>
      {(!hideDotIfZero || numberOfNotifications > 0) && (
        <div className="absolute -right-1 top-0 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-red-600 outline outline-[1.5px] outline-background-light">
          <span className="text-xs font-bold text-white">{numberOfNotifications}</span>
        </div>
      )}
    </>
  );
};

export default NotificationDot;
