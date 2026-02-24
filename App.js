import { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
} from 'react-native';
import { Pedometer } from 'expo-sensors';

const CALORIES_PER_STEP = 0.04;

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  return { start, end };
};

export default function App() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [steps, setSteps] = useState(0);
  const [manualSteps, setManualSteps] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let subscription;

    const setup = async () => {
      const available = await Pedometer.isAvailableAsync();
      setIsAvailable(available);

      if (!available) {
        setError('Pedometer is unavailable on this device. Add steps manually below.');
        return;
      }

      const { start, end } = getTodayRange();

      try {
        const result = await Pedometer.getStepCountAsync(start, end);
        setSteps(result.steps || 0);
      } catch {
        setError('Could not fetch today\'s steps. Add steps manually below.');
      }

      subscription = Pedometer.watchStepCount((result) => {
        setSteps((current) => current + result.steps);
      });
    };

    setup();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const manualStepValue = useMemo(() => {
    const parsed = Number.parseInt(manualSteps, 10);
    return Number.isNaN(parsed) ? 0 : Math.max(parsed, 0);
  }, [manualSteps]);

  const totalSteps = steps + manualStepValue;
  const caloriesBurned = (totalSteps * CALORIES_PER_STEP).toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.card}>
        <Text style={styles.title}>Step to Calory Counter</Text>
        <Text style={styles.subtitle}>Track daily steps and estimated calories burned</Text>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Steps Today</Text>
          <Text style={styles.metricValue}>{totalSteps}</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Calories Burned</Text>
          <Text style={styles.metricValue}>{caloriesBurned} kcal</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.inputLabel}>Manual step adjustment</Text>
        <TextInput
          style={styles.input}
          value={manualSteps}
          onChangeText={setManualSteps}
          keyboardType="number-pad"
          placeholder="Enter extra steps"
          placeholderTextColor="#9ca3af"
        />

        <Pressable style={styles.resetButton} onPress={() => setManualSteps('')}>
          <Text style={styles.resetText}>Clear Manual Steps</Text>
        </Pressable>

        <Text style={styles.note}>
          Calories are estimated using 0.04 kcal per step.
          {!isAvailable ? ' Automatic step counting is off for this device.' : ''}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
    marginBottom: 18,
  },
  metricBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  metricLabel: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '600',
  },
  metricValue: {
    marginTop: 6,
    color: '#1e3a8a',
    fontSize: 30,
    fontWeight: '700',
  },
  inputLabel: {
    marginTop: 8,
    marginBottom: 6,
    color: '#374151',
    fontWeight: '600',
  },
  input: {
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  resetButton: {
    marginTop: 10,
    backgroundColor: '#111827',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  resetText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    marginBottom: 8,
    color: '#b91c1c',
  },
  note: {
    marginTop: 14,
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 18,
  },
});
