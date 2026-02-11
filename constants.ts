import { AlchemyElement } from './types';

export const INITIAL_ELEMENTS: AlchemyElement[] = [
  // --- PRIMORDIAL & BASICS ---
  { id: 'water', name: 'Water', emoji: '💧', description: 'Essential for all known forms of life.', color: '#3b82f6' },
  { id: 'fire', name: 'Fire', emoji: '🔥', description: 'Combustion or burning.', color: '#ef4444' },
  { id: 'earth', name: 'Earth', emoji: '🌍', description: 'The substance of the land surface.', color: '#22c55e' },
  { id: 'air', name: 'Air', emoji: '💨', description: 'The invisible mixture of gases.', color: '#cbd5e1' },
  { id: 'time', name: 'Time', emoji: '⏳', description: 'The indefinite continued progress of existence.', color: '#a8a29e' },
  { id: 'void', name: 'Void', emoji: '⚫', description: 'The complete absence of matter.', color: '#000000' },
  { id: 'chaos', name: 'Chaos', emoji: '🌀', description: 'Complete disorder and confusion.', color: '#7c3aed' },
  { id: 'light', name: 'Light', emoji: '💡', description: 'Electromagnetic radiation perceived by the eye.', color: '#fef08a' },
  { id: 'darkness', name: 'Darkness', emoji: '🌑', description: 'The partial or total absence of light.', color: '#171717' },

  // --- NATURE & WEATHER ---
  { id: 'sun', name: 'Sun', emoji: '☀️', description: 'The star around which the earth orbits.', color: '#fcd34d' },
  { id: 'moon', name: 'Moon', emoji: '🌙', description: 'The natural satellite of the earth.', color: '#94a3b8' },
  { id: 'storm', name: 'Storm', emoji: '⚡', description: 'A violent disturbance of the atmosphere.', color: '#6366f1' },
  { id: 'rain', name: 'Rain', emoji: '🌧️', description: 'Moisture condensed from the atmosphere.', color: '#60a5fa' },
  { id: 'snow', name: 'Snow', emoji: '❄️', description: 'Atmospheric water vapor frozen into ice crystals.', color: '#e0f2fe' },
  { id: 'ice', name: 'Ice', emoji: '🧊', description: 'Frozen water.', color: '#bfdbfe' },
  { id: 'lava', name: 'Lava', emoji: '🌋', description: 'Hot molten rock.', color: '#dc2626' },
  { id: 'stone', name: 'Stone', emoji: '🪨', description: 'Hard, solid non-metallic mineral matter.', color: '#57534e' },
  { id: 'sand', name: 'Sand', emoji: '🏖️', description: 'Loose granular substance.', color: '#fde68a' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', description: 'A very large expanse of sea.', color: '#1e40af' },
  { id: 'mountain', name: 'Mountain', emoji: '🏔️', description: 'A large natural elevation of the earth\'s surface.', color: '#525252' },

  // --- LIFE & EVOLUTION ---
  { id: 'life', name: 'Life', emoji: '🌟', description: 'The condition that distinguishes animals and plants from inorganic matter.', color: '#eab308' },
  { id: 'death', name: 'Death', emoji: '💀', description: 'The end of life.', color: '#171717' },
  { id: 'bacteria', name: 'Bacteria', emoji: '🦠', description: 'Microscopic living organisms.', color: '#84cc16' },
  { id: 'plant', name: 'Plant', emoji: '🌱', description: 'A living organism of the kind exemplified by trees and shrubs.', color: '#4ade80' },
  { id: 'tree', name: 'Tree', emoji: '🌳', description: 'A woody perennial plant.', color: '#166534' },
  { id: 'flower', name: 'Flower', emoji: '🌸', description: 'The seed-bearing part of a plant.', color: '#f472b6' },
  { id: 'animal', name: 'Animal', emoji: '🐾', description: 'A living organism that feeds on organic matter.', color: '#a16207' },
  { id: 'dinosaur', name: 'Dinosaur', emoji: '🦖', description: 'A fossil reptile of the Mesozoic era.', color: '#3f6212' },
  { id: 'egg', name: 'Egg', emoji: '🥚', description: 'An oval or round object laid by a female bird or reptile.', color: '#fef3c7' },
  { id: 'bird', name: 'Bird', emoji: '🐦', description: 'A warm-blooded egg-laying vertebrate.', color: '#0ea5e9' },
  { id: 'fish', name: 'Fish', emoji: '🐟', description: 'A limbless cold-blooded vertebrate animal with gills.', color: '#38bdf8' },
  { id: 'human', name: 'Human', emoji: '🧑', description: 'A human being.', color: '#fca5a5' },
  { id: 'monkey', name: 'Monkey', emoji: '🐒', description: 'A small to medium-sized primate.', color: '#78350f' },

  // --- CIVILIZATION & HISTORY ---
  { id: 'fire-starter', name: 'Campfire', emoji: '⛺', description: 'The beginning of civilization.', color: '#ea580c' },
  { id: 'wheel', name: 'Wheel', emoji: '🛞', description: 'One of the most important inventions in history.', color: '#57534e' },
  { id: 'tool', name: 'Tool', emoji: '🔨', description: 'A device used to carry out a particular function.', color: '#475569' },
  { id: 'weapon', name: 'Weapon', emoji: '⚔️', description: 'A thing designed or used for inflicting bodily harm.', color: '#991b1b' },
  { id: 'pyramid', name: 'Pyramid', emoji: '🔺', description: 'Monumental structure with a square or triangular base.', color: '#d4d4d4' },
  { id: 'castle', name: 'Castle', emoji: '🏰', description: 'A large building fortified against attack.', color: '#737373' },
  { id: 'knight', name: 'Knight', emoji: '🛡️', description: 'A man who served his sovereign or lord as a mounted soldier in armor.', color: '#94a3b8' },
  { id: 'king', name: 'King', emoji: '👑', description: 'The male ruler of an independent state.', color: '#fbbf24' },
  { id: 'war', name: 'War', emoji: '⚔️', description: 'A state of armed conflict.', color: '#7f1d1d' },
  { id: 'city', name: 'City', emoji: '🏙️', description: 'A large town.', color: '#64748b' },
  { id: 'house', name: 'House', emoji: '🏠', description: 'A building for human habitation.', color: '#b45309' },

  // --- MYTHOLOGY & FICTION ---
  { id: 'magic', name: 'Magic', emoji: '✨', description: 'The power of apparently influencing the course of events.', color: '#c084fc' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙‍♂️', description: 'A man who has magical powers.', color: '#6b21a8' },
  { id: 'dragon', name: 'Dragon', emoji: '🐉', description: 'A mythical monster like a giant reptile.', color: '#15803d' },
  { id: 'phoenix', name: 'Phoenix', emoji: '🐦‍🔥', description: 'A unique bird that lived for five or six centuries.', color: '#f97316' },
  { id: 'unicorn', name: 'Unicorn', emoji: '🦄', description: 'A mythical animal represented as a horse with a single horn.', color: '#f0abfc' },
  { id: 'vampire', name: 'Vampire', emoji: '🧛', description: 'A corpse supposed to leave its grave at night to drink the blood of the living.', color: '#9f1239' },
  { id: 'werewolf', name: 'Werewolf', emoji: '🐺', description: 'A person who changes into a wolf.', color: '#525252' },
  { id: 'zombie', name: 'Zombie', emoji: '🧟', description: 'A corpse said to be revived by witchcraft.', color: '#65a30d' },
  { id: 'ghost', name: 'Ghost', emoji: '👻', description: 'An apparition of a dead person.', color: '#f8fafc' },
  { id: 'alien', name: 'Alien', emoji: '👽', description: 'A being from another world.', color: '#22c55e' },
  { id: 'ufo', name: 'UFO', emoji: '🛸', description: 'Unidentified Flying Object.', color: '#9ca3af' },
  { id: 'kaiju', name: 'Kaiju', emoji: '🦖', description: 'A giant monster.', color: '#1e293b' },
  { id: 'superhero', name: 'Superhero', emoji: '🦸', description: 'A benevolent fictional character with superhuman powers.', color: '#3b82f6' },
  { id: 'lightsaber', name: 'Laser Sword', emoji: '⚔️', description: 'An elegant weapon for a more civilized age.', color: '#ef4444' },

  // --- SCIENCE & TECH ---
  { id: 'electricity', name: 'Electricity', emoji: '⚡', description: 'A form of energy resulting from charged particles.', color: '#eab308' },
  { id: 'steam', name: 'Steam', emoji: '🧖', description: 'The vapor into which water is converted when heated.', color: '#e5e7eb' },
  { id: 'energy', name: 'Energy', emoji: '🔋', description: 'The strength and vitality required for sustained activity.', color: '#8b5cf6' },
  { id: 'computer', name: 'Computer', emoji: '💻', description: 'An electronic device for storing and processing data.', color: '#1e293b' },
  { id: 'internet', name: 'Internet', emoji: '🌐', description: 'A global computer network.', color: '#2563eb' },
  { id: 'ai', name: 'AI', emoji: '🧠', description: 'Artificial Intelligence.', color: '#10b981' },
  { id: 'robot', name: 'Robot', emoji: '🤖', description: 'A machine capable of carrying out a complex series of actions.', color: '#64748b' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', description: 'A cylindrical projectile that can be propelled to a great height.', color: '#dc2626' },
  { id: 'atom', name: 'Atom', emoji: '⚛️', description: 'The basic unit of a chemical element.', color: '#6366f1' },
  { id: 'blackhole', name: 'Black Hole', emoji: '🕳️', description: 'A region of space having a gravitational field so intense that no matter can escape.', color: '#000000' },
  { id: 'nuke', name: 'Nuclear Bomb', emoji: '☢️', description: 'A bomb that derives its destructive power from nuclear reactions.', color: '#16a34a' },
  
  // --- MATERIALS ---
  { id: 'metal', name: 'Metal', emoji: '🤘', description: 'A solid material that is typically hard, shiny, malleable.', color: '#94a3b8' },
  { id: 'glass', name: 'Glass', emoji: '🥃', description: 'A hard, brittle substance, typically transparent.', color: '#a5f3fc' },
  { id: 'wood', name: 'Wood', emoji: '🪵', description: 'The hard fibrous material of a tree.', color: '#78350f' },
  { id: 'clay', name: 'Clay', emoji: '🧱', description: 'A stiff, sticky fine-grained earth.', color: '#ea580c' },
  { id: 'plastic', name: 'Plastic', emoji: '🥤', description: 'A synthetic material made from a wide range of organic polymers.', color: '#f472b6' },
  { id: 'gold', name: 'Gold', emoji: '🥇', description: 'A yellow precious metal.', color: '#fbbf24' },
  { id: 'diamond', name: 'Diamond', emoji: '💎', description: 'A precious stone consisting of a clear and colorless crystalline form of pure carbon.', color: '#06b6d4' },

  // --- FOOD ---
  { id: 'bread', name: 'Bread', emoji: '🍞', description: 'Food made of flour, water, and yeast.', color: '#f59e0b' },
  { id: 'meat', name: 'Meat', emoji: '🥩', description: 'The flesh of an animal as food.', color: '#ef4444' },
  { id: 'alcohol', name: 'Alcohol', emoji: '🍺', description: 'Fermented liquor.', color: '#eab308' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', description: 'A food made from the pressed curds of milk.', color: '#fcd34d' },

  // --- ABSTRACT CONCEPTS ---
  { id: 'love', name: 'Love', emoji: '❤️', description: 'An intense feeling of deep affection.', color: '#be123c' },
  { id: 'music', name: 'Music', emoji: '🎵', description: 'Vocal or instrumental sounds.', color: '#ec4899' },
  { id: 'idea', name: 'Idea', emoji: '💡', description: 'A thought or suggestion as to a possible course of action.', color: '#fef08a' },
  { id: 'science', name: 'Science', emoji: '🧪', description: 'The systematic study of the structure and behavior of the physical and natural world.', color: '#10b981' },
  { id: 'philosophy', name: 'Philosophy', emoji: '🤔', description: 'The study of the fundamental nature of knowledge, reality, and existence.', color: '#a8a29e' },
];