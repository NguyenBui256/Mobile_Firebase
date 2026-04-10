import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';

const mockMovies = [
  {
    id: 'm1',
    title: 'Dune: Part Two',
    genre: 'Sci-Fi / Adventure',
    duration: '166 min',
    image: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH283vVJ1A4.jpg',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.',
  },
  {
    id: 'm2',
    title: 'Kung Fu Panda 4',
    genre: 'Animation / Action',
    duration: '94 min',
    image: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
    description: 'Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior.',
  },
  {
    id: 'm3',
    title: 'Godzilla x Kong: The New Empire',
    genre: 'Action / Sci-Fi',
    duration: '115 min',
    image: 'https://image.tmdb.org/t/p/w500/tMefBSflR6PGQLvLuPEWpABqIhq.jpg',
    description: 'Following their explosive showdown, Godzilla and Kong must reunite against a colossal undiscovered threat hidden within our world.',
  },
  {
    id: 'm4',
    title: 'Civil War',
    genre: 'Action / Thriller',
    duration: '109 min',
    image: 'https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg',
    description: 'A journey across a dystopian future America, following a team of military-embedded journalists as they race against time.',
  }
];

export default function MoviesScreen() {
  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/');
  };

  const renderMovie = ({ item }: { item: typeof mockMovies[0] }) => (
    <TouchableOpacity 
      style={styles.movieCard}
      onPress={() => router.push({ pathname: '/movie/[id]', params: { id: item.id, title: item.title, image: item.image, description: item.description, duration: item.duration } })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.movieImage} />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieGenre}>{item.genre}</Text>
        <Text style={styles.movieDuration}>{item.duration}</Text>
        <View style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Ticket</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome, {auth.currentUser?.email?.split('@')[0] || 'User'}!</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Now Showing</Text>
      
      <FlatList
        data={mockMovies}
        keyExtractor={(item) => item.id}
        renderItem={renderMovie}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 18,
    color: '#f8fafc',
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: '#e11d48',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  movieImage: {
    width: 120,
    height: 180,
  },
  movieInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
    marginBottom: 4,
  },
  movieGenre: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  movieDuration: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: '#e11d48',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
