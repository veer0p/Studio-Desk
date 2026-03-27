"use client"

import { ContractsShell } from "@/components/contracts/ContractsShell"
import { ContractList } from "@/components/contracts/ContractList"

export default function ContractsPage() {
  return (
    <ContractsShell>
      <ContractList />
    </ContractsShell>
  )
}
