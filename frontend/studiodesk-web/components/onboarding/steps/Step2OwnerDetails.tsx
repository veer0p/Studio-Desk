"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step2Schema, Step2Data } from "@/lib/validations/onboarding"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Step2Props {
  initialData?: Step2Data;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

export default function Step2OwnerDetails({ initialData, onNext, onBack }: Step2Props) {
  const form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: initialData || {
      fullName: "",
      phone: "",
      whatsapp: "",
      designation: "",
    },
  })

  const onSubmit = (data: Step2Data) => {
    onNext(data)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          About the Owner
        </h2>
        <p className="text-base text-muted-foreground">
          Tell us a bit about yourself. This helps us personalize your experience.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">Full Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Rahul Sharma" 
                      className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all duration-300" 
                      {...field} 
                      autoFocus 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">Phone Number *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. +91 98765 43210" 
                      className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all duration-300" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">Designation</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Founder & Lead Photographer" 
                      className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all duration-300" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. +91 98765 43210" 
                      className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all duration-300" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center">
            <Button variant="ghost" type="button" onClick={onBack} className="h-12 px-6 hover:bg-white/5 transition-colors">
              Back
            </Button>
            <Button size="lg" type="submit" className="px-10 h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
