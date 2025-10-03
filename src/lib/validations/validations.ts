//Matches any characters that are not a digit unless its a "+" at the beginning of the string
export const preSavePhoneRegex = /(?!^\+)\D/g;

export async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    const contentType = response.headers.get("content-type");
    return contentType ? contentType.startsWith("image") : false;
  } catch (error) {
    return false;
  }
}
