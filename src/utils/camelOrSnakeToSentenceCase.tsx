export default function camelOrSnakeToSentenceCase(str: string) {
  if (!str) return str;

  // Replace underscores and hyphens with spaces
  str = str.replace(/[_-]/g, " ");

  //addSpaceBeforeCapitalLetters and open brackets, unless first letter or preceded by an open bracket
  str = str.replace(/(?<![ ])(?<!^)(?<![(])(?=[A-Z({\[])/g, " ");

  // Capitalize the first letter of first word
  str.charAt(0).toUpperCase() + str.slice(1);

  return str;
}
