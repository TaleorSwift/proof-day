import type { ProofScoreResult } from '@/lib/types/proof-score'

export async function getProofScore(projectId: string): Promise<ProofScoreResult | null> {
  const res = await fetch(`/api/proof-score/${projectId}`)
  if (!res.ok) throw new Error((await res.json()).error)
  return (await res.json()).data
}
