import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as fs from 'fs'
import * as path from 'path'

// Chunked audio streaming with Range headers support
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get song from database
        const song = await prisma.song.findUnique({
            where: { id },
            select: {
                id: true,
                audioUrl: true,
                title: true,
            },
        })

        if (!song) {
            return NextResponse.json(
                { error: 'Song not found' },
                { status: 404 }
            )
        }

        // Check if audioUrl is a local file or external URL
        if (song.audioUrl.startsWith('http://') || song.audioUrl.startsWith('https://')) {
            // For external URLs, redirect to the actual audio file
            return NextResponse.redirect(song.audioUrl)
        }

        // For local files, serve with chunked streaming
        const audioPath = path.join(process.cwd(), 'public', song.audioUrl)

        // Check if file exists
        if (!fs.existsSync(audioPath)) {
            return NextResponse.json(
                { error: 'Audio file not found' },
                { status: 404 }
            )
        }

        const stat = fs.statSync(audioPath)
        const fileSize = stat.size
        const range = request.headers.get('range')

        // Determine content type from file extension
        const ext = path.extname(audioPath).toLowerCase()
        const contentType = getContentType(ext)

        if (range) {
            // Parse Range header
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

            // Validate range
            if (start >= fileSize) {
                return new Response(null, {
                    status: 416,
                    headers: {
                        'Content-Range': `bytes */${fileSize}`,
                    },
                })
            }

            const chunkSize = end - start + 1
            const stream = fs.createReadStream(audioPath, { start, end })

            // Convert Node.js stream to Web ReadableStream
            const webStream = new ReadableStream({
                start(controller) {
                    stream.on('data', (chunk: string | Buffer) => {
                        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
                        controller.enqueue(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength))
                    })
                    stream.on('end', () => {
                        controller.close()
                    })
                    stream.on('error', (error) => {
                        controller.error(error)
                    })
                },
                cancel() {
                    stream.destroy()
                },
            })

            return new Response(webStream, {
                status: 206,
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': String(chunkSize),
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000',
                },
            })
        } else {
            // No range header, send entire file
            const stream = fs.createReadStream(audioPath)

            const webStream = new ReadableStream({
                start(controller) {
                    stream.on('data', (chunk: string | Buffer) => {
                        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
                        controller.enqueue(new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength))
                    })
                    stream.on('end', () => {
                        controller.close()
                    })
                    stream.on('error', (error) => {
                        controller.error(error)
                    })
                },
                cancel() {
                    stream.destroy()
                },
            })

            return new Response(webStream, {
                status: 200,
                headers: {
                    'Content-Length': String(fileSize),
                    'Content-Type': contentType,
                    'Accept-Ranges': 'bytes',
                    'Cache-Control': 'public, max-age=31536000',
                },
            })
        }
    } catch (error) {
        console.error('Streaming error:', error)
        return NextResponse.json(
            { error: 'Failed to stream audio' },
            { status: 500 }
        )
    }
}

function getContentType(ext: string): string {
    const types: Record<string, string> = {
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
        '.aac': 'audio/aac',
        '.flac': 'audio/flac',
        '.webm': 'audio/webm',
    }
    return types[ext] || 'audio/mpeg'
}
