"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step4Schema, Step4Data } from "@/lib/validations/onboarding"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

const EVENT_TYPES = [
  "Wedding", "Engagement", "Corporate", "Birthday", "Product Shoot", "Other"
]

interface Step4Props {
  initialData?: Step4Data;
  onNext: (data: Step4Data) => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function Step4Packages({ initialData, onNext, onBack, onSkip }: Step4Props) {
  const form = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: initialData || {
      packages: [
        { name: "Standard Wedding", eventType: "Wedding", duration: 8, price: 50000, inclusions: "Photos, 1 Cinematic Video, Drone" }
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "packages"
  })

  const onSubmit = (data: Step4Data) => {
    onNext(data)
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">Your packages</h2>
      <p className="text-sm text-muted-foreground mb-6">Give clients something to pick from — edit anytime from Dashboard</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-5">
            {fields.map((field, index) => (
              <div key={field.id} className="relative p-5 border border-border/60 rounded-xl bg-card shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium text-muted-foreground">Package {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-8 w-8 -m-2"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`packages.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Classic Wedding" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`packages.${index}.eventType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EVENT_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`packages.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Hours)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} placeholder="8" {...field} value={(field.value as any) ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`packages.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (₹) *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground text-sm font-medium">
                              ₹
                            </div>
                            <Input type="number" min={0} placeholder="50000" className="pl-7" {...field} value={(field.value as any) ?? ""} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`packages.${index}.inclusions`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inclusions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List out what's included (e.g. 50 edited photos, 1 min reel)" 
                          className="resize-none h-16" 
                          maxLength={200}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={() => append({ name: "", eventType: undefined as any, duration: undefined as any, price: undefined as any, inclusions: "" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Package
          </Button>

          <div className="pt-8 flex justify-between items-center border-t border-border/40 mt-8">
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <div className="space-x-2 flex">
              <Button type="button" variant="secondary" onClick={onSkip}>
                Skip
              </Button>
              <Button type="submit">
                Continue
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
