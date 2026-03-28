import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  confirmation_failed: "No hemos podido confirmar tu cuenta. El enlace puede haber expirado o ya fue utilizado. Solicita un nuevo enlace de confirmación.",
};

const DEFAULT_ERROR_MESSAGE = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde.";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  const message = params?.error
    ? (ERROR_MESSAGES[params.error] ?? DEFAULT_ERROR_MESSAGE)
    : DEFAULT_ERROR_MESSAGE;

  return (
    <p className="text-sm text-muted-foreground">
      {message}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
