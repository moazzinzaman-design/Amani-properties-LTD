/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const { projects } = await req.json();
    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: 'Invalid projects array' }, { status: 400 });
    }

    const statuses = await Promise.all(
      projects.map(async (project) => {
        try {
          if (!fs.existsSync(project.path)) {
            return { id: project.id, status: 'not_found', error: 'Directory not found' };
          }

          // Check if it's a git repo
          const isGit = fs.existsSync(path.join(project.path, '.git'));
          if (!isGit) {
            return { id: project.id, status: 'no_git', error: 'Not a git repository' };
          }

          // Get branch
          const { stdout: branchOut } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: project.path });
          const branch = branchOut.trim();

          // Get status (clean/dirty)
          const { stdout: statusOut } = await execAsync('git status --porcelain', { cwd: project.path });
          const isDirty = statusOut.trim().length > 0;

          // Check remote sync status (requires fetch, but we do a fast check without fetch first to avoid blocking)
          let syncStatus = 'unknown';
          try {
            const { stdout: syncOut } = await execAsync('git rev-list --left-right --count HEAD...@{u}', { cwd: project.path });
            const [ahead, behind] = syncOut.trim().split('\t').map(Number);
            if (ahead === 0 && behind === 0) syncStatus = 'up_to_date';
            else syncStatus = `${ahead} ahead, ${behind} behind`;
          } catch (e) {
            // No upstream configured or remote unaccessible
            syncStatus = 'no_upstream';
          }

          // Check if package.json exists
          const hasPackageJson = fs.existsSync(path.join(project.path, 'package.json'));

          return {
            id: project.id,
            status: 'ok',
            branch,
            isDirty,
            syncStatus,
            hasPackageJson
          };
        } catch (error: any) {
          return { id: project.id, status: 'error', error: error.message };
        }
      })
    );

    return NextResponse.json({ statuses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
