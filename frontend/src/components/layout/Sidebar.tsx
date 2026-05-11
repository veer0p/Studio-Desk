import { NavTree } from './NavTree';

/**
 * Desktop sidebar — visible only on `md+`. Mobile uses MobileNavDrawer.
 */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 px-3 pb-4 pt-5 backdrop-blur-sm md:flex">
      <NavTree variant="desktop" />
    </aside>
  );
}
