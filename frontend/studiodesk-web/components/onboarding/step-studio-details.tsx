"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const studioDetailsSchema = z.object({
    name: z.string().min(2, "Studio name is too short"),
    slug: z.string().min(2, "URL slug is too short").regex(/^[a-z0-9-]+$/, "Only lowercase, numbers and hyphens allowed"),
    phone: z.string().min(10, "Invalid phone number"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    currency: z.string().min(1, "Currency is required"),
})

export type StudioDetailsValues = z.infer<typeof studioDetailsSchema>

interface StepStudioDetailsProps {
    defaultValues: StudioDetailsValues
    onUpdate: (values: StudioDetailsValues) => void
}

export function StepStudioDetails({ defaultValues, onUpdate }: StepStudioDetailsProps) {
    const form = useForm<StudioDetailsValues>({
        resolver: zodResolver(studioDetailsSchema),
        defaultValues,
        mode: "onChange",
    })

    // Auto-generate slug from name
    const name = form.watch("name")
    React.useEffect(() => {
        if (name && !form.getFieldState("slug").isDirty) {
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
            form.setValue("slug", slug, { shouldValidate: true })
        }
    }, [name, form])

    React.useEffect(() => {
        const subscription = form.watch((value) => {
            if (form.formState.isValid) {
                onUpdate(value as StudioDetailsValues)
            }
        })
        return () => subscription.unsubscribe()
    }, [form, onUpdate])

    return (
        <Form {...form}>
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Studio Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your studio name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Studio URL</FormLabel>
                                <div className="flex items-center">
                                    <span className="bg-muted px-3 h-10 flex items-center border border-r-0 rounded-l-xl text-sm text-muted-foreground">
                                        studiodesk.in/
                                    </span>
                                    <FormControl>
                                        <Input className="rounded-l-none" placeholder="your-studio-name" {...field} />
                                    </FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Contact Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="+91 XXXXX XXXXX" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input placeholder="Mumbai, Delhi, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                    <Input placeholder="Maharashtra, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Default Currency</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                                        <SelectItem value="USD">US Dollar ($)</SelectItem>
                                        <SelectItem value="GBP">British Pound (£)</SelectItem>
                                        <SelectItem value="EUR">Euro (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    )
}
