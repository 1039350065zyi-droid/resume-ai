export function calculateOverallScore(
  keywordScore: number,
  experienceScore: number,
  hardMet: boolean,
  industryScore: number
): number {
  const hardScore = hardMet ? 100 : 40;
  return Math.round(
    keywordScore * 0.3 +
    experienceScore * 0.35 +
    hardScore * 0.2 +
    industryScore * 0.15
  );
}

export function getScoreLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-100';
  if (score >= 60) return 'bg-yellow-100';
  return 'bg-red-100';
}
