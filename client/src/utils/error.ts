export const getErrorStatusCode = (error: unknown): number | null => {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const { statusCode } = error;
    if (typeof statusCode === "number") {
      return statusCode;
    }
  }
  return null;
};
