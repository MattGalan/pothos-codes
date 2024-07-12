import { isNumberLike } from "@mantine/core";

export function searchMatch(search: string, value: string) {
  if (!search) return true;
  if (!value) return false;
  return value.toLocaleLowerCase().includes(search);
}

export function validatePrice(price: string) {
  // not a number
  if (!isNumberLike(price)) return "Not a number?";

  // whole numbers are good
  if (/^\d+$/.test(price)) return undefined;

  // check for a decimal and two cents
  if (!/^\d+\.\d\d$/.test(price)) return "Bad number format?";

  return undefined;
}
