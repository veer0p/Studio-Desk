"use client"

import { ProposalsShell } from "@/components/proposals/ProposalsShell"
import { ProposalList } from "@/components/proposals/ProposalList"

export default function ProposalsPage() {
  return (
    <ProposalsShell>
      <ProposalList />
    </ProposalsShell>
  )
}
