
import { ref, set, remove, onValue, get } from "firebase/database";
import { db } from "./utils.js";

export function getStationId(station) {
  return station.id || station.stationId || station.url;
}

export async function addFavorite(uid, station, genreId = null) {
  if (!uid) throw new Error("addFavorite requires a uid");
  const id = getStationId(station);
  const favRef = ref(db, `favorites/${uid}/${id}`);
  await set(favRef, {
    stationId: id,
    name: station.name || "",
    url: station.url || "",
    favicon: station.favicon || "",
    homepage: station.homepage || "",
    host: station.host || "",
    api: station.api || "",
    tags: Array.isArray(station.tags) ? station.tags : [],
    addedAt: Date.now(),
  });
}

export async function removeFavorite(uid, stationId) {
  if (!uid || !stationId) return;
  await remove(ref(db, `favorites/${uid}/${stationId}`));
}

export async function getFavorites(uid) {
  if (!uid) return [];
  const snap = await get(ref(db, `favorites/${uid}`));
  const list = [];
  snap.forEach((c) => {
    list.push({ id: c.key, ...c.val() });
  });
  list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
  return list;
}

export function subscribeFavorites(uid, cb) {
  if (!uid) {
    cb([]);
    return () => {};
  }
  const favRef = ref(db, `favorites/${uid}`);
  return onValue(favRef, (snap) => {
    const list = [];
    snap.forEach((c) => {
      list.push({ id: c.key, ...c.val() });
    });
    list.sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    cb(list);
  });
}
