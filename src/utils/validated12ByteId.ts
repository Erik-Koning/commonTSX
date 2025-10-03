//mongodb requires a 12 byte id for each document using the @db.ObjectId type

//pass string and return 12 byte id string
export function validated12ByteId(str: string | number) {
  if (typeof str === "number") {
    str = str.toString();
  }
  str = str.toLowerCase().replace(/[^a-z0-9]/g, "0"); // Replace non-alphanumeric characters with zeros
  if (str.length >= 24) {
    return str.substring(0, 24);
  }
  return str.padStart(24, "0");
}
