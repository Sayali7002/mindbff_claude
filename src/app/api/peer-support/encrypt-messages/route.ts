import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/app/api/auth-middleware';
import { migrateMessagesToEncrypted, checkMigrationStatus } from '@/lib/peer-support/encryption-migration';

// Check migration status
export async function GET(request: NextRequest) {
  return withAuth(request, async (userId, request) => {
    try {
      const status = await checkMigrationStatus();
      
      if (!status.success) {
        return NextResponse.json(
          { error: status.error },
          { status: 500 }
        );
      }
      
      return NextResponse.json(status);
      
    } catch (error) {
      console.error('Error checking migration status:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

// Run migration
export async function POST(request: NextRequest) {
  return withAuth(request, async (userId, request) => {
    try {
      const result = await migrateMessagesToEncrypted();
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        message: 'Migration completed successfully',
        ...result
      });
      
    } catch (error) {
      console.error('Error running migration:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
} 