import { createLoader, parseAsIndex, parseAsString } from "nuqs/server";

export const projectFilterSearchParams = {
  search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  page: parseAsIndex.withDefault(1).withOptions({ clearOnDefault: true }),
};

export const loadSearchParams = createLoader(projectFilterSearchParams);
