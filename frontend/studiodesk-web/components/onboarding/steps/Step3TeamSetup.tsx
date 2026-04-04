"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step3Schema, Step3Data } from "@/lib/validations/onboarding"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { motion } from "framer-motion"

const ROLES = [
  "Photographer", "Videographer", "Editor", "Drone Operator", "Assistant", "Admin"
]

interface Step3Props {
  initialData?: Step3Data;
  onNext: (data: Step3Data) => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function Step3TeamSetup({ initialData, onNext, onBack, onSkip }: Step3Props) {
  const form = useForm({
    resolver: zodResolver(step3Schema),
    defaultValues: initialData || {
      members: [
        { name: "", role: undefined, email: "" }
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members"
  })

  const onSubmit = (data: Step3Data) => {
    onNext(data)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
            Build your team
          </h2>
          <p className="text-base text-muted-foreground">
            Add your partners, photographers, or editors. You can always manage your team later.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 border-primary/30 text-primary hover:bg-primary/5 transition-all text-xs font-bold uppercase tracking-wider"
          onClick={() => append({ name: "", role: undefined, email: "" })}
          disabled={fields.length >= 10}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Member
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4">
            {fields.map((field, index) => (
              <motion.div 
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-4">
                    <FormField
                      control={form.control}
                      name={`members.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. John Doe" 
                              className="h-11 bg-background/40 border-white/10 focus:border-primary/40 transition-all" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="md:col-span-3">
                    <FormField
                      control={form.control}
                      name={`members.${index}.role`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-background/40 border-white/10 focus:border-primary/40 transition-all">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ROLES.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-4">
                    <FormField
                      control={form.control}
                      name={`members.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. john@example.com" 
                              type="email" 
                              className="h-11 bg-background/40 border-white/10 focus:border-primary/40 transition-all" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-1 pt-6 flex justify-end md:justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground/40 hover:text-danger hover:bg-danger/10 h-10 w-10 transition-all rounded-full"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1 && !form.watch(`members.0.name`)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {fields.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
              <p className="text-muted-foreground text-sm">No members added yet. You can skip this for now.</p>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button variant="ghost" type="button" onClick={onBack} className="h-12 px-6 w-full sm:w-auto hover:bg-white/5 transition-colors">
              Back
            </Button>
            <div className="flex w-full sm:w-auto gap-3">
              <Button type="button" variant="secondary" onClick={onSkip} className="h-12 px-6 flex-1 sm:flex-none hover:bg-secondary/80 transition-colors">
                Skip for now
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
