export function isAIEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_ENABLED === 'true'
}
