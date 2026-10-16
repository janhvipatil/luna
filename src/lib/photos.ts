import type { AspectRatio, VisualStyle } from "./types";
import { FORMAT_PRESETS } from "./constants";

/**
 * A curated library of food & hospitality photography (Unsplash, free to use
 * under the Unsplash License). It powers template covers, storyboard card
 * covers and the built-in preview provider, which picks the photo that best
 * matches a scene's prompt so storyboards look like real café content before a
 * generation backend is connected.
 */

export interface Photo {
  /** Unsplash CDN id — the part after `photo-` in images.unsplash.com URLs. */
  id: string;
  /** Lower-case keywords matched against prompts. Earlier = more specific. */
  tags: string[];
}

export const PHOTOS: Photo[] = [
  // Coffee, matcha & drinks
  { id: "1515823064-d6e0c04616a7", tags: ["matcha", "matcha latte", "green tea", "chawan", "whisk", "latte art"] },
  { id: "1536256263959-770b48d82b0a", tags: ["matcha", "iced matcha", "green tea", "latte"] },
  { id: "1509042239860-f550ce710b93", tags: ["latte art", "latte", "cappuccino", "coffee", "flat white", "cup"] },
  { id: "1495474472287-4d71bcdd2085", tags: ["latte", "coffee", "cheers", "friends", "cups", "loyalty"] },
  { id: "1511920170033-f8396924c348", tags: ["espresso", "beans", "grind", "grinder", "portafilter", "coffee"] },
  { id: "1442512595331-e89e73853f31", tags: ["pour over", "filter coffee", "brew", "kettle", "barista", "coffee", "first brew"] },
  { id: "1461023058943-07fcbe16d735", tags: ["iced coffee", "cold brew", "iced", "drink", "summer"] },
  { id: "1497534446932-c925b458314e", tags: ["lemonade", "spritz", "pink drink", "summer drink", "cocktail", "drinks"] },
  { id: "1551538827-9c037cb4f32a", tags: ["mojito", "pour", "refreshing", "lime", "soda", "drink"] },
  { id: "1514362545857-3bc16c4c7d1b", tags: ["cocktail", "happy hour", "bar", "night", "evening", "drink"] },
  { id: "1470337458703-46ad1756a187", tags: ["cocktail", "shaker", "pour", "whisky", "old fashioned", "bar", "ice"] },
  { id: "1600271886742-f049cd451bba", tags: ["juice", "orange juice", "fresh juice", "breakfast drink"] },

  // Bakery & desserts
  { id: "1555507036-ab1f4038808a", tags: ["croissant", "pastry", "pastries", "oven", "flour", "bake", "flaky"] },
  { id: "1509440159596-0249088772ff", tags: ["bread", "sourdough", "loaf", "bakery", "baker", "bake"] },
  { id: "1517686469429-8bdb88b9f907", tags: ["dough", "kneading", "baker", "hands", "flour", "5am", "bakery"] },
  { id: "1495147466023-ac5c588e2e94", tags: ["tart", "tarts", "pastry counter", "bake case", "pastries", "counter"] },
  { id: "1533134242443-d4fd215305ad", tags: ["cheesecake", "basque", "slice", "dessert", "cake"] },
  { id: "1578985545062-69928b1d9587", tags: ["chocolate cake", "cake", "celebration", "dessert", "birthday"] },
  { id: "1565958011703-44f9829ba187", tags: ["cake slice", "raspberry", "layer cake", "dessert", "cake"] },
  { id: "1571877227200-a0d98ea607e9", tags: ["tiramisu", "dessert", "date night", "sweet"] },
  { id: "1551024601-bec78aea704b", tags: ["donut", "doughnut", "sprinkles", "sweet", "dessert"] },
  { id: "1563729784474-d77dbb933a9e", tags: ["cupcake", "cupcakes", "frosting", "dessert", "mochi", "pastel"] },
  { id: "1499636136210-6f4ee915583e", tags: ["cookie", "cookies", "chocolate chip", "crumbs", "bake"] },
  { id: "1558961363-fa8fdf82db35", tags: ["cookie", "cookies", "cookie box", "basket", "gift"] },
  { id: "1563805042-7684c019e1cb", tags: ["sundae", "ice cream", "dessert", "milkshake", "oreo"] },
  { id: "1488477181946-6428a0291777", tags: ["yogurt", "parfait", "strawberry", "pots", "healthy"] },
  { id: "1607920591413-4ec007e70023", tags: ["brownie", "brownies", "chocolate", "fudge"] },

  // Brunch & breakfast
  { id: "1567620905732-2d1ec7ab7445", tags: ["pancakes", "pancake", "stack", "syrup", "maple", "brunch"] },
  { id: "1600326145552-327f74b9c189", tags: ["pancakes", "berries", "stack", "brunch", "strawberries"] },
  { id: "1484723091739-30a097e8f929", tags: ["french toast", "berries", "brunch", "syrup", "banana"] },
  { id: "1504754524776-8f4f37790ca0", tags: ["brunch spread", "overhead", "spread", "waffles", "brunch", "table", "flat lay"] },
  { id: "1424847651672-bf20a4b0982b", tags: ["brunch", "table", "hands reaching", "sharing", "overhead", "spread", "friends"] },
  { id: "1525351484163-7529414344d8", tags: ["egg", "fried egg", "toast", "yolk", "breakfast"] },
  { id: "1541519227354-08fa5d50c44d", tags: ["avocado toast", "avocado", "egg", "poached egg", "yolk", "brunch"] },
  { id: "1482049016688-2d3e1b311543", tags: ["eggs benedict", "egg", "avocado", "toast", "brunch"] },

  // Mains, bowls & Japanese
  { id: "1569718212165-3a8278d5f624", tags: ["ramen", "noodle pull", "chopsticks", "noodles", "broth", "egg"] },
  { id: "1557872943-16a5ac26437e", tags: ["ramen", "tonkotsu", "egg", "ajitama", "broth", "noodles"] },
  { id: "1591814468924-caf88d1232e1", tags: ["ramen", "noodles", "bowl", "egg", "corn"] },
  { id: "1582878826629-29b7ad1cdc43", tags: ["pho", "noodle soup", "broth", "noodles", "soup"] },
  { id: "1607330289024-1535c6b4e1c1", tags: ["laksa", "curry noodles", "noodles", "coconut", "spicy"] },
  { id: "1579584425555-c3ce17fd4351", tags: ["sushi", "japanese", "onigiri", "salmon", "soy"] },
  { id: "1611143669185-af224c5e3252", tags: ["sushi platter", "sushi", "japanese", "bento", "onigiri", "lunch set"] },
  { id: "1615361200141-f45040f367be", tags: ["nigiri", "sushi", "chopsticks", "salmon", "japanese"] },
  { id: "1563245372-f21724e3856d", tags: ["dumplings", "dim sum", "bao", "steam", "steamer"] },
  { id: "1546069901-ba9599a7e63c", tags: ["poke", "bowl", "lunch bowl", "lunch deal", "healthy", "takeaway"] },
  { id: "1512621776951-a57141f2eefd", tags: ["salad", "buddha bowl", "vegan", "healthy", "fresh", "vegetables"] },
  { id: "1540189549336-e6e99c3679fe", tags: ["salad", "seasonal", "greens", "fresh"] },
  { id: "1514516345957-556ca7d90a29", tags: ["seasonal dish", "salad", "fruit", "special"] },
  { id: "1473093295043-cdd812d0e601", tags: ["pasta salad", "pasta", "farfalle", "lunch"] },
  { id: "1611270629569-8b357cb88da9", tags: ["pasta", "tagliatelle", "ragu", "italian", "dinner"] },
  { id: "1565299624946-b28f40a0ae38", tags: ["pizza", "slice", "cheese pull", "italian"] },
  { id: "1530554764233-e79e16c91d08", tags: ["burger stack", "burger", "flying", "layers", "drop"] },
  { id: "1550547660-d9450f859349", tags: ["burger", "burgers", "fries", "smash burger"] },
  { id: "1574484284002-952d92456975", tags: ["salmon", "curry", "pan", "dinner"] },
  { id: "1559847844-5315695dadae", tags: ["curry", "prawns", "shrimp", "rice", "dinner"] },
  { id: "1504674900247-0877df9cc836", tags: ["steak", "spread", "dinner", "plates", "flat lay"] },
  { id: "1414235077428-338989a2e8c0", tags: ["fine dining", "plated", "plating", "dinner", "restaurant", "chef", "dish"] },

  // People & craft
  { id: "1577219491135-ce391730fb2c", tags: ["chef plating", "chef", "plating", "tweezers", "hands", "kitchen", "craft"] },
  { id: "1581299894007-aaa50297cf16", tags: ["chef portrait", "chef", "meet the team", "portrait", "smiling"] },
  { id: "1556910103-1c02745aae4d", tags: ["team", "kitchen", "cooking", "behind the scenes", "staff"] },
  { id: "1556909114-f6e7ad7d3136", tags: ["cooking", "kitchen", "team", "pot"] },
  { id: "1533777857889-4be7c70b33f7", tags: ["customer", "first bite", "bite", "eating", "reaction", "review"] },
  { id: "1528605248644-14dd04022da1", tags: ["friends", "group", "dinner party", "laughing", "crowd", "table"] },
  { id: "1501386761578-eac5c94b800a", tags: ["crowd", "cheering", "concert", "party", "event"] },
  { id: "1511671782779-c97d3d27a1d4", tags: ["microphone", "live music", "gig", "open mic", "music"] },
  { id: "1526367790999-0150786686a2", tags: ["delivery", "rider", "takeaway", "order in"] },
  { id: "1488459716781-31db52582fe9", tags: ["farm", "market", "produce", "vegetables", "local", "sourcing"] },
  { id: "1542838132-92c53300491e", tags: ["produce", "vegetables", "greens", "grocer", "fresh"] },

  // Spaces
  { id: "1445116572660-236099ec97a0", tags: ["window", "window seat", "café table", "cozy", "french press", "interior"] },
  { id: "1554118811-1e0d58224f24", tags: ["café interior", "interior", "plants", "cozy", "seating", "cafe"] },
  { id: "1453614512568-c4024d13c247", tags: ["counter", "espresso machine", "coffee shop", "café counter", "bar counter", "opening"] },
  { id: "1501339847302-ac426a4a7cbb", tags: ["café sign", "sign", "cafe", "neon", "opening", "doors open"] },
  { id: "1555396273-367ea4eb4db5", tags: ["restaurant interior", "interior", "industrial", "pendant lights", "lights on"] },
  { id: "1517248135467-4c7edcad34c4", tags: ["restaurant", "dining room", "interior", "tables", "evening"] },
  { id: "1521017432531-fbd92d768814", tags: ["café interior", "interior", "empty", "chairs", "morning"] },
  { id: "1525610553991-2bede1a236e2", tags: ["busy", "crowd", "customers", "full", "atmosphere", "lively"] },
  { id: "1559925393-8be0ec4767c8", tags: ["exterior", "storefront", "street", "terrace", "chalkboard", "outside"] },
  { id: "1559339352-11d035aa65de", tags: ["terrace", "outdoor", "seaside", "patio", "summer"] },
  { id: "1514933651103-005eec06c04b", tags: ["bar", "bar interior", "night", "candlelit", "wine bar", "evening"] },
  { id: "1534040385115-33dcb3acba5b", tags: ["window seat", "sunny table", "sunny window", "notebook", "slow morning", "coffee"] },
];

