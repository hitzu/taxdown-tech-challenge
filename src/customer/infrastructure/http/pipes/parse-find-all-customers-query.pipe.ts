import { Injectable, PipeTransform } from "@nestjs/common";

const toPositiveIntOrUndefined = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") return undefined;

  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 1) return undefined;
    return value;
  }

  if (typeof value !== "string") return undefined;
  if (!/^\d+$/.test(value)) return undefined;

  const parsed = Number.parseInt(value, 10);
  if (parsed < 1) return undefined;
  return parsed;
};

@Injectable()
export class ParseFindAllCustomersQueryPipe
  implements PipeTransform<Record<string, unknown>>
{
  transform(value: Record<string, unknown>) {
    if (!value || typeof value !== "object") return value;

    return {
      ...value,
      page: toPositiveIntOrUndefined(value.page),
      pageSize: toPositiveIntOrUndefined(value.pageSize),
    };
  }
}
