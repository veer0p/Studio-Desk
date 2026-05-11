import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Eye, FileSignature, FileText, Images, LayoutDashboard, Receipt, Search, UserPlus, Users, Wallet } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * CommandPalette — ⌘K. Sprint 0 ships navigation only; modules register their
 * own commands ("New lead", "Mark invoice paid", etc.) as they land.
 */
export function CommandPalette({ open, onOpenChange }: Props) {
  const navigate = useNavigate();

  const go = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-40 bg-fg/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-[18%] z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2"
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <div
                  className="overflow-hidden rounded-card border border-border/70 bg-card/95 shadow-elevated backdrop-blur-xl"
                  style={{
                    boxShadow:
                      '0 24px 60px -12px rgb(15 23 42 / 0.18), 0 0 0 1px rgb(var(--accent) / 0.08)',
                  }}
                >
                  <Dialog.Title className="sr-only">Command palette</Dialog.Title>
                  <Command label="Command Menu" className="font-sans">
                    <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
                      <Search className="size-4 text-muted-fg" />
                      <Command.Input
                        placeholder="Type a command or search…"
                        className="flex-1 bg-transparent text-[15px] placeholder:text-muted-fg/70 focus:outline-none"
                      />
                      <kbd className="rounded-input border border-border bg-bg px-1.5 py-0.5 font-mono text-[10px] text-muted-fg">
                        esc
                      </kbd>
                    </div>

                    <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                      <Command.Empty className="px-3 py-10 text-center text-sm text-muted-fg">
                        Nothing matches — modules add commands as they ship.
                      </Command.Empty>

                      <Command.Group
                        heading="Quick actions"
                        className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-fg/70 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2"
                      >
                        <Command.Item
                          value="New lead · Add prospective shoot to the pipeline"
                          onSelect={() => go(`${ROUTES.leads}?new=1`)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input bg-accent/10 text-accent">
                            <UserPlus className="size-3.5" />
                          </div>
                          <span className="flex-1 text-fg">New lead</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="New client · Add a client directly to the client list"
                          onSelect={() => go(`${ROUTES.clients}?new=1`)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input bg-accent/10 text-accent">
                            <Users className="size-3.5" />
                          </div>
                          <span className="flex-1 text-fg">New client</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="New proposal · Create a draft quote for a booking"
                          onSelect={() => go(`${ROUTES.proposals}?new=1`)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input bg-accent/10 text-accent">
                            <FileText className="size-3.5" />
                          </div>
                          <span className="flex-1 text-fg">New proposal</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="New contract · Generate a contract from a booking template"
                          onSelect={() => go(`${ROUTES.contracts}?new=1`)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input bg-accent/10 text-accent">
                            <FileSignature className="size-3.5" />
                          </div>
                          <span className="flex-1 text-fg">New contract</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="New booking · Schedule a shoot for a client"
                          onSelect={() => go(`${ROUTES.bookings}?new=1`)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input bg-accent/10 text-accent">
                            <Calendar className="size-3.5" />
                          </div>
                          <span className="flex-1 text-fg">New booking</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="New invoice · Generate a GST-compliant invoice for a booking"
                          onSelect={() => go(`${ROUTES.invoices}?new=1`)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input bg-accent/10 text-accent">
                            <Receipt className="size-3.5" />
                          </div>
                          <span className="flex-1 text-fg">New invoice</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="New gallery · Create a delivery gallery for a booking"
                          onSelect={() => go(`${ROUTES.gallery}?new=1`)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input bg-accent/10 text-accent">
                            <Images className="size-3.5" />
                          </div>
                          <span className="flex-1 text-fg">New gallery</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                      </Command.Group>

                      <Command.Group
                        heading="Jump to"
                        className="px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-fg/70 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2"
                      >
                        <Command.Item
                          value="Leads pipeline"
                          onSelect={() => go(ROUTES.leads)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <UserPlus className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Leads</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="Clients list"
                          onSelect={() => go(ROUTES.clients)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <Users className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Clients</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="Proposals list"
                          onSelect={() => go(ROUTES.proposals)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <FileText className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Proposals</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="Contracts list"
                          onSelect={() => go(ROUTES.contracts)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <FileSignature className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Contracts</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="Bookings list"
                          onSelect={() => go(ROUTES.bookings)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <Calendar className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Bookings</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="Invoices list"
                          onSelect={() => go(ROUTES.invoices)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <Receipt className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Invoices</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="Payments ledger"
                          onSelect={() => go(ROUTES.payments)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <Wallet className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Payments</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="Gallery delivery albums"
                          onSelect={() => go(ROUTES.gallery)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <Images className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Gallery</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="Dashboard overview KPIs shoots"
                          onSelect={() => go(ROUTES.dashboard)}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <LayoutDashboard className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Dashboard</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                        <Command.Item
                          value="Components preview · design primitives"
                          onSelect={() => go('/_components')}
                          className="flex cursor-pointer items-center gap-3 rounded-input px-3 py-2.5 text-sm transition-colors data-[selected=true]:bg-accent/8"
                        >
                          <div className="grid size-7 place-items-center rounded-input border border-border/70 bg-bg">
                            <Eye className="size-3.5 text-muted-fg" />
                          </div>
                          <span className="flex-1 text-fg">Components preview</span>
                          <ArrowRight className="size-3.5 text-muted-fg/60" />
                        </Command.Item>
                      </Command.Group>
                    </Command.List>

                    <div className="flex items-center justify-between border-t border-border/60 bg-bg/40 px-4 py-2.5 text-[11px] text-muted-fg">
                      <span>
                        <kbd className="mr-1 rounded border border-border bg-card px-1 font-mono">
                          ↑↓
                        </kbd>
                        navigate
                        <kbd className="ml-3 mr-1 rounded border border-border bg-card px-1 font-mono">
                          ↵
                        </kbd>
                        open
                      </span>
                      <span>StudioDesk · Sprint 10</span>
                    </div>
                  </Command>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
