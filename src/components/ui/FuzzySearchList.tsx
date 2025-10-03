import { forwardRef, useEffect, useState } from "react";
import Fuse from "fuse.js";
import { Input } from "../inputs/Input";
import { CuteWordOrb } from "./CuteWordOrb";
import { getWordStartingWith, removeRegexFromString } from '../../utils/stringManipulation';
import camelOrSnakeToTitleCase from '../../utils/camelOrSnakeToTitleCase';
import { cn } from '../../lib/utils';

interface FuzzySearchListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: Record<string, any> | string[];
  query?: string;
  hideEmptyValues?: boolean;
  hideValueRegexs?: RegExp[];
  hideKeysRegexs?: RegExp[];
  searchKeys?: boolean; // else search values
  returnKeys?: boolean; // else return values
  iconsMap?: Record<string, any>;
  onSelectCallback?: (value: string) => void;
  className?: string;
  maxWidthPX?: number;
  onHoverFeatures?: boolean;
}

// FuzzySearchList is a component that allows you to search through a list of items and select one
export const FuzzySearchList = forwardRef<HTMLDivElement, FuzzySearchListProps>(
  (
    {
      items,
      query,
      hideEmptyValues = true,
      hideValueRegexs,
      hideKeysRegexs,
      searchKeys = true,
      returnKeys = false,
      iconsMap,
      onSelectCallback,
      className,
      maxWidthPX = 200,
      onHoverFeatures = true,
    },
    ref
  ) => {
    const [queryState, setQueryState] = useState(query);
    const [results, setResults] = useState<string[]>([]);

    const controlledQuery = query !== undefined && query !== null;

    useEffect(() => {
      if (controlledQuery) {
        setQueryState(query);
      }
    }, [query]);

    useEffect(() => {
      if (Array.isArray(items)) {
        items = Object.fromEntries(items.map((item) => [item, item]));
      }

      if (hideEmptyValues) {
        items = Object.fromEntries(
          Object.entries(items).filter(([key, value]) => {
            return value !== null && value !== undefined && value !== "";
          })
        );
      }
      if (hideValueRegexs) {
        items = Object.fromEntries(
          Object.entries(items).filter(([key, value]) => {
            return !hideValueRegexs.some((regex) => regex.test(value));
          })
        );
      }
      if (hideKeysRegexs) {
        items = Object.fromEntries(
          Object.entries(items).filter(([key, value]) => {
            return !hideKeysRegexs.some((regex) => regex.test(key));
          })
        );
      }

      // Determine what to search (keys or values)
      const searchItems: string[] = Array.isArray(items) ? (items as string[]) : searchKeys ? Object.keys(items) : Object.values(items).map(String);

      // Initialize Fuse
      const fuse = new Fuse(searchItems, {
        includeScore: true,
        keys: ["self"], // Since we're searching in an array of strings, we'll use 'self' as key
      });

      if (queryState) {
        const fuseResults = fuse.search(queryState).map(({ item }) => item);
        setResults(fuseResults);
      } else {
        setResults(searchItems);
      }
    }, [queryState, items, searchKeys]);

    const handleClick = (e: any, item?: string) => {
      //const elemId = e.target.parentNode.offsetParent.id as string;
      onSelectCallback && onSelectCallback(!Array.isArray(items) && typeof items === "object" ? items[item ?? ""] : item ?? "");
    };

    const parentBgClassName = getWordStartingWith(className, "bg-");

    return (
      <div ref={ref} className={cn("flex flex-col py-1", className)}>
        {!controlledQuery && (
          <Input
            className="w-full pb-1"
            id="FuzzySearchInput"
            size="md"
            placeholder="Search..."
            value={queryState}
            onChange={(e) => setQueryState(e.target.value)}
          />
        )}
        <div className="flex w-full flex-col justify-start gap-y-1">
          {results.map((item, index) => (
            <CuteWordOrb
              id={`${item}-quick-insert`}
              key={index}
              text={item}
              className={cn("w-full justify-start text-start", parentBgClassName)}
              iconClassName={parentBgClassName}
              iconContainerClassName={parentBgClassName}
              buttonVariant="blank"
              buttonSize="full"
              maxWidthPX={maxWidthPX}
              iconsMap={iconsMap}
              allowWrap={false}
              showFull={false}
              allowBannerScroll={true}
              bannerScrollDurationPerWord={3}
              parseText={(text: string) => {
                return camelOrSnakeToTitleCase(removeRegexFromString(text, /^rel/), " -> ");
              }}
              onClick={handleClick}
              onHoverFeatures={onHoverFeatures}
              innerClassName="justify-start -ml-[12px]"
            />
            //<li key={index}>{item}</li> // Adjust based on your item structure
          ))}
        </div>
      </div>
    );
  }
);

FuzzySearchList.displayName = "FuzzySearchList";
