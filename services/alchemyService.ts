import { GoogleGenAI, Type } from "@google/genai";
import { AlchemyElement, CombinationResult } from "../types";

// --- CACHING SYSTEM ---
const CACHE_KEY = 'alchemy_combinations_cache_v2';
let combinationCache: Record<string, CombinationResult> = {};

// Load cache on startup
try {
  const storedCache = localStorage.getItem(CACHE_KEY);
  if (storedCache) {
    combinationCache = JSON.parse(storedCache);
  }
} catch (e) {
  console.warn("Failed to load alchemy cache", e);
}

const saveCache = () => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(combinationCache));
  } catch (e) {
    console.warn("Failed to save alchemy cache", e);
  }
};

// KUNCI PUBLIK (Fallback agar semua orang bisa akses)
const PUBLIC_FALLBACK_KEY = "AIzaSyBaKZiqAu5imDXyzaoCIYhUg8xUYNPaW0s";

const getApiKey = (): string | undefined => {
  try {
    // @ts-ignore
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;
    const localKey = localStorage.getItem("gemini_api_key");
    if (localKey) return localKey;
    if (process.env.API_KEY) return process.env.API_KEY;
    return PUBLIC_FALLBACK_KEY;
  } catch (e) {
    return PUBLIC_FALLBACK_KEY;
  }
};

export const hasValidKey = (): boolean => {
    return !!getApiKey();
};

