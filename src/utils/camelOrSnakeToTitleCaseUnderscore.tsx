export default function camelOrSnakeToTitleCaseUnderscore(str: string) {
  if (!str) return str;

  // Replace underscores and hyphens with spaces
  str = str.replace(/[_-]/g, " ");

  //addSpaceBeforeCapitalLetters and open brackets, unless first letter or preceded by an open bracket
  str = str.replace(/(?<![ ])(?<!^)(?<![(])(?=[A-Z({\[])/g, " ");

  // Capitalize the first letter of each word
  str = str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const stringWithUnderscores = str.replace(/ /g, "_");

  return stringWithUnderscores;
}