/** Fallback pools when nothing in the prompt matches a tag. */
const STYLE_FALLBACK: Partial<Record<VisualStyle, string[]>> = {
  "food-closeup": ["1569718212165-3a8278d5f624", "1555507036-ab1f4038808a", "1533134242443-d4fd215305ad", "1567620905732-2d1ec7ab7445"],
  "flat-lay": ["1504754524776-8f4f37790ca0", "1424847651672-bf20a4b0982b", "1504674900247-0877df9cc836", "1611143669185-af224c5e3252"],
  "cozy-ambient": ["1554118811-1e0d58224f24", "1445116572660-236099ec97a0", "1453614512568-c4024d13c247", "1521017432531-fbd92d768814"],
  cinematic: ["1577219491135-ce391730fb2c", "1514362545857-3bc16c4c7d1b", "1414235077428-338989a2e8c0"],
  photographic: ["1533777857889-4be7c70b33f7", "1509042239860-f550ce710b93", "1541519227354-08fa5d50c44d"],
  "product-shot": ["1509042239860-f550ce710b93", "1555507036-ab1f4038808a", "1515823064-d6e0c04616a7"],
  retro: ["1501339847302-ac426a4a7cbb", "1514933651103-005eec06c04b"],
};

const DEFAULT_POOL = STYLE_FALLBACK["food-closeup"]!;

