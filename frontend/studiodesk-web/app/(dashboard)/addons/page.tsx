"use client"

import { AddonsShell } from "@/components/addons/AddonsShell"
import { AddonList } from "@/components/addons/AddonList"

export default function AddonsPage() {
  return (
    <AddonsShell>
      <AddonList />
    </AddonsShell>
  )
}
