import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'index-original.html')
    const htmlContent = await readFile(filePath, 'utf-8')
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    return new NextResponse('File not found', { status: 404 })
  }
}

