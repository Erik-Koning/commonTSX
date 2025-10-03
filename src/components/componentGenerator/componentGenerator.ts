import React from "react";
import { Input, InputProps } from "../inputs/Input";
import CountrySelect, { CountrySelectProps } from "../inputs/CountrySelect";
import { SelectBox, SelectBoxProps } from "../inputs/SelectBox";

const componentMap: { [key: string]: React.ElementType } = {
  Input: Input,
  CountrySelect: CountrySelect,
  SelectBox: SelectBox,
};

// 1. A base map of component names to their respective props.
// To add a new component, you only need to add it here and to componentMap.
interface ComponentPropsMap {
  Input: InputProps;
  CountrySelect: CountrySelectProps;
  SelectBox: SelectBoxProps;
}

// 2. A generic utility type that creates an exclusive union.
// This creates a union of objects, where each object has exactly one key from the map.
// e.g. { Input: InputProps } | { CountrySelect: CountrySelectProps } | ...
type OneOf<T> = { [K in keyof T]: { [P in K]: T[P] } & { [P in Exclude<keyof T, K>]?: never } }[keyof T];

// 3. The final config type, automatically generated from the ComponentPropsMap.
export type ComponentConfig = OneOf<ComponentPropsMap>;

export type ComponentConfigPage = ComponentConfig[];
export type ComponentConfigArray = ComponentConfigPage[];

export const componentGenerator = (pageConfig: ComponentConfigPage): (React.ReactElement | null)[] => {
  return pageConfig.map((componentConfig, index) => {
    // Find the single defined property in the component config object.
    const entry = Object.entries(componentConfig).find(([, value]) => value !== undefined);

    if (!entry) {
      console.warn(`ComponentGenerator: Empty component configuration object at index ${index}.`);
      return null;
    }

    const [key, props] = entry;
    const Component = componentMap[key];

    if (Component) {
      return React.createElement(Component, {
        ...(props as any),
        key: props.id, // 'id' is required on all our props interfaces
      });
    }

    console.warn(`ComponentGenerator: Component type "${key}" not found in componentMap.`);
    return null;
  });
};

export const wrapInDiv = (jsx: React.ReactNode, props: React.ComponentProps<"div"> = {}) => {
  return React.createElement("div", props, jsx);
};
