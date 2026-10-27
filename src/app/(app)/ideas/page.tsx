import type { Metadata } from "next";
import { IdeaBank } from "@/components/ideas/IdeaBank";

export const metadata: Metadata = { title: "Ideas — Luna" };

export default function IdeasPage() {
  return <IdeaBank />;
}
