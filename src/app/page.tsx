"use client";

import { useState } from "react";
import { RefreshCw, Shield, Swords, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import iconsMap from "../data/icons-map.json";
import portraitsMap from "../data/portraits.json";
import tutorialsMap from "../data/tutorials.json";
import countersMap from "../data/counters.json";

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
  "Dark Arrogance": {
    "name": "Dark Arrogance",
    "descEn": "Increases Vault speed by 25%. Increases duration of Pallet Stuns by 25%.",
    "descAr": "يزيد من سرعة القفز عبر النوافذ بنسبة 25%. يزيد من مدة الدوار عند ضربك بلوح بنسبة 25%."
  },
  "Hardened": {
    "name": "Hardened",
    "descEn": "Prevents screaming. After unlocking a chest or cleansing/blessing a totem, see the killer's aura when they are in range.",
    "descAr": "يمنع الصراخ. بعد فتح صندوق أو تطهير توتم، ترى هالة القاتل عندما يكون قريباً."
  },
  "Languish": {
    "name": "Languish",
    "descEn": "Survivors within your terror radius have their healing speed reduced by 25%.",
    "descAr": "الناجون داخل نطاق الرعب الخاص بك تقل سرعة شفائهم بنسبة 25%."
  },
  "Scourge Hook: Dominance": {
    "name": "Scourge Hook: Dominance",
    "descEn": "After hooking on a Scourge Hook, the next generator worked on is blocked for a duration.",
    "descAr": "بعد التعليق على خطاف الموت، يتم حظر المولد التالي الذي يتم العمل عليه لفترة."
  },
  "Human Greed": {
    "name": "Human Greed",
    "descEn": "Allows you to see the auras of unopened chests. You can close opened chests to gain a speed boost.",
    "descAr": "يسمح لك برؤية هالات الصناديق غير المفتوحة. يمكنك إغلاق الصناديق المفتوحة للحصول على زيادة في السرعة."
  },
  "Weave Attunement": {
    "name": "Weave Attunement",
    "descEn": "When an item is dropped, its aura is revealed. Survivors near dropped items have their auras revealed.",
    "descAr": "عند سقوط عنصر، يتم الكشف عن هالته. الناجون القريبون من العناصر الساقطة يتم الكشف عن هالاتهم."
  },
  "default": {
    name: "Perk",
    descEn: "Equippable perk that provides a unique advantage in the trial.",
    descAr: "ميزة قابلة للتجهيز توفر أفضلية فريدة في اللعبة."
  },
  "Hyperfocus": {"name":"Hyperfocus","descEn":"Hitting Great Skill Checks increases progression and subsequent Skill Check chance/speed.","descAr":"إصابة الفحوصات بامتياز تزيد من تقدم المولد وسرعات الفحوصات التالية."},
  "Stake Out": {"name":"Stake Out","descEn":"Staying in the Killer's Terror Radius grants tokens that convert Good Skill Checks to Great.","descAr":"البقاء في نطاق الرعب للقاتل يمنحك نقاطاً تحول الفحوصات الجيدة إلى ممتازة."},
  "Fogwise": {"name":"Fogwise","descEn":"Hitting a Great Skill Check on a generator reveals the Killer's aura for several seconds.","descAr":"إصابة فحص ممتاز أثناء إصلاح المولد يكشف هالة القاتل لعدة ثوانٍ."},
  "Fast Track": {"name":"Fast Track","descEn":"Gain tokens when survivors are hooked. Tokens grant progress on Great Skill Checks.","descAr":"اكسب نقاط تقدم مع كل ناجٍ يتم تعليقه وتستهلك عند الفحوصات الممتازة."},
  "Potential Energy": {"name":"Potential Energy","descEn":"Store repair progress and instantly apply it to another generator.","descAr":"خزن تقدم الإصلاح لتطبيقه لاحقاً وبشكل فوري على مولد آخر."},
  "Overzealous": {"name":"Overzealous","descEn":"After cleansing or blessing a Totem, your generator repair speed is increased.","descAr":"تزيد سرعة إصلاح المولدات بعد تطهير أو مباركة طوطم."},
  "Hope": {"name":"Hope","descEn":"Gain a permanent 7% Haste status effect as soon as the Exit Gates are powered.","descAr":"احصل على زيادة سرعة دائمة بنسبة 7% بمجرد شحن بوابات الخروج."},
  "Made for This": {"name":"Made for This","descEn":"Gain Haste when injured and moving, and Endurance after healing another.","descAr":"احصل على سرعة إضافية وأنت مصاب، وتحمُّل بعد معالجة ناجٍ آخر."},
  "Dead Hard": {"name":"Dead Hard","descEn":"Activate while injured and running to gain the Endurance status effect briefly.","descAr":"يُفعَّل أثناء الجري وأنت مصاب لتحصل على حالة التحمُّل للحظة وتتجنب الضربة."},
  "Vigil": {"name":"Vigil","descEn":"You and nearby allies recover from Exhaustion, Hemorrhage, and other negative effects 30% faster.","descAr":"تتعافى أنت وحلفاؤك من الإرهاق والنزيف وغيرها بنسبة 30% أسرع."},
  "Fixated": {"name":"Fixated","descEn":"You walk 20% faster uninjured and can see your own scratch marks.","descAr":"تمشي أسرع بنسبة 20% وترى علامات الجري (الخدوش) الخاصة بك."},
  "Champion of Light": {"name":"Champion of Light","descEn":"Gain Haste while shining a flashlight and hinder the Killer if you successfully blind them.","descAr":"تحصل على سرعة عند استخدام الكشاف اليدوي، وتُبطئ القاتل عند إعمائه."},
  "Windows of Opportunity": {"name":"Windows of Opportunity","descEn":"Auras of breakable walls, pallets, and vault locations are revealed within 32 meters.","descAr":"يكشف لك أماكن الألواح الخشبية (الباليت) والنوافذ ضمن مسافة 32 متراً."},
  "Lithe": {"name":"Lithe","descEn":"After performing a rushed vault, sprint at 150% speed for 3 seconds.","descAr":"ارركض بسرعة 150% لمدة 3 ثوانٍ بعد القفز السريع."},
  "Dance With Me": {"name":"Dance With Me","descEn":"Performing a rushed vault leaves no scratch marks for 3 seconds.","descAr":"القفز السريع لا يترك أي علامات جري (خدوش) خلفك لمدة 3 ثوانٍ."},
  "Quick & Quiet": {"name":"Quick & Quiet","descEn":"The noise from rushing a vault or hiding in a locker is completely suppressed.","descAr":"يخفي صوت القفز أو الدخول السريع في الخزانة تماماً (لفترة وتعود للشحن)."},
  "Iron Will": {"name":"Iron Will","descEn":"Reduces the volume of grunts of pain when injured by up to 100%.","descAr":"يخفي أو يقلل أصوات تألمك بنسبة كبيرة (تصل إلى 100%) وأنت مصاب."},
  "We'll Make It": {"name":"We'll Make It","descEn":"Healing speed becomes 100% faster for a duration after unhooking a Survivor.","descAr":"تزيد سرعة العلاج بنسبة 100% لمدة معينة بعد إنقاذ شخص من الخطاف."},
  "Kindred": {"name":"Kindred","descEn":"While a Survivor is hooked, reveals all Survivor auras and the Killer's aura if nearby.","descAr":"عندما يكون هناك ناجٍ على الخطاف، تظهر هالات كل الناجين والقاتل إذا كان قريباً."},
  "Bond": {"name":"Bond","descEn":"Allies' auras are revealed to you within a specific range.","descAr":"يكشف لك أماكن أصدقائك في نطاق مسافة معينة."},
  "Open-Handed": {"name":"Open-Handed","descEn":"Increases Aura-reading ranges for you and your team by 16 meters.","descAr":"يزيد نطاق قراءة الهالات (اكتشاف الأماكن) لك ولفريقك بمقدار 16 متراً."},
  "Distortion": {"name":"Distortion","descEn":"Hides your aura from the Killer temporarily when they attempt to read it.","descAr":"يخفي هالتك ويمنع القاتل من رؤيتك عندما يحاول الكشف عنك بواسطة البيركات."},
  "Alert": {"name":"Alert","descEn":"Reveals the Killer's aura completely whenever they break a pallet or generator.","descAr":"يكشف عن هالة القاتل عند كسره لأي لوح خشبي أو مولد."},
  "Dark Sense": {"name":"Dark Sense","descEn":"Whenever a generator is completed, the Killer's aura is revealed if they are within 24m.","descAr":"يكشف لك القاتل عند اكتمال إصلاح المولد إذا كان ضمن 24 متراً."},
  "Wiretap": {"name":"Wiretap","descEn":"Install a trap on a generator that reveals the Killer if they walk near it.","descAr":"يزرع جهاز تنصت على المولد ليكشف القاتل إذا اقترب منه لفريقك."},
  "Object of Obsession": {"name":"Object of Obsession","descEn":"You can see the Killer's aura whenever they can see yours. Your aura is periodically revealed.","descAr":"ترى القاتل كلما حاول رؤيتك. تنكشف هالتك بشكل دوري لتكون هدفاً للقاتل."},
  "Agitation": {"name":"Agitation","descEn":"Increases movement speed while carrying a survivor.","descAr":"تزيد من سرعتك أثناء حمل ناجٍ على كتفك."},
  "Iron Grasp": {"name":"Iron Grasp","descEn":"Reduces struggle effects and increases time required for a survivor to wiggle free.","descAr":"يقلل من تأثير وتمايل الناجي المحمول ويزيد وقت هروبه."},
  "Scourge Hook: Pain Resonance": {"name":"Scourge Hook: Pain Resonance","descEn":"Hooking on a Scourge Hook explodes the most progressed generator, losing progress.","descAr":"التعليق على خطاف الموت يفجر المولد الأكثر تقدماً مسبباً خسارة في الإصلاح."},
  "Mad Grit": {"name":"Mad Grit","descEn":"No attack cooldown on missed attacks while carrying a survivor. Hitting pauses wiggle timer.","descAr":"لا يوجد تباطؤ عند إخطاء ضربة وأنت تحمل ناجياً. والضربات توقف مؤقت هروبه."},
  "Awakened Awareness": {"name":"Awakened Awareness","descEn":"Reveals survivor auras around you while you are carrying a survivor.","descAr":"يكشف لك الناجين المحيطين بك أثناء حملك لأحد الناجين."},
  "Sloppy Butcher": {"name":"Sloppy Butcher","descEn":"Basic attacks cause Hemorrhage and Mangled effects, slowing their healing.","descAr":"الضربات العادية تسبب النزيف وصعوبة الالتئام، مما يبطئ من علاج الناجين."},
  "A Nurse's Calling": {"name":"A Nurse's Calling","descEn":"Reveals the auras of survivors nearby who are healing or being healed.","descAr":"يكشف عن هالات الناجين القريبين الذين يعالجون بعضهم أو يتم معالجتهم."},
  "Make Your Choice": {"name":"Make Your Choice","descEn":"The rescuer of a survivor becomes exposed (one-hit down) if you are far enough away.","descAr":"يكون المنقذ عرضة للسقوط بضربة واحدة إذا كنت بعيداً عن الخطاف."},
  "Jolt": {"name":"Jolt","descEn":"Downing a survivor explodes all generators within 32 meters, losing progress.","descAr":"إسقاط ناجٍ يفجر جميع المولدات بمحيط 32 متراً ويفقدها تقدمها تلقائياً."},
  "Enduring": {"name":"Enduring","descEn":"Reduces the stun duration from pallets significantly.","descAr":"يقلل مدة الدوار المتلقى من سقوط الألواح الخشبية بشكل كبير."},
  "Spirit Fury": {"name":"Spirit Fury","descEn":"After breaking pallets, the next pallet that stuns you gets destroyed instantly.","descAr":"بعد تدمير عدد معين من الألواح، يُدمر اللوح القادم الذي يسقط عليك فوراً."},
  "Bamboozle": {"name":"Bamboozle","descEn":"Speeds up your vaulting and blocks the window for a short duration.","descAr":"يسرّع قفزك للنافذة، ويغلق تلك النافذة أمام الناجين لفترة قصيرة."},
  "Tinkerer": {"name":"Tinkerer","descEn":"When a generator reaches 70% repair, you gain Undetectable status and a noise notification.","descAr":"حين يصل مولد لـ 70%، يتم إخفاء نبض قلبك (الرعب) ويأتيك إشعار ضوضاء."},
  "Nowhere to Hide": {"name":"Nowhere to Hide","descEn":"Kicking a generator reveals auras of survivors around you.","descAr":"ركل المولد يكشف لك هالات الناجين القريبين منك في محيط معين."},
  "Infectious Fright": {"name":"Infectious Fright","descEn":"Downing a survivor makes other survivors in your Terror Radius scream, revealing positions.","descAr":"إسقاط ناجٍ يجعل كافة الناجين حولك (بنطاق الرعب) يصرخون مما يكشف مكانهم."},
  "Play with Your Food": {"name":"Play with Your Food","descEn":"Chasing and letting your Obsession escape grants you a movement speed stacking bonus.","descAr":"مطاردة الهوس وتركه يهرب يمنحك نقاطاً تزيد من سرعة تحركك بشكل كبير."},
  "Deadlock": {"name":"Deadlock","descEn":"When a generator is finished, the generator with the most progress is blocked.","descAr":"عند إنهاء مولد، يتم إغلاق المولد التالي الأكثر تقدماً وتجميد تقدمه."},
  "No Way Out": {"name":"No Way Out","descEn":"Hooking unique survivors blocks the Exit Gate switches for a period of time.","descAr":"تعليقك لكل ناجٍ مميز يمنحك وقتاً يُغلق فيه بوابات الخروج فور لمسها."},
  "Monitor & Abuse": {"name":"Monitor & Abuse","descEn":"Terror Radius is slightly smaller Out of Chase, but much larger In Chase. Increases FOV.","descAr":"يصغر نطاق الرعب خارج المطاردة، ويكبر داخلها، ويزيد من مجال رؤيتك."},
  "Franklin's Demise": {"name":"Franklin's Demise","descEn":"Your basic attacks make Survivors drop their items, which drain charges over time.","descAr":"ضربتك تجعل الناجي يسقط الأداة التي بيده على الأرض لتفقد شحنتها تدريجياً."},
  "Merciless Storm": {"name":"Merciless Storm","descEn":"When a gen hits 90%, Survivors face continuous skill checks; if failed, it gets blocked.","descAr":"حين يصل المولد لـ90%، يواجه الناجون فحوصات متتالية وإن أخطأوا يُغلق المولد."},
  "Overcharge": {"name":"Overcharge","descEn":"Kicked generators regress faster and give a very difficult skill check to the next Survivor.","descAr":"الركل يسبب فحص مهارة صعب للناجي، ويزيد من سرعة الانحدار تدريجياً بمرور الوقت."},
  "Unnerving Presence": {"name":"Unnerving Presence","descEn":"Survivors in your Terror Radius face smaller skill check success zones and frequent triggers.","descAr":"الناجون المحيطون بك يواجهون فحوصات صغيرة جداً ومتكررة بشكل أكبر."},
  "Distressing": {"name":"Distressing","descEn":"Increases your Terror Radius by a massive amount and grants bonus Bloodpoints.","descAr":"يزيد من نطاق رعبك (نبض القلب) بشكل ضخم ويمنحك نقاط دم مضاعفة."},
  "I'm All Ears": {"name":"I'm All Ears","descEn":"Survivors making inside/outside fast vaults completely reveal their aura momentarily.","descAr":"عند قيام الناجي بقفز سريع بجوارك، تُكشف هالته لفترة وجيزة حتى من خلف الجدران."},
  "Bitter Murmur": {"name":"Bitter Murmur","descEn":"Every time a generator is completed, Survivor auras around it are revealed.","descAr":"كلما أكمل الناجون مولداً، تنكشف هالاتهم في محيط المولد لعدة ثوانٍ."},
  "Iron Maiden": {"name":"Iron Maiden","descEn":"Open lockers faster, and Survivors exiting lockers scream and become Exposed.","descAr":"تفتح الخزائن أسرع. الناجي التارك للخزانة يصرخ ويصبح عرضة للموت بضربة."},
  "Insidious": {"name":"Insidious","descEn":"Standing perfectly still for a short time removes your Terror Radius and Red Stain.","descAr":"الوقوف بلا حركة تماماً لثوانٍ معدودة يجعلك مخفياً عن الرادار (بلا نبض قلب أو ضوء أحمر)."},
  "Remember Me": {"name":"Remember Me","descEn":"Each hit on your Obsession increases the opening time for Exit Gates.","descAr":"ضرب الهوس المعين لك يزيد من المدة المطلوبة لفتح الناجين لبوابة الخروج."},
  "Blood Warden": {"name":"Blood Warden","descEn":"Hooking a Survivor while gates are open blocks the Exit area for all Survivors.","descAr":"تعليق ناجٍ والبوابات مفتوحة يغلق ممرات الهروب للأمام بوجه الناجين الباقين."},
  "No One Escapes Death": {"name":"No One Escapes Death","descEn":"When Exit Gates are powered, gain movement speed and standard attacks down Survivors.","descAr":"عند جاهزية البوابات، تربح سرعة فائقة وتصبح كل ضرباتك قاتلة (يسقط بضربة) وتُربط بطوطم."},
  "Hex: Ruin": {"name":"Hex: Ruin","descEn":"All unconnected generators instantly and automatically regress at double the speed.","descAr":"تبدأ المولدات التي يتركها الناجون بالانحدار فوراً وبسرعة هائلة تلقائياً ما دام الطوطم نشطاً."},
  "Hex: Undying": {"name":"Hex: Undying","descEn":"Protects another Hex Totem; reveals Survivors nearby ANY Totem.","descAr":"يحمي بيرك طوطم آخر من التدمير (يأخذ مكانه)؛ ويكشف الناجين المارين جوار الطواطم."},
  "Save the Best for Last": {"name":"Save the Best for Last","descEn":"Hitting Non-Obsessions grants tokens shortening weapon cooldown, avoiding the Obsession.","descAr":"ضرب الناجين (غير الهوس) يعطيك سرعة تعافي بعد كل ضربة لتطارد بسرعة."},
  "Stridor": {"name":"Stridor","descEn":"All breathing and injured grunts from Survivors are much louder.","descAr":"أصوات تنفس الناجين وأصوات ألمهم وهم مصابون تصبح أعلى بشكل ملحوظ."},
  "Thanatophobia": {"name":"Thanatophobia","descEn":"The more injured, hooked, or dying Survivors there are, the slower they perform actions.","descAr":"كل ناجٍ مصاب أو معلق يبطئ من سرعة إصلاح وعلاج الفريق بالكامل."},
  "Dying Light": {"name":"Dying Light","descEn":"Penalty to repair and heal speed increases as you hook Survivors, avoiding Obsession.","descAr":"كل تعليقة تعطي الفريق كله عقوبة بطء دائمة في كل شيء باستثناء الهوس."},
  "Forced Penance": {"name":"Forced Penance","descEn":"Taking a protection hit applies the Broken status effect, preventing them from healing.","descAr":"أي شخص يأخذ ضربة دفاعية لحماية صديقه يُصاب بحالة (انكسار) ويتعذر علاجه."},
  "Starstruck": {"name":"Starstruck","descEn":"While carrying a Survivor, Anyone in your Terror Radius becomes Exposed (1-hit down).","descAr":"أثناء حمل ناجٍ، يصبح الناجون في محيطك (نطاق الرعب) عرضة للسقوط بضربة."},
  "Discordance": {"name":"Discordance","descEn":"Any Generator worked on by 2 or more Survivors is highlighted yellow with an alert.","descAr":"يتم كشف المولد بتظليل أصفر إن كان عليه 2 من الناجين، ويصلك إشعار."},
  "Hex: Plaything": {"name":"Hex: Plaything","descEn":"Hooking Survivor makes them oblivious and deaf to your Terror Radius until cleansed.","descAr":"تعليق أي ناجٍ يجعله غير قادر على سماع نبضك أو رؤية شعاعك حتى يكسر طوطمه الخاص."},
  "Hex: Pentimento": {"name":"Hex: Pentimento","descEn":"Allows you to rekindle Broken Totems, imparting massive widespread debuffs to Survivors.","descAr":"يسمح لك بإعادة إشعال الطواطم المكسورة لإعطاء الناجين عقوبات بطء قاسية."},
  "Dead Man's Switch": {"name":"Dead Man's Switch","descEn":"Hooking a Survivor activates this. While active, any Survivors leaving a Gen blocks that Gen.","descAr":"بعد تعليق ناجٍ، إذا ترك أحدهم مولده ينغلق المولد ولا يقدر أحد على إكماله لعدة ثوانٍ."},
  "Hex: Face the Darkness": {"name":"Hex: Face the Darkness","descEn":"Injuring someone lights a totem; ANY Survivor outside your Terror Radius will scream occasionally.","descAr":"إصابة ناجٍ تشعل طوطم. أي ناجٍ خارج نطاق رعبك سيصرخ ويكشف نفسه كل حين."},
  "Lavalier Microphone": {"name":"Lavalier Microphone","descEn":"A teleportation-enhancing addon or perk affecting detection distances / alerts.","descAr":"أداة/قدرة تزيد نطاق الاكتشاف والإنذار بالضوضاء."},
  "Superior Anatomy": {"name":"Superior Anatomy","descEn":"When a Survivor fast vaults near you, your next vault is significantly faster.","descAr":"إذا قفز أحد بجوارك بسرعة كبيرة، تزيد سرعة قفزتك التالية وتكون فورية جداً."},
  "Call of Brine": {"name":"Call of Brine","descEn":"Kicked generators regress very fast, and you get noise alerts if they hit good skill checks.","descAr":"يزيد من سرعة رجوع المولدات عند ركلها، ويصلك صوت إن أصابوا فحوصات مهارة جيدة."},
  "Soma Family Photo": {"name":"Soma Family Photo","descEn":"An exceptional addon boosting speed temporarily but restricts abilities or adds limitations.","descAr":"أداة تعزز السرعة الفائقة مؤقتًا عند الاستخدام."},
  "Rapid Brutality": {"name":"Rapid Brutality","descEn":"You cannot gain Bloodlust. Hitting a Survivor grants 5% Haste for a few seconds.","descAr":"لا تتلقى السرعة التلقائية بالمطاردة، لكن تستلم سرعة هائلة بنسبة 5% بعد ضرب الناجي."},
  "Friends 'Til the End": {"name":"Friends 'Til the End","descEn":"Hooking someone non-Obsession exposes and reveals Obsession. Hooking Obsession changes target.","descAr":"تعليق الناجين يكشف الهوس، وتعليق الهوس يغير الهدف لشخص آخر يجعله مكشوفاً تماماً للضربة."},
  "Unforeseen": {"name":"Unforeseen","descEn":"Kicking a Generator delegates your Terror Radius to the Generator while you become Undetectable.","descAr":"ركل المولّد ينقل دقات الرعب إلى المولد فتصبح بلا صوت لفترة طويلة وتقوم بمفاجأتهم."},
  "Hex: Devour Hope": {"name":"Hex: Devour Hope","descEn":"Gain tokens for unhooks far away. Tokens grant Exposure and ultimately the ability to Mori.","descAr":"يكسبك القوة كلما أُنقذ ناجٍ وأنت بعيد عنه. لتتمكن بالنهاية من القتل فور السقوط."},
  "Perk 1": {"name":"Perk 1","descEn":"Empty Perk Slot 1","descAr":"خانة بيرك 1"},
  "Perk 2": {"name":"Perk 2","descEn":"Empty Perk Slot 2","descAr":"خانة بيرك 2"},
  "Perk 3": {"name":"Perk 3","descEn":"Empty Perk Slot 3","descAr":"خانة بيرك 3"},
  "Perk 4": {"name":"Perk 4","descEn":"Empty Perk Slot 4","descAr":"خانة بيرك 4"}
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
  },
  "The Dark Lord": {
    "versatile-form": [{ perks: ["Dark Arrogance", "Lethal Pursuer", "Pop Goes the Weasel", "Scourge Hook: Pain Resonance"], equipment: { name: "Wolf, Bat, Mist", addons: ["Watchful Eye", "Lapis Lazuli"] } }]
  },
  "The Houndmaster": {
    "scent-tracker": [{ perks: ["Discordance", "Lethal Pursuer", "Jolt", "Save the Best for Last"], equipment: { name: "Falconer", addons: ["Leather Glove", "Scent Tracker"] } }]
  },
  "The First": {
    "primal-fear": [{ perks: ["Corrupt Intervention", "Nowhere to Hide", "Sloppy Butcher", "No Way Out"], equipment: { name: "Primal Roar", addons: ["Torn Cloth", "Sharp Claws"] } }]
  },
  "The Animatronic": {
    "jumpscare": [{ perks: ["Monitor & Abuse", "Discordance", "Hex: Devour Hope", "Lethal Pursuer"], equipment: { name: "Circuitry", addons: ["Old Battery", "Rusty Springs"] } }]
  }
};

