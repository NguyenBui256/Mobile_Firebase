import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Ticket = {
  id: string;
  movieId: string;
  movieTitle: string;
  showTime: string;
  bookingDate: string;
  status: string;
};

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'tickets'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetched: Ticket[] = [];
      querySnapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      // Sort in memory instead of composite index for simplicity
      fetched.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
      setTickets(fetched);
    } catch (error) {
      console.error("Error fetching tickets: ", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.movieTitle}>{item.movieTitle}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.ticketDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={20} color="#94a3b8" />
          <Text style={styles.detailText}>Showtime: {item.showTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar-outline" size={20} color="#94a3b8" />
          <Text style={styles.detailText}>Booked: {new Date(item.bookingDate).toLocaleDateString()}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="ticket-confirmation-outline" size={20} color="#94a3b8" />
          <Text style={styles.detailText}>Ticket ID: {item.id.substring(0, 8).toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e11d48" />
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="ticket-outline" size={64} color="#334155" />
          <Text style={styles.emptyText}>No tickets booked yet.</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicket}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e11d48" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 6,
    borderLeftColor: '#e11d48',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f8fafc',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  statusText: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  ticketDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    color: '#cbd5e1',
    fontSize: 15,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 18,
    marginTop: 16,
  },
});
