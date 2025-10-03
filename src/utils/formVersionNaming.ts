export const getVersionSuffixHumanReadable = (versionSuffixs: string[]): string => {
  //given an array of versionSuffixs, what is the name of the most recent one?
  let versionSuffixsHumanReadable = "";
  console.log("versionSuffixs110", versionSuffixs);
  if (!versionSuffixs || versionSuffixs.length === 0) {
    return versionSuffixsHumanReadable;
  }
  //TODO if the versionSuffixs is only "_" then return V{count}

  let baseSuffix = versionSuffixs[versionSuffixs.length - 1];
  let countBase = 1;
  for (let i = versionSuffixs.length - 1; i >= 0; i--) {
    // what is the first string that is not a "V" or a "_"
    if (baseSuffix === "_" && versionSuffixs[i] !== "_") {
      baseSuffix = versionSuffixs[i];
      countBase++;
    } else if (versionSuffixs[i] === baseSuffix) {
      countBase++;
    } else {
      break;
    }
  }

  return baseSuffix + String(countBase);
};
