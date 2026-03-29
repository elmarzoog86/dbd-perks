"use client";

import { useState } from "react";
import { RefreshCw, Shield, Swords, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import iconsMap from "../data/icons-map.json";
import portraitsMap from "../data/portraits.json";

type Role = "survivor" | "killer";
type BuildStrategy = "gen-rush" | "haste" | "looping" | "aura" | string;

interface ItemOrPower {
  name: string;
  addons: string[];
}

interface Build {
  perks: string[];
  equipment: ItemOrPower;
}

interface PerkInfo {
  name: string;
  descEn: string;
  descAr: string;
}

// English & Arabic Database for Perks
const PERKS_DB: Record<string, PerkInfo> = {
  "Prove Thyself": {
    name: "Prove Thyself",
    descEn: "Gain a 10% repair speed bonus for every other Survivor working on a generator within 4 meters.",
    descAr: "احصل على مكافأة سرعة إصلاح بنسبة 10% لكل ناجٍ آخر يعمل على مولد ضمن مسافة 4 أمتار."
  },
  "Deja Vu": {
    name: "Deja Vu",
    descEn: "Reveals the auras of 3 generators in closest proximity. Gain a 6% repair speed bonus to them.",
    descAr: "يكشف عن هالات 3 مولدات قريبة من بعضها البعض. يزيد من سرعة الإصلاح لها بنسبة 6%."
  },
  "Resilience": {
    name: "Resilience",
    descEn: "Grants 9% additional speed to Repairing, Healing, Sabotaging, Unhooking, etc., while Injured.",
    descAr: "يمنحك سرعة إضافية بنسبة 9% عند الإصلاح، العلاج، أو الإنقاذ وأنت مصاب."
  },
  "Built to Last": {
    name: "Built to Last",
    descEn: "Hiding in a Locker for 12 seconds with a depleted item replenishes 99% of its charges.",
    descAr: "الاختباء في خزانة لمدة 12 ثانية بعنصر فارغ يعيد 99% من شحناته."
  },
  "Sprint Burst": {
    name: "Sprint Burst",
    descEn: "When starting to run, break into a sprint at 150% normal speed for 3 seconds. Causes Exhaustion.",
    descAr: "عند بدء الركض، اركض بسرعة 150% لمدة 3 ثوانٍ. يسبب الإرهاق."
  },
  "Corrupt Intervention": {
    name: "Corrupt Intervention",
    descEn: "The 3 Generators furthest from you are blocked by The Entity for 120 seconds at the start of the Trial.",
    descAr: "يتم حظر أبعد 3 مولدات عنك بواسطة الكيان لمدة 120 ثانية في بداية اللعبة."
  },
  "Lethal Pursuer": {
    name: "Lethal Pursuer",
    descEn: "At the start of the trial, reveals the auras of all Survivors for 9 seconds.",
    descAr: "في بداية اللعبة، يكشف هالات جميع الناجين لمدة 9 ثوانٍ."
  },
  "Pop Goes the Weasel": {
    name: "Pop Goes the Weasel",
    descEn: "After hooking a Survivor, the next generator you kick instantly loses 20% of its current progress.",
    descAr: "بعد تعليق ناجٍ، يفقد المولد التالي الذي تضربه 20% من تقدمه الحالي فورًا."
  },
  "default": {
    name: "Perk",
    descEn: "Equippable perk that provides a unique advantage in the trial.",
    descAr: "ميزة قابلة للتجهيز توفر أفضلية فريدة في اللعبة."
  }
};

const getPerkInfo = (name: string): PerkInfo => {
  return PERKS_DB[name] || { ...PERKS_DB["default"], name, descEn: `${name} is a powerful perk in Dead by Daylight.`, descAr: `${name} ميزة قوية في اللعبة.` };
};

const survivorData: Record<string, Build[]> = {
  "gen-rush": [
    { perks: ["Prove Thyself", "Deja Vu", "Resilience", "Built to Last"], equipment: { name: "Commodious Toolbox", addons: ["Wire Spool", "Scraps"] } },
    { perks: ["Hyperfocus", "Stake Out", "Fogwise", "Fast Track"], equipment: { name: "Engineer's Toolbox", addons: ["Brand New Part", "Socket Swivels"] } },
    { perks: ["Potential Energy", "Overzealous", "Deja Vu", "Sprint Burst"], equipment: { name: "Mechanic's Toolbox", addons: ["Grip Wrench", "Spring Clamp"] } }
  ],
  "haste": [
    { perks: ["Hope", "Made for This", "Resilience", "Dead Hard"], equipment: { name: "Med-kit", addons: ["Medical Scissors", "Gauze Roll"] } },
    { perks: ["Sprint Burst", "Vigil", "Fixated", "Champion of Light"], equipment: { name: "Flashlight", addons: ["Battery", "Low Amp Filament"] } }
  ],
  "looping": [
    { perks: ["Windows of Opportunity", "Lithe", "Dance With Me", "Quick & Quiet"], equipment: { name: "Flashlight", addons: ["Odd Bulb", "Halogen Decals"] } },
    { perks: ["Dead Hard", "Resilience", "Iron Will", "We'll Make It"], equipment: { name: "Ranger Med-kit", addons: ["Anti-Hemorrhagic Syringe", "Gel Dressings"] } }
  ],
  "aura": [
    { perks: ["Kindred", "Bond", "Open-Handed", "Distortion"], equipment: { name: "Map", addons: ["Glass Bead", "Red Twine"] } },
    { perks: ["Alert", "Dark Sense", "Wiretap", "Object of Obsession"], equipment: { name: "Rainbow Map", addons: ["Odd Stamp", "Retardant Jelly"] } }
  ]
};

// Added specific killer setups with multiple strategies!
const killerData: Record<string, Record<string, Build[]>> = {
  "The Trapper": {
    "territorial": [{ perks: ["Corrupt Intervention", "Agitation", "Iron Grasp", "Scourge Hook: Pain Resonance"], equipment: { name: "Bear Trap", addons: ["Trapper Bag", "Tar Bottle"] } }],
    "basement": [{ perks: ["Agitation", "Iron Grasp", "Mad Grit", "Awakened Awareness"], equipment: { name: "Bear Trap", addons: ["Iridescent Stone", "Honing Stone"] } }]
  },
  "The Wraith": {
    "hit-and-run": [{ perks: ["Sloppy Butcher", "A Nurse's Calling", "Make Your Choice", "Jolt"], equipment: { name: "Wailing Bell", addons: ["Bone Clapper", "Windstorm - Blood"] } }]
  },
  "The Hillbilly": {
    "lethal-chase": [{ perks: ["Enduring", "Spirit Fury", "Bamboozle", "Tinkerer"], equipment: { name: "Chainsaw", addons: ["Lo Pro Chains", "Doom Engravings"] } }]
  },
  "The Nurse": {
    "aura-slugging": [{ perks: ["Lethal Pursuer", "Nowhere to Hide", "Infectious Fright", "A Nurse's Calling"], equipment: { name: "Spencer's Last Breath", addons: ["Heavy Panting", "Fragile Wheeze"] } }]
  },
  "The Shape": {
    "tombstone": [{ perks: ["Play with Your Food", "Corrupt Intervention", "Deadlock", "No Way Out"], equipment: { name: "Evil Within", addons: ["Judith's Tombstone", "Fragrant Tuft of Hair"] } }],
    "scratched-mirror": [{ perks: ["A Nurse's Calling", "Monitor & Abuse", "Sloppy Butcher", "Deadlock"], equipment: { name: "Evil Within", addons: ["Scratched Mirror", "Boyfriend's Memo"] } }]
  },
  "The Hag": {
    "territorial": [{ perks: ["Corrupt Intervention", "Make Your Choice", "Franklin's Demise", "Deadlock"], equipment: { name: "Blackened Catalyst", addons: ["Mint Rag", "Rusty Shackles"] } }]
  },
  "The Doctor": {
    "impossible-skillcheck": [{ perks: ["Merciless Storm", "Overcharge", "Unnerving Presence", "Distressing"], equipment: { name: "Carter's Spark", addons: ["Iridescent King", "High Stimulus Electrode"] } }]
  },
  "The Huntress": {
    "aura-sniper": [{ perks: ["Lethal Pursuer", "I'm All Ears", "Bitter Murmur", "Iron Maiden"], equipment: { name: "Hunting Hatchets", addons: ["Iridescent Head", "Infantry Belt"] } }]
  },
  "The Cannibal": {
    "basement-defense": [{ perks: ["Agitation", "Iron Grasp", "Insidious", "Bamboozle"], equipment: { name: "Bubba's Chainsaw", addons: ["Award-winning Chili", "Beast's Marks"] } }]
  },
  "The Nightmare": {
    "endgame": [{ perks: ["Remember Me", "Blood Warden", "No One Escapes Death", "No Way Out"], equipment: { name: "Dream Demon", addons: ["Red Paint Brush", "Pill Bottle"] } }]
  },
  "The Pig": {
    "headtrap-stall": [{ perks: ["Corrupt Intervention", "Hex: Ruin", "Hex: Undying", "Save the Best for Last"], equipment: { name: "Jigsaw's Baptism", addons: ["Video Tape", "Rules Set No.2"] } }]
  },
  "The Clown": {
    "chase-denial": [{ perks: ["Save the Best for Last", "Pop Goes the Weasel", "Bamboozle", "Enduring"], equipment: { name: "The Afterpiece Tonic", addons: ["Tattoo's Middle Finger", "Garish Makeup Kit"] } }]
  },
  "The Spirit": {
    "hit-and-run": [{ perks: ["Sloppy Butcher", "Stridor", "A Nurse's Calling", "Jolt"], equipment: { name: "Yamaoka's Haunting", addons: ["Mother-Daughter Ring", "Dried Cherry Blossom"] } }]
  },
  "The Legion": {
    "mend-simulator": [{ perks: ["Thanatophobia", "Dying Light", "Hex: Ruin", "Scourge Hook: Pain Resonance"], equipment: { name: "Feral Frenzy", addons: ["Iridescent Button", "Fuming Mixtape"] } }]
  },
  "The Plague": {
    "anti-heal": [{ perks: ["Corrupt Intervention", "Thanatophobia", "Infectious Fright", "Scourge Hook: Pain Resonance"], equipment: { name: "Vile Purge", addons: ["Black Incense", "Ashen Apple"] } }]
  },
  "The Ghost Face": {
    "stealth-stalk": [{ perks: ["Nurse's Calling", "Sloppy Butcher", "Corrupt Intervention", "Lethal Pursuer"], equipment: { name: "Night Shroud", addons: ["Philly", "Drop-Leg Knife Sheath"] } }]
  },
  "The Demogorgon": {
    "portal-control": [{ perks: ["Save the Best for Last", "Corrupt Intervention", "Pop Goes the Weasel", "Make Your Choice"], equipment: { name: "Of the Abyss", addons: ["Leprose Lichen", "Mew's Guts"] } }]
  },
  "The Oni": {
    "slug-fest": [{ perks: ["Infectious Fright", "Monitor & Abuse", "Sloppy Butcher", "Lethal Pursuer"], equipment: { name: "Yamaoka's Wrath", addons: ["Akito's Crutch", "Lion Fang"] } }]
  },
  "The Deathslinger": {
    "chase-dominance": [{ perks: ["Save the Best for Last", "Monitor & Abuse", "Lethal Pursuer", "Scourge Hook: Pain Resonance"], equipment: { name: "The Redeemer", addons: ["Iridescent Coin", "Bounty Hunter's Label"] } }]
  },
  "The Executioner": {
    "aura-snipe": [{ perks: ["I'm All Ears", "Nurse's Calling", "Lethal Pursuer", "Tinkerer"], equipment: { name: "Rites of Judgement", addons: ["Wax Doll", "Burning Man Painting"] } }]
  },
  "The Blight": {
    "lethal-chase": [{ perks: ["Lethal Pursuer", "Enduring", "Spirit Fury", "Bamboozle"], equipment: { name: "Blighted Corruption", addons: ["Alchemist's Ring", "Blighted Crow"] } }]
  },
  "The Twins": {
    "slugging": [{ perks: ["Sloppy Butcher", "Forced Penance", "Corrupt Intervention", "Infectious Fright"], equipment: { name: "Blood Bond", addons: ["Toy Sword", "Forest Stew"] } }]
  },
  "The Trickster": {
    "rapid-fire": [{ perks: ["No Way Out", "Starstruck", "Hex: Ruin", "Scourge Hook: Pain Resonance"], equipment: { name: "Showstopper", addons: ["Melodious Murder", "Trick Blades"] } }]
  },
  "The Nemesis": {
    "zombie-value": [{ perks: ["Lethal Pursuer", "Discordance", "Tinkerer", "Pop Goes the Weasel"], equipment: { name: "T-Virus", addons: ["Serotonin Injector", "Iridescent Umbrella Badge"] } }]
  },
  "The Cenobite": {
    "chain-hunt": [{ perks: ["Hex: Plaything", "Hex: Pentimento", "Corrupt Intervention", "Deadlock"], equipment: { name: "Summons of Pain", addons: ["Engineer's Fang", "Original Pain"] } }]
  },
  "The Artist": {
    "aura-control": [{ perks: ["Scourge Hook: Pain Resonance", "Dead Man's Switch", "Lethal Pursuer", "No Way Out"], equipment: { name: "Birds of Torment", addons: ["Severed Hands", "Matias' Baby Shoes"] } }]
  },
  "The Onryo": {
    "condemned": [{ perks: ["Sloppy Butcher", "Lethal Pursuer", "Scourge Hook: Pain Resonance", "Hex: Face the Darkness"], equipment: { name: "Deluge of Fear", addons: ["Ring Drawing", "Iridescent Videotape"] } }]
  },
  "The Dredge": {
    "nightfall": [{ perks: ["Make Your Choice", "Sloppy Butcher", "Lethal Pursuer", "Lavalier Microphone"], equipment: { name: "Reign of Darkness", addons: ["Field Recorder", "Malthinker's Skull"] } }]
  },
  "The Mastermind": {
    "vault-speed": [{ perks: ["Bamboozle", "Superior Anatomy", "Lethal Pursuer", "Awakened Awareness"], equipment: { name: "Virulent Bound", addons: ["Uroboros Tentacle", "Iridescent Uroboros Vial"] } }]
  },
  "The Knight": {
    "three-gen": [{ perks: ["Nowhere to Hide", "Call of Brine", "Overcharge", "Pop Goes the Weasel"], equipment: { name: "Guardia Compagnia", addons: ["Map of the Realm", "Call to Arms"] } }]
  },
  "The Skull Merchant": {
    "drone-defense": [{ perks: ["Hex: Ruin", "Hex: Undying", "Pop Goes the Weasel", "Corrupt Intervention"], equipment: { name: "Eyes in the Sky", addons: ["Geographical Readout", "Advanced Movement Prediction"] } }]
  },
  "The Singularity": {
    "camera-chase": [{ perks: ["Soma Family Photo", "Rapid Brutality", "Corrupt Intervention", "Pop Goes the Weasel"], equipment: { name: "Quantum Instantiation", addons: ["Soma Family Photo", "Denial of Birth Mechanism"] } }]
  },
  "The Xenomorph": {
    "tunnel-rat": [{ perks: ["Lethal Pursuer", "A Nurse's Calling", "Pop Goes the Weasel", "Nowhere to Hide"], equipment: { name: "Hidden Pursuit", addons: ["Emergency Helmet", "Lambert's Star Map"] } }]
  },
  "The Good Guy": {
    "stealth-dash": [{ perks: ["Lethal Pursuer", "Friends 'Til the End", "No Way Out", "Pop Goes the Weasel"], equipment: { name: "Slice & Dice", addons: ["Running Shoes", "Straight Razor"] } }]
  },
  "The Unknown": {
    "hallucination": [{ perks: ["Unforeseen", "Pop Goes the Weasel", "Corrupt Intervention", "Lethal Pursuer"], equipment: { name: "UVX", addons: ["Blurry Photo", "Vanish Drop"] } }]
  }
};

export default function Home() {
  const [role, setRole] = useState<Role>("killer");
  const [killerName, setKillerName] = useState<string>("The Trapper");
  const [strategy, setStrategy] = useState<BuildStrategy>("territorial");
  const [buildIndex, setBuildIndex] = useState(0);

  // Derived state based on role
  const currentAvailableBuilds = role === "survivor" 
    ? survivorData[strategy] || survivorData["gen-rush"]
    : killerData[killerName]?.[strategy] || Object.values(killerData[killerName] || {})[0] || [];

  const activeBuild = currentAvailableBuilds[buildIndex % Math.max(1, currentAvailableBuilds.length)] || {
    perks: ["Perk 1", "Perk 2", "Perk 3", "Perk 4"],
    equipment: { name: "Item", addons: ["Addon 1", "Addon 2"] }
  };

  const handleRefresh = () => {
    if (currentAvailableBuilds.length <= 1) return;
    const currentIdx = buildIndex % currentAvailableBuilds.length;
    let randomIdx = Math.floor(Math.random() * currentAvailableBuilds.length);
    if (randomIdx === currentIdx) {
      randomIdx = (randomIdx + 1) % currentAvailableBuilds.length;
    }
    setBuildIndex(randomIdx);
  };

  // 1. Search the massive dbd icon map using string similarity.
  // 2. Returns the accurate image URL from the icon-pack repo.
  const getImageUrl = (name: string, type: "perks" | "items" | "addons" | "powers") => {
    // Exact mapping for certain generic fallbacks or specific requests
    if (!name) return `https://ui-avatars.com/api/?name=?&background=1a1a1a&color=fff`;

    const rawId = name.toLowerCase().replace(/&/g, "and").replace(/[\s\:\'\-\!\?\.\,]/g, "");
    
    // Convert generic lookup type into dictionary prefixes
    const prefixes = type === "perks" ? ["iconperks_"] : 
                     type === "addons" ? ["iconaddon_", "icons_addon_"] : 
                     ["iconitems_", "iconpower_", "iconfavors_"];

    // Find in the dynamically generated dictionary map!
    const dictionary = iconsMap as Record<string, string>;
    
    // First, try exact prefix match
    for (const prefix of prefixes) {
      if (dictionary[`${prefix}${rawId}`]) {
         return `https://raw.githubusercontent.com/Icon-Pack-Provider/Dead-by-daylight-Default-icons/main/${dictionary[`${prefix}${rawId}`]}`;
      }
    }

    // Second, try generic includes match if spelling is slightly off
    const keyMatch = Object.keys(dictionary).find(k => k.includes(rawId) && prefixes.some(p => k.startsWith(p)));
    if (keyMatch) {
       return `https://raw.githubusercontent.com/Icon-Pack-Provider/Dead-by-daylight-Default-icons/main/${dictionary[keyMatch]}`;
    }

    // Fallback if the image simply isn't in the massive DB
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=fff&size=256&bold=true&font-size=0.33&length=3`;
  };

  const AssetIcon = ({ name, type, className }: { name: string, type: "perks" | "items" | "addons" | "powers", className?: string }) => {
    return (
      <img 
        src={getImageUrl(name, type)} 
        alt={name}
        className={`object-cover ${className || ""}`}
        title={name}
        onError={(e) => {
          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a1a&color=666`;
        }}
      />
    );
  };

  const StrategyButton = ({ id, name, icon }: { id: BuildStrategy, name: string, icon: React.ReactNode }) => (
    <button
      onClick={() => { setStrategy(id); setBuildIndex(0); }}
      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
        strategy === id
          ? "bg-neutral-800 border-neutral-600 text-white shadow-md shadow-neutral-900/50"
          : "border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800/50"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{name}</span>
    </button>
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 flex flex-col items-center justify-start py-12 font-sans">
      <div className="max-w-4xl w-full space-y-10">
        
        <header className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-red-600 to-red-900 bg-clip-text text-transparent drop-shadow-sm">
            DbD Build Crafter
          </h1>
          <p className="text-neutral-400 text-lg">Generate top-tier meta builds for the current patch</p>
        </header>

        {/* Role Selection */}
        <div className="flex gap-2 p-1.5 bg-neutral-900 rounded-xl mx-auto w-fit border border-neutral-800 shadow-inner">
          <button 
            onClick={() => { 
              setRole("survivor"); 
              setStrategy("gen-rush");
              setBuildIndex(0); 
            }}
            className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              role === "survivor" 
                ? "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]" 
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Shield size={20} /> Survivor
          </button>
          <button 
            onClick={() => { 
              setRole("killer"); 
              setStrategy("territorial");
              setBuildIndex(0); 
            }}
            className={`px-8 py-3 rounded-lg font-bold transition-all flex items-center gap-2 ${
              role === "killer" 
                ? "bg-red-600/20 text-red-400 ring-1 ring-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.15)]" 
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <Swords size={20} /> Killer
          </button>
        </div>

        {/* Killer Selection (Only visible if Killer Role is selected) */}
        {role === "killer" && (
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {Object.keys(killerData).map(killer => (
              <button
                key={killer}
                onClick={() => {
                  setKillerName(killer);
                  setStrategy(Object.keys(killerData[killer])[0]);
                  setBuildIndex(0);
                }}
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all w-28 ${
                  killerName === killer 
                    ? "bg-red-950/40 border-red-500/80 shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-105" 
                    : "bg-neutral-900 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/80"
                }`}
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden mb-3 border-2 transition-colors ${killerName === killer ? "border-red-500 shadow-inner" : "border-neutral-700"} bg-neutral-950`}>
                  <img
                    src={(portraitsMap as Record<string, string>)[killer] || `https://ui-avatars.com/api/?name=${encodeURIComponent(killer)}&background=1a1a1a&color=fff`}
                    alt={killer}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    onError={(e) => { 
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(killer)}&background=1a1a1a&color=fff`; 
                    }} 
                  />
                </div>
                <span className={`text-xs font-bold text-center leading-tight ${killerName === killer ? "text-white" : "text-neutral-400"}`}>
                  {killer}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Strategy Selection based on Role */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {role === "survivor" ? (
            <>
              <StrategyButton id="gen-rush" name="Gen Rush" icon={<Zap size={18} />} />
              <StrategyButton id="haste" name="Haste / Speed" icon={<Activity size={18} />} />
              <StrategyButton id="looping" name="Chase / Looping" icon={<Activity size={18} />} />
              <StrategyButton id="aura" name="Aura Reading" icon={<Activity size={18} />} />
            </>
          ) : (
            // Dynamic generation of strategies specifically for the currently selected killer
            Object.keys(killerData[killerName] || {}).map(strat => (
              <StrategyButton 
                key={strat} 
                id={strat} 
                name={strat.replace("-", " ")} 
                icon={<Activity size={18} />} 
              />
            ))
          )}
        </div>

        {/* Build Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${role}-${strategy}-${buildIndex}`}
            initial={{ opacity: 0, scale: 0.98, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -15 }}
            transition={{ duration: 0.2 }}
            className="bg-neutral-900 rounded-2xl p-6 md:p-8 border border-neutral-800 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-neutral-800 pb-5">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="capitalize">{strategy.replace("-", " ")}</span> Synergy
                </h2>
                <p className="text-neutral-500 text-sm mt-1">Recommended setup for maximum efficiency</p>
              </div>
              <button 
                onClick={handleRefresh}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-lg text-sm font-semibold transition-colors text-white border border-neutral-700"
              >
                <RefreshCw size={18} />
                Refresh Build
              </button>
            </div>

            <div className="space-y-8">
              {/* Perks */}
              <div>
                <h3 className="text-sm font-bold text-neutral-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neutral-600" /> Essential Perks
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {activeBuild.perks.map((perkName, i) => {
                    const perkInfo = getPerkInfo(perkName);
                    return (
                      <div key={i} className="relative group aspect-square bg-gradient-to-b from-neutral-800 to-neutral-800/50 border border-neutral-700/50 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:border-neutral-500 transition-all hover:-translate-y-1 hover:shadow-lg z-10 hover:z-50">
                        <div className="w-16 h-16 bg-neutral-900 rotate-45 mb-4 flex items-center justify-center shadow-inner overflow-hidden border-2 border-neutral-700/50 group-hover:border-neutral-500 transition-colors">
                          <AssetIcon name={perkName} type="perks" className="-rotate-45 w-[140%] h-[140%] max-w-none drop-shadow-2xl object-contain object-center scale-110" />
                        </div>
                      
                      {/* Name label beneath the perk */}
                      <span className="text-sm font-bold text-neutral-200 mt-2 leading-tight z-10">{perkName}</span>
                      
                      {/* Hover Tooltip - Ensure tooltip is properly layered and readable */}
                      <div className="absolute top-full mt-3 w-64 p-4 bg-neutral-900 border border-neutral-600 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-2xl z-50 pointer-events-none flex flex-col gap-3">
                        <p className="font-bold text-sm text-blue-400 border-b border-neutral-700 pb-2">{perkInfo.name}</p>
                        <p className="text-xs text-neutral-300 text-left leading-relaxed">{perkInfo.descEn}</p>
                        <p className="text-xs text-neutral-400 text-right leading-relaxed font-bold" dir="rtl">{perkInfo.descAr}</p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Items / Addons */}
              <div>
                <h3 className="text-sm font-bold text-neutral-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neutral-600" />
                  {role === "survivor" ? "Optimal Item Setup" : "Recommended Add-ons"}
                </h3>
                <div className="bg-neutral-950/50 rounded-xl p-5 border border-neutral-800/80 flex flex-col md:flex-row items-center gap-6">
                  
                  <div className="flex-1 flex flex-col md:flex-row items-center gap-4 text-center md:text-left w-full">
                    <div className="w-16 h-16 bg-neutral-900 border border-neutral-700/50 rounded flex items-center justify-center shadow-inner group overflow-hidden shrink-0">
                      <AssetIcon 
                        name={activeBuild.equipment.name} 
                        type={role === "survivor" ? "items" : "powers"} 
                        className="w-full h-full object-contain p-1 opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all drop-shadow-md" 
                      />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white leading-tight">{activeBuild.equipment.name}</p>
                      <p className="text-sm font-medium text-neutral-500 mt-1">{role === "survivor" ? "Held Item" : "Killer Power"}</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:block w-px self-stretch bg-neutral-800"></div>
                  
                  <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    {activeBuild.equipment.addons.map((addon, i) => (
                      <div key={i} className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg flex items-center gap-4 hover:bg-neutral-800 transition-colors">
                        <div className="w-8 h-8 bg-neutral-800 rounded flex-shrink-0 border border-neutral-700 overflow-hidden">
                          <AssetIcon name={addon} type="addons" className="w-full h-full" />
                        </div>
                        <span className="font-semibold text-neutral-300 text-sm">{addon}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </main>
  );
}

