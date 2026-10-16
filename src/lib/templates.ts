import type { Template, TemplateCategory } from "./types";
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
