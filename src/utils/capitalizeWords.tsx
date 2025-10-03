export default function capitalizeWords(str: string) {
  // Split the string into an array of words
  const words = str.split(" ");

  // Capitalize the first character of each word
  const capitalizedWords = words.map((word) => {
    const firstChar = word.charAt(0).toUpperCase();
    const restOfString = word.slice(1);
    return firstChar + restOfString;
  });

  // Join the capitalized words back into a single string
  const capitalizedStr = capitalizedWords.join(" ");

  return capitalizedStr;
}
