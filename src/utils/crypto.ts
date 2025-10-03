import CryptoJS from "crypto-js";

// encrypts an obj or string using our secret key and a unique IV (should be unique for each encryption and 16 bytes long)
export const encryptData = (data: string | Record<string, any>, secretKey: string, uniqueIv: string): string => {
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.enc.Hex.parse(uniqueIv);

  let dataToEncrypt = typeof data === "object" ? JSON.stringify(data) : data;

  const encrypted = CryptoJS.AES.encrypt(dataToEncrypt, key, { iv: iv, format: CryptoJS.format.Hex });
  return encrypted.toString();
};

// decrypts an obj or string using our secret key and a unique IV (should be unique for each encryption and 16 bytes long)
export const decryptData = (cipherText: string, secretKey: string, uniqueIv: string): string | Record<string, any> => {
  const key = CryptoJS.enc.Utf8.parse(secretKey);
  const iv = CryptoJS.enc.Hex.parse(uniqueIv);

  const bytes = CryptoJS.AES.decrypt(cipherText, key, { iv: iv, format: CryptoJS.format.Hex });
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  console.log("before parse4", decryptedString);
  try {
    let result = JSON.parse(decryptedString); // Try to parse as JSON (for objects)
    if (!result || typeof result !== "object") throw new Error("Invalid JSON");
    return result;
  } catch (e) {
    return decryptedString; // Return as string if JSON parsing fails
  }
};
