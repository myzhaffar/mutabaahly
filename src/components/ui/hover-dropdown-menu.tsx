import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

const HoverDropdownMenu = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Root> & {
    children: React.ReactNode;
  }
>(({ children }, ref) => {
  const [open, setOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 300); // Increased delay for smoother interaction
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={ref} 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
      className="relative inline-block"
    >
      <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen}>
        {children}
      </DropdownMenuPrimitive.Root>
    </div>
  );
});
HoverDropdownMenu.displayName = "HoverDropdownMenu";

const HoverDropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, children }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn("outline-none data-[state=open]:bg-accent", className)}
  >
    {children}
  </DropdownMenuPrimitive.Trigger>
));
HoverDropdownMenuTrigger.displayName = "HoverDropdownMenuTrigger";

const HoverDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      onMouseEnter={() => {
        if (ref && 'current' in ref && ref.current) {
          const parentDropdown = ref.current.parentElement?.closest('[data-radix-dropdown-menu-content]') as HTMLElement;
          if (parentDropdown) {
            parentDropdown.style.display = 'block';
          }
        }
      }}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
HoverDropdownMenuContent.displayName = "HoverDropdownMenuContent";

export {
  HoverDropdownMenu,
  HoverDropdownMenuTrigger,
  HoverDropdownMenuContent,
  DropdownMenuPrimitive as HoverDropdownMenuPrimitive,
}; 