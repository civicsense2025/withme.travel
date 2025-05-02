import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

export default function DebugScreen({ route }: any) {
  const { debugData } = route.params || {};

  const renderData = (data: any, indent = 0) => {
    if (typeof data !== 'object' || data === null) {
      return <Text style={styles.value}>{String(data)}</Text>;
    }

    return (
      <View style={{ marginLeft: indent * 10 }}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.itemContainer}>
            <Text style={styles.key}>{key}:</Text>
            {renderData(value, indent + 1)}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Debug Information</Text>
        {debugData ? (
          renderData(debugData)
        ) : (
          <Text style={styles.noData}>No debug data provided.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  itemContainer: {
    marginBottom: 8,
  },
  key: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  noData: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    color: '#888',
  },
});
