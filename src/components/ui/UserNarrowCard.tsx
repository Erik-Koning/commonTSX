import React, { forwardRef } from "react";
import { Button } from "./Button";
import { Avatar, AvatarFallback, AvatarImage } from "@common/components/ui/avatar";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@common/lib/utils';

const userNarrowCardVariants = cva("flex w-fit items-center gap-x-2 rounded-full border border-border p-0.5", {
  variants: {
    variant: {
      pill: "rounded-full",
      square: "rounded-md",
    },
  },
});

const avatarFallbackVariants = cva("text-xs text-primary-light dark:bg-primary-dark", {
  variants: {
    avatarFallbackVariant: {
      default: "bg-faintPurple text-secondary-dark",
      purple: "bg-faintPurple text-secondary-dark",
    },
  },
});

export interface UserNarrowCardProps extends VariantProps<typeof userNarrowCardVariants>, VariantProps<typeof avatarFallbackVariants> {
  user: Record<string, any>;
  className?: string;
  isRemovable?: boolean;
  onRemove?: () => void;
  avatarFallbackClassName?: string;
  allowClose?: boolean;
}

export const UserNarrowCard = forwardRef<HTMLDivElement, UserNarrowCardProps>(
  (
    {
      user,
      className,
      allowClose = true,
      isRemovable = allowClose,
      onRemove,
      avatarFallbackClassName,
      variant = "pill",
      avatarFallbackVariant = "default",
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn(userNarrowCardVariants({ variant }), className)}>
        <Avatar className="flex h-[26px] w-[26px]">
          <AvatarImage src={user.image} />
          <AvatarFallback className={cn(avatarFallbackVariants({ avatarFallbackVariant }), avatarFallbackClassName)}>
            {(user?.firstName && user?.firstName?.charAt(0)) ?? (user?.lastName && user?.lastName?.charAt(0)) ?? ""}
          </AvatarFallback>
        </Avatar>
        <h2>{user.email}</h2>
        {allowClose && (
          <div className="flex items-center justify-center">
            <Button variant="blank" size="blank" disabled={!isRemovable} onClick={onRemove}>
              <CloseOutlinedIcon className="rounded-full p-0.5 hover:bg-border" sx={{ fontSize: 26 }} />
            </Button>
          </div>
        )}
      </div>
    );
  }
);
UserNarrowCard.displayName = "UserNarrowCard";
