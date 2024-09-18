export function getErrorMessage(error: any, name: string): string {
  if (error instanceof Error) {
    return `Error in ${name}: ${error.message}`;
  } else {
    console.log("error:", error);
    return `Unknown error in ${name}`;
  }
}
