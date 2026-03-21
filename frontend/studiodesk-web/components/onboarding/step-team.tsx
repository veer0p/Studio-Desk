"use client"

import * as React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Mail, Plus, Trash2, UserPlus } from "lucide-react"

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const teamSchema = z.object({
    members: z.array(z.object({
        email: z.string().email("Invalid email"),
        role: z.string().min(1, "Role required"),
    })),
})

export type TeamValues = z.infer<typeof teamSchema>

interface StepTeamProps {
    defaultValues: TeamValues
    onUpdate: (values: TeamValues) => void
}

export function StepTeam({ defaultValues, onUpdate }: StepTeamProps) {
    const form = useForm<TeamValues>({
        resolver: zodResolver(teamSchema),
        defaultValues: defaultValues.members.length > 0 ? defaultValues : { members: [] },
        mode: "onChange",
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "members",
    })

    // Sync state upward
    React.useEffect(() => {
        const subscription = form.watch((value) => {
            if (form.formState.isValid) {
                onUpdate(value as TeamValues)
            }
        })
        return () => subscription.unsubscribe()
    }, [form, onUpdate])

    return (
        <div className="space-y-8">
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold">Invite your team</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                        Collaborate with your photographers and editors. You can always add more later from settings.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form className="space-y-6">
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/20 p-4 rounded-2xl border border-transparent hover:border-border transition-all"
                            >
                                <FormField
                                    control={form.control}
                                    name={`members.${index}.email`}
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-6">
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                    <Input className="pl-9" placeholder="colleague@example.com" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name={`members.${index}.role`}
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-5">
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="photographer">Photographer</SelectItem>
                                                    <SelectItem value="editor">Editor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="md:col-span-1 flex justify-center pb-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-danger hover:bg-danger/10"
                                        onClick={() => remove(index)}
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
                        onClick={() => append({ email: "", role: "photographer" })}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add member
                    </Button>

                    {fields.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground italic">
                            No members added yet. You can skip this step for now.
                        </p>
                    )}
                </form>
            </Form>
        </div>
    )
}
