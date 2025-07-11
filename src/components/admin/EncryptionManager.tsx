'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface MigrationStatus {
  success: boolean;
  needsMigration?: boolean;
  unencryptedCount?: number;
  encryptedCount?: number;
  totalSampled?: number;
  message?: string;
}

interface MigrationResult {
  success: boolean;
  migratedCount?: number;
  skippedCount?: number;
  totalMessages?: number;
  message?: string;
  error?: string;
}

export default function EncryptionManager() {
  const [status, setStatus] = useState<MigrationStatus | null>(null);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/peer-support/encrypt-messages', {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to check status' 
      });
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    setMigrating(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/peer-support/encrypt-messages', {
        method: 'POST',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMigrationResult(data);
      // Refresh status after migration
      await checkStatus();
    } catch (error) {
      console.error('Error running migration:', error);
      setMigrationResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Migration failed' 
      });
    } finally {
      setMigrating(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Message Encryption Manager</h2>
      
      {/* Status Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Migration Status</h3>
        <div className="flex items-center gap-4 mb-4">
          <Button 
            onClick={checkStatus} 
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {loading ? 'Checking...' : 'Check Status'}
          </Button>
        </div>
        
        {status && (
          <div className="space-y-2">
            {status.success ? (
              <>
                {status.needsMigration === false && (
                  <p className="text-green-600 font-medium">
                    ✅ All messages are encrypted
                  </p>
                )}
                {status.needsMigration && (
                  <p className="text-orange-600 font-medium">
                    ⚠️ {status.unencryptedCount} unencrypted messages found
                  </p>
                )}
                {status.unencryptedCount !== undefined && (
                  <p>Unencrypted: {status.unencryptedCount}</p>
                )}
                {status.encryptedCount !== undefined && (
                  <p>Encrypted: {status.encryptedCount}</p>
                )}
                {status.totalSampled !== undefined && (
                  <p>Total sampled: {status.totalSampled}</p>
                )}
              </>
            ) : (
              <p className="text-red-600">Error: {status.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Migration Section */}
      {status?.needsMigration && (
        <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="text-lg font-semibold mb-3 text-orange-800">
            Encryption Migration Required
          </h3>
          <p className="text-orange-700 mb-4">
            Some messages are not encrypted. Click the button below to encrypt all existing messages.
          </p>
          <Button 
            onClick={runMigration} 
            disabled={migrating}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {migrating ? 'Migrating...' : 'Run Migration'}
          </Button>
        </div>
      )}

      {/* Migration Result */}
      {migrationResult && (
        <div className={`p-4 rounded-lg ${
          migrationResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className="text-lg font-semibold mb-3">
            {migrationResult.success ? 'Migration Completed' : 'Migration Failed'}
          </h3>
          {migrationResult.success ? (
            <div className="space-y-2 text-green-800">
              <p>✅ {migrationResult.message}</p>
              {migrationResult.migratedCount !== undefined && (
                <p>Messages migrated: {migrationResult.migratedCount}</p>
              )}
              {migrationResult.skippedCount !== undefined && (
                <p>Messages skipped: {migrationResult.skippedCount}</p>
              )}
              {migrationResult.totalMessages !== undefined && (
                <p>Total messages: {migrationResult.totalMessages}</p>
              )}
            </div>
          ) : (
            <p className="text-red-800">Error: {migrationResult.error}</p>
          )}
        </div>
      )}

      {/* Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">
          About Message Encryption
        </h3>
        <div className="space-y-2 text-blue-700 text-sm">
          <p>• Messages are encrypted using AES-256-GCM encryption</p>
          <p>• Each conversation has a unique encryption key</p>
          <p>• Only participants in the conversation can decrypt messages</p>
          <p>• Messages are encrypted before storing in the database</p>
          <p>• Decryption happens automatically when messages are retrieved</p>
        </div>
      </div>
    </div>
  );
} 