import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryStates,
} from "nuqs";
import { DEFAULT_PAGE } from "../constants";
export const useProjectsFilter = () => {
  return useQueryStates({
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
    page: parseAsIndex
      .withDefault(DEFAULT_PAGE)
      .withOptions({ clearOnDefault: true }),
  });
};
