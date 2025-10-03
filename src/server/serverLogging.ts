import fs from "fs";

export const logDirectoryContents = (dir: string) => {
  try {
    const files = fs.readdirSync(dir);
    console.log(`Contents of ${dir}:`, files);
  } catch (err) {
    console.error(`Could not read ${dir}:`, err);
  }
};
