// src/utils/roblox.js
import axios from 'axios';

export async function usernameToId(username) {
  if (!username) return null;
  try {
    const res = await axios.post('https://users.roblox.com/v1/usernames/users', {
        "usernames": [username],
        "excludeBannedUsers": true
    });
    return res.data?.data?.[0]?.id ?? null;
  } catch(e) {
      console.error(`Erro ao buscar ID do Roblox para o usuário '${username}':`, e.response?.data || e.message);
      return null;
  }
}
