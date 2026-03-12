'use server'

import si from 'systeminformation';
import os from 'os';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics: string[];
}

export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    throw new Error('GitHub token not configured');
  }

  const response = await fetch('https://api.github.com/users/moazzinzaman-design/repos?sort=updated&per_page=20', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
    },
    next: { revalidate: 300 }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const repos = await response.json();
  
  return repos.map((repo: GitHubRepo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    language: repo.language,
    updated_at: repo.updated_at,
    topics: repo.topics || [],
  }));
}

/* ── System Health (real metrics via systeminformation) ── */
export interface SystemMetrics {
  cpuLoad: number;
  memUsedPercent: number;
  memFreeGb: number;
  memTotalGb: number;
  uptime: number;
}

export async function getSystemHealth(): Promise<SystemMetrics> {
  try {
    const [cpu, mem] = await Promise.all([
      si.currentLoad(),
      si.mem(),
    ]);

    return {
      cpuLoad: Math.round(cpu.currentLoad),
      memUsedPercent: Math.round((mem.used / mem.total) * 100),
      memFreeGb: Math.round((mem.free / 1073741824) * 10) / 10,
      memTotalGb: Math.round((mem.total / 1073741824) * 10) / 10,
      uptime: Math.round(os.uptime()),
    };
  } catch {
    return { cpuLoad: 0, memUsedPercent: 0, memFreeGb: 0, memTotalGb: 0, uptime: 0 };
  }
}