export default function Home() {
  const [role, setRole] = useState<Role>("killer");
  const [killerName, setKillerName] = useState<string>("The Trapper");
  const [strategy, setStrategy] = useState<BuildStrategy>("territorial");
  const [buildIndex, setBuildIndex] = useState(0);
  
  // Specific states for Survivor tab switching
  const [survivorTab, setSurvivorTab] = useState<"builds" | "counters">("builds");
  const [counterKillerName, setCounterKillerName] = useState<string>("The Trapper");

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
    const cleanId = rawId.replace(/^(hex|boon|scourgehook|invocation|teamwork|bloodweb)/, "");
    
    // Convert generic lookup type into dictionary prefixes
    const prefixes = type === "perks" ? ["iconperks_", "t_iconperks_"] : 
                     type === "addons" ? ["iconaddon_", "icons_addon_"] : 
                     ["iconitems_", "iconpower_", "iconfavors_"];

    // Find in the dynamically generated dictionary map!
    const dictionary = iconsMap as Record<string, string>;
    
    // First, try exact prefix match
    const searchIds = [rawId, cleanId];
    for (const prefix of prefixes) {
      for (const id of searchIds) {
        const match = dictionary[`${prefix}${id}`];
        if (match) {
           if (match.startsWith('/Perks/') || match.startsWith('/Powers/') || match.startsWith('/ItemAddons/')) return match;
           return `https://raw.githubusercontent.com/Icon-Pack-Provider/Dead-by-daylight-Default-icons/main/${match}`;
        }
      }
    }

    // Second, try generic includes match if spelling is slightly off
    const keyMatch = Object.keys(dictionary).find(k => {
      // Must match one of the valid prefixes
      if (!prefixes.some(p => k.startsWith(p))) return false;
      
      const strippedKey = k.replace(/^(t_)?iconperks_|^(iconaddon_)|^(icons_addon_)|^(iconitems_)|^(iconpower_)/, '');

      return searchIds.some(id => k.includes(id) || id.includes(strippedKey));
    });

    if (keyMatch) {
       const match = dictionary[keyMatch];
       if (match.startsWith('/Perks/') || match.startsWith('/Powers/') || match.startsWith('/ItemAddons/')) return match;
       return `https://raw.githubusercontent.com/Icon-Pack-Provider/Dead-by-daylight-Default-icons/main/${match}`;
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
      <main 
        className="min-h-screen text-neutral-100 p-4 md:p-8 flex flex-col items-center justify-start py-12 font-sans transition-all duration-700 bg-neutral-950"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 10, 10, 0.4), rgba(10, 10, 10, 0.6)), url('/${role}-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-4xl w-full space-y-10">        <header className="text-center space-y-3">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-br from-red-600 to-red-900 bg-clip-text text-transparent drop-shadow-sm">
            DBD Builds
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

        {/* Survivor Sub-tabs */}
        {role === "survivor" && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setSurvivorTab("builds")}
              className={`px-6 py-2 rounded-full font-bold transition-all border ${
                survivorTab === 'builds' 
                  ? "bg-blue-600/30 text-white border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.2)]" 
                  : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Meta Builds
            </button>
            <button
              onClick={() => setSurvivorTab("counters")}
              className={`px-6 py-2 rounded-full font-bold transition-all border ${
                survivorTab === 'counters' 
                  ? "bg-blue-600/30 text-white border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.2)]" 
                  : "bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-neutral-300"
              }`}
            >
              How to Counter
            </button>
          </div>
        )}

        {/* Counters View for Survivor */}
        {role === "survivor" && survivorTab === "counters" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="p-4 border border-neutral-800 rounded-xl bg-neutral-900/30 backdrop-blur-md shadow-inner overflow-hidden">
              <h3 className="text-center font-semibold text-neutral-400 mb-4 tracking-wider uppercase text-sm">Select a Killer to Counter</h3>
              <div className="flex flex-row overflow-x-auto justify-start lg:justify-center gap-3 pb-2 custom-scrollbar">
                {Object.keys(killerData).map(killer => (
                  <button
                    key={killer}
                    onClick={() => setCounterKillerName(killer)}
                    className={`flex-shrink-0 flex flex-col items-center p-2 rounded-xl border transition-all w-24 ${
                      counterKillerName === killer 
                        ? "bg-blue-900/40 border-blue-500/80 shadow-[0_0_15px_rgba(37,99,235,0.3)] scale-105" 
                        : "bg-neutral-900 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-800/80"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full overflow-hidden mb-2 border-2 transition-colors ${counterKillerName === killer ? "border-blue-500 shadow-inner" : "border-neutral-700"} bg-neutral-950`}>
                      <img
                        src={(portraitsMap as Record<string, string>)[killer] || `https://ui-avatars.com/api/?name=${encodeURIComponent(killer)}&background=1a1a1a&color=fff`}
                        alt={killer}
                        className="w-full h-full object-cover opacity-90 hover:opacity-100"
                      />
                    </div>
                    <span className={`text-[10px] font-bold text-center leading-tight ${counterKillerName === killer ? "text-white" : "text-neutral-400"}`}>
                      {killer}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900/40 backdrop-blur-md rounded-2xl p-8 border border-neutral-700/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full"></div>
              <h2 className="text-3xl font-bold flex items-center gap-3 drop-shadow-md mb-6">
                <span className="text-blue-400">Countering</span> {counterKillerName}
              </h2>
              
              <div className="space-y-6">
                <div className="bg-neutral-950/50 rounded-lg p-5 border border-neutral-800">
                  <span className="text-xs uppercase font-bold text-neutral-500 mb-2 block tracking-widest">English Strategy</span>
                  <p className="text-lg text-neutral-200 leading-relaxed font-medium">
                    {(countersMap as any)[counterKillerName]?.en || (countersMap as any)["default"].en}
                  </p>
                </div>

                <div className="bg-neutral-950/50 rounded-lg p-5 border border-neutral-800 text-right" dir="rtl">
                  <span className="text-xs uppercase font-bold text-neutral-500 mb-2 block tracking-widest font-sans">الشرح بالعربي</span>
                  <p className="text-2xl text-amber-400 leading-relaxed font-bold drop-shadow-sm">
                    {(countersMap as any)[counterKillerName]?.ar || (countersMap as any)["default"].ar}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Wrapper for Builds (Visible if Killer OR Survivor on 'builds' tab) */}
        {(role === "killer" || (role === "survivor" && survivorTab === "builds")) && (
          <div className="space-y-8 animate-in fade-in duration-500">
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
                className={`rounded-2xl p-6 md:p-8 border shadow-xl transition-colors duration-500 relative z-10 bg-neutral-900/20 border-neutral-800/30 backdrop-blur-md`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-neutral-800/50 pb-5">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <span className="capitalize">{strategy.replace("-", " ")}</span> Synergy
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1">Recommended setup for maximum efficiency</p>
                  </div>
                  {currentAvailableBuilds.length > 1 && (
                    <button 
                      onClick={handleRefresh}
                      className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-lg text-sm font-semibold transition-colors text-white border border-neutral-700"
                    >
                      <RefreshCw size={18} />
                      Refresh Build
                    </button>
                  )}
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
                          <div key={i} className={`relative group aspect-square border-0 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all hover:-translate-y-1 z-10 hover:z-50`}>
                              <div className={`w-16 h-16 rotate-45 mb-6 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.5)] overflow-hidden border-[2px] border-[#c87bff] group-hover:border-[#e2b5ff] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.9)] transition-all bg-gradient-to-br from-[#7e25a7] via-[#541474] to-[#260538]`}>
                                <AssetIcon name={perkName} type="perks" className="-rotate-45 w-[140%] h-[140%] max-w-none drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)] object-contain object-center scale-110 opacity-100" />
                              </div>

                            {/* Name label beneath the perk */}
                            <span className="text-sm font-bold text-neutral-200 mt-2 leading-tight z-10 drop-shadow-md">{perkName}</span>                            {/* Hover Tooltip - Ensure tooltip is properly layered and readable */}
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
                    <div className="bg-neutral-950/10 backdrop-blur-sm rounded-xl p-5 border border-neutral-800/80 flex flex-col md:flex-row items-center gap-6">
                      
                      {/* Item/Power Icon */}
                      <div className="w-16 h-16 border border-neutral-700/50 rounded flex items-center justify-center shadow-inner group overflow-hidden shrink-0 bg-neutral-900/60 backdrop-blur-md">
                        <AssetIcon 
                          name={activeBuild.equipment.name} 
                          type={role === "survivor" ? "items" : "powers"} 
                          className="w-12 h-12 rotate-[-5deg] group-hover:rotate-0 transition-transform opacity-100 drop-shadow-xl" 
                        />
                      </div>
                      
                      <div className="flex-1 w-full text-center md:text-left">
                        <span className="font-bold text-white text-lg block drop-shadow-md">{activeBuild.equipment.name}</span>
                        <p className="text-sm font-medium text-neutral-500 mt-1">{role === "survivor" ? "Held Item" : "Killer Power"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tutorial / Strategy Guide - New Section Added */}
                  {role === "killer" && tutorialsMap[killerName as keyof typeof tutorialsMap] && (
                    <div className="mt-8 bg-blue-900/10 border border-blue-800/30 rounded-xl p-5 md:p-6 opacity-90 hover:opacity-100 transition-opacity">
                      <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={16} /> Quick Strategy Guide
                      </h3>
                      <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
                        {(tutorialsMap[killerName as keyof typeof tutorialsMap] as Record<string, string>)[strategy] || 
                         "Use your core power effectively while monitoring your overall map pressure. Your perks will carry you through chases and generator slowdown organically."}
                      </p>
                    </div>
                  )}

                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Footer / Credits */}
        <div className="mt-12 pb-8 text-center flex flex-col items-center gap-3 animate-in fade-in duration-700 delay-300">
          <p className="text-neutral-400 font-medium tracking-wide">Done by : <span className="text-neutral-200 font-bold">StigQ8</span></p>
          <a 
            href="https://www.twitch.tv/stigq8" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#9146FF] hover:bg-[#a970ff] text-white rounded-xl font-bold transition-all hover:-translate-y-1 shadow-lg shadow-[#9146FF]/20 ring-1 ring-[#9146FF]/50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
            Twitch Channel
          </a>
        </div>

      </div>
    </main>
  );
}

