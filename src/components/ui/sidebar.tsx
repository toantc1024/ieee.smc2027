"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH_STORAGE_KEY = "sidebar_width";
const DEFAULT_SIDEBAR_WIDTH_PX = 256; // 16rem = 256px
const MIN_SIDEBAR_WIDTH_PX = 48; // Minimum version (icon mode width = 48px)
const MAX_SIDEBAR_WIDTH_PX = 460; // Max width when expanded
const COLLAPSE_THRESHOLD_PX = 110; // Automatically snaps to minimum version during drag
const EXPAND_THRESHOLD_PX = 110; // Symmetrically expands from the exact same threshold during drag
const MIN_EXPANDED_WIDTH_PX = 110; // Minimum healthy width saved for expanded state
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "\\";

type SidebarContextProps = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean | ((value: boolean) => boolean)) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  width: number;
  setWidth: (width: number, persist?: boolean) => void;
  resetWidth: () => void;
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

function SidebarProvider({
  defaultOpen = true,
  defaultWidth = 260,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean;
  defaultWidth?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open],
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Responsive: automatically collapse to square-icon mode on medium screens (< 1024px)
  React.useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 768 && window.innerWidth < 1024) {
        setOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        // Don't capture shortcut when focus is inside an editor
        const activeElement = document.activeElement;
        const isInEditor =
          activeElement?.closest(".tiptap") ||
          activeElement?.closest(".ProseMirror") ||
          activeElement?.closest("[contenteditable='true']") ||
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA";

        if (isInEditor) {
          return;
        }

        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  // Width management with localStorage persistence (default 260px)
  const [width, setWidthState] = React.useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
        if (saved) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed >= MIN_SIDEBAR_WIDTH_PX && parsed <= MAX_SIDEBAR_WIDTH_PX) {
            // Upgrade previous default width (248 or 240) to the new 5% wider default (260)
            if (parsed === 248 || parsed === 240) {
              return defaultWidth;
            }
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return defaultWidth;
  });

  const [isResizing, setIsResizing] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);

  const setWidth = React.useCallback((newWidth: number, persist = true) => {
    const clamped = Math.min(Math.max(newWidth, MIN_SIDEBAR_WIDTH_PX), MAX_SIDEBAR_WIDTH_PX);
    setWidthState(clamped);
    if (wrapperRef.current) {
      wrapperRef.current.style.setProperty("--sidebar-width", `${clamped}px`);
    }
    if (persist && typeof window !== "undefined" && clamped >= MIN_EXPANDED_WIDTH_PX) {
      try {
        localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(clamped));
      } catch {
        // ignore
      }
    }
  }, []);

  const resetWidth = React.useCallback(() => {
    setWidth(defaultWidth, true);
    setOpen(true);
  }, [setWidth, setOpen, defaultWidth]);

  // State: expanded or collapsed
  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      width,
      setWidth,
      resetWidth,
      isResizing,
      setIsResizing,
      wrapperRef,
    }),
    [
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
      width,
      setWidth,
      resetWidth,
      isResizing,
    ],
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          ref={wrapperRef}
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": `${width}px`,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            isResizing && "select-none",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, state, openMobile, setOpenMobile, isResizing } = useSidebar();

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-out",
          isResizing && "transition-none",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-30 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-out md:flex",
          isResizing && "transition-none",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-inherit group-data-[variant=floating]:border-sidebar-border relative flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm overflow-hidden"
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="outline"
      size="icon"
      className={cn(
        "size-8 rounded-full border border-border bg-background hover:bg-muted text-foreground/80 hover:text-primary shadow-2xs transition-all duration-200 cursor-pointer shrink-0",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      title={open ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
      aria-label={open ? "Thu gọn thanh bên" : "Mở rộng thanh bên"}
      {...props}
    >
      <PanelLeft className="size-4 stroke-[1.8] transition-transform duration-200" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const {
    toggleSidebar,
    setWidth,
    open,
    setOpen,
    isResizing,
    setIsResizing,
    resetWidth,
    wrapperRef,
    width,
  } = useSidebar();

  const openRef = React.useRef(open);
  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  const widthRef = React.useRef(width);
  React.useEffect(() => {
    widthRef.current = width;
  }, [width]);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const startX = e.clientX;
      const initialOpen = openRef.current;
      const initialWidth = widthRef.current;
      let currentWidth = initialOpen ? initialWidth : 48;
      let hasDragged = false;

      setIsResizing(true);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = Math.abs(moveEvent.clientX - startX);
        if (deltaX > 3) {
          hasDragged = true;
        }

        if (!hasDragged) return;

        const clientX = moveEvent.clientX;

        // If currently open and dragged below collapse threshold:
        // Automatically resize to minimum version (icon mode) mid-drag without waiting for mouseup
        if (openRef.current && clientX < COLLAPSE_THRESHOLD_PX) {
          openRef.current = false;
          setOpen(false);
          return;
        }

        // If currently in minimum version and dragged right past expand threshold:
        // Automatically expand back into full version
        if (!openRef.current && clientX >= EXPAND_THRESHOLD_PX) {
          openRef.current = true;
          setOpen(true);
          const clamped = Math.min(
            Math.max(clientX, MIN_EXPANDED_WIDTH_PX),
            MAX_SIDEBAR_WIDTH_PX,
          );
          currentWidth = clamped;
          if (wrapperRef.current) {
            wrapperRef.current.style.setProperty("--sidebar-width", `${clamped}px`);
          }
          return;
        }

        // If open, smoothly resize width with 1:1 mouse tracking
        if (openRef.current) {
          const clamped = Math.min(
            Math.max(clientX, COLLAPSE_THRESHOLD_PX),
            MAX_SIDEBAR_WIDTH_PX,
          );

          currentWidth = clamped;

          if (wrapperRef.current) {
            wrapperRef.current.style.setProperty("--sidebar-width", `${clamped}px`);
          }
        }
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);

        if (!hasDragged) {
          toggleSidebar();
          return;
        }

        // On drag release:
        // If ended in minimum version (icon mode)
        if (!openRef.current) {
          setOpen(false);
          const restoreWidth =
            initialWidth >= MIN_EXPANDED_WIDTH_PX
              ? initialWidth
              : DEFAULT_SIDEBAR_WIDTH_PX;
          if (wrapperRef.current) {
            wrapperRef.current.style.setProperty(
              "--sidebar-width",
              `${restoreWidth}px`,
            );
          }
          setWidth(restoreWidth, false);
        } else {
          // Stay expanded at chosen width
          setOpen(true);
          const finalWidth = Math.max(currentWidth, MIN_EXPANDED_WIDTH_PX);
          if (wrapperRef.current) {
            wrapperRef.current.style.setProperty(
              "--sidebar-width",
              `${finalWidth}px`,
            );
          }
          setWidth(finalWidth, true);
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [setOpen, setWidth, setIsResizing, toggleSidebar, wrapperRef],
  );

  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent<HTMLButtonElement>) => {
      const touch = e.touches[0];
      if (!touch) return;
      const startX = touch.clientX;
      const initialOpen = openRef.current;
      const initialWidth = widthRef.current;
      let currentWidth = initialOpen ? initialWidth : 48;
      let hasDragged = false;

      setIsResizing(true);

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.touches[0];
        if (!moveTouch) return;
        const deltaX = Math.abs(moveTouch.clientX - startX);
        if (deltaX > 3) {
          hasDragged = true;
        }

        if (!hasDragged) return;

        const clientX = moveTouch.clientX;

        if (openRef.current && clientX < COLLAPSE_THRESHOLD_PX) {
          openRef.current = false;
          setOpen(false);
          return;
        }

        if (!openRef.current && clientX >= EXPAND_THRESHOLD_PX) {
          openRef.current = true;
          setOpen(true);
          const clamped = Math.min(
            Math.max(clientX, MIN_EXPANDED_WIDTH_PX),
            MAX_SIDEBAR_WIDTH_PX,
          );
          currentWidth = clamped;
          if (wrapperRef.current) {
            wrapperRef.current.style.setProperty("--sidebar-width", `${clamped}px`);
          }
          return;
        }

        if (openRef.current) {
          const clamped = Math.min(
            Math.max(clientX, COLLAPSE_THRESHOLD_PX),
            MAX_SIDEBAR_WIDTH_PX,
          );

          currentWidth = clamped;

          if (wrapperRef.current) {
            wrapperRef.current.style.setProperty("--sidebar-width", `${clamped}px`);
          }
        }
      };

      const handleTouchEnd = () => {
        setIsResizing(false);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);

        if (!hasDragged) {
          toggleSidebar();
          return;
        }

        if (!openRef.current) {
          setOpen(false);
          const restoreWidth =
            initialWidth >= MIN_EXPANDED_WIDTH_PX
              ? initialWidth
              : DEFAULT_SIDEBAR_WIDTH_PX;
          if (wrapperRef.current) {
            wrapperRef.current.style.setProperty(
              "--sidebar-width",
              `${restoreWidth}px`,
            );
          }
          setWidth(restoreWidth, false);
        } else {
          setOpen(true);
          const finalWidth = Math.max(currentWidth, MIN_EXPANDED_WIDTH_PX);
          if (wrapperRef.current) {
            wrapperRef.current.style.setProperty(
              "--sidebar-width",
              `${finalWidth}px`,
            );
          }
          setWidth(finalWidth, true);
        }
      };

      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    },
    [setOpen, setWidth, setIsResizing, toggleSidebar, wrapperRef],
  );

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Chỉnh kích thước hoặc đóng mở thanh bên"
      tabIndex={-1}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={resetWidth}
      title="Kéo để thay đổi kích thước · Nhấp đúp để đặt lại mặc định · Nhấp để đóng/mở"
      className={cn(
        "hover:after:bg-primary/50 absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "cursor-col-resize",
        "in-data-[side=left]:cursor-col-resize in-data-[side=right]:cursor-col-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        isResizing && "after:bg-primary after:w-[3px]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Hook to automatically minimize the sidebar when entering a studio/page editor,
 * and restore the previous expanded/collapsed state when exiting or navigating back.
 */
function useAutoMinimizeSidebar() {
  const { open, setOpen } = useSidebar();
  const previousOpenRef = React.useRef<boolean | null>(null);

  React.useEffect(() => {
    // Save previous state on mount
    previousOpenRef.current = open;

    // Minimize on enter
    if (open) {
      setOpen(false);
    }

    // Restore on exit
    return () => {
      if (previousOpenRef.current !== null) {
        setOpen(previousOpenRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  );
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border w-full", className)}
      {...props}
    />
  );
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn(
        "relative flex w-full min-w-0 flex-col p-2 group-data-[collapsible=icon]:p-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 min-w-0 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0 truncate",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  );
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  );
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span]:truncate [&>span]:min-w-0 [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip || state !== "collapsed" || isMobile) {
    return button;
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    };
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  showOnHover?: boolean;
}) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}) {
  const width = "70%";

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative w-full", className)}
      {...props}
    />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  asChild?: boolean;
  size?: "sm" | "md";
  isActive?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "w-full text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span]:truncate [&>span]:min-w-0 [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
  useAutoMinimizeSidebar,
};
