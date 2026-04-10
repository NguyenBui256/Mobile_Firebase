import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { auth, db } from '../../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { MaterialIcons } from '@expo/vector-icons';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.log('Notifications not supported');
}

const SHOW_TIMES = ['10:00 AM', '01:30 PM', '04:15 PM', '07:30 PM', '10:00 PM'];

export default function MovieDetailScreen() {
  const { id, title, image, description, duration } = useLocalSearchParams();
  const [selectedTime, setSelectedTime] = useState('');
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    // Request permission for push notifications
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need push notification permission to remind you about the showtime.');
      }
    };
    requestPermissions();
  }, []);

  const handleBookTicket = async () => {
    if (!selectedTime) {
      Alert.alert('Please select a time', 'You must select a showtime to proceed.');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Not Logged In', 'Please login to book tickets.');
      router.replace('/');
      return;
    }

    setBooking(true);
    try {
      // 1. Save ticket to Firebase Firestore
      const docRef = await addDoc(collection(db, 'tickets'), {
        userId: auth.currentUser.uid,
        movieId: id,
        movieTitle: title,
        showTime: selectedTime,
        bookingDate: new Date().toISOString(),
        status: 'Confirmed'
      });

      // 2. Schedule local push notification 
      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Showtime Reminder! 🍿",
            body: `Your movie "${title}" is starting soon at ${selectedTime}. Grab your popcorn!`,
            sound: true,
          },
          trigger: {
            seconds: 10,
          },
        });
      } catch (e) {
        console.warn('Notifications not supported in this environment');
      }

      Alert.alert('Ticket Booked!', 'Your ticket has been booked successfully and saved. You will receive a notification reminder.');
      router.back();
    } catch (error: any) {
      console.error(error);
      Alert.alert('Failed to book', error.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: image as string }} style={styles.image} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.duration}>Duration: {duration}</Text>

        <Text style={styles.sectionTitle}>Synopsis</Text>
        <Text style={styles.description}>{description}</Text>

        <Text style={styles.sectionTitle}>Select Showtime</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeContainer}>
          {SHOW_TIMES.map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeChip, selectedTime === time && styles.timeChipSelected]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.bookButton, (!selectedTime || booking) && styles.bookButtonDisabled]}
          onPress={handleBookTicket}
          disabled={!selectedTime || booking}
        >
          {booking ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  imageContainer: {
    position: 'relative',
    height: 400,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  content: {
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#0f172a',
    marginTop: -30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  duration: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 24,
    marginBottom: 24,
  },
  timeContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  timeChip: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginRight: 12,
    backgroundColor: '#1e293b',
  },
  timeChipSelected: {
    backgroundColor: '#e11d48',
    borderColor: '#e11d48',
  },
  timeText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  timeTextSelected: {
    color: '#ffffff',
  },
  bookButton: {
    backgroundColor: '#e11d48',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonDisabled: {
    backgroundColor: '#475569',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
