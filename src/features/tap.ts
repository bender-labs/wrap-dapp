
export function tap<T>(effect: (arg: T) => any): (arg: T) => T {
  return (arg) => {
    effect(arg);
    return arg;
  }
}