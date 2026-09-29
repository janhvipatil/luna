import { Editor } from "@/components/editor/Editor";

export default async function StoryboardPage({ params }: PageProps<"/storyboard/[id]">) {
  const { id } = await params;
  return <Editor storyboardId={id} />;
}
