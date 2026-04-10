import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#0f172a' },
        headerTintColor: '#fff',
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#e11d48',
        tabBarInactiveTintColor: '#64748b',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: 'Movies',
          tabBarLabel: 'Movies',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="movie-roll" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          headerTitle: 'My Tickets',
          tabBarLabel: 'Tickets',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="ticket-confirmation" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide explore if it exists
        }}
      />
    </Tabs>
  );
}
