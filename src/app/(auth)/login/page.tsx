import { AuthForm } from "@/components/auth/AuthForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { redirect } = await searchParams;
  const redirectTo = typeof redirect === "string" ? redirect : "/";
  return <AuthForm mode="signin" redirectTo={redirectTo} />;
}
