import type { AspectRatio, GeneratedAsset, Template, TemplateCategory } from "./types";
import { NON_PHOTO_STYLES, photoUrlForAspect, pickPhoto } from "./photos";
import exampleMedia from "./examples.media.json";
import { personalize, type VenueProfile } from "./venue";

/**
 * Starter storyboards for cafés and restaurants. Each is a proven short-form
 * structure written around food & hospitality — the fastest path from "blank"
 * to "generating". Text uses venue tokens ({venue}, {signature}, {location},
 * {type}, {vibe}) that are filled from the user's venue profile on creation.
 */

export const TEMPLATE_CATEGORIES: Array<{ id: TemplateCategory; label: string }> = [
  { id: "menu", label: "Menu & dishes" },
  { id: "promo", label: "Offers & promos" },
  { id: "story", label: "Behind the scenes" },
  { id: "events", label: "Events & seasons" },
  { id: "social", label: "Social & reviews" },
];

export const TEMPLATES: Template[] = [
  // ── Menu & dishes ────────────────────────────────────────────────────────
  {
    id: "signature-dish",
    cover: "1414235077428-338989a2e8c0",
    name: "Signature Dish Spotlight",
    description: "Slow, sensory build-up to the one thing everyone orders.",
    format: "9:16",
    accent: "#ea580c",
    category: "menu",
    emoji: "🍽️",
    scenes: [
      { title: "Tease", prompt: "Extreme macro of {signature}, glistening textures, steam rising, dark moody background", script: "You've seen it on your feed.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Craft", prompt: "Chef's hands carefully plating {signature}, tweezers and sauce swoosh, warm kitchen light", script: "Made by hand, every single time.", style: "cinematic", medium: "video", durationSec: 4 },
      { title: "The moment", prompt: "Fork breaking into {signature}, slow-motion reveal of the inside, crumbs and sauce, appetising", script: "This is the bite.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Setting", prompt: "Plate of {signature} on a sunny window table inside a {vibe} {type}, coffee cup beside it", script: "Only at {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Overhead flat lay of {signature} with negative space for text, linen napkin, ceramic plate", script: "Come hungry. See you at {venue}.", style: "flat-lay", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "new-menu-drop",
    cover: "1504754524776-8f4f37790ca0",
    name: "New Menu Drop",
    description: "Countdown-style reveal of new dishes — built for launch week.",
    format: "9:16",
    accent: "#16a34a",
    category: "menu",
    emoji: "✨",
    scenes: [
      { title: "Announce", prompt: "Hand flipping open a fresh printed menu on a marble counter, crisp morning light", script: "New menu. Just landed.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "Dish 1", prompt: "Hero close-up of a vibrant seasonal salad with edible flowers, glossy dressing drizzle", script: "Number one: fresh and bright.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Dish 2", prompt: "Steaming bowl of slow-cooked comfort food, spoon lifting a perfect bite", script: "Number two: pure comfort.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Dish 3", prompt: "Decadent dessert being finished with a dusting of icing sugar, slow motion", script: "And one for the sweet tooth.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Spread", prompt: "Overhead flat lay of all new dishes together on a shared table, hands reaching in", script: "Which one are you trying first?", style: "flat-lay", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Exterior of {venue} with an open sign and chalkboard reading NEW MENU, golden hour", script: "Available now at {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "latte-art",
    cover: "1509042239860-f550ce710b93",
    name: "Coffee Ritual",
    description: "ASMR-style coffee pour — grind, tamp, pull, latte art. Endlessly rewatchable.",
    format: "9:16",
    accent: "#92400e",
    category: "menu",
    emoji: "☕",
    scenes: [
      { title: "Grind", prompt: "Close-up of fresh coffee beans pouring into a grinder, rich brown tones, dramatic side light", script: "It starts with the beans.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Pull", prompt: "Espresso shot pulling from a bottomless portafilter into a glass cup, golden crema, slow motion", script: "Twenty-eight seconds of patience.", style: "cinematic", medium: "video", durationSec: 4 },
      { title: "Pour", prompt: "Barista pouring silky steamed milk forming a rosetta latte art, top-down macro", script: "Then a little art.", style: "food-closeup", medium: "video", durationSec: 4 },
      { title: "Serve", prompt: "Finished latte on a saucer slid across a wooden counter toward camera, café blurred behind", script: "Your morning, sorted.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Takeaway cup with the {venue} logo held up against a sunny street", script: "Pull up a chair at {venue}.", style: "photographic", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "bake-of-the-day",
    cover: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Cardamom_buns.jpg/1280px-Cardamom_buns.jpg",
    name: "Fresh Out the Oven",
    description: "Morning bake reveal — perfect for bakeries and pastry counters.",
    format: "4:5",
    accent: "#d97706",
    category: "menu",
    emoji: "🥐",
    scenes: [
      { title: "Early start", prompt: "Baker dusting flour on a wooden bench before dawn, single warm pendant light, flour in the air", script: "5am. The ovens are on.", style: "cinematic", medium: "image", durationSec: 3 },
      { title: "Oven door", prompt: "Oven door opening to reveal trays of golden laminated pastries, steam billowing out", script: "Fresh out the oven…", style: "food-closeup", medium: "video", durationSec: 4 },
      { title: "Flake", prompt: "Hands tearing a croissant in half showing honeycomb layers, flakes falling in slow motion", script: "Listen to that crunch.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Counter", prompt: "Glass pastry counter fully stocked with {signature} and other bakes, morning sunlight", script: "Until they're gone. Get here early.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },

  // ── Offers & promos ──────────────────────────────────────────────────────
  {
    id: "happy-hour",
    cover: "1497534446932-c925b458314e",
    name: "Happy Hour",
    description: "Punchy, upbeat promo for a time-limited deal.",
    format: "9:16",
    accent: "#db2777",
    category: "promo",
    emoji: "🍹",
    scenes: [
      { title: "Hook", prompt: "Cocktail shaker mid-shake with ice splashing, neon-tinged bar lighting, high energy", script: "It's 5 o'clock somewhere. Here, actually.", style: "cinematic", medium: "video", durationSec: 3 },
      { title: "The pour", prompt: "Bright cocktail poured over clear ice into a coupe glass, citrus twist, bokeh bar lights", script: "Two-for-one on house cocktails.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Bites", prompt: "Overhead of shared small plates and drinks on a busy bar counter, friends' hands clinking glasses", script: "Plus half-price bar bites.", style: "flat-lay", medium: "image", durationSec: 3 },
      { title: "Crowd", prompt: "Lively friends laughing at a candlelit table inside {venue}, warm evening glow", script: "Bring the group chat.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Bold graphic of a clock showing 5 to 7 over a cocktail silhouette, brand colour background", script: "Daily, 5–7pm at {venue}.", style: "flat-illustration", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "limited-time",
    cover: "1533134242443-d4fd215305ad",
    name: "Limited-Time Special",
    description: "Scarcity-driven promo for a seasonal or weekend-only item.",
    format: "9:16",
    accent: "#dc2626",
    category: "promo",
    emoji: "⏳",
    scenes: [
      { title: "Hook", prompt: "Dramatic reveal of a special dish under a lifting cloche, steam escaping, spotlight", script: "Here for a good time, not a long time.", style: "cinematic", medium: "video", durationSec: 3 },
      { title: "Details", prompt: "Macro sweep across the special dish showing every ingredient and texture", script: "Seasonal ingredients, this week only.", style: "food-closeup", medium: "video", durationSec: 4 },
      { title: "Reaction", prompt: "Customer taking first bite and closing eyes in delight, café window light", script: "People are already coming back for seconds.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Chalkboard sign reading LIMITED next to the dish, cozy café counter", script: "Gone Sunday. Don't miss it.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "loyalty",
    cover: "1495474472287-4d71bcdd2085",
    name: "Loyalty Card",
    description: "Turn first-timers into regulars — promote your stamp card or app.",
    format: "1:1",
    accent: "#7c3aed",
    category: "promo",
    emoji: "💳",
    scenes: [
      { title: "Hook", prompt: "Coffee loyalty card with nine stamps and one empty space, on a café table beside a latte", script: "One stamp away from free coffee?", style: "product-shot", medium: "image", durationSec: 3 },
      { title: "How it works", prompt: "Barista stamping a card at the till with a smile, friendly interaction", script: "Every visit counts at {venue}.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "Reward", prompt: "Free drink handed across the counter with a little thank-you note, warm light", script: "Your 10th is on us.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Illustrated card with stamps forming a heart, brand colour background", script: "Ask for a card on your next visit.", style: "flat-illustration", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "delivery",
    cover: "1526367790999-0150786686a2",
    name: "Order In Tonight",
    description: "Push delivery & takeaway — from kitchen to couch.",
    format: "9:16",
    accent: "#0891b2",
    category: "promo",
    emoji: "🛵",
    scenes: [
      { title: "Hook", prompt: "Person on a sofa in pyjamas scrolling a phone, cozy evening lamp light, relatable", script: "Too cosy to go out?", style: "photographic", medium: "image", durationSec: 3 },
      { title: "Kitchen", prompt: "Fast-paced kitchen line packing fresh dishes into eco takeaway boxes, steam and motion", script: "We'll bring {venue} to you.", style: "cinematic", medium: "video", durationSec: 3 },
      { title: "Unbox", prompt: "Overhead of takeaway boxes opening to reveal colourful hot food on a coffee table", script: "Still hot. Still perfect.", style: "flat-lay", medium: "video", durationSec: 3 },
      { title: "CTA", prompt: "Phone screen mockup showing an order button next to {signature}, brand colours", script: "Order now — link in bio.", style: "flat-illustration", medium: "image", durationSec: 3 },
    ],
  },

  // ── Behind the scenes ────────────────────────────────────────────────────
  {
    id: "morning-open",
    cover: "1453614512568-c4024d13c247",
    name: "Opening Up",
    description: "A calm 'day in the life' of opening the doors. Builds connection.",
    format: "9:16",
    accent: "#ca8a04",
    category: "story",
    emoji: "🌅",
    scenes: [
      { title: "Keys", prompt: "Hand turning a key in the front door of a small café at sunrise, quiet street", script: "6:30am in {location}.", style: "cinematic", medium: "image", durationSec: 3 },
      { title: "Lights on", prompt: "Pendant lights flickering on inside an empty {vibe} café, chairs being set down", script: "Lights on. Chairs down.", style: "cozy-ambient", medium: "video", durationSec: 3 },
      { title: "First brew", prompt: "First batch of filter coffee dripping into a carafe, steam, morning light beams", script: "First coffee is always for us.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Counter ready", prompt: "Pastry counter being filled with fresh bakes, staff arranging with care", script: "Everything made fresh.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "Doors open", prompt: "Flipping the door sign to OPEN, first customer walking in smiling", script: "Come say good morning at {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "meet-the-team",
    cover: "1581299894007-aaa50297cf16",
    name: "Meet the Team",
    description: "Put faces to the food — chef, barista or owner introductions.",
    format: "9:16",
    accent: "#2563eb",
    category: "story",
    emoji: "👩‍🍳",
    scenes: [
      { title: "Intro", prompt: "Warm portrait of a chef in apron leaning on the pass, smiling at camera, kitchen behind", script: "Meet the people behind {venue}.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "Their craft", prompt: "Close-up of skilled hands at work — kneading dough, pouring latte art, plating", script: "Every dish has a person behind it.", style: "cinematic", medium: "video", durationSec: 4 },
      { title: "Favourite", prompt: "Team member holding up their favourite menu item to camera, playful", script: "Their pick? {signature}.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Whole team gathered behind the counter waving, candid and joyful", script: "Come say hi — we'll put the kettle on.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "farm-to-table",
    cover: "1488459716781-31db52582fe9",
    name: "Farm to Table",
    description: "Show where your ingredients come from — local suppliers and sourcing.",
    format: "4:5",
    accent: "#65a30d",
    category: "story",
    emoji: "🌿",
    scenes: [
      { title: "Source", prompt: "Crate of fresh vegetables and herbs at a local farm, morning dew, soft light", script: "It starts here, not in a warehouse.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "Delivery", prompt: "Farmer handing a crate of produce to a chef at the café back door, handshake", script: "Local growers we know by name.", style: "cinematic", medium: "image", durationSec: 3 },
      { title: "Prep", prompt: "Knife slicing through vibrant fresh produce on a wooden board, macro", script: "Prepped fresh every morning.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Plate", prompt: "Finished seasonal dish beautifully plated, herbs garnish, natural light", script: "Tasted at {venue}.", style: "food-closeup", medium: "image", durationSec: 3 },
    ],
  },

  // ── Events & seasons ─────────────────────────────────────────────────────
  {
    id: "weekend-brunch",
    cover: "1567620905732-2d1ec7ab7445",
    name: "Weekend Brunch",
    description: "Lazy-Sunday energy: stacks, spritzes and slow mornings.",
    format: "9:16",
    accent: "#f59e0b",
    category: "events",
    emoji: "🥞",
    scenes: [
      { title: "Hook", prompt: "Tall stack of fluffy pancakes with maple syrup pouring down in slow motion, berries on top", script: "Weekend plans: sorted.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Table", prompt: "Overhead brunch spread — eggs benedict, avocado toast, fresh juice, flowers — friends' hands", script: "Bottomless coffee, zero rush.", style: "flat-lay", medium: "image", durationSec: 4 },
      { title: "Yolk", prompt: "Knife cutting into a poached egg, golden yolk running over toast, macro", script: "The yolk porn you came for.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Vibe", prompt: "Sunny {vibe} café full of people chatting over brunch, plants and natural light", script: "Saturdays & Sundays, 9 till 3.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Reserved sign on a sunny window table set for brunch", script: "Book your table at {venue}.", style: "photographic", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "live-music",
    cover: "1511671782779-c97d3d27a1d4",
    name: "Live Music Night",
    description: "Event promo with atmosphere — gigs, open mics, quiz nights.",
    format: "9:16",
    accent: "#9333ea",
    category: "events",
    emoji: "🎶",
    scenes: [
      { title: "Hook", prompt: "Acoustic guitarist on a small stage in a dim café, warm spotlight, string lights", script: "This Friday, the lights go down…", style: "cinematic", medium: "video", durationSec: 3 },
      { title: "Atmosphere", prompt: "Candlelit tables with wine glasses and sharing boards, audience silhouettes", script: "Good food, good wine, live sets.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "Details", prompt: "Illustrated gig poster with a guitar and date, warm retro colours", script: "Friday · 8pm · Free entry.", style: "retro", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Crowd clapping and cheering at {venue}, joyful night atmosphere", script: "Tables go fast — book now.", style: "cinematic", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "seasonal-menu",
    cover: "1461023058943-07fcbe16d735",
    name: "Seasonal Favourite",
    description: "Pumpkin spice, summer spritz or festive specials — swap the season.",
    format: "4:5",
    accent: "#c2410c",
    category: "events",
    emoji: "🍂",
    scenes: [
      { title: "Season", prompt: "Autumn leaves falling past a café window, warm drink steaming on the sill", script: "It's that time of year again.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "Return", prompt: "Seasonal latte topped with whipped cream and cinnamon, held in mittens, macro", script: "Your favourite is back.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Pairing", prompt: "Overhead of seasonal drink with a matching spiced pastry on a knit-textured table", script: "Perfect with a spiced bake.", style: "flat-lay", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Chalkboard menu listing seasonal specials in hand lettering", script: "For a limited season at {venue}.", style: "photographic", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "grand-opening",
    cover: "1501339847302-ac426a4a7cbb",
    name: "Grand Opening",
    description: "Build hype for a launch or new location.",
    format: "9:16",
    accent: "#e11d48",
    category: "events",
    emoji: "🎉",
    scenes: [
      { title: "Teaser", prompt: "Papered-over shop window with a hint of light inside, sign reading COMING SOON", script: "Something's brewing in {location}…", style: "cinematic", medium: "image", durationSec: 3 },
      { title: "Sneak peek", prompt: "Quick glimpses of a new café interior — tiles, plants, espresso machine being polished", script: "We've been busy.", style: "cozy-ambient", medium: "video", durationSec: 4 },
      { title: "Menu taste", prompt: "Hero shot of {signature} on the new counter, spotlight", script: "Starring {signature}.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Date", prompt: "Ribbon being cut at the front door with confetti, crowd cheering", script: "Doors open this Saturday.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Bold graphic: free coffee for the first 50 guests, brand colour background", script: "First 50 guests get a free coffee. See you there.", style: "flat-illustration", medium: "image", durationSec: 3 },
    ],
  },

  // ── Social & reviews ─────────────────────────────────────────────────────
  {
    id: "reviews",
    cover: "1533777857889-4be7c70b33f7",
    name: "What Regulars Say",
    description: "Turn your best reviews into social proof.",
    format: "4:5",
    accent: "#0d9488",
    category: "social",
    emoji: "⭐",
    scenes: [
      { title: "Stars", prompt: "Five golden stars glowing above a café table with a coffee cup, soft bokeh", script: "Don't take our word for it.", style: "cinematic", medium: "image", durationSec: 3 },
      { title: "Review 1", prompt: "Happy customer smiling over a plate of {signature}, window light", script: "“Best {signature} in {location}.”", style: "photographic", medium: "image", durationSec: 3 },
      { title: "Review 2", prompt: "Couple sharing dessert and laughing at a cozy corner table", script: "“Our new favourite date spot.”", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "Review 3", prompt: "Regular at the counter greeted by name by the barista", script: "“Feels like coming home.”", style: "photographic", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Inviting exterior of {venue} with a busy terrace, golden hour", script: "See what the fuss is about.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "pov-order",
    cover: "1534040385115-33dcb3acba5b",
    name: "POV: Your Order",
    description: "Trend-friendly first-person format — from walking in to first bite.",
    format: "9:16",
    accent: "#4f46e5",
    category: "social",
    emoji: "📱",
    scenes: [
      { title: "Walk in", prompt: "First-person view walking through the door of a {vibe} café, bell above the door", script: "POV: you finally tried {venue}.", style: "cozy-ambient", medium: "video", durationSec: 3 },
      { title: "Order", prompt: "First-person view at the counter pointing at {signature} in the pastry case", script: "You point at the {signature}. Obviously.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "Window seat", prompt: "First-person view of a tray set down on a sunny window seat, drink and plate", script: "Best seat in the house.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "Bite", prompt: "First-person bite of {signature}, crumbs, slow motion, ultra appetising", script: "And now you get it.", style: "food-closeup", medium: "video", durationSec: 3 },
    ],
  },
  // ── More formats ─────────────────────────────────────────────────────────
  {
    id: "dessert-pull",
    cover: "1578985545062-69928b1d9587",
    name: "Dessert Moment",
    description: "One slow, indulgent slice — the dessert that sells itself.",
    format: "9:16",
    accent: "#9d174d",
    category: "menu",
    emoji: "🍰",
    scenes: [
      { title: "Tease", prompt: "Whole chocolate cake on a stand under warm light, glossy ganache dripping down the sides", script: "Saved room for dessert?", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Slice", prompt: "Knife slicing a cake slice and lifting it out to reveal soft layers, slow motion", script: "Good. Because this exists.", style: "food-closeup", medium: "video", durationSec: 4 },
      { title: "Fork", prompt: "Fork pressing into the cake slice, crumbs and cream, macro", script: "Rich, soft, not too sweet.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "CTA", prompt: "Cake slice with a coffee on a café table by the window, cozy", script: "Treat yourself at {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "noodle-pull",
    cover: "1569718212165-3a8278d5f624",
    name: "The Noodle Pull",
    description: "Steam, broth, chopsticks — the most satisfying shot in food video.",
    format: "9:16",
    accent: "#b45309",
    category: "menu",
    emoji: "🍜",
    scenes: [
      { title: "Steam", prompt: "Steaming bowl of ramen with broth, egg and chashu, dark moody background, steam rising", script: "Soup season is every season.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Pull", prompt: "Chopsticks lifting springy noodles from the ramen bowl, slow motion, broth dripping", script: "Wait for it…", style: "food-closeup", medium: "video", durationSec: 4 },
      { title: "Yolk", prompt: "Jammy soft-boiled egg sliced in half on top of ramen, macro", script: "Jammy egg, always.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Cozy restaurant counter with steaming bowls at night, warm pendant lights", script: "Slurp your way to {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "burger-drop",
    cover: "1530554764233-e79e16c91d08",
    name: "Burger Drop",
    description: "Stack-it-up, layer-by-layer build for burgers, sandwiches and bao.",
    format: "9:16",
    accent: "#ca8a04",
    category: "menu",
    emoji: "🍔",
    scenes: [
      { title: "Drop", prompt: "Burger layers dropping onto each other in mid-air against a black background, slow motion burger stack", script: "Built layer by layer.", style: "cinematic", medium: "video", durationSec: 3 },
      { title: "Sizzle", prompt: "Smash burger patty sizzling on a hot griddle, cheese melting, sparks of steam", script: "Smashed. Seared. Melted.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Hero", prompt: "Two burgers with fries on a wooden board, rich lighting, glistening", script: "Meet your new favourite.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Friends grabbing burgers across a busy table, laughing, evening", script: "Burger night at {venue}.", style: "photographic", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "iced-drinks",
    cover: "1551538827-9c037cb4f32a",
    name: "Summer Drinks Menu",
    description: "Ice, pours and colour — launch your cold drinks for the warm months.",
    format: "9:16",
    accent: "#0284c7",
    category: "menu",
    emoji: "🧊",
    scenes: [
      { title: "Ice", prompt: "Ice cubes dropping into a tall glass, splash, bright backlight", script: "Hot day? We've got you.", style: "food-closeup", medium: "video", durationSec: 2 },
      { title: "Iced coffee", prompt: "Milk swirling into an iced coffee in a glass, slow motion marbling", script: "Iced coffee, done properly.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Lemonade", prompt: "Pink lemonade and strawberry spritz glasses with lime and berries, bright and fresh", script: "Plus house lemonades.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "Pour", prompt: "Sparkling water poured into a mojito glass with lime and mint, refreshing", script: "Zero-proof spritzes too.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "CTA", prompt: "Sunny outdoor terrace with cold drinks on the table, summer", script: "Grab one on the terrace at {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "lunch-deal",
    cover: "1546069901-ba9599a7e63c",
    name: "Lunch Deal",
    description: "Fast, clear weekday lunch promo — price-free so you can add your own.",
    format: "4:5",
    accent: "#059669",
    category: "promo",
    emoji: "🥗",
    scenes: [
      { title: "Hook", prompt: "Colourful poke bowl with salmon, avocado and greens, top-down, bright daylight", script: "Lunch break upgrade.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Options", prompt: "Overhead of three lunch bowls and salads side by side on a wooden counter", script: "Pick a bowl, any bowl.", style: "flat-lay", medium: "image", durationSec: 3 },
      { title: "Speed", prompt: "Takeaway bowl being handed over the counter, motion, friendly smile", script: "Ready in five minutes.", style: "photographic", medium: "video", durationSec: 3 },
      { title: "CTA", prompt: "Busy café at lunchtime with people eating at shared tables", script: "Weekday lunch deal at {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "private-events",
    cover: "1528605248644-14dd04022da1",
    name: "Private Events & Catering",
    description: "Pitch your space for birthdays, team lunches and parties.",
    format: "16:9",
    accent: "#7c3aed",
    category: "promo",
    emoji: "🥂",
    scenes: [
      { title: "Hook", prompt: "Long shared table full of friends laughing over dinner, candles and string lights", script: "Got something to celebrate?", style: "cinematic", medium: "image", durationSec: 3 },
      { title: "Space", prompt: "Empty dining room set for a private party, tables dressed, warm evening lighting", script: "Book {venue} for your next event.", style: "cozy-ambient", medium: "image", durationSec: 4 },
      { title: "Food", prompt: "Overhead of sharing platters and dishes laid out for a group", script: "Sharing menus for groups of any size.", style: "flat-lay", medium: "image", durationSec: 3 },
      { title: "Cake", prompt: "Celebration cake being brought to the table, people cheering", script: "We'll handle the cake too.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Glasses raised in a toast across the table, joyful", script: "Enquire today — link in bio.", style: "cinematic", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "date-night",
    cover: "1571877227200-a0d98ea607e9",
    name: "Date Night",
    description: "Candles, sharing plates, dessert for two — Valentine's or any Friday.",
    format: "9:16",
    accent: "#e11d48",
    category: "events",
    emoji: "🕯️",
    scenes: [
      { title: "Mood", prompt: "Candlelit table for two in a dim restaurant, wine glasses, soft bokeh", script: "Table for two?", style: "cinematic", medium: "image", durationSec: 3 },
      { title: "Plates", prompt: "Elegant plated dish being set down between two people, chef's finishing touch", script: "Plates made for sharing.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Drinks", prompt: "Cocktail being poured over a large ice cube, amber glow", script: "A drink to start.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Dessert", prompt: "Tiramisu with two spoons on a candlelit table", script: "And one dessert. Two spoons.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Cozy evening dining room glowing with candles", script: "Book date night at {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "festive",
    cover: "1558961363-fa8fdf82db35",
    name: "Festive Treats",
    description: "Holiday menu, gift boxes and cosy vibes for the festive season.",
    format: "4:5",
    accent: "#15803d",
    category: "events",
    emoji: "🎄",
    scenes: [
      { title: "Cosy", prompt: "Café window with fairy lights and a steaming hot chocolate, wintery evening", script: "The festive menu is here.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "Treats", prompt: "Basket of fresh chocolate chip cookies and festive bakes, warm light", script: "Festive bakes, all month.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Gift box", prompt: "Hands tying a ribbon on a box of cookies and pastries, gift wrapping", script: "Gift boxes to take home.", style: "photographic", medium: "video", durationSec: 3 },
      { title: "CTA", prompt: "Overhead of festive drinks and treats on a table with greenery", script: "Pre-order yours at {venue}.", style: "flat-lay", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "menu-ranking",
    cover: "1504674900247-0877df9cc836",
    name: "Rating Our Menu",
    description: "Trend format: staff rate menu items out of 10. Highly shareable.",
    format: "9:16",
    accent: "#ea580c",
    category: "social",
    emoji: "🔟",
    scenes: [
      { title: "Hook", prompt: "Overhead of several plates from the menu laid out on a table, ready to be judged", script: "Rating every item on our menu…", style: "flat-lay", medium: "image", durationSec: 3 },
      { title: "Item 1", prompt: "Close-up of a breakfast plate with eggs and toast, fork lifting a bite", script: "Breakfast plate: solid 8.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Item 2", prompt: "Close-up of a dessert slice, cream and berries", script: "Dessert: 9, no notes.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Winner", prompt: "Hero shot of {signature} under a spotlight, glistening", script: "{signature}: 11/10. Obviously.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Staff laughing behind the counter of the café", script: "Disagree? Come argue with us at {venue}.", style: "photographic", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "this-or-that",
    cover: "1551024601-bec78aea704b",
    name: "This or That",
    description: "Comment-bait split choices: sweet vs savoury, iced vs hot.",
    format: "9:16",
    accent: "#2563eb",
    category: "social",
    emoji: "🤔",
    scenes: [
      { title: "Hook", prompt: "Two dishes side by side on a marble counter, one sweet one savoury, bright light", script: "You can only pick one.", style: "photographic", medium: "image", durationSec: 2 },
      { title: "Round 1", prompt: "Glazed donuts with sprinkles next to a croissant, close-up", script: "Donut or croissant?", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Round 2", prompt: "Iced coffee in a glass next to a hot latte with latte art", script: "Iced or hot?", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Round 3", prompt: "Stack of pancakes next to avocado toast with a poached egg", script: "Pancakes or avo toast?", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Busy café table with all the dishes shared between friends", script: "Comment your picks — or get both at {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },

  // ── From café user testing ───────────────────────────────────────────────
  {
    id: "afternoon-pick-me-up",
    cover: "1534040385115-33dcb3acba5b",
    name: "Afternoon Pick-Me-Up",
    description: "Spread the crowd beyond lunch — an off-peak coffee-and-cake deal for remote workers.",
    format: "9:16",
    accent: "#0f766e",
    category: "promo",
    emoji: "🕒",
    scenes: [
      { title: "Slump", prompt: "Laptop on a sunny window table at 3pm, half-finished coffee, quiet café, afternoon light", script: "3pm slump? We've got you.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "Fresh cup", prompt: "Fresh flat white with latte art set down beside a slice of cake, steam rising", script: "Coffee + cake, after lunch.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Quiet tables", prompt: "Calm, spacious café interior in the afternoon with free tables and plugs, plants", script: "Quiet tables, fast Wi-Fi, no rush.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Overhead of a coffee and cake on a wooden table next to a notebook, golden light", script: "Every weekday afternoon at {venue}.", style: "flat-lay", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "evening-workshop",
    cover: "1424847651672-bf20a4b0982b",
    name: "Evening Workshop",
    description: "Sip & paint, latte-art classes, networking nights — fill your evening events.",
    format: "9:16",
    accent: "#a21caf",
    category: "events",
    emoji: "🎨",
    scenes: [
      { title: "Hook", prompt: "Friends laughing around a long table in a cosy café at night, string lights, drinks and creative supplies", script: "Your new favourite night out.", style: "cozy-ambient", medium: "video", durationSec: 3 },
      { title: "The activity", prompt: "Close-up of hands creating at the table — painting, pouring latte art or crafting — warm evening light", script: "Learn something new, glass in hand.", style: "cinematic", medium: "video", durationSec: 4 },
      { title: "Treats", prompt: "Overhead of wine, coffee and sharing snacks on a busy workshop table", script: "Drinks and snacks included.", style: "flat-lay", medium: "image", durationSec: 3 },
      { title: "Proud moment", prompt: "Group holding up what they made, smiling, cosy café evening atmosphere", script: "Take home what you made.", style: "photographic", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Café exterior at dusk with warm light inside and a chalkboard sign announcing the workshop", script: "Spots are limited — book at {venue}.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "cartoon-mascot",
    cover: "1551024601-bec78aea704b",
    name: "Cartoon Fun",
    description: "A playful cartoon short starring your signature treat — charming, never fake-real.",
    format: "9:16",
    accent: "#db2777",
    category: "social",
    emoji: "🧁",
    scenes: [
      { title: "Wake up", prompt: "Cute cartoon {signature} character waking up in a sunny café window, yawning and stretching", script: "Good morning from {venue}!", style: "cartoon", medium: "video", durationSec: 3 },
      { title: "Get ready", prompt: "Cartoon {signature} character getting ready — sprinkles as glitter, a coffee cup friend cheering", script: "Getting fresh for you…", style: "cartoon", medium: "video", durationSec: 3 },
      { title: "Big reveal", prompt: "Cartoon {signature} character striking a pose on the café counter with sparkles", script: "Ta-da! Fresh today.", style: "cartoon", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Cartoon café storefront with the character waving from the door, bright cheerful colours", script: "Come say hi at {venue}.", style: "cartoon", medium: "image", durationSec: 3 },
    ],
  },

];

/** A copy of a template with venue tokens filled in, ready to create from. */
export function personalizeTemplate(template: Template, venue?: VenueProfile): Template {
  return {
    ...template,
    name: personalize(template.name, venue),
    description: personalize(template.description, venue),
    scenes: template.scenes.map((s) => ({
      ...s,
      title: personalize(s.title, venue),
      prompt: personalize(s.prompt, venue),
      script: personalize(s.script, venue),
    })),
  };
}

type TemplateScene = Template["scenes"][number];

/**
 * The pre-generated still for a template scene: the curated photo the preview
 * provider would pick for it, cropped to the template's format. Illustration
 * looks get none (they're generated on demand).
 */
export function previewStillFor(
  scene: TemplateScene,
  format: AspectRatio,
  avoid: string[] = [],
): { id: string; url: string } | undefined {
  if (NON_PHOTO_STYLES.includes(scene.style)) return undefined;
  const id = pickPhoto(`${scene.title} ${scene.prompt}`, { style: scene.style, avoid });
  return { id, url: photoUrlForAspect(id, format) };
}

/** Pre-generated video clips (e.g. Match Ya), keyed by template id → scene index. */
const MEDIA = exampleMedia as Record<string, Record<string, { url: string; posterUrl?: string }>>;

/**
 * Attach pre-generated assets so a storyboard created from this template opens
 * with every scene already filled in: stored video clips where we have them
 * (scripts/pregenerate-examples.ts), else the matched preview still.
 */
export function withPreviewAssets(template: Template): Template {
  const clips = MEDIA[template.id] ?? {};
  const used: string[] = [];
  return {
    ...template,
    scenes: template.scenes.map((scene, i) => {
      if (scene.asset) return scene;
      const clip = clips[String(i)];
      if (clip) {
        const asset: GeneratedAsset = { ...clip, medium: "video", providerId: "veo", createdAt: Date.now() };
        return { ...scene, asset };
      }
      const still = previewStillFor(scene, template.format, used);
      if (!still) return scene;
      used.push(still.id);
      return { ...scene, asset: { url: still.url, medium: "image", providerId: "mock", createdAt: Date.now() } };
    }),
  };
}
