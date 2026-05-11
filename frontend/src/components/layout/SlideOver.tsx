import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'motion/react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideOverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  widthClass?: string;
}

export function SlideOver({
  open,
  onOpenChange,
  title,
  description,
  children,
  widthClass = 'w-full max-w-xl',
}: SlideOverProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-30 bg-fg/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.aside
                className={cn(
                  'fixed inset-y-0 right-0 z-40 flex flex-col border-l border-border bg-card shadow-elevated',
                  widthClass,
                )}
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
              >
                <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                  <div>
                    {title && (
                      <Dialog.Title className="font-display text-lg font-semibold">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Description className="mt-1 text-sm text-muted-fg">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close
                    aria-label="Close"
                    className="grid size-8 place-items-center rounded-input text-muted-fg transition-colors hover:bg-bg hover:text-fg"
                  >
                    <X className="size-4" />
                  </Dialog.Close>
                </header>
                <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
