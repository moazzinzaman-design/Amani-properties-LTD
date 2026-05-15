/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const targetDir = '/Users/moazzinzaman/Desktop/CODING AI';
    
    // Check if directory exists
    try {
      await fs.access(targetDir);
    } catch {
      return NextResponse.json({ success: false, error: 'Directory not found at ' + targetDir, projects: [] });
    }

    const items = await fs.readdir(targetDir, { withFileTypes: true });
    
    // Filter out hidden folders and non-directories
    const folders = items.filter(item => item.isDirectory() && !item.name.startsWith('.'));
    
    const projects = await Promise.all(folders.map(async (folder) => {
      const fullPath = path.join(targetDir, folder.name);
      
      // Get basic stats to make it feel real
      const stats = await fs.stat(fullPath);
      let isNode = false;
      let isPython = false;
      
      try {
        const contents = await fs.readdir(fullPath);
        isNode = contents.includes('package.json');
        isPython = contents.includes('requirements.txt') || contents.includes('main.py');
      } catch {
        // ignore read errors on specific folders
      }

      // Determine tech stack based on contents
      let stack = ['Unknown'];
      if (isNode) stack = ['Node.js', 'React', 'TypeScript'];
      else if (isPython) stack = ['Python', 'AI Model'];
      else stack = ['Static', 'HTML/CSS'];

      // Assign a random health status for UI flair
      const statuses = ['ONLINE', 'BUILDING', 'READY', 'OFFLINE', 'SYNCING'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Parse Category from Name (e.g., [APPS] Something -> Category: APPS, Name: Something)
      let category = 'Other';
      let cleanName = folder.name;
      const match = folder.name.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) {
        category = match[1].toUpperCase();
        cleanName = match[2];
        if (category === 'BIZ') category = 'BUSINESS';
      }

      return {
        id: Buffer.from(folder.name).toString('base64'),
        name: cleanName,
        originalName: folder.name,
        category,
        path: fullPath,
        lastModified: stats.mtime,
        size: stats.size, // in bytes
        stack,
        status,
        isNode,
        isPython
      };
    }));

    // Sort by most recently modified
    projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

    return NextResponse.json({ success: true, count: projects.length, projects });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message, projects: [] }, { status: 500 });
  }
}
