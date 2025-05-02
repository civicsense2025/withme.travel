import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { testDatabaseConnection, testAuthentication } from '../utils/databaseTest';
import { checkSupabaseHealth, getSupabaseDebugInfo } from '../utils/supabase';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../hooks/useAuth';

export default function DiagnosticScreen({ navigation }: any) {
  const { user, isLoading: authLoading } = useAuth();
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [dbHealth, setDbHealth] = useState<any>(null);

  useEffect(() => {
    checkNetworkStatus();

    // Setup network listener
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkInfo(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkNetworkStatus = async () => {
    const state = await NetInfo.fetch();
    setNetworkInfo(state);
  };

  const runDiagnostics = async () => {
    setIsRunningTests(true);

    try {
      // Run database tests
      const connectionTest = await testDatabaseConnection();

      // Run auth tests
      const authTest = await testAuthentication();

      // Check supabase health
      const health = await checkSupabaseHealth();
      setDbHealth(health);

      // Set all results
      setTestResults({
        connection: connectionTest,
        auth: authTest,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error running diagnostics:', error);
      Alert.alert('Error', 'Failed to run diagnostics');
    } finally {
      setIsRunningTests(false);
    }
  };

  const renderStatusItem = (title: string, status: boolean | null | undefined, details?: any) => {
    let statusColor = '#999';
    let statusText = 'Unknown';

    if (status === true) {
      statusColor = '#4CAF50';
      statusText = 'OK';
    } else if (status === false) {
      statusColor = '#F44336';
      statusText = 'Failed';
    }

    return (
      <View style={styles.statusItem}>
        <Text style={styles.statusTitle}>{title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
        {details && (
          <TouchableOpacity
            onPress={() => Alert.alert('Details', JSON.stringify(details, null, 2))}
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>System Diagnostics</Text>

      {/* Network Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Status</Text>
        <View style={styles.statusItem}>
          <Text style={styles.statusTitle}>Connected</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: networkInfo?.isConnected ? '#4CAF50' : '#F44336',
              },
            ]}
          >
            <Text style={styles.statusText}>{networkInfo?.isConnected ? 'Yes' : 'No'}</Text>
          </View>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusTitle}>Type</Text>
          <Text style={styles.statusValue}>{networkInfo?.type || 'Unknown'}</Text>
        </View>

        {networkInfo?.details && (
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Network Details', JSON.stringify(networkInfo?.details, null, 2))
            }
            style={styles.detailsButton}
          >
            <Text style={styles.detailsButtonText}>Network Details</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Auth Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Authentication Status</Text>
        <View style={styles.statusItem}>
          <Text style={styles.statusTitle}>Auth State</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: authLoading ? '#FFC107' : user ? '#4CAF50' : '#F44336',
              },
            ]}
          >
            <Text style={styles.statusText}>
              {authLoading ? 'Loading' : user ? 'Authenticated' : 'Not Authenticated'}
            </Text>
          </View>
        </View>

        {user && (
          <View style={styles.statusItem}>
            <Text style={styles.statusTitle}>User ID</Text>
            <Text style={styles.statusValue}>{user.id}</Text>
          </View>
        )}
      </View>

      {/* Database Status */}
      {dbHealth && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Status</Text>
          {renderStatusItem('Client Initialized', dbHealth.isClientInitialized)}
          {renderStatusItem('DB Connection', dbHealth.dbConnectionStatus === 'connected', {
            status: dbHealth.dbConnectionStatus,
          })}

          <View style={styles.statusItem}>
            <Text style={styles.statusTitle}>Client Age</Text>
            <Text style={styles.statusValue}>
              {dbHealth.clientAge ? `${dbHealth.clientAge}s` : 'N/A'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusTitle}>Creation Count</Text>
            <Text style={styles.statusValue}>{dbHealth.creationCount}</Text>
          </View>

          {dbHealth.errors && dbHealth.errors.length > 0 && (
            <TouchableOpacity
              onPress={() => Alert.alert('Errors', JSON.stringify(dbHealth.errors, null, 2))}
              style={[styles.detailsButton, { backgroundColor: '#F44336' }]}
            >
              <Text style={[styles.detailsButtonText, { color: '#fff' }]}>
                View Errors ({dbHealth.errors.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Test Results */}
      {testResults && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Results</Text>

          <Text style={styles.subsectionTitle}>Database Connection</Text>
          {renderStatusItem('Client Created', testResults.connection.clientCreated)}
          {renderStatusItem('Session Fetched', testResults.connection.sessionFetched)}
          {renderStatusItem('Query Executed', testResults.connection.queryExecuted)}

          {Object.keys(testResults.connection.errors).length > 0 && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  'Connection Errors',
                  JSON.stringify(testResults.connection.errors, null, 2)
                )
              }
              style={[styles.detailsButton, { backgroundColor: '#F44336' }]}
            >
              <Text style={[styles.detailsButtonText, { color: '#fff' }]}>
                View Connection Errors
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.subsectionTitle}>Authentication</Text>
          {renderStatusItem('Guest Session', testResults.auth.guestSessionFetched)}
          {renderStatusItem('Anonymous Auth', testResults.auth.anonymousSessionCreated)}

          {Object.keys(testResults.auth.errors).length > 0 && (
            <TouchableOpacity
              onPress={() =>
                Alert.alert('Auth Errors', JSON.stringify(testResults.auth.errors, null, 2))
              }
              style={[styles.detailsButton, { backgroundColor: '#F44336' }]}
            >
              <Text style={[styles.detailsButtonText, { color: '#fff' }]}>View Auth Errors</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.timestamp}>
            Tests run at: {new Date(testResults.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, isRunningTests && styles.disabledButton]}
          onPress={runDiagnostics}
          disabled={isRunningTests}
        >
          {isRunningTests ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.actionButtonText}>Run Diagnostics</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={checkNetworkStatus}>
          <Text style={styles.actionButtonText}>Refresh Network</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#555',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusTitle: {
    fontSize: 16,
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsButton: {
    marginTop: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    color: '#555',
    fontSize: 14,
  },
  timestamp: {
    marginTop: 16,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  actionsSection: {
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#0066ff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
});
