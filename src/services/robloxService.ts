export interface GamepassData {
  id: string;
  name: string;
  price: number;
  username: string;
  placeId: string;
  gameName: string;
  iconUrl: string;
  gameIconUrl: string;
  updated: string;
}

const imageToBase64 = async (url: string | undefined): Promise<string> => {
  if (!url) return '';
  try {
    // Replace Roblox CDN domains with our local local proxy paths to bypass CORS/403
    let targetUrl = url;
    if (url.includes('tr.rbxcdn.com')) {
      targetUrl = url.replace('https://tr.rbxcdn.com', '/roblox-cdn-tr');
    } else if (url.includes('t0.rbxcdn.com')) {
      targetUrl = url.replace('https://t0.rbxcdn.com', '/roblox-cdn-t0');
    }

    const response = await fetch(targetUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Failed to convert image to base64:', e);
    return url || ''; 
  }
};

export const getGamepassDetails = async (id: string, onLog: (msg: string) => void = () => { }): Promise<GamepassData> => {
  try {
    // 1. Get Product Info
    onLog(`Fetching product info for ID: ${id}...`);
    const productResponse = await fetch(`/roblox-api/apis/game-passes/v1/game-passes/${id}/product-info`);
    if (!productResponse.ok) throw new Error(`Product API responded with ${productResponse.status}`);
    const productInfo = await productResponse.json();
    onLog(`Found: "${productInfo.Name}" | Price: ${productInfo.PriceInRobux} Robux`);

    const iconImageAssetId = productInfo.IconImageAssetId;

    // 2. Resolve universeId
    let universeId: number | string | null = productInfo.UniverseId || null;

    if (universeId) {
      onLog(`Universe ID from product-info: ${universeId}`);
    } else {
      onLog('Universe ID missing. Searching via creator games...');
      try {
        const creatorId = productInfo.Creator?.CreatorTargetId || productInfo.Creator?.Id;
        if (!creatorId) throw new Error('No creator metadata found');

        let universeFound = false;
        const gameFetchUrl = `/roblox-api/games/v2/users/${creatorId}/games?accessFilter=Public&limit=50&sortOrder=Asc`;

        const gamesRes = await fetch(gameFetchUrl);
        if (gamesRes.ok) {
          const gamesData = await gamesRes.json();
          for (const game of gamesData.data) {
            const gpRes = await fetch(`/roblox-api/apis/game-passes/v1/universes/${game.id}/game-passes?limit=100`);
            if (!gpRes.ok) continue;
            const gpData = await gpRes.json();
            if (gpData.gamePasses?.some((gp: any) => gp.name === productInfo.Name)) {
              universeId = game.id;
              onLog(`Match found! Universe ID: ${universeId}`);
              universeFound = true;
              break;
            }
          }
        }
      } catch (e: any) {
        onLog(`Warning: ID resolution failed: ${e.message}`);
      }
    }

    // 3. Icons (Converted to base64 for export stability)
    onLog('Preparing images for high-fidelity export...');
    let iconUrl = '';
    if (iconImageAssetId) {
      const assetRes = await fetch(`/roblox-api/thumbnails/v1/assets?assetIds=${iconImageAssetId}&size=420x420&format=Png`);
      if (assetRes.ok) {
        const assetData = await assetRes.json();
        iconUrl = await imageToBase64(assetData.data[0]?.imageUrl);
      }
    }

    let placeId = 'N/A';
    let gameIconUrl = '';
    let gameName = 'Unknown Game';
    if (universeId) {
      const [gameRes, gameThumbRes] = await Promise.all([
        fetch(`/roblox-api/games/v1/games?universeIds=${universeId}`),
        fetch(`/roblox-api/thumbnails/v1/games/icons?universeIds=${universeId}&size=512x512&format=Png`)
      ]);

      if (gameRes.ok) {
        const gameData = await gameRes.json();
        const gameInfo = gameData.data[0];
        gameName = gameInfo?.name || 'Unknown Game';
        placeId = gameInfo?.rootPlaceId ? String(gameInfo.rootPlaceId) : 'N/A';
      }
      if (gameThumbRes.ok) {
        const thumbData = await gameThumbRes.json();
        gameIconUrl = await imageToBase64(thumbData.data[0]?.imageUrl);
      }
    }

    // Fallback if placeId still N/A but it's in productInfo
    if (placeId === 'N/A' && productInfo.PlaceId) {
      placeId = String(productInfo.PlaceId);
    }

    onLog('Synchronization complete ✔');

    return {
      id,
      name: productInfo.Name,
      price: productInfo.PriceInRobux || 0,
      username: productInfo.Creator?.Name || 'Unknown',
      placeId,
      gameName,
      iconUrl,
      gameIconUrl,
      updated: productInfo.Updated || new Date().toISOString()
    };
  } catch (error: any) {
    onLog(`FATAL — ${error.message}`);
    throw error;
  }
};

export const parseGamepassId = (url: string): string | null => {
  const match = url.match(/game-pass\/(\d+)/i);
  return match ? match[1] : null;
};
