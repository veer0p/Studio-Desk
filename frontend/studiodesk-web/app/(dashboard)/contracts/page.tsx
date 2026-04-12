import { ContractsShell } from "@/components/contracts/ContractsShell"
import { ContractList } from "@/components/contracts/ContractList"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Contracts | StudioDesk",
  description: "Manage your legal contracts and agreements",
}

export default function ContractsPage() {
  return (
    <ContractsShell>
      <ContractList />
    </ContractsShell>
  )
}
