import { RefObject } from "react";

export const getEventsClosestToRefSide = (
  event: any,
  refs: RefObject<HTMLDivElement | null>[] | RefObject<HTMLDivElement | null>,
  idx: number = 0,
  preferXAxisMultiplier: number = 2
) => {
  let elemRef: HTMLDivElement | null;

  if (Array.isArray(refs)) {
    // When refs is an array, access the current property of the ref at idx
    elemRef = refs[idx].current;
  } else {
    // When refs is not an array, access the current property of refs
    elemRef = refs.current;
  }

  if (!elemRef) return "";

  const { left, top, right, bottom } = elemRef.getBoundingClientRect();

  const { clientX, clientY } = event;

  const fromLeft = Math.abs(clientX - left);
  const fromRight = Math.abs(clientX - right);
  const fromTop = Math.abs(clientY - top) * preferXAxisMultiplier;
  const fromBottom = Math.abs(clientY - bottom) * preferXAxisMultiplier;

  const minDistance = Math.min(fromLeft, fromRight, fromTop, fromBottom);

  switch (minDistance) {
    case fromLeft:
      return "left";
    case fromRight:
      return "right";
    case fromTop:
      return "top";
    case fromBottom:
      return "bottom";
    default:
      return "";
  }
};
