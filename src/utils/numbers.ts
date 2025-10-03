export const randomNumber = (): number => {
  return Math.floor(Math.random() * 100);
};

export interface IndexRange {
  start: number;
  end: number;
}

export const isContainedWithinRange = (range1: IndexRange, range2: IndexRange): boolean => {
  return range1.start >= range2.start && range1.end <= range2.end;
};

//returns true if range1 is found to be contained within range2,
/**
 * @param arr1 array of IndexRange objects, the ones to check if they are contained within arr2
 * @param arr2 array of IndexRange objects, the ones to check if they contain arr1
 * @param requireAllContained, if true, all ranges in arr1 must be contained within at least one range in arr2
 * @returns
 */
export const rangesContained = (arr1: IndexRange[] | IndexRange | null, arr2: IndexRange[] | null, requireAllContained: boolean = false): boolean => {
  if (!arr1 || !arr2) return false;

  if (!Array.isArray(arr1)) {
    arr1 = [arr1];
  }
  let allContained = true;

  for (let i = 0; i < arr1.length; i++) {
    const range1 = arr1[i];
    if (range1 === null) continue;

    let contained = false;
    for (let j = 0; j < arr2.length; j++) {
      const range2 = arr2[j];
      if (range2 === null) continue;

      if (isContainedWithinRange(range1, range2)) {
        contained = true;
        break;
      }
    }

    if (requireAllContained && !contained) {
      return false;
    }

    if (!requireAllContained && contained) {
      return true;
    }

    allContained = allContained && contained;
  }

  return requireAllContained ? allContained : false;
};

//returns a new array with ranges from arr1 that are not contained within any range in arr2
/**
 * @param arr1 array of IndexRange objects, the ones to check if they are contained within arr2
 * @param arr2 array of IndexRange objects, the ones to check if they contain arr1
 * @returns
 */
export const removeRangesContained = (arr1: IndexRange[] | null, arr2: IndexRange[] | null): IndexRange[] | null => {
  if (!arr1) return null;
  if (!arr2) return arr1;
  return arr1.filter((range1) => {
    //if range1 is null, it can't be contained within any range
    if (range1 === null) return true;

    //if range1 is contained within any range in arr2, remove it
    for (let j = 0; j < arr2.length; j++) {
      //look at all ranges in arr2
      const range2 = arr2[j];
      if (range2 === null) continue;
      if (isContainedWithinRange(range1, range2)) {
        return false;
      }
    }

    return true;
  });
};

export const reorderIndicesDescending = (indicesArray: IndexRange[]): IndexRange[] => {
  if (!indicesArray) {
    return [];
  }
  return indicesArray.sort((a, b) => b.start - a.start);
};

export const removeIndiciesFromText = (text: string, indices: IndexRange[]): string => {
  if (!indices || indices.length === 0) return text;
  let newText = text;

  for (let i = indices.length - 1; i >= 0; i--) {
    const { start, end } = indices[i];
    newText = newText.slice(0, start) + newText.slice(end);
  }
  return newText;
};
