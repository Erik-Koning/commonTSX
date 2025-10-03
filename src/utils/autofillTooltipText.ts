import camelOrSnakeToTitleCase from "./camelOrSnakeToTitleCase";

export default function autofillTooltipText(parents: string[] = [], dependents: string[] = []) {
  let parentText = "";
  if (parents.length > 0) {
    parentText += "This field is auto-filled by:";
    for (let i = 0; i < parents.length; i++) {
      const parent = parents[i];
      const [accordion, field] = parent.split("_");
      parentText += "\n" + camelOrSnakeToTitleCase(accordion) + " > " + camelOrSnakeToTitleCase(field);
    }
  }

  let dependentText = "";
  if (dependents.length > 0) {
    if (parentText.length > 0) dependentText += "\n\n";
    dependentText += "This field will auto-fill:";
    for (let i = 0; i < dependents.length; i++) {
      const dependent = dependents[i];
      const [accordion, field] = dependent.split("_");
      dependentText += "\n" + camelOrSnakeToTitleCase(accordion) + " > " + camelOrSnakeToTitleCase(field);
    }
  }

  return `${parentText} ${dependentText}`;
}
