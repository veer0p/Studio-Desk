"use client"

import * as React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Zap } from "lucide-react"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const servicesSchema = z.object({
    services: z.array(z.object({
        name: z.string().min(2, "Name required"),
        price: z.number().min(0, "Price must be >= 0"),
        duration: z.number().min(1, "Duration required"),
    })).min(1, "Add at least one service"),
})

export type ServicesValues = z.infer<typeof servicesSchema>

const SUGGESTIONS = [
    { name: "Wedding Photography", price: 50000, duration: 480 },
    { name: "Portrait Session", price: 5000, duration: 60 },
    { name: "Commercial Shoot", price: 25000, duration: 240 },
    { name: "Event Coverage", price: 15000, duration: 180 },
]

interface StepServicesProps {
    defaultValues: ServicesValues
    onUpdate: (values: ServicesValues) => void
}

export function StepServices({ defaultValues, onUpdate }: StepServicesProps) {
    const form = useForm<ServicesValues>({
        resolver: zodResolver(servicesSchema),
        defaultValues: defaultValues.services.length > 0 ? defaultValues : { services: [{ name: "", price: 0, duration: 60 }] },
        mode: "onChange",
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "services",
    })

    // Sync state upward
    React.useEffect(() => {
        const subscription = form.watch((value) => {
            if (form.formState.isValid) {
                onUpdate(value as ServicesValues)
            }
        })
        return () => subscription.unsubscribe()
    }, [form, onUpdate])

    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    Quick add suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                        <Badge
                            key={s.name}
                            variant="outline"
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1 text-xs"
                            onClick={() => append(s)}
                        >
                            + {s.name}
                        </Badge>
                    ))}
                </div>
            </div>

            <Form {...form}>
                <form className="space-y-6">
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="group relative grid grid-cols-1 md:grid-cols-12 gap-4 bg-muted/30 p-4 rounded-2xl border border-transparent hover:border-border transition-all"
                            >
                                <FormField
                                    control={form.control}
                                    name={`services.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-6">
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Service Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Wedding, Portrait..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`services.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-3">
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Price (₹)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`services.${index}.duration`}
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Mins</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="md:col-span-1 flex items-end justify-center pb-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-danger hover:bg-danger/10"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-2 py-6 rounded-2xl"
                        onClick={() => append({ name: "", price: 0, duration: 60 })}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add custom service
                    </Button>
                </form>
            </Form>
        </div>
    )
}
