import PortalLoginForm from "./PortalLoginForm";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getNextPath(nextValue: string | string[] | undefined): string {
  const value = Array.isArray(nextValue) ? nextValue[0] : nextValue;
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/portal";
  return value;
}

function getErrorMessage(errorValue: string | string[] | undefined): string | undefined {
  const value = Array.isArray(errorValue) ? errorValue[0] : errorValue;
  if (value === "auth_callback_failed") {
    return "Your sign-in link expired or is invalid. Request a new link and try again.";
  }
  return undefined;
}

export default async function PortalLoginPage({ searchParams }: PageProps) {
  const resolved = searchParams ? await searchParams : {};
  const nextPath = getNextPath(resolved.next);
  const initialError = getErrorMessage(resolved.error);

  return (
    <main className="p-6">
      <PortalLoginForm nextPath={nextPath} initialError={initialError} />
    </main>
  );
}
