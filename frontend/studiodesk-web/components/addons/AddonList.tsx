"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Zap, ChevronRight, MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react"
import useSWR from "swr"
import { fetchAddonsList, createAddon, deleteAddon, AddonRecord } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { useSWRConfig } from "swr"

const addonSchema = z.object({
  name: z.string().min(1, "Name required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  unit: z.enum(["flat", "per_hour", "per_day"]),
})

const unitLabels: Record<string, string> = {
  flat: "Flat Rate",
  per_hour: "Per Hour",
  per_day: "Per Day",
}

export function AddonList() {
  const { data, isLoading, error } = useSWR("/api/v1/addons", fetchAddonsList)
  const addons = data?.list || []
  const [open, setOpen] = useState(false)
  const [editingAddon, setEditingAddon] = useState<AddonRecord | null>(null)
  const [deletingAddon, setDeletingAddon] = useState<AddonRecord | null>(null)
  const { mutate } = useSWRConfig()

  const form = useForm<z.infer<typeof addonSchema>>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      unit: "flat" as const,
    }
  })

  const editForm = useForm<z.infer<typeof addonSchema>>({
    resolver: zodResolver(addonSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      unit: "flat" as const,
    }
  })

  // Reset edit form when editingAddon changes
  useState(() => {
    if (editingAddon) {
      editForm.reset({
        name: editingAddon.name,
        description: editingAddon.description || "",
        price: editingAddon.price,
        unit: editingAddon.unit || "flat",
      })
    }
  })

  const refreshAddons = () => {
    mutate((key: unknown) => typeof key === 'string' && key.startsWith('/api/v1/addons'))
  }

  const onSubmit = async (data: z.infer<typeof addonSchema>) => {
    try {
      await createAddon(data)
      toast.success("Addon created successfully")
      setOpen(false)
      form.reset()
      refreshAddons()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create addon")
    }
  }

  const onEditSubmit = async (data: z.infer<typeof addonSchema>) => {
    if (!editingAddon) return
    try {
      const { updateAddon } = await import("@/lib/api")
      await updateAddon(editingAddon.id, data)
      toast.success("Addon updated successfully")
      setEditingAddon(null)
      editForm.reset()
      refreshAddons()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update addon")
    }
  }

  const onDelete = async () => {
    if (!deletingAddon) return
    try {
      await deleteAddon(deletingAddon.id)
      toast.success("Addon deleted")
      setDeletingAddon(null)
      refreshAddons()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete addon")
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Failed to load addons</p>
        <p className="text-sm">{error.message || "Please try again later."}</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {addons.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <Zap className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-medium text-foreground mb-1">No service addons yet</p>
          <p className="text-sm">Create addons to offer clients alongside their main package.</p>
        </div>
      ) : (
        addons.map((addon: AddonRecord) => (
          <div key={addon.id} className="group bg-background border border-border/60 p-5 rounded-md flex flex-col justify-between hover:border-foreground/20 transition-all cursor-pointer relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-sm bg-muted/30 border border-border/40 flex items-center justify-center">
                <Zap className="w-5 h-5 text-foreground/70" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 hover:bg-muted/50 rounded-sm text-muted-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setEditingAddon(addon)
                    editForm.reset({
                      name: addon.name,
                      description: addon.description || "",
                      price: addon.price,
                      unit: addon.unit || "flat",
                    })
                  }}>
                    <Pencil className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeletingAddon(addon)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground bg-muted/20 px-1.5 py-0.5 rounded-sm border mb-2 inline-block">
                {addon.unit ? unitLabels[addon.unit] || addon.unit : "N/A"}
              </span>
              <h4 className="text-sm font-bold tracking-tight mb-1">{addon.name}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{addon.description}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
              <span className="font-mono text-sm font-bold tracking-widest uppercase">Rs{addon.price.toLocaleString("en-IN")}</span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-1">Update <ChevronRight className="w-3 h-3" /></span>
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-foreground/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500" />
          </div>
        ))
      )}

      <button
        className="border border-dashed border-border/60 rounded-md p-6 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all gap-2 group"
        onClick={() => setOpen(true)}
      >
        <div className="w-10 h-10 rounded-sm bg-muted/10 border border-dashed border-border/40 flex items-center justify-center group-hover:bg-muted/20 transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Add New Service</span>
      </button>

      {/* Create Addon Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input {...form.register("name")} placeholder="e.g. Drone Coverage" />
            </div>

            <div className="space-y-2">
              <Label>Pricing Type *</Label>
              <Select onValueChange={(v) => form.setValue("unit", v as "flat" | "per_hour" | "per_day")} defaultValue="flat">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Rate</SelectItem>
                  <SelectItem value="per_hour">Per Hour</SelectItem>
                  <SelectItem value="per_day">Per Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price (₹) *</Label>
              <Input type="number" {...form.register("price", { valueAsNumber: true })} placeholder="5000" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...form.register("description")} placeholder="Service details..." className="resize-none h-20" />
            </div>

            <DialogFooter className="pt-4">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Addon Dialog */}
      <Dialog open={!!editingAddon} onOpenChange={(v) => { if (!v) setEditingAddon(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>

          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input {...editForm.register("name")} placeholder="e.g. Drone Coverage" />
            </div>

            <div className="space-y-2">
              <Label>Pricing Type *</Label>
              <Select onValueChange={(v) => editForm.setValue("unit", v as "flat" | "per_hour" | "per_day")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Rate</SelectItem>
                  <SelectItem value="per_hour">Per Hour</SelectItem>
                  <SelectItem value="per_day">Per Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price (₹) *</Label>
              <Input type="number" {...editForm.register("price", { valueAsNumber: true })} placeholder="5000" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...editForm.register("description")} placeholder="Service details..." className="resize-none h-20" />
            </div>

            <DialogFooter className="pt-4">
              <Button variant="ghost" type="button" onClick={() => setEditingAddon(null)}>Cancel</Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                {editForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingAddon} onOpenChange={(v) => { if (!v) setDeletingAddon(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingAddon?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
