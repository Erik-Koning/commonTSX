"use client";

import React, { useEffect, useRef, useState } from "react";

//Animated icon component with optional variable for setting animation
const CollapsibleMenuIcon = ({ animationState }: { animationState?: Number }) => {
  const arrowRef = useRef<SVGPathElement>(null);
  const [arrowCenter, setArrowCenter] = useState({ x: 0, y: 0 });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (arrowRef.current) {
      const { x, y, width, height } = arrowRef.current.getBBox();
      const center = { x: x + width / 2, y: y + height / 2 };
      setArrowCenter(center);
    }
  }, []);

  useEffect(() => {
    if (animationState !== undefined) {
      //console.log(animationState)
      setExpanded(!Boolean(animationState));
    }
  }, [animationState]);

  const toggleArrowAnimation = () => {
    if (animationState) return;
    setExpanded(!expanded);
    //console.log(expanded);
  };

  return (
    <div onClick={toggleArrowAnimation} className="">
      <style jsx>{`
        #Arrow {
          transition: all 500ms ease;
          transform-origin: ${arrowCenter.x}px ${arrowCenter.y}px;
          animation: ${expanded ? "SlideLeft 500ms ease" : "SlideRight 500ms ease"};
          transform: ${expanded ? "translateX(-72%) rotate(180deg)" : "translateX(0%) rotate(0deg)"};
        }

        @keyframes SlideLeft {
          0% {
            transform: rotate(0deg);
          }
          30% {
            transform: rotate(60deg);
          }
          0%,
          30% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-72%) rotate(180deg);
          }
        }

        #midBar {
          //transition: all 220ms ease;
          animation: ${expanded ? "FadeRight 700ms ease" : "FadeLeft 500ms ease"};
          transform: ${expanded ? "translateX(40%)" : "translateX(0%) rotate(0deg)"};
        }

        #lowBar,
        #highBar {
          animation: ${expanded ? "FadeIn 500ms ease" : "FadeOut 500ms ease"};
          transform-origin: center center; /* Set the center of the path as the transform origin */
        }

        @keyframes FadeIn {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          40%,
          60% {
            opacity: 0.6;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes FadeOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          40%,
          60% {
            opacity: 0.6;
            transform: scale(1.15);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes FadeRight {
          0% {
            opacity: 1;
            transform: translateX(0%) rotate(0deg);
          }
          30% {
            transform: translateX(0%) rotate(0deg);
            opacity: 0;
          }
          70% {
            transform: translateX(40%) rotate(0deg);
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes FadeLeft {
          0% {
            opacity: 1;
            transform: translateX(40%) rotate(0deg);
          }
          30% {
            transform: translateX(40%) rotate(0deg);
            opacity: 0;
          }
          70% {
            transform: translateX(0%) rotate(0deg);
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>

      <svg viewBox="0 0 294 219" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Collapse Menu 1">
          <g id="CollapseMenuBars">
            <path
              id="lowBar"
              d="M146.682 24.1003C101.325 24.1003 55.9682 24.1003 10.6114 24.1003C4.59503 24.1003 0.0632479 19.0163 0.0241808 12.2222C-0.0148863 5.28946 4.43874 0.0205415 10.5332 0.0205415C30.9653 -0.0256769 51.4365 0.0205415 71.8685 0.0205415C142.033 0.0205415 212.198 0.0205415 282.362 0.0205415C287.87 0.0205415 291.816 3.20962 293.144 8.66338C295.059 16.5667 290.175 24.1003 283.104 24.1003C252.905 24.1003 222.746 24.1003 192.547 24.1003C177.232 24.1003 161.957 24.1003 146.682 24.1003Z"
              fill="currentColor"
            />
            <path
              id="midBar"
              d="M146.679 121.39C101.204 121.39 55.7304 121.39 10.2563 121.39C7.09184 121.39 4.51342 120.095 2.6382 117.507C-0.604365 113.07 -0.721578 106.091 2.44286 101.562C4.43528 98.6964 7.16997 97.3561 10.5297 97.4023C54.5974 97.4485 98.626 97.4023 142.694 97.4023C189.535 97.4023 119.175 97.4023 165.978 97.4023C169.806 97.4023 172.775 99.251 174.729 102.995C176.721 106.785 176.799 111.822 174.846 115.659C172.814 119.633 169.689 121.436 165.704 121.436C120.308 121.343 192.074 121.39 146.679 121.39Z"
              fill="currentColor"
            />
            <path
              id="highBar"
              d="M146.874 194.646C192.231 194.646 237.588 194.646 282.945 194.646C288.961 194.646 293.493 199.73 293.532 206.524C293.571 213.364 289.156 218.587 283.179 218.726C282.202 218.772 281.265 218.726 280.288 218.726C190.629 218.726 101.009 218.726 11.3503 218.726C5.49023 218.726 1.46635 215.352 0.294334 209.482C-1.26835 201.764 3.57596 194.646 10.4518 194.646C48.7375 194.646 87.0233 194.646 125.309 194.646C132.458 194.646 139.686 194.646 146.874 194.646Z"
              fill="currentColor"
            />
          </g>
          <g id="Arrow">
            <path
              id="arrow"
              d="M222.187 98.7872C222.187 98.7872 199.684 108.17 222.187 120.094C283.171 152.493 283.171 152.493 283.171 152.493C283.171 152.493 293.563 156.606 293.563 144.312C293.563 132.018 293.563 74.615 293.563 74.615C293.563 74.615 293.562 62.3209 283.171 66.4343"
              fill="currentColor"
              ref={arrowRef}
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default CollapsibleMenuIcon;
