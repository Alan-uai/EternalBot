// src/firebase/firestore/data.ts
'use server';

import { initializeFirebaseServer } from '@/firebase/server';
import { collection, getDocs, query, where, doc, getDoc, collectionGroup } from 'firebase/firestore';

// Helper function to parse multiplier string to a number
function parseMultiplier(multiplier: string): number {
    if (typeof multiplier !== 'string') return 0;
    return parseFloat(multiplier.replace('x', ''));
}

export async function getGameData(worldName: string, category: string, itemName?: string) {
  const { firestore } = initializeFirebaseServer();
  try {
    let worldQuery;
    const lowerCaseWorldName = worldName.toLowerCase();
    
    const worldsRef = collection(firestore, 'worlds');
    worldQuery = query(worldsRef, where('name', '>=', worldName), where('name', '<=', worldName + '\uf8ff'));

    const worldQuerySnapshot = await getDocs(worldQuery);
    
    let targetWorldDoc;

    if (!worldQuerySnapshot.empty) {
        targetWorldDoc = worldQuerySnapshot.docs.find(doc => doc.data().name.toLowerCase().startsWith(lowerCaseWorldName));
        if (!targetWorldDoc) {
             targetWorldDoc = worldQuerySnapshot.docs.find(doc => doc.data().name.toLowerCase().includes(lowerCaseWorldName));
        }
        if (!targetWorldDoc) {
            targetWorldDoc = worldQuerySnapshot.docs[0];
        }
    }

    if (!targetWorldDoc) {
      return { error: `World containing name "${worldName}" not found.` };
    }

    const categoryCollectionRef = collection(targetWorldDoc.ref, category);
    
    let itemQuery;
    if (itemName) {
      const lowerCaseItemName = itemName.toLowerCase();
      const allItemsSnapshot = await getDocs(categoryCollectionRef);
      const matchedDocs = allItemsSnapshot.docs.filter(doc => doc.data().name.toLowerCase().includes(lowerCaseItemName));
      
      if(matchedDocs.length === 0) {
        return { error: `No items found in category "${category}" with name containing "${itemName}" for world "${targetWorldDoc.data().name}".` };
      }
      itemQuery = matchedDocs;

    } else {
      const allItemsSnapshot = await getDocs(categoryCollectionRef);
      itemQuery = allItemsSnapshot.docs;
    }

    if (itemQuery.length === 0) {
        return { error: `No items found in category "${category}" ${itemName ? `with name "${itemName}"` : ''} for world "${targetWorldDoc.data().name}".` };
    }
    
    const results = [];
    for (const itemDoc of itemQuery) {
        const itemData = { id: itemDoc.id, ...itemDoc.data() };
        
        if (category === 'powers' && itemDoc.ref) {
            const statsCollectionRef = collection(itemDoc.ref, 'stats');
            const statsSnapshot = await getDocs(statsCollectionRef);
            if (!statsSnapshot.empty) {
                const statsData = statsSnapshot.docs.map(d => ({id: d.id, ...d.data()}));
                
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

export async function getAllGameData() {
    const { firestore } = initializeFirebaseServer();
    try {
        const worldsSnapshot = await getDocs(collection(firestore, 'worlds'));
        const worldsData = worldsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const subcollectionNames = ['powers', 'npcs', 'pets', 'dungeons', 'shadows', 'stands', 'accessories'];

        const allDataPromises = worldsData.map(async (world) => {
            const worldWithSubcollections: any = { ...world };
            for (const subcollectionName of subcollectionNames) {
                const subcollectionSnapshot = await getDocs(collection(firestore, 'worlds', world.id, subcollectionName));
                if (!subcollectionSnapshot.empty) {
                    const subcollectionData = await Promise.all(subcollectionSnapshot.docs.map(async (doc) => {
                        const docData:any = { id: doc.id, ...doc.data() };
                        if (subcollectionName === 'powers') {
                             const statsSnapshot = await getDocs(collection(doc.ref, 'stats'));
                             if (!statsSnapshot.empty) {
                                docData.stats = statsSnapshot.docs.map(statDoc => ({ id: statDoc.id, ...statDoc.data() }));
                             }
                        }
                        return docData;
                    }));
                    worldWithSubcollections[subcollectionName] = subcollectionData;
                }
            }
            return worldWithSubcollections;
        });

        const allData = await Promise.all(allDataPromises);
        return allData;

    } catch (error) {
        console.error('Error fetching all game data:', error);
        return { error: 'An error occurred while fetching all game data from Firestore.' };
    }
}
