// src/utils/raid-data.js
import { lobbyDungeonsArticle } from '../data/wiki-articles/lobby-dungeons.js';
import { world1Data } from '../data/worlds/world-1-data.js';
import { world2Data } from '../data/worlds/world-2-data.js';
import { world3Data } from '../data/worlds/world-3-data.js';
import { world4Data } from '../data/worlds/world-4-data.js';
import { world11Data } from '../data/worlds/world-11-data.js';
import { world12Data } from '../data/worlds/world-12-data.js';
import { world15Data } from '../data/worlds/world-15-data.js';
import { world17Data } from '../data/worlds/world-17-data.js';
import { world18Data } from '../data/worlds/world-18-data.js';
import { world20Data } from '../data/worlds/world-20-data.js';
import { world24Data } from '../data/worlds/world-24-data.js';
import { worldHalloweenData } from '../data/worlds/world-halloween-data.js';

function getDungeonsFromWorlds() {
    const worlds = [
        world1Data, world2Data, world3Data, world4Data, world11Data, 
        world12Data, world15Data, world17Data, world18Data, world20Data,
        world24Data, worldHalloweenData
    ];
    
    return worlds.flatMap(world => {
        if (!world.dungeons || world.dungeons.length === 0) return [];
        
        const worldNumberMatch = world.id.match(/\d+/);
        const category = world.id.includes('halloween') ? 'event' : (worldNumberMatch && parseInt(worldNumberMatch[0]) >= 20 ? 'w20plus' : 'w1-19');

        return world.dungeons.map(dungeon => ({
            label: dungeon.name,
            value: dungeon.name.toLowerCase().replace(/ /g, '_'),
            category
        }));
    });
}

export function getAvailableRaids() {
    const lobbyRaids = lobbyDungeonsArticle.tables.lobbySchedule.rows.map(raid => ({
        label: raid.Dificuldade,
        value: raid.Dificuldade.toLowerCase().replace(/ /g, '_'),
        category: 'w1-19' // Lobby raids are considered early game
    }));

    const worldRaids = getDungeonsFromWorlds();
    
    const newLobby2Raids = [
        { label: 'Hollow Raid', value: 'hollow_raid', category: 'w20plus' },
        { label: 'Adventure Raid', value: 'adventure_raid', category: 'w20plus' },
        { label: 'Torment Raid', value: 'torment_raid', category: 'w20plus' },
        { label: 'Mazel Raid', value: 'mazel_raid', category: 'w20plus' },
    ];
    
    const allRaids = [...lobbyRaids, ...worldRaids, ...newLobby2Raids];
    
    // Categorize
    const categorizedRaids = {
        'w1-19': allRaids.filter(r => r.category === 'w1-19'),
        'w20plus': allRaids.filter(r => r.category === 'w20plus'),
        'event': allRaids.filter(r => r.category === 'event')
    };

    return categorizedRaids;
}
