import { format } from 'date-fns';

export const priceForPassInvest = (invest: number) => {
  let percent = 2;
  if (invest < 5000) percent = 5.5;
  else if (invest < 10000) percent = 5;
  else if (invest < 20000) percent = 4.5;
  else if (invest < 50000) percent = 4;
  else if (invest < 100000) percent = 3.5;
  else if (invest < 200000) percent = 3;
  else if (invest < 500000) percent = 2.5;
  else percent = 2;

  return invest * percent;
};

export const generateRandomCode = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

type InputValue = Date | string | number | null;

export function fDate(date: InputValue, newFormat?: string) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function formatCardStringNumber(str: string) {
  const num = parseInt(str, 10);
  if (num < 10) {
    return `0${num}`;
  }
  if (num >= 1000) {
    return num.toString().slice(-2);
  }
  return num.toString();
}
