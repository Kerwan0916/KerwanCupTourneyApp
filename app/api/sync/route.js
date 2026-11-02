import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { INITIAL_DATA } from '@/lib/types';

const DATA_FILE_PATH = path.join(process.cwd(), 'tournament_data.json');

// In-memory fallback for serverless environments where disk is ephemeral
let inMemoryData = null;

function readData() {
  if (inMemoryData) return inMemoryData;

  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const content = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      inMemoryData = JSON.parse(content);
      return inMemoryData;
    }
  } catch (err) {
    console.warn("Could not read local file, using fallback:", err.message);
  }

  inMemoryData = INITIAL_DATA;
  return inMemoryData;
}

function writeData(data) {
  inMemoryData = data;
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // In serverless / read-only filesystem environments, writing to disk may fail safely
    console.warn("File write skipped (serverless environment):", err.message);
  }
}

export async function GET() {
  try {
    const data = readData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    body.lastUpdated = new Date().toISOString();
    writeData(body);
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
