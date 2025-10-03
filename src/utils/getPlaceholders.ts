export function getPlaceholders(template: string, regex: RegExp = /{([^{}]+)}/g) {
  // Use the match method with the regex to extract strings inside {}
  const matches = template.match(regex);

  // If matches are found, extract the content inside curly braces
  const extractedStrings = matches ? matches.map((match) => match.slice(1, -1)) : [];

  return extractedStrings;
}
