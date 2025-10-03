"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-day-picker/dist/style.css";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from '../../lib/utils';
import styles from "./calendar.module.css"; // Import the CSS module

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, captionLayout, showOutsideDays = true, defaultMonth, ...props }: CalendarProps) {
  const defaultClassNames = getDefaultClassNames();

  const extraClassNames = "";

  return (
    <DayPicker
      defaultMonth={defaultMonth}
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      //styles={styles}
      className={cn("rounded-lg")}
      classNames={{
        //Dropdowns
        dropdowns: cn(defaultClassNames.dropdowns, "", extraClassNames), //The dropdowns container
        dropdown_root: cn(defaultClassNames.dropdown_root, "rounded-lg hover:bg-faintPurple", extraClassNames), //Any dropdown root container

        dropdown: cn(defaultClassNames.dropdown, "outline outline-2 outline-purple rounded-lg", extraClassNames), // The underlying dropdown element, do not style
        months_dropdown: cn(defaultClassNames.months_dropdown, "rounded-md pl-1.5 hover:bg-faintBlue", extraClassNames),
        years_dropdown: cn(defaultClassNames.years_dropdown, "rounded-md p-1 hover:bg-faintBlue w-fit", extraClassNames),
        caption_label: cn(defaultClassNames.caption_label, "p-1 pl-2 rounded-lg", extraClassNames), // The dropdown labels
        focused: cn(defaultClassNames.focused, "rounded-lg", extraClassNames),

        month_caption: cn(defaultClassNames.month_caption, ""), //The entire feb month page banner
        month: cn(defaultClassNames.month, ""), //The whole month page

        months: cn(defaultClassNames.months, ""), //The month classic "calendar" view container
        //dropdown_month: `${defaultClassNames.months_dropdown} rounded-md p-1 hover:bg-faintBlue bg-blue-500`,
        month_grid: cn(defaultClassNames.month_grid, "", styles.table),

        weekdays: cn("h-fit font-normal text-sm rounded-lg pt-0 my-0 pb-1 border-b border-tertiary-dark border-spacing-y-[-12px] mb-0.5 ", styles.tr),
        weekday: cn("font-normal rounded-lg py-0 pb-1 my-0 h-fit mb-0.5"),

        weeks: cn("pt-1", styles.tbody),

        //Days
        today: cn(false && defaultClassNames.today, "font-bold rounded-md bg-background-faint text-primary-dark"), // Add a border to today's date
        selected: cn(
          false && defaultClassNames.selected,
          "transition-all duration-[105ms] bg-faintBlue rounded-lg text-lg outline outline-2 outline-purple text-primary-dark font-bold"
        ), // Highlight the selected day
        outside: cn(defaultClassNames.outside, "text-tertiary-dark"),
        day_button: cn("hover:bg-faintPurple rounded-lg w-full h-full"),

        //Page Navigation
        nav: cn(defaultClassNames.nav, "rounded-lg p-1 "),
        button_next: cn("rounded-lg p-2 hover:bg-faintPurple"),
        button_previous: cn("rounded-lg p-2 hover:bg-faintPurple"),

        root: cn(defaultClassNames.root, "", "max-h-[1000px] p-2 shadow-xl rounded-xl transition-all duration-300", className), // Add a shadow to the root element
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-6 w-6" />;
          }
          return <ChevronRight className="h-6 w-6" />;
        },
        //CaptionLabel: () => <></>, // This will render nothing for the caption label
        //HeadRow: () => <></>,
        //Caption: ({ ...props }) => { //console.log("CAL PROPS",props); return (<div></div>) },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
