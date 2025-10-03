import { securityControls, soc2Categories, standards } from "@common/workers/securityControls";
import camelOrSnakeToTitleCase from "./camelOrSnakeToTitleCase";

// Define the flattened control type with multiple standards
export type FlattenedControl = {
  id: string;
  title: string;
  category: securityControls["controls"][number]["category"];
  standards: {
    [key: string]: {
      description: string;
      category: string;
    };
  };
};

export const flattenSecurityControls = (): FlattenedControl[] => {
  const flattenedControls: FlattenedControl[] = [];
  const controlMap: { [key: string]: FlattenedControl } = {};

  securityControls.controls.forEach((control) => {
    // Filter based on test/satisfied condition
    if (control.tests || (control.tests === false && control.satisfied === true)) {
      const controlId = Array.isArray(control.code) ? control.code.join("-") : control.code;

      // Create or retrieve the flattened control
      if (!controlMap[controlId]) {
        controlMap[controlId] = {
          id: controlId,
          title: control.name,
          category: control.category,
          standards: {},
        };
      }

      // Process each standard in the control
      Object.entries(control.standards).forEach(([standardKey, standardValue]) => {
        const standard = standardKey as standards;

        if (typeof standardValue === "object" || typeof standardValue === "string") {
          // Extract the category ID if available for SOC 2
          let category = "";

          if (standard === "SOC_2" && typeof standardValue === "object" && standardValue.categoryId) {
            // Find the corresponding category name
            const categoryCode = standardValue.categoryId;
            const categoryObj = soc2Categories.find((cat: any) => cat.code.includes(categoryCode) || categoryCode.includes(cat.code));
            category = categoryObj ? categoryObj.name : standardKey;
          } else {
            category = camelOrSnakeToTitleCase(standard);
          }

          // Add the standard to the control
          controlMap[controlId].standards[standardKey] = {
            description: typeof standardValue === "string" ? standardValue : standardValue?.description,
            category: category,
          };
        }
      });
    }
  });

  // Convert the map to an array
  return Object.values(controlMap);
};
