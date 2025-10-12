// src/firebase/firestore/data.ts
'use server';

import { initializeFirebaseServer } from '@/firebase/server';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

const worldNameToId: { [key: string]: string } = {
    "World 1": "world-1",
    "Windmill Island": "world-2",
    "World 3": "world-3",
    "World 4": "world-4",
    "World 7": "world-7",
    "World 8": "world-8",
    "World 10": "world-10",
    "World 11": "world-11",
    "World 13": "world-13",
    "World 15": "world-15",
    "World 20": "world-20"
};

// Helper function to parse multiplier string to a number
function parseMultiplier(multiplier: string): number {
    if (typeof multiplier !== 'string') return 0;
    return parseFloat(multiplier.replace('x', ''));
}

export async function getGameData(worldName: string, category: string, itemName?: string) {
  const { firestore } = initializeFirebaseServer();
  try {
    const worldId = Object.keys(worldNameToId).find(key => key.toLowerCase() === worldName.toLowerCase());
    const finalWorldId = worldId ? worldNameToId[worldId] : worldName.toLowerCase().replace(/\s+/g, '-');

    if (!finalWorldId) {
       return { error: `World "${worldName}" could not be mapped to an ID.` };
    }

    const worldRef = doc(firestore, 'worlds', finalWorldId);
    const worldSnapshot = await getDoc(worldRef);

    if (!worldSnapshot.exists()) {
      return { error: `World with ID "${finalWorldId}" not found.` };
    }

    const categoryCollectionRef = collection(worldRef, category);
    
    let itemQuery;
    if (itemName) {
      itemQuery = query(categoryCollectionRef, where('name', '==', itemName));
    } else {
      itemQuery = categoryCollectionRef;
    }

    const itemSnapshot = await getDocs(itemQuery);

    if (itemSnapshot.empty) {
        return { error: `No items found in category "${category}" ${itemName ? `with name "${itemName}"` : ''} for world "${worldName}".` };
    }
    
    const results = [];
    for (const itemDoc of itemSnapshot.docs) {
        const itemData = { id: itemDoc.id, ...itemDoc.data() };
        
        // Fetch sub-collections like 'stats' for a power
        if (category === 'powers') {
            const statsCollectionRef = collection(itemDoc.ref, 'stats');
            const statsSnapshot = await getDocs(statsCollectionRef);
            if (!statsSnapshot.empty) {
                const statsData = statsSnapshot.docs.map(d => ({id: d.id, ...d.data()}));
                
                // Sort stats by multiplier in ascending order
                statsData.sort((a, b) => parseMultiplier(a.multiplier) - parseMultiplier(b.multiplier));

                (itemData as any)['stats'] = statsData;
            }
        }
        
        results.push(itemData);
    }
    
    return results;

  } catch (error) {
    console.error('Error fetching game data:', error);
    return { error: 'An error occurred while fetching data from Firestore.' };
  }
}

// Kept for backwards compatibility if needed by other parts of the app, but new logic should use getGameData
export async function getRaceStats(raceName: string) {
  return getGameData("World1", "races", raceName);
}

    