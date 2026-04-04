"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step1Schema, Step1Data } from "@/lib/validations/onboarding"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", 
  "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
]

const STUDIO_TYPES = [
  "Photography Only",
  "Videography Only",
  "Photo + Video",
  "Full Production House"
]

interface Step1Props {
  initialData?: Step1Data;
  onNext: (data: Step1Data) => void;
}

export default function Step1StudioProfile({ initialData, onNext }: Step1Props) {
  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: initialData || {
      name: "",
      city: "",
      tagline: "",
      specialty: undefined,
      state: undefined,
      experience: undefined,
    },
  })

  // Watch tagline to show char count
  const taglineValue = form.watch("tagline") || ""

  const onSubmit = (data: any) => {
    onNext(data as Step1Data)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Tell us about your studio
        </h2>
        <p className="text-base text-muted-foreground">
          Let's start with the basics. This information will be used to brand your client portal.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">Studio Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Moonlight Studios" 
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
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">Studio Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all duration-300">
                        <SelectValue placeholder="Select your specialty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STUDIO_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">City *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Mumbai" 
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
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground/80">State *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all duration-300">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem className="w-full md:w-1/2">
                <FormLabel className="text-sm font-semibold text-foreground/80">Years in Business</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={0} 
                    max={50} 
                    placeholder="e.g. 5" 
                    className="h-12 bg-background/50 border-white/20 focus:border-primary/50 transition-all duration-300" 
                    {...field} 
                    value={(field.value as any) ?? ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-end">
                  <FormLabel className="text-sm font-semibold text-foreground/80">Studio Tagline</FormLabel>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{taglineValue.length} / 120</span>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="e.g. Capturing memories that last a lifetime" 
                    className="min-h-[100px] bg-background/50 border-white/20 focus:border-primary/50 transition-all duration-300 resize-none" 
                    maxLength={120}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-10 flex justify-end">
            <Button size="lg" type="submit" className="px-10 h-12 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
