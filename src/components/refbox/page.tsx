"use client";

import { use, useCallback, useState } from "react";
import { RefBox } from '../../components/ui/Refbox';
import { RefBox2 } from '../../components/ui/RefboxCopy';

export default function Page(props: { params: Promise<{ slug: string }>; searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = use(props.params);
  const searchParams = use(props.searchParams);
  const slug = params.slug;
  const query = searchParams.query;

  const [isOpen, setIsOpen] = useState(false);
  interface StringNumberObject {
    [key: string]: number;
  }
  const suggestWords: StringNumberObject[] = [{ foo: 4 }, { bar: 6 }, { baz: 1 }];

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  return (
    <div className="container w-full pb-20 pt-20">
      <div
        //onClick={onRent}
        className="
            hidden
            cursor-pointer
            rounded-full
            p-20 
            px-4 
            py-3 
            text-sm 
            font-semibold 
            transition 
            hover:bg-neutral-100 
            md:block
          "
      ></div>
      <div className="flex w-full flex-wrap gap-8 pt-11">
        <div className="h-10 w-1/3">
          <RefBox suggestWords={suggestWords} suggestBoxWidth={0.5} />
        </div>
        <div className="h-10 w-1/3">
          <RefBox suggestWords={suggestWords} suggestBoxWidth={0.5} />
        </div>
        <div className="h-10 w-1/3">
          <RefBox2 suggestWords={suggestWords} suggestBoxWidth={0.5} />
        </div>
      </div>
    </div>
  );
}
