"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl text-xs",
          description: "group-[.toast]:text-slate-500",
          actionButton:
            "group-[.toast]:bg-[#115eff] group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
