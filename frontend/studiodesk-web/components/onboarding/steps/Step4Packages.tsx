"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step4Schema } from "@/lib/validations/onboarding"
import type { Step4Data } from "@/lib/validations/onboarding"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
    defaultValues: initialData as Step4Data || {
      packages: [
        { name: "Standard Wedding", eventType: "Wedding", duration: 8, price: 50000, inclusions: "Photos, 1 Cinematic Video, Drone" }
      ],
    } satisfies Step4Data,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "packages"
  })

  const onSubmit = (data: Step4Data) => {
    onNext(data as Step4Data)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
            Service Packages
          </h2>
          <p className="text-base text-muted-foreground">
            Define your starting packages. This helps clients understand your offerings instantly.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 border-primary/30 text-primary hover:bg-primary/5 transition-all text-xs font-bold uppercase tracking-wider"
          onClick={() => append({ name: "", eventType: "Wedding", duration: 8, price: 0, inclusions: "" })}
          disabled={fields.length >= 5}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Package
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <AnimatePresence mode="popLayout">
              {fields.map((field, index) => (
                <motion.div 
                  key={field.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="relative group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 shadow-xl"
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="px-3 py-1 bg-primary/20 rounded-full">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Package #{index + 1}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground/40 hover:text-danger hover:bg-danger/10 h-8 w-8 transition-all rounded-full"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name={`packages.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Package Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Premium Wedding" className="h-11 bg-background/40 border-white/10 focus:border-primary/40 transition-all" {...field} />
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
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Event Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-background/40 border-white/10 focus:border-primary/40 transition-all">
                                <SelectValue placeholder="Social, Wedding, etc." />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name={`packages.${index}.duration`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Duration (Hours)</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} placeholder="8" className="h-11 bg-background/40 border-white/10 focus:border-primary/40 transition-all" {...field} value={(field.value as any) ?? ""} />
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
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Starting Price (₹) *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground text-sm font-bold">
                                ₹
                              </div>
                              <Input type="number" min={0} placeholder="50000" className="pl-9 h-11 bg-background/40 border-white/10 focus:border-primary/40 transition-all font-bold" {...field} value={(field.value as any) ?? ""} />
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
                      <FormItem className="mt-6">
                        <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">What's included?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g. 2 Photographers, 1 Cinematic Film, All raw images" 
                            className="resize-none h-20 bg-background/40 border-white/10 focus:border-primary/40 transition-all" 
                            maxLength={200}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button variant="ghost" type="button" onClick={onBack} className="h-12 px-6 w-full sm:w-auto hover:bg-white/5 transition-colors text-muted-foreground">
              Back
            </Button>
            <div className="flex w-full sm:w-auto gap-3">
              <Button type="button" variant="secondary" onClick={onSkip} className="h-12 px-6 flex-1 sm:flex-none hover:bg-secondary/80 transition-colors">
                Skip
              </Button>
              <Button size="lg" type="submit" className="h-12 px-10 flex-1 sm:flex-none font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
                Continue
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