/** Styles that are illustrations — photos would be wrong for them. */
export const NON_PHOTO_STYLES: VisualStyle[] = ["flat-illustration", "anime", "3d-render"];

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Pick the photo whose tags best match the text. Multi-word tags score higher,
 * the first (subject) tag counts most, and earlier tags count a little more. Ties (and re-rolls via `seed`) choose
 * deterministically among the best matches so each take can differ.
 */
export function pickPhoto(
  text: string,
  opts: { style?: VisualStyle; seed?: number; avoid?: string[] } = {},
): string {
  const haystack = ` ${text.toLowerCase().replace(/[^a-z0-9é\s]/g, " ").replace(/\s+/g, " ")} `;
  let best: string[] = [];
  let bestScore = 0;
  for (const photo of PHOTOS) {
    let score = 0;
    photo.tags.forEach((tag, i) => {
      // The first tag is the photo's subject — matching it matters most.
      if (haystack.includes(` ${tag} `)) score += tag.split(" ").length * 3 + (i === 0 ? 6 : Math.max(0, 3 - i));
    });
    if (score > bestScore) {
      bestScore = score;
      best = [photo.id];
    } else if (score === bestScore && score > 0) {
      best.push(photo.id);
    }
  }
  const matched = best.length ? best : (opts.style && STYLE_FALLBACK[opts.style]) || DEFAULT_POOL;
  // Among equally good matches, skip photos already used (e.g. earlier scenes
  // of the same storyboard) so a storyboard doesn't repeat one shot.
  const fresh = matched.filter((id) => !opts.avoid?.includes(id));
  const pool = fresh.length ? fresh : matched;
  const pick = hash(text) + (opts.seed ?? 0);
  return pool[pick % pool.length];
}

/**
 * CDN URL for a photo, cropped to the given size. `format: "jpg"` pins JPEG
 * (needed when the photo becomes a scene asset Veo can animate); the default
 * lets the CDN serve WebP/AVIF to browsers.
 */
export function photoUrl(
  id: string,
  width: number,
  height?: number,
  { quality = 80, format = "auto" }: { quality?: number; format?: "auto" | "jpg" } = {},
): string {
  const size = height ? `&w=${width}&h=${height}` : `&w=${width}`;
  const fmt = format === "jpg" ? "fm=jpg" : "auto=format";
  return `https://images.unsplash.com/photo-${id}?${fmt}&fit=crop${size}&q=${quality}`;
}

/** CDN URL cropped to a storyboard aspect ratio (long edge = `longEdge`). */
export function photoUrlForAspect(id: string, aspect: AspectRatio, longEdge = 1080): string {
  const { width, height } = FORMAT_PRESETS[aspect];
  const scale = longEdge / Math.max(width, height);
  return photoUrl(id, Math.round(width * scale), Math.round(height * scale), { format: "jpg" });
}
