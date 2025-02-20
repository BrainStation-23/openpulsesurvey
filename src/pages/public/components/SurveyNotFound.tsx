
export function SurveyNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Survey Not Found</h1>
      <p className="text-muted-foreground">
        The survey you're looking for doesn't exist or has expired.
      </p>
    </div>
  );
}
