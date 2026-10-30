export interface FetchPageResult<T> {
  items: T[];
  totalPages: number;
}

export interface FetchAllPagesOptions {
  pageSize: number;
  maxPages?: number;
}

/**
 * Recorre todas las páginas de un endpoint paginado y concatena sus ítems.
 *
 * El backend no expone un "listar todo" y además ordena de más viejo a más nuevo, así que
 * quedarse con la primera página deja afuera a los registros recién creados. `maxPages` es
 * una válvula de seguridad: un `totalPages` erróneo del backend no debe disparar requests
 * sin fin.
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, limit: number) => Promise<FetchPageResult<T>>,
  options: FetchAllPagesOptions
): Promise<T[]> {
  const { pageSize, maxPages = 20 } = options;
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages && page <= maxPages) {
    const result = await fetchPage(page, pageSize);
    items.push(...result.items);
    totalPages = result.totalPages;
    page += 1;
  }

  return items;
}
