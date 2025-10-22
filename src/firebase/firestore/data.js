// src/firebase/firestore/data.js
import { initializeFirebaseServer } from '../server/index.js';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';

// Helper function to parse multiplier string to a number
function parseMultiplier(multiplier) {
    if (typeof multiplier !== 'string') return 0;
    return parseFloat(multiplier.replace('x', ''));
}

export async function getGameData(worldName, category, itemName) {
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

                itemData['stats'] = statsData;
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