import type { Template } from "./types";
import type { VenueProfile } from "./venue";

/**
 * A worked example venue — Match Ya, a Japanese-inspired matcha café that also
 * does bakes, desserts, ramen and onigiri. Used to show new users what a fully
 * set-up account looks like: one click fills the venue profile, and these
 * storyboards are written specifically for it (no tokens — they're the "after").
 */

export const EXAMPLE_VENUE: VenueProfile = {
  name: "Match Ya",
  type: "cafe",
  signature: "ceremonial iced matcha latte",
  vibe: "calm, minimal Japanese café — pale wood, green accents, soft daylight",
};

export const EXAMPLE_STORYBOARDS: Template[] = [
  {
    id: "matchya-whisk",
    cover: "1515823064-d6e0c04616a7",
    name: "Match Ya · The Whisk Ritual",
    description: "ASMR matcha prep — sift, whisk, pour. Match Ya's signature in 16 seconds.",
    format: "9:16",
    accent: "#4d7c0f",
    category: "menu",
    emoji: "🍵",
    scenes: [
      { title: "Sift", prompt: "Vivid green ceremonial matcha powder sifted through a fine mesh into a ceramic chawan, macro, pale wood counter, soft daylight", script: "Ceremonial grade. Sifted, never clumpy.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Whisk", prompt: "Bamboo chasen whisking matcha into a bright frothy foam in a handmade bowl, zigzag motion, slow motion, top-down", script: "Whisked by hand, every order.", style: "food-closeup", medium: "video", durationSec: 4 },
      { title: "Pour", prompt: "Matcha poured over oat milk and ice in a tall clear glass, green and white swirling layers, minimal Japanese café backdrop", script: "Our iced matcha latte.", style: "cinematic", medium: "video", durationSec: 4 },
      { title: "Sip", prompt: "Hand lifting the iced matcha latte by a sunny window seat, pale wood and plants, calm minimal café", script: "Slow down. Sip.", style: "cozy-ambient", medium: "image", durationSec: 2 },
      { title: "CTA", prompt: "Overhead flat lay of an iced matcha latte, a matcha cookie and a bamboo whisk on linen, green accents, negative space", script: "Match Ya — come find your matcha.", style: "flat-lay", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "matchya-ramen",
    cover: "1557872943-16a5ac26437e",
    name: "Match Ya · Ramen After Dark",
    description: "Evening menu reveal — the café turns into a cosy ramen bar.",
    format: "9:16",
    accent: "#b45309",
    category: "events",
    emoji: "🍜",
    scenes: [
      { title: "Switch", prompt: "Café window at dusk as paper lanterns switch on inside, warm glow, minimal Japanese interior", script: "By day: matcha. By night…", style: "cinematic", medium: "video", durationSec: 3 },
      { title: "Broth", prompt: "Rich golden tonkotsu broth ladled into a deep ceramic bowl, steam billowing, dark moody background", script: "Broth simmered for 12 hours.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Noodle lift", prompt: "Chopsticks lifting springy ramen noodles out of the bowl, steam, soft-boiled egg and chashu in frame, slow motion", script: "The noodle pull you came for.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Egg", prompt: "Ajitama egg sliced open to a jammy amber yolk, resting on the ramen, macro", script: "Jammy egg, always.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Counter seats with steaming ramen bowls and lanterns, friends chatting, cozy evening atmosphere", script: "Ramen nights at Match Ya. Thu–Sat from 6.", style: "cozy-ambient", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "matchya-onigiri",
    cover: "1611143669185-af224c5e3252",
    name: "Match Ya · Onigiri Lunch Set",
    description: "Quick, bright lunch-deal promo for the onigiri counter.",
    format: "4:5",
    accent: "#0f766e",
    category: "promo",
    emoji: "🍙",
    scenes: [
      { title: "Hook", prompt: "Neat row of hand-shaped onigiri wrapped in crisp nori on a pale wooden tray, bright daylight", script: "Lunch, but make it onigiri.", style: "food-closeup", medium: "image", durationSec: 3 },
      { title: "Fillings", prompt: "Onigiri broken in half showing fillings — salmon, umeboshi, tuna mayo — macro, steam from warm rice", script: "Salmon, ume, tuna mayo — pick two.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "The set", prompt: "Overhead bento-style lunch set: two onigiri, miso soup, pickles and an iced matcha on a linen placemat", script: "Two onigiri + miso + matcha.", style: "flat-lay", medium: "image", durationSec: 3 },
      { title: "CTA", prompt: "Takeaway onigiri box handed over the counter with a smile, minimal green-accented café", script: "Weekday lunch set at Match Ya.", style: "photographic", medium: "image", durationSec: 3 },
    ],
  },
  {
    id: "matchya-bakes",
    cover: "1495147466023-ac5c588e2e94",
    name: "Match Ya · Matcha Bake Counter",
    description: "The dessert & bakery case — matcha everything.",
    format: "9:16",
    accent: "#65a30d",
    category: "menu",
    emoji: "🥐",
    scenes: [
      { title: "Case", prompt: "Glass bakery case filled with matcha croissants, mochi, matcha basque cheesecake and melon pan, soft morning light", script: "Our bake case, fresh this morning.", style: "cozy-ambient", medium: "image", durationSec: 3 },
      { title: "Croissant", prompt: "Hands tearing a matcha croissant to reveal green swirled layers and flakes falling, slow motion macro", script: "The matcha croissant.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Cheesecake", prompt: "Knife slicing through a burnt matcha basque cheesecake, creamy green centre, macro", script: "Burnt matcha basque. Gooey middle.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "Mochi", prompt: "Hand pulling apart a soft strawberry mochi daifuku showing the stretch, pastel background", script: "Plus mochi that stretches.", style: "food-closeup", medium: "video", durationSec: 3 },
      { title: "CTA", prompt: "Pastry box of assorted matcha bakes tied with green ribbon, overhead, negative space for text", script: "Get here early — they sell out. Match Ya.", style: "flat-lay", medium: "image", durationSec: 3 },
    ],
  },
];
