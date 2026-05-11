import { Drawer } from 'vaul';
import { NavTree } from './NavTree';

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile navigation drawer — slides from the left edge on `<md`.
 * Uses vaul for native-feeling swipe-to-close on touch devices.
 */
export function MobileNavDrawer({ open, onOpenChange }: MobileNavDrawerProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      direction="left"
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-fg/30 backdrop-blur-[2px]" />
        <Drawer.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(280px,85vw)] flex-col border-r border-border bg-bg px-3 pb-4 pt-5 outline-none">
          <Drawer.Title className="sr-only">Navigation</Drawer.Title>
          <NavTree variant="mobile" onNavigate={() => onOpenChange(false)} />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
