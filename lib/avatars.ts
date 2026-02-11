import {
  Cat,
  Bird,
  Fish,
  Bug,
  Rabbit,
  Squirrel,
  Turtle,
  Ghost,
  Flame,
  Zap,
  Star,
  Heart,
  Crown,
  Gem,
  Rocket,
  Moon,
  type LucideIcon,
} from "lucide-react";

export interface AvatarConfig {
  id: string;
  icon: LucideIcon;
  label: string;
  bg: string;
  text: string;
}

export const AVATARS: AvatarConfig[] = [
  { id: "cat", icon: Cat, label: "Chat", bg: "bg-amber-100", text: "text-amber-600" },
  { id: "bird", icon: Bird, label: "Oiseau", bg: "bg-sky-100", text: "text-sky-600" },
  { id: "fish", icon: Fish, label: "Poisson", bg: "bg-cyan-100", text: "text-cyan-600" },
  { id: "bug", icon: Bug, label: "Insecte", bg: "bg-lime-100", text: "text-lime-600" },
  { id: "rabbit", icon: Rabbit, label: "Lapin", bg: "bg-pink-100", text: "text-pink-600" },
  { id: "squirrel", icon: Squirrel, label: "Ecureuil", bg: "bg-orange-100", text: "text-orange-600" },
  { id: "turtle", icon: Turtle, label: "Tortue", bg: "bg-emerald-100", text: "text-emerald-600" },
  { id: "ghost", icon: Ghost, label: "Fantome", bg: "bg-violet-100", text: "text-violet-600" },
  { id: "flame", icon: Flame, label: "Flamme", bg: "bg-red-100", text: "text-red-500" },
  { id: "zap", icon: Zap, label: "Eclair", bg: "bg-yellow-100", text: "text-yellow-600" },
  { id: "star", icon: Star, label: "Etoile", bg: "bg-amber-100", text: "text-amber-500" },
  { id: "heart", icon: Heart, label: "Coeur", bg: "bg-rose-100", text: "text-rose-500" },
  { id: "crown", icon: Crown, label: "Couronne", bg: "bg-yellow-100", text: "text-yellow-600" },
  { id: "gem", icon: Gem, label: "Diamant", bg: "bg-indigo-100", text: "text-indigo-600" },
  { id: "rocket", icon: Rocket, label: "Fusee", bg: "bg-slate-100", text: "text-slate-600" },
  { id: "moon", icon: Moon, label: "Lune", bg: "bg-purple-100", text: "text-purple-600" },
];

export function getAvatarById(id: string): AvatarConfig {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}
