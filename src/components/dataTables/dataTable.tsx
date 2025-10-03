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
  Table as TableType,
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

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[]; //array of objects
  auxData?: Record<string, any>; //auxiliary data to be passed to the table for logic
  title?: string;
  titleClassName?: string;
  subTitle?: string;
  subTitleJSX?: React.ReactNode;
  pixelsNeededBelow?: number;
  menuBarItemTitles?: string[];
  filterMenuBarsBy?: string | undefined;
  initiallyHiddenColumns?: string[];
  showSearch?: boolean;
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
  noRowsMessage?: string;
  rowClickNavigateUrl?: string;
  hidePaginationIfSub?: number;
  hideTableEmptyMessage?: boolean;
  hideEmptyTable?: boolean;
  defaultTabIndex?: number;
  dataNounPlural?: string;
  dataNounSingular?: string;
  extraButtons?: Record<string, any>[];
  extraButtonsSide?: "left" | "right";
  extraHeaderJSX?: React.ReactNode;
  extraHeaderJSXSide?: "left" | "right";
  className?: string;
  iterativeFetching?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  auxData,
  title,
  titleClassName,
  subTitle,
  subTitleJSX,
  pixelsNeededBelow = 136,
  menuBarItemTitles = [],
  filterMenuBarsBy = undefined,
  initiallyHiddenColumns = [],
  showSearch = true,
  initialState,
  disableRowClick = false,
  getRowURL,
  rowClickHandler,
  noRowsMessage,
  rowClickNavigateUrl = "/entries/doc/",
  hidePaginationIfSub,
  hideTableEmptyMessage,
  hideEmptyTable,
  defaultTabIndex = 0,
  dataNounPlural = "entries",
  dataNounSingular = "entry",
  extraButtons,
  extraButtonsSide = "right",
  extraHeaderJSX,
  extraHeaderJSXSide = "right",
  className,
  iterativeFetching,
}: DataTableProps<TData, TValue>) {
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
    handleMenuBarItemClicked(undefined, defaultTabIndex);
  }, []);

  useEffect(() => {
    //console.log("globalFilter", JSON.stringify(globalFilter));
  }, [globalFilter]);

  const handleRowClicked = (id: string | null, rowData: Cell<any, unknown>[], e?: any) => {
    if (!id || id === "" || disableRowClick) return;
    if (rowClickHandler) {
      rowClickHandler(id, rowData, e);
    } else if (rowClickNavigateUrl) {
      try {
        router.push(`${rowClickNavigateUrl}${id}`);
      } catch (error) {
        toast({
          title: "Navigation Error",
          message: `Error navigating to ${rowClickNavigateUrl}${id}`,
          type: "error",
        });
      }
    }
  };

  //filter based on the tab selected
  const handleMenuBarItemClicked = (
    e: React.MouseEvent | undefined,
    index: number,
    setFilter: boolean = true,
    allowMultiple: boolean = false,
    allowUnselect: boolean = true
  ) => {
    if (!menuBarItemTitles || !filterMenuBarsBy) return;
    setCurrentMenuBarItem(index);
    //reset the page index
    table.setPageIndex(0);
    setPreviousTabIndex(index);
    //get reference function to the status column
    let column: Column<TData, TValue> | undefined;
    //Check if the column exists before trying to get it
    //list the table columns
    if (!tableHasColumn(table, filterMenuBarsBy)) {
      console.warn("Column does not exist", filterMenuBarsBy);
      return;
    }

    column = table.getColumn(filterMenuBarsBy) as Column<TData, TValue>;

    //get the string value of the tab clicked
    const value = menuBarItemTitles[index];
    //The initially filtered value
    let selectedValues: Set<string> | undefined = new Set(column?.getFilterValue() as string[]);
    //check if the value is already selected
    const isSelected = selectedValues.has(value);
    if (allowMultiple) {
    } else {
      if (isSelected && allowUnselect) {
        selectedValues.clear();
      } else {
        selectedValues.clear();
        selectedValues.add(value);
      }
    }
    console.log("selectedValues", selectedValues);
    //set as undefined if the selectedValues is empty
    column?.setFilterValue(setFilter && selectedValues.size !== 0 ? Array.from(selectedValues) : undefined);
  };

  const handleSearchChange = (value: string) => {
    //The search if global
    table.setPageIndex(0);
    let column: Column<TData, TValue>;
    if (filterMenuBarsBy && tableHasColumn(table, filterMenuBarsBy)) {
      column = table.getColumn(filterMenuBarsBy) as Column<TData, TValue>;
    }

    //console.log("value", value, previousTabIndex);
    if (value === "" && previousTabIndex !== undefined) {
      //reset any table tab filters
      handleMenuBarItemClicked(undefined, previousTabIndex, undefined, undefined, false);
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
    if (!table || !data) return;
    if (!menuBarItemTitles || !filterMenuBarsBy) return;
    if (!tableHasColumn(table, filterMenuBarsBy)) {
      console.warn("Column does not exist", filterMenuBarsBy);
      return;
    }
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
      let status = row.getValue(filterMenuBarsBy) as string | string[];
      if (typeof status === "string") {
        status = [status];
      }

      if (!status || status.length === 0) {
        continue;
      }

      //Loop over all statuses and find the index of the menuBarItemTitles that matches, if an index exists, increment the count
      for (let j = 0; j < status.length; j++) {
        const index = menuBarItemTitles.indexOf(status[j]);
        if (index !== -1) {
          setNumberOfRowsPerTab((prev) => {
            const copy = [...prev];
            copy[index] = copy[index] + 1;
            return copy;
          });
        }
      }
    }
    console.log("Number of rows per tab", numberOfRowsPerTab);

    //console.log("Filtered Row model Length", table.getFilteredRowModel().rows.length);
  }, [data]);

  //const statusFilterValues = ["In Progress", "Pending Approval", "Approved", "Sent", "Archived"];
  //const rowCountPerFilter = useFilteredRowCounts(table, statusFilterValues, filterMenuBarsBy);

  const tableHasColumn = (table: TableType<any>, columnId: string) => {
    return table.getAllColumns().find((c) => c.id === columnId) !== undefined;
  };

  const getNoDataText = () => {
    if (!data || data.length === 0) {
      return `Your ${dataNounPlural} will appear here`;
    }
    if (globalFilter || table.getFilteredRowModel().rows.length > 0) {
      return `No ${dataNounSingular} found`;
    }
    if (
      filterMenuBarsBy &&
      tableHasColumn(table, filterMenuBarsBy) &&
      ((table.getColumn(filterMenuBarsBy) as Column<TData, TValue>)?.getFilterValue() as string[]).length > 0
    ) {
      return `No ${dataNounSingular} found on this tab.`;
    }
    return `No ${dataNounSingular} found.`;
  };

  const menuItemsPresent = menuBarItemTitles.length > 0;

  const extraButtonsJSX =
    extraButtons && extraButtons.length > 0 ? (
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
    ) : null;

  return (
    <div ref={parentDivRef} className={cn("", className)}>
      <div className="flex items-baseline gap-x-2">
        {title && (
          <h1 className={cn("pb-1 text-lg font-medium text-secondary-dark", titleClassName)}>
            {title}
            {false && <span className=""> - </span>}
          </h1>
        )}
        {subTitle && <h2 className="pb-2 text-sm text-muted-foreground">- {subTitle}</h2>}
        {subTitleJSX && <div className="pb-2 text-sm text-muted-foreground">{subTitleJSX}</div>}
      </div>
      <div key="Table-Div" className="rounded-md border">
        {(data && data.length > 0) || !hideEmptyTable ? (
          <>
            <div className="flex h-full w-full flex-col items-end justify-end gap-x-2 px-2 pt-2 lg:pt-0 lg:!flex-row lg:justify-between">
              {menuItemsPresent && (
                <div className="flex h-full w-full justify-start overflow-y-hidden overflow-x-visible align-bottom text-secondary-dark ">
                  <HoverBarMenuArray
                    componentsContainerClassName="h-[36px]"
                    onClick={handleMenuBarItemClicked}
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
                            <span className={cn({ invisible: iterativeFetching })}>{numberOfRowsPerTab[index]}</span>
                          </div>
                        </div>
                        {iterativeFetching && (
                          <div
                            className={`absolute inset-0 -top-[20px] flex h-[calc(100%+40px)] w-full animate-shine-infinite-2 delay-[${
                              index * 0.5
                            }s] justify-center blur-[12px]`}
                          >
                            <div className="relative h-full w-8 bg-white/80"></div>
                          </div>
                        )}
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
                <div>
                  {showSearch && (
                    <DebouncedInput
                      id="debounced-search-all"
                      variant="outline"
                      size="md"
                      width="fit"
                      placeholder="Search All ..."
                      value={globalFilter ?? ""}
                      onChange={handleSearchChange}
                      className="w-[176px] px-0 lg:w-fit"
                      inputBoxClassName="max-w-full"
                    />
                  )}
                  {extraButtonsSide === "left" && extraButtonsJSX}
                  {extraHeaderJSX && extraHeaderJSXSide === "left" && extraHeaderJSX}
                </div>
                <div className="flex gap-x-2">
                  {extraHeaderJSX && extraHeaderJSXSide === "right" && extraHeaderJSX}
                  {extraButtonsSide === "right" && extraButtonsJSX}
                  <FilterTableColumnsDropdown
                    table={table}
                    initiallyHiddenColumns={initiallyHiddenColumns}
                    variant="outline"
                    size="md"
                    classNameButton=""
                  />
                </div>
              </div>
            </div>
            <Table className="">
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
              <TableBody>
                {data && data.length > 0 && table.getRowModel().rows?.length ? (
                  // There is data
                  table.getRowModel().rows.map((row) => {
                    //Datatable assumes the id always has column id "id", but some tables may have a different column id for the id
                    const idRowValue = row.getValue("id");
                    const rowId = typeof idRowValue === "string" ? idRowValue : (row.getAllCells()[0].getValue() as string) || "";
                    const rowData = row.getAllCells() as Cell<any, unknown>[];
                    return (
                      <TableRow
                        className="cursor-pointer hover:bg-background-faint/50"
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        onClick={(e) => {
                          handleRowClicked(rowId, rowData, e);
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell className="justify-center self-center" key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  // There are no form entries yet
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={columns.length} className="items-center justify-center py-4 text-left hover:bg-transparent md:text-center">
                      <div className="flex items-start justify-start">
                        <h1 className="left-0 justify-start self-start pb-4 text-base font-normal">{noRowsMessage ?? getNoDataText()}</h1>
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
          </>
        ) : (
          <div className="p-5 text-center">No Pending Invites</div>
        )}
      </div>
      {!data || (hidePaginationIfSub && data.length < hidePaginationIfSub) ? null : (
        <div className={cn("flex items-center justify-between px-0.5 pt-2", { "pb-4": fitPageSizeMode === false })}>
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center text-secondary-dark lg:space-x-10">
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
