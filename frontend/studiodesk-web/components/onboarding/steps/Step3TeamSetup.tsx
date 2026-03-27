"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step3Schema, Step3Data } from "@/lib/validations/onboarding"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

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
    <div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">Your team</h2>
      <p className="text-sm text-muted-foreground mb-6">Add members now or skip — you can always do this later</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-3 items-start relative p-4 border border-border/50 rounded-lg bg-muted/20">
                <div className="col-span-12 sm:col-span-4">
                  <FormField
                    control={form.control}
                    name={`members.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Member Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="col-span-12 sm:col-span-4">
                  <FormField
                    control={form.control}
                    name={`members.${index}.role`}
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
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

                <div className="col-span-12 sm:col-span-3">
                  <FormField
                    control={form.control}
                    name={`members.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Email (ops)" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12 sm:col-span-1 flex justify-end sm:justify-center pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1 && !form.watch(`members.0.name`)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {fields.length < 10 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 border-dashed"
              onClick={() => append({ name: "", role: undefined, email: "" })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add another member
            </Button>
          )}

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
