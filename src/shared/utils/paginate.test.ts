import { fetchAllPages } from './paginate';

function page<T>(items: T[], totalPages: number) {
  return Promise.resolve({ items, totalPages });
}

describe('fetchAllPages', () => {
  it('recorre las páginas hasta la última y concatena los ítems', async () => {
    const fetchPage = jest
      .fn()
      .mockReturnValueOnce(page(['a'], 3))
      .mockReturnValueOnce(page(['b'], 3))
      .mockReturnValueOnce(page(['c'], 3));

    await expect(fetchAllPages(fetchPage, { pageSize: 100 })).resolves.toEqual(['a', 'b', 'c']);
    expect(fetchPage.mock.calls).toEqual([
      [1, 100],
      [2, 100],
      [3, 100],
    ]);
  });

  it('hace un solo request cuando hay una sola página', async () => {
    const fetchPage = jest.fn().mockReturnValueOnce(page(['a'], 1));

    await expect(fetchAllPages(fetchPage, { pageSize: 100 })).resolves.toEqual(['a']);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  /** Válvula de seguridad: un `totalPages` erróneo del backend no debe disparar requests sin fin. */
  it('se detiene en `maxPages` aunque el backend informe más páginas', async () => {
    const fetchPage = jest.fn().mockImplementation((pageNumber: number) => page([pageNumber], 999));

    await expect(fetchAllPages(fetchPage, { pageSize: 10, maxPages: 2 })).resolves.toEqual([1, 2]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });
});