// ==========================================
// DATABASE RESEP INSTAN (OFFLINE - 0ms Latency)
// Agar terasa seperti Little Alchemy asli
// ==========================================
const RECIPES: Record<string, Partial<AlchemyElement>> = {
  // --- DASAR ---
  "Air|Fire": { name: "Energy", emoji: "⚡", description: "Raw power.", color: "#eab308" },
  "Air|Earth": { name: "Dust", emoji: "🌫️", description: "Fine particles.", color: "#a8a29e" },
  "Air|Water": { name: "Rain", emoji: "🌧️", description: "Water from sky.", color: "#60a5fa" },
  "Earth|Fire": { name: "Lava", emoji: "🌋", description: "Molten rock.", color: "#dc2626" },
  "Earth|Water": { name: "Mud", emoji: "💩", description: "Wet dirt.", color: "#78350f" },
  "Fire|Water": { name: "Steam", emoji: "💨", description: "Hot gas.", color: "#d1d5db" },
  
  // --- CUACA & ALAM ---
  "Air|Steam": { name: "Cloud", emoji: "☁️", description: "Condensed vapor.", color: "#f3f4f6" },
  "Cloud|Water": { name: "Rain", emoji: "🌧️", description: "Falling water.", color: "#3b82f6" },
  "Air|Cloud": { name: "Sky", emoji: "🌌", description: "The atmosphere.", color: "#0ea5e9" },
  "Cloud|Energy": { name: "Storm", emoji: "⛈️", description: "Lightning storm.", color: "#6366f1" },
  "Rain|Rain": { name: "Flood", emoji: "🌊", description: "Overflow.", color: "#1e3a8a" },
  "Earth|Rain": { name: "Plant", emoji: "🌱", description: "Sprout.", color: "#4ade80" },
  "Air|Lava": { name: "Stone", emoji: "🪨", description: "Hard rock.", color: "#57534e" },
  "Lava|Water": { name: "Obsidian", emoji: "⚫", description: "Black glass.", color: "#171717" },
  "Air|Stone": { name: "Sand", emoji: "🏖️", description: "Erosion.", color: "#fde68a" },
  "Fire|Sand": { name: "Glass", emoji: "🥃", description: "Transparent.", color: "#a5f3fc" },
  
  // --- TANAMAN ---
  "Earth|Plant": { name: "Tree", emoji: "🌳", description: "Tall plant.", color: "#166534" },
  "Plant|Plant": { name: "Garden", emoji: "🌻", description: "Flowers.", color: "#bef264" },
  "Flower|Flower": { name: "Bouquet", emoji: "💐", description: "Bunch of flowers.", color: "#f9a8d4" },
  "Tree|Tree": { name: "Forest", emoji: "🌲", description: "Woods.", color: "#14532d" },
  "Plant|Sand": { name: "Cactus", emoji: "🌵", description: "Spiky plant.", color: "#16a34a" },
  "Plant|Water": { name: "Algae", emoji: "🌿", description: "Sea plant.", color: "#065f46" },
  
  // --- ELEMEN SAMA ---
  "Water|Water": { name: "Puddle", emoji: "💧", description: "Small pool.", color: "#60a5fa" },
  "Puddle|Puddle": { name: "Pond", emoji: "🐸", description: "Medium pool.", color: "#3b82f6" },
  "Pond|Pond": { name: "Lake", emoji: "🛶", description: "Large water body.", color: "#2563eb" },
  "Lake|Lake": { name: "Ocean", emoji: "🌊", description: "Vast sea.", color: "#1e40af" },
  "Ocean|Ocean": { name: "Sea", emoji: "🌊", description: "The deep blue.", color: "#1e3a8a" },
  "Fire|Fire": { name: "Heat", emoji: "🔥", description: "Intense warmth.", color: "#ef4444" },
  "Earth|Earth": { name: "Land", emoji: "🏞️", description: "Ground.", color: "#65a30d" },
  "Land|Land": { name: "Continent", emoji: "🗺️", description: "Huge landmass.", color: "#3f6212" },
  "Continent|Continent": { name: "Planet", emoji: "🌍", description: "Earth.", color: "#2563eb" },
  "Air|Air": { name: "Pressure", emoji: "😤", description: "Compressed air.", color: "#94a3b8" },
  "Pressure|Air": { name: "Wind", emoji: "🍃", description: "Moving air.", color: "#a7f3d0" },
  "Stone|Stone": { name: "Boulder", emoji: "🪨", description: "Big rock.", color: "#57534e" },
  "Boulder|Boulder": { name: "Mountain", emoji: "🏔️", description: "High peak.", color: "#525252" },
  "Sand|Sand": { name: "Desert", emoji: "🏜️", description: "Dry land.", color: "#fde68a" },

  // --- KEHIDUPAN ---
  "Earth|Life": { name: "Human", emoji: "🧑", description: "Person.", color: "#fca5a5" },
  "Life|Mud": { name: "Bacteria", emoji: "🦠", description: "Germs.", color: "#84cc16" },
  "Life|Water": { name: "Fish", emoji: "🐟", description: "Swimmer.", color: "#38bdf8" },
  "Air|Life": { name: "Bird", emoji: "🐦", description: "Flyer.", color: "#0ea5e9" },
  "Life|Stone": { name: "Egg", emoji: "🥚", description: "Start.", color: "#fef3c7" },
  "Egg|Swamp": { name: "Lizard", emoji: "🦎", description: "Reptile.", color: "#4ade80" },
  "Earth|Egg": { name: "Dinosaur", emoji: "🦖", description: "Giant.", color: "#3f6212" },
  "Dinosaur|Time": { name: "Fossil", emoji: "🦴", description: "Bones.", color: "#d6d3d1" },
  "Dinosaur|Meteor": { name: "Extinction", emoji: "💀", description: "Dead.", color: "#000000" },
  "Life|Time": { name: "Death", emoji: "💀", description: "End.", color: "#171717" },
  "Death|Human": { name: "Corpse", emoji: "⚰️", description: "Body.", color: "#525252" },
  "Corpse|Life": { name: "Zombie", emoji: "🧟", description: "Walker.", color: "#65a30d" },
  "Corpse|Earth": { name: "Grave", emoji: "🪦", description: "Rest.", color: "#525252" },
  "Grave|Grave": { name: "Graveyard", emoji: "👻", description: "Spooky.", color: "#3f3f46" },
  "Blood|Human": { name: "Vampire", emoji: "🧛", description: "Dracula.", color: "#9f1239" },
  "Human|Moon": { name: "Werewolf", emoji: "🐺", description: "Beast.", color: "#525252" },
  
  // --- MANUSIA & TEKNOLOGI ---
  "Human|Plant": { name: "Farmer", emoji: "🌾", description: "Worker.", color: "#fcd34d" },
  "Fire|Human": { name: "Firefighter", emoji: "👩‍🚒", description: "Hero.", color: "#ef4444" },
  "Human|Tool": { name: "Engineer", emoji: "👷", description: "Builder.", color: "#fbbf24" },
  "Human|Stone": { name: "Statue", emoji: "🗿", description: "Art.", color: "#78716c" },
  "Glasses|Human": { name: "Nerd", emoji: "🤓", description: "Smart.", color: "#fcd34d" },
  "Fire|Stone": { name: "Metal", emoji: "🤘", description: "Ore.", color: "#94a3b8" },
  "Fire|Mud": { name: "Brick", emoji: "🧱", description: "Block.", color: "#b91c1c" },
  "Brick|Brick": { name: "Wall", emoji: "🧱", description: "Fence.", color: "#7f1d1d" },
  "Wall|Wall": { name: "House", emoji: "🏠", description: "Home.", color: "#b45309" },
  "Home|Human": { name: "Family", emoji: "🏡", description: "Love.", color: "#a16207" },
  "House|House": { name: "Village", emoji: "🏘️", description: "Town.", color: "#a16207" },
  "Village|Village": { name: "City", emoji: "🏙️", description: "Urban.", color: "#64748b" },
  
  "Energy|Metal": { name: "Electricity", emoji: "⚡", description: "Volts.", color: "#eab308" },
  "Electricity|Glass": { name: "Light Bulb", emoji: "💡", description: "Lamp.", color: "#fef08a" },
  "Metal|Steam": { name: "Engine", emoji: "🚂", description: "Motor.", color: "#4b5563" },
  "Engine|Metal": { name: "Car", emoji: "🚗", description: "Auto.", color: "#dc2626" },
  "Air|Car": { name: "Airplane", emoji: "✈️", description: "Jet.", color: "#e2e8f0" },
  "Airplane|Space": { name: "Rocket", emoji: "🚀", description: "Launch.", color: "#ef4444" },
  "Glass|Metal": { name: "Mirror", emoji: "🪞", description: "Look.", color: "#e5e7eb" },
  "Computer|Electricity": { name: "Internet", emoji: "🌐", description: "Web.", color: "#2563eb" },
  "Computer|Human": { name: "AI", emoji: "🤖", description: "Bot.", color: "#10b981" },
  "Human|Metal": { name: "Cyborg", emoji: "🦾", description: "Robo.", color: "#64748b" },
  "Glass|Sand": { name: "Hourglass", emoji: "⏳", description: "Time.", color: "#f59e0b" },
  "Electricity|Wire": { name: "Battery", emoji: "🔋", description: "Charge.", color: "#16a34a" },
  "Paper|Wood": { name: "Book", emoji: "📚", description: "Read.", color: "#8b5cf6" },
  "Tool|Wood": { name: "Paper", emoji: "📄", description: "Sheet.", color: "#f3f4f6" },
};

