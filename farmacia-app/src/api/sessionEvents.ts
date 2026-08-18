type UnauthorizedHandler = () => void;

let unauthorizedHandler: UnauthorizedHandler | null = null;
let handlingUnauthorized = false;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized(): void {
  if (handlingUnauthorized) {
    return;
  }
  handlingUnauthorized = true;
  try {
    unauthorizedHandler?.();
  } finally {
    handlingUnauthorized = false;
  }
}
