import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    message: "Welcome to Portivo API",
    version: "1.0",
  });
}
