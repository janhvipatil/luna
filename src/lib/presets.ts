/**
 * One-click building blocks for food & beverage scenes, offered in the scene
 * inspector. Shot ideas append to the visual prompt; captions replace the
 * script line. Captions may contain venue tokens (see lib/venue).
 */

export const SHOT_IDEAS: Array<{ label: string; text: string }> = [
  { label: "Steam rising", text: "wisps of steam rising, backlit" },
  { label: "Slow-mo pour", text: "slow-motion pour, liquid splashing" },
  { label: "Latte art", text: "barista pouring latte art, top-down" },
  { label: "Cheese / noodle pull", text: "stretchy pull lifted with a fork, slow motion" },
  { label: "First bite", text: "fork breaking into it to reveal the inside" },
  { label: "Overhead spread", text: "overhead table spread with hands reaching in" },
  { label: "Window seat", text: "on a sunny window-seat table, plants in background" },
  { label: "Chef's hands", text: "chef's hands plating with care, close-up" },
  { label: "Golden hour", text: "warm golden-hour light, long soft shadows" },
  { label: "Moody dark", text: "dark moody background, single dramatic side light" },
];

export const CAPTION_PRESETS: Array<{ group: string; lines: string[] }> = [
  {
    group: "Call to action",
    lines: [
      "Book your table — link in bio.",
      "Order now for delivery or pickup.",
      "Come hungry. See you at {venue}.",
      "Tag someone you'd bring here.",
      "Save this for your next weekend plan.",
    ],
  },
  {
    group: "Hooks",
    lines: [
      "Stop scrolling — you need to see this.",
      "The {signature} everyone's talking about.",
      "POV: you finally tried {venue}.",
      "Rating every item on our menu…",
    ],
  },
  {
    group: "Info",
    lines: [
      "Open daily, 8am – 4pm.",
      "Limited time only.",
      "Vegan & gluten-free options available.",
      "Walk-ins welcome.",
    ],
  },
];
