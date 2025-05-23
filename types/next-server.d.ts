// Type declarations for next/server
import { NextResponse as NextResponseType } from 'next/server';

declare module 'next/server' {
  export const NextResponse: typeof NextResponseType;
}
