import { Transform } from 'class-transformer';

export function TransformStringToNumber() {
  return Transform(({ value }) =>
    typeof value === 'string' ? Number(value) : value,
  );
}
