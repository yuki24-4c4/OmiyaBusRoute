"use client";

import * as React from "react";
<<<<<<< HEAD
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "./utils"; // ※もしパスエラーが出たら "@/lib/utils" など環境に合わせてください
=======
import * as CheckboxPrimitive from "@radix-ui/react-checkbox@1.1.4";
import { CheckIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";
>>>>>>> origin/back

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
<<<<<<< HEAD
        // 👇 【修正】 size-4 を h-4 w-4 に変更し、borderの透明度などの問題を排除した最強設定です
        "peer h-4 w-4 shrink-0 rounded-sm border border-gray-400 bg-white shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary",
        className
=======
        "peer border bg-input-background dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
>>>>>>> origin/back
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
<<<<<<< HEAD
        className="flex items-center justify-center text-current"
      >
        <Check className="h-3.5 w-3.5" />
=======
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
>>>>>>> origin/back
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

<<<<<<< HEAD
export { Checkbox };
=======
export { Checkbox };
>>>>>>> origin/back