export const combineElements = async (
  elementA: AlchemyElement,
  elementB: AlchemyElement
): Promise<CombinationResult> => {
  
  // 1. GENERATE KEY (Always sorted A-Z to match RECIPES)
  const names = [elementA.name, elementB.name].sort();
  const key = `${names[0]}|${names[1]}`;
  
  console.log(`[Alchemy] Mixing: ${key}`);

  // 2. CHECK HARDCODED RECIPES (INSTANT SUCCESS)
  if (RECIPES[key]) {
    console.log(`[Alchemy] Found instant recipe for ${key}`);
    const result = RECIPES[key];
    const newElement: AlchemyElement = {
        id: result.name!.toLowerCase().replace(/\s+/g, '-'),
        name: result.name!,
        emoji: result.emoji || '✨',
        description: result.description || `Combined from ${elementA.name} and ${elementB.name}`,
        color: result.color || '#a3a3a3',
        isNew: true
    };
    return { success: true, element: newElement };
  }

  // 3. CHECK CACHE
  if (combinationCache[key]) {
     console.log(`[Alchemy] Found cached recipe for ${key}`);
    return JSON.parse(JSON.stringify(combinationCache[key]));
  }

  // 4. API FALLBACK (INFINITE ALCHEMY)
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("API Key is missing.");
    return { success: false, element: undefined }; 
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    // Use latest flash model for speed
    const model = "gemini-2.5-flash-latest"; 
    
    const prompt = `Mix: ${elementA.name} + ${elementB.name}.
    Return a single JSON object.
    Structure: { "success": true, "name": "Result Name", "emoji": "🔥", "description": "Short desc", "color": "#hex" }
    If invalid mix, success: false. Be creative. NO MARKDOWN.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Increased safety margin. 120 was too low and caused cut-off JSON.
        // 1024 is still very fast but prevents JSON errors.
        maxOutputTokens: 1024, 
        temperature: 1.0, 
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    // Robust JSON extraction:
    // Sometimes models add text before or after the JSON even with responseMimeType
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
       console.error("Invalid JSON format received:", text);
       throw new Error("Invalid JSON format");
    }

    const cleanText = text.substring(jsonStart, jsonEnd + 1);
    const result = JSON.parse(cleanText);
    
    let finalResult: CombinationResult;

    if (result.success && result.name) {
      finalResult = {
        success: true,
        element: {
          id: result.name.toLowerCase().replace(/\s+/g, '-'),
          name: result.name,
          emoji: result.emoji || '✨',
          description: result.description || `Combined from ${elementA.name} and ${elementB.name}`,
          color: result.color || '#a3a3a3',
          isNew: true,
        },
      };
    } else {
      finalResult = { success: false };
    }

    // Save to Cache
    combinationCache[key] = finalResult;
    saveCache();

    return finalResult;

  } catch (error) {
    console.error("Alchemy combination failed:", error);
    // On timeout or error, fail gracefully without crashing
    return { success: false };
  }
};