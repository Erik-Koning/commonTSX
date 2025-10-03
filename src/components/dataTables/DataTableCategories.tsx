"use client";

// backend functionality to define out table and interact with the data
import {
  Cell,
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  FilterFn,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingFn,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from "@tanstack/react-table";

import { RankingInfo, rankItem, compareItems } from "@tanstack/match-sorter-utils";
// @ts-ignore
import entriesWaitingRoomImg from "@/root/public/imgs/entriesWaitingRoom.png";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/Button";
import { ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from "@radix-ui/react-icons";
import { ChevronLeftIcon } from "lucide-react";
import React, { useEffect, useInsertionEffect, useLayoutEffect, useMemo } from "react";
import { useItemSizeUL } from '../../hooks/useItemSizeUL';
import { useState } from "react";
import { DebouncedInput } from "../inputs/DebouncedInput";
import { FilterTableColumnsDropdown } from "../ui/FilterTableColumnsDropdown";
import { useRouter } from "next/navigation";
import { HoverBarMenuArray } from "../ui/HoverBarMenuArray";
import { cn } from '../../lib/utils';
import { toast } from "../ui/sonner";
import { Card } from "@common/components/ui/card";
import { Heading } from "@common/components/ui/Heading";
import { SecurityControlCard } from "../ui/SecurityControlCard";
import { FilterTags } from "../inputs/FilterTags";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface DataTableCategoriesProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[]; //array of objects
  title?: string;
  subTitle?: string;
  pixelsNeededBelow?: number;
  menuBarItemTitles?: string[];
  filterTags?: string[];
  filterMenuBarsBy?: string | undefined;
  initiallyHiddenColumns?: string[];
  hideHeader?: boolean;
  initialState?: {
    sorting?: SortingState;
    columnVisibility?: Record<string, boolean>;
    columnPinning?: ColumnPinningState;
    columnOrder?: ColumnOrderState;
    columnFilters?: ColumnFiltersState;
    pagination?: PaginationState;
    globalFilter?: string;
    rowSelection?: RowSelectionState;
  };
  disableRowClick?: boolean;
  getRowURL?: (id: string, rowData?: Cell<any, unknown>[]) => string;
  rowClickHandler?: (id: string, rowData?: Cell<any, unknown>[], e?: any) => void;
  rowClickNavigateUrl?: string;
  hidePaginationIfSub?: number;
  hidePagination?: boolean;
  hideTableEmptyMessage?: boolean;
  hideEmptyTable?: boolean;
  allowSelection?: boolean;
  defaultTabIndex?: number;
  dataNounPlural?: string;
  dataNounSingular?: string;
  extraButtons?: Record<string, any>[];
  className?: string;
}

export function DataTableCategories<TData, TValue>({
  columns,
  data,
  title,
  subTitle,
  pixelsNeededBelow = 136,
  menuBarItemTitles = [],
  filterTags = [],
  filterMenuBarsBy = "category",
  initiallyHiddenColumns = [],
  hideHeader = true,
  initialState,
  disableRowClick = false,
  getRowURL,
  rowClickHandler,
  rowClickNavigateUrl = "/entries/doc/",
  hidePaginationIfSub,
  hidePagination = true,
  hideTableEmptyMessage,
  hideEmptyTable,
  allowSelection = false,
  defaultTabIndex = 0,
  dataNounPlural = "entries",
  dataNounSingular = "entry",
  extraButtons,
  className,
}: DataTableCategoriesProps<TData, TValue>) {
  const [firstRender, setFirstRender] = useState(true);
  const [knownSizeOfRow, setKnownSizeOfRow] = useState<number | undefined>(undefined);
  const [numberOfRowsFit, setNumberOfRows] = useState<number | undefined>(undefined);
  const [fitPageSizeMode, setFitPageSizeMode] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [previousTabIndex, setPreviousTabIndex] = useState<number | undefined>(undefined);
  const [globalFilter, setGlobalFilter] = useState<any>("");
  const [rowSelection, setRowSelection] = React.useState({});
  const [disableFocusedTabUnderline, setDisableFocusedTabUnderline] = useState(false);
  const [currentMenuBarItem, setCurrentMenuBarItem] = useState(defaultTabIndex);
  const [numberOfRowsPerTab, setNumberOfRowsPerTab] = useState<number[]>(new Array(menuBarItemTitles.length).fill(0));
  const [previousPageHeight, setPreviousPageHeight] = useState<number | undefined>(undefined);

  //console.log("globalFilter", globalFilter);
  console.log("dataInDataTable", data);

  const globalFilterFn: FilterFn<any> = (row, columnId, filterValue: string) => {
    let value = row.getValue(columnId) as string;
    if (typeof value === "number") value = String(value);

    return value?.toLowerCase().includes(filterValue);
  };

  const fuzzyFilter: FilterFn<any> = (row, columnId, value: string, addMeta) => {
    let filterValue = row.getValue(columnId) as string;
    if (typeof value === "number") value = String(value);

    // Rank the item
    const itemRank = rankItem(filterValue, value);

    // Store the itemRank info
    addMeta({
      itemRank,
    });

    // Return if the item should be filtered in/out
    return itemRank.passed;
  };

  const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
    let dir = 0;

    // Only sort by rank if the column has ranking information
    if (rowA.columnFiltersMeta[columnId]) {
      dir = compareItems(rowA.columnFiltersMeta[columnId]?.itemRank!, rowB.columnFiltersMeta[columnId]?.itemRank!);
    }

    // Provide an alphanumeric fallback for when the item ranks are equal
    return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
  };

  const table = useReactTable({
    data,
    columns,
    initialState: {
      sorting: initialState?.sorting,
      columnVisibility: initialState?.columnVisibility,
      columnFilters: initialState?.columnFilters,
      pagination: initialState?.pagination,
      globalFilter: initialState?.globalFilter,
      rowSelection: initialState?.rowSelection,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
    },
    globalFilterFn: fuzzyFilter,
    enableRowSelection: true,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useLayoutEffect(() => {
    // Force re-apply sorting on mount
    if (initialState?.sorting) {
      table.setSorting(initialState.sorting);
    }
  }, []); // runs once after the component mounts

  //for page routing
  const router = useRouter();

  const parentDivRef = React.useRef<HTMLDivElement>(null);

  //get position and size of the element
  const { upperLeftPosition, width, height } = useItemSizeUL(parentDivRef);

  //get the height of the navbar and header from css variables
  const navbarHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue("--navbar-height"), 10);
  const headerHeight = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue("--header-height"), 10);

  const adjustTableHeight = () => {
    if (true) return;
    if (!parentDivRef.current) return;

    if (!height || !navbarHeight || !headerHeight) {
      //we dont have the values we need yet
      return;
    }
    // calculate the height needed to fit the table on the screen
    let heightNeeded = height + navbarHeight + headerHeight + pixelsNeededBelow;
    const initialPageSize = table.getState().pagination.pageSize;
    let currentPageSize = initialPageSize;
    const initialWindowHeight = window.innerHeight;
    setPreviousPageHeight(initialWindowHeight);
    const heightOfRow = knownSizeOfRow || 40;

    if (heightNeeded < window.innerHeight) {
      //it fits, can it fit more rows?
      while ((heightNeeded += heightOfRow) < window.innerHeight) {
        heightNeeded += heightOfRow;
        table.setPageSize(currentPageSize + 1);
        currentPageSize++;
      }
    } else {
      //table height is larger than window, how many can we remove?
      while ((heightNeeded -= heightOfRow) > window.innerHeight) {
        heightNeeded -= heightOfRow;
        table.setPageSize(currentPageSize - 1);
        currentPageSize--;
      }
    }
    //of the number of rows has only changed by 1, lets capture what the true hegith of a row is
    if (initialWindowHeight === undefined && Math.abs(currentPageSize - initialPageSize) === 1) {
      setKnownSizeOfRow(Math.abs(initialWindowHeight - window.innerHeight));
    }
  };

  //initalize and update the table page size such that it fits the screen
  useLayoutEffect(() => {
    if (true) return;
    if (!previousPageHeight || window.innerHeight !== previousPageHeight) {
      console.log("scrolling to top");
      console.log("table", table);
      console.log("upperLeftPosition", upperLeftPosition);
      console.log("width", width);
      console.log("height", height);
      console.log("fitPageSizeMode", fitPageSizeMode);
      console.log("parentDivRef.current", parentDivRef.current);
      if (!fitPageSizeMode) {
        return;
      } else {
        //scroll to top becuase page size may need to change
        window.scrollTo({ top: 0 });
      }
      adjustTableHeight();
    }
  }, [table, upperLeftPosition, width, height, fitPageSizeMode, parentDivRef.current]);

  useEffect(() => {
    //On load lets set the optimistic size
    table.setPageIndex(0);
    table.setPageSize(9);
    if (firstRender) {
      setFirstRender(false);
      //timeout because we need to wait for the table and other things to render still...
      setTimeout(() => {
        adjustTableHeight();
      }, 600);
    }
    //Set the first tab as the default
    //handleFilterTagsChange(filterTags);
  }, []);

  useEffect(() => {
    //console.log("globalFilter", JSON.stringify(globalFilter));
  }, [globalFilter]);

  //filter based on the tags selected,  filterMenuBarsBy is likely set to "category" which is a column. category could be a string or string[]. set the fitler so it only shows those categories if tags.length is > 0
  const handleFilterTagsChange = (tags: string[]) => {
    if (!filterMenuBarsBy) return;

    //reset the page index
    table.setPageIndex(0);

    //get reference function to the status column
    const column: Column<TData, TValue> = table.getColumn(filterMenuBarsBy) as Column<TData, TValue>;

    // Only set the filter if we have tags to filter by
    if (tags.length > 0) {
      column?.setFilterValue(tags);
    } else {
      column?.setFilterValue(undefined);
    }
  };

  const handleFilterTagClicked = (tag: string) => {
    console.log("tag", tag);
  };

  const handleSearchChange = (value: string) => {
    //The search if global
    table.setPageIndex(0);
    let column: Column<TData, TValue>;
    if (filterMenuBarsBy) {
      column = table.getColumn(filterMenuBarsBy) as Column<TData, TValue>;
    }

    //console.log("value", value, previousTabIndex);
    if (value === "" && previousTabIndex !== undefined) {
      //reset any table tab filters
      //handleMenuBarItemClicked(undefined, previousTabIndex, undefined, undefined, false);
      setGlobalFilter(undefined);
      setDisableFocusedTabUnderline(false);
    } else {
      //reset any table tab filters
      //column?.setFilterValue(undefined);
      //setDisableFocusedTabUnderline(true);
      setGlobalFilter(String(value));
    }
  };

  function useFilteredRowCounts(tableInstance: any, filterValues: string[], columnId: string) {
    return useMemo(() => {
      return filterValues.map((value: string) => {
        // Create a new temporary filters array to apply
        const tempFilters = [{ id: columnId, value }];

        tableInstance.set;

        // Apply these filters to calculate the filtered row model
        const filteredModel = tableInstance.getFilteredRowModel({
          filters: tempFilters,
        });

        // Return the count of filtered rows for this specific filter value
        console.log("filteredModel", "value", filteredModel.rows.length);
        return filteredModel.rows.length;
      });
    }, [tableInstance, filterValues, columnId]);
  }

  // After filtering or any table operations
  useEffect(() => {
    //if (true) return;
    if (!table || !data) return;
    if (!menuBarItemTitles || !filterMenuBarsBy) return;
    const facetedRows = table.getGlobalFacetedRowModel();
    //console.log("table", table);   //functions and properties of the table
    //console.log("Faceted rows", facetedRows); //rows that are filtered
    //console.log("Total filtered rows:", facetedRows.rows.length); //total filtered rows
    //console.log("all rows", table.getCoreRowModel().rows); //all rows
    //console.log("allcolumns", table.getAllColumns()); //all columns

    //if we have already counted, lets reset the count
    setNumberOfRowsPerTab(new Array(menuBarItemTitles.length).fill(0));

    const allRowsInTable = table.getCoreRowModel().rows;
    const numberOfRowsTotal = allRowsInTable.length;
    //How many rows are there of each status
    for (let i = 0; i < numberOfRowsTotal; i++) {
      const row = allRowsInTable[i];
      const status = row.getValue(filterMenuBarsBy) as string;
      const index = menuBarItemTitles.indexOf(status);
      if (index !== -1) {
        setNumberOfRowsPerTab((prev) => {
          const copy = [...prev];
          copy[index] = copy[index] + 1;
          return copy;
        });
      }
    }
    console.log("Number of rows per tab", numberOfRowsPerTab);

    //console.log("Filtered Row model Length", table.getFilteredRowModel().rows.length);
  }, [data]);

  //const statusFilterValues = ["In Progress", "Pending Approval", "Approved", "Sent", "Archived"];
  //const rowCountPerFilter = useFilteredRowCounts(table, statusFilterValues, filterMenuBarsBy);

  const getNoDataText = () => {
    if (!data || data.length === 0) {
      return `Your ${dataNounPlural} will appear here`;
    }
    if (globalFilter || table.getFilteredRowModel().rows.length > 0) {
      return `No ${dataNounSingular} found`;
    }
    if (filterMenuBarsBy && ((table.getColumn(filterMenuBarsBy) as Column<TData, TValue>)?.getFilterValue() as string[]).length > 0) {
      return `No ${dataNounSingular} found on this tab.`;
    }
    return `No ${dataNounSingular} found.`;
  };

  const handleViewAll = () => {
    table.setPageSize(data.length);
  };

  const menuItemsPresent = menuBarItemTitles.length > 0;
  const onlySearchBar = hideHeader && !(extraButtons && extraButtons.length > 0);

  console.log("data***", data);
  console.log("getRowModel***", table.getRowModel().rows);

  return (
    <div ref={parentDivRef} className={cn("", className)}>
      <div className="flex items-baseline gap-x-2">
        {title && (
          <h1 className="pb-1 text-lg font-medium text-secondary-dark">
            {title}
            {subTitle && <span className=""> - </span>}
          </h1>
        )}
        {subTitle && <h2 className="pb-2 text-sm text-muted-foreground">{subTitle}</h2>}
      </div>
      <div key="Table-Div" className="">
        {(data && data.length > 0) || !hideEmptyTable ? (
          <>
            <div
              className={cn("flex h-full w-full flex-col items-end justify-end gap-x-2 px-2 lg:!flex-row lg:justify-between", {
                "px-0": onlySearchBar,
              })}
            >
              {menuItemsPresent && (
                <div className="flex h-full w-full justify-start overflow-y-hidden overflow-x-visible align-bottom text-secondary-dark ">
                  <HoverBarMenuArray
                    componentsContainerClassName="h-[36px]"
                    //onClick={handleMenuBarItemClicked}
                    components={menuBarItemTitles.map((title, index) => (
                      <Button
                        key={title}
                        variant="ghost"
                        size="md"
                        className={cn("group flex max-h-[40px] gap-x-2", { "text-darkPurple dark:text-primary-dark": index === currentMenuBarItem })}
                      >
                        <div className=" flex w-full items-center justify-between gap-x-2">
                          <span className="flex-grow text-center">{title}</span>
                          <div
                            className={cn(" flex h-8 w-8 items-center justify-center rounded-full bg-secondary-light group-hover:bg-faintPurple", {
                              "bg-faintPurple": index === currentMenuBarItem,
                            })}
                          >
                            <span className="">{numberOfRowsPerTab[index]}</span>
                          </div>
                        </div>
                      </Button>
                    ))}
                    defaultTabIndex={defaultTabIndex}
                    allowUnselection={false}
                    disableFocusUnderline={disableFocusedTabUnderline}
                  />
                </div>
              )}
              <div
                className={cn("mt-[1px] flex w-full items-center justify-between gap-x-2 pb-2 lg:mt-0 lg:w-fit lg:justify-start lg:pt-2", {
                  "pr-8 sm:pr-0 lg:w-full lg:justify-between": !menuItemsPresent,
                })}
              >
                <FilterTags tags={filterTags} initialActiveTags={[]} overflow="scroll" onActiveTagsChange={handleFilterTagsChange} />
                <DebouncedInput
                  id="debounced-search-all"
                  variant="outline"
                  size="sm"
                  width="fit"
                  placeholder="Search All ..."
                  value={globalFilter ?? ""}
                  onChange={handleSearchChange}
                  inputBoxClassName="max-w-full h-[36px]"
                  className={cn("w-[120px] px-0 lg:w-fit", { "w-fit": onlySearchBar })}
                  inputContainerClassName={cn({ "flex justify-end": onlySearchBar })}
                />
                {!onlySearchBar && (
                  <div className="flex gap-x-2">
                    {extraButtons && extraButtons.length > 0 && (
                      <div className="flex items-center justify-end gap-x-2">
                        {extraButtons.map((button, index) => {
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              size="md"
                              onClick={() => button.onClick()}
                              className="h-[42px] w-fit text-secondary-dark hover:text-primary-dark"
                            >
                              {button.title}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                    {!hideHeader && (
                      <FilterTableColumnsDropdown
                        table={table}
                        initiallyHiddenColumns={initiallyHiddenColumns}
                        variant="outline"
                        size="md"
                        classNameButton=""
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
            <Table className="">
              {!hideHeader && (
                <TableHeader className="items-center justify-start border-y bg-background-faint">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
              )}
              <TableBody>
                {data && data.length > 0 && table.getRowModel().rows?.length ? (
                  // There is data
                  table.getRowModel().rows.map((row, index, array) => {
                    const rowId = (row.getAllCells()[0].getValue() as string) || "";
                    const rowData = row.getAllCells() as Cell<any, unknown>[];
                    const visibleCells = row.getVisibleCells();
                    const visibleCellsData = visibleCells.map((cell) => cell.getValue());
                    const id = row.original.id;
                    const title = visibleCells.find((cell) => cell.column.id === "title")?.getValue() as string;
                    const category = visibleCells.find((cell) => cell.column.id === "category")?.getValue() as string;
                    const description = visibleCells.find((cell) => cell.column.id === "description")?.getValue() as string;

                    return (
                      <TableRow
                        className={cn("hover:bg-background border-none", { "cursor-pointer": rowClickHandler })}
                        key={`${id}-TR-${index}`}
                        data-state={row.getIsSelected() && "selected"}
                        onClick={(e) => {
                          rowClickHandler &&
                            rowClickHandler((row.getAllCells()[0].getValue() as string) || "", row.getAllCells() as Cell<any, unknown>[], e);
                        }}
                      >
                        <TableCell colSpan={columns.length} className="py-1 items-center justify-center px-0 text-left md:text-center">
                          <SecurityControlCard control={row.original} index={index} initiallyActive={true} className="" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  // There are no form entries yet
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="items-center justify-center py-4 text-left hover:bg-transparent md:text-center">
                      <div className="flex items-start justify-start">
                        <h1 className="left-0 justify-start self-start pb-4 text-base font-normal">{getNoDataText()}</h1>
                      </div>
                      <div className="items-start justify-start md:flex md:justify-center">
                        <Image
                          className="h-[65%] p-1"
                          src={entriesWaitingRoomImg}
                          priority={true}
                          //onClick={() => router.push("/")}
                          width={400}
                          height={380}
                          style={{ objectFit: "contain" }}
                          alt="Welcome to the entries page, your entries will appear here"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {data && data.length > 0 && (
              <div className="w-full flex justify-center pb-0.5 pt-1">
                {table.getPageCount() > 1 && (
                  <Button variant="purpleInvert" size="tight" className="text-md font-semibold" onClick={handleViewAll}>
                    View All
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="p-5 text-center">No Pending Invites</div>
        )}
      </div>
      {hidePagination || !data || (hidePaginationIfSub && data.length < hidePaginationIfSub) ? null : (
        <div className={cn("flex items-center justify-between px-0.5 pt-2", { "pb-4": fitPageSizeMode === false })}>
          <div className="flex w-full justify-between items-center text-secondary-dark lg:space-x-10">
            {allowSelection && (
              <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
            )}
            <div className="flex items-center space-x-2">
              <h2 className="w-full whitespace-nowrap text-sm font-medium">Rows per page</h2>
              <Select
                value={`${table.getState().pagination.pageSize} ff`}
                onValueChange={(value: string | number) => {
                  if (value === "Fit") {
                    setFitPageSizeMode(true);
                  } else {
                    table.setPageSize(Number(value));
                    setFitPageSizeMode(false);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-full">{fitPageSizeMode ? "Fit" : table.getState().pagination.pageSize}</SelectTrigger>
                <SelectContent side="top">
                  {["Fit", 15, 30, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <DoubleArrowLeftIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <DoubleArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
