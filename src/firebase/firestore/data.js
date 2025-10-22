// src/firebase/firestore/data.js
import { initializeFirebaseServer } from '../server/index.js';
import { collection, getDocs, query, where, getDoc, doc, collectionGroup } from 'firebase/firestore';

// Helper function to parse multiplier string to a number
function parseMultiplier(multiplier) {
    if (typeof multiplier !== 'string') return 0;
    return parseFloat(multiplier.replace('x', ''));
}

export async function getGameData(worldName, category, itemName) {
    const { firestore } = initializeFirebaseServer();
    try {
        let worldDocs = [];

        // If a world name is provided, try to find that specific world
        if (worldName) {
            const lowerCaseWorldName = worldName.toLowerCase();
            const worldsRef = collection(firestore, 'worlds');
            const worldQuery = query(worldsRef, where('name', '>=', worldName), where('name', '<=', worldName + '\uf8ff'));
            const worldQuerySnapshot = await getDocs(worldQuery);

            if (!worldQuerySnapshot.empty) {
                let targetWorldDoc = worldQuerySnapshot.docs.find(doc => doc.data().name.toLowerCase().startsWith(lowerCaseWorldName));
                if (!targetWorldDoc) {
                    targetWorldDoc = worldQuerySnapshot.docs.find(doc => doc.data().name.toLowerCase().includes(lowerCaseWorldName));
                }
                if (targetWorldDoc) {
                    worldDocs.push(targetWorldDoc);
                }
            }
        }

        // If no specific world was found or no world name was given, search across all worlds
        if (worldDocs.length === 0) {
            const allWorldsSnapshot = await getDocs(collection(firestore, 'worlds'));
            worldDocs = allWorldsSnapshot.docs;
        }
        
        if (worldDocs.length === 0) {
            return { error: `Could not find any worlds.` };
        }

        const results = [];
        const lowerCaseItemName = itemName ? itemName.toLowerCase().replace(/ /g, '-') : null;

        for (const worldDoc of worldDocs) {
            const categoryCollectionRef = collection(worldDoc.ref, category);
            let itemsSnapshot;

            if (lowerCaseItemName) {
                // Try fetching by ID first (more efficient)
                const itemRef = doc(categoryCollectionRef, lowerCaseItemName);
                const itemSnap = await getDoc(itemRef);
                
                if (itemSnap.exists()) {
                     itemsSnapshot = { docs: [itemSnap] };
                } else {
                    // Fallback to querying by name
                    const nameQuery = query(categoryCollectionRef, where('name', '>=', itemName), where('name', '<=', itemName + '\uf8ff'));
                    itemsSnapshot = await getDocs(nameQuery);
                }
            } else {
                itemsSnapshot = await getDocs(categoryCollectionRef);
            }
            
            if (!itemsSnapshot.empty) {
                 for (const itemDoc of itemsSnapshot.docs) {
                    const itemData = {
                        id: itemDoc.id,
                        world: worldDoc.data().name, // Add world name to result
                        ...itemDoc.data()
                    };

                    // If it's a power, fetch its sub-collection of stats
                    if (category === 'powers' && itemDoc.ref) {
                        const statsCollectionRef = collection(itemDoc.ref, 'stats');
                        const statsSnapshot = await getDocs(statsCollectionRef);
                        if (!statsSnapshot.empty) {
                            const statsData = statsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                            statsData.sort((a, b) => parseMultiplier(a.multiplier) - parseMultiplier(b.multiplier));
                            itemData['stats'] = statsData;
                        }
                    }
                    results.push(itemData);
                }
            }
        }
        
        if (results.length === 0) {
             return { error: `No items found in category "${category}" ${itemName ? `with name containing "${itemName}"` : ''} in any searched world.` };
        }

        return results;

    } catch (error) {
        console.error('Error fetching game data:', error);
        return { error: 'An error occurred while fetching data from Firestore.' };
    }
}


export async function getUpdateLog() {
    const { firestore } = initializeFirebaseServer();
    try {
        const logRef = doc(firestore, 'bot_config', 'latestUpdateLog');
        const docSnap = await getDoc(logRef);

        if (!docSnap.exists()) {
            return { error: 'Nenhum log de atualização encontrado.' };
        }
        const data = docSnap.data();
        return {
            title: data.title,
            content: data.content
        };
    } catch (error) {
        console.error('Error fetching update log:', error);
        return { error: 'An error occurred while fetching the update log.' };
    }
}