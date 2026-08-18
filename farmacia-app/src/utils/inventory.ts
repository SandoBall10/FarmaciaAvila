export const STOCK_BAJO = 10;
export const DIAS_POR_VENCER = 30;

export function isProximoAVencer(fecha?: string): boolean {
  if (!fecha) return false;
  const limite = new Date();
  limite.setDate(limite.getDate() + DIAS_POR_VENCER);
  return new Date(fecha) <= limite;
}

export function getStockLabel(cantidad: number): { label: string; tone: 'ok' | 'warn' | 'danger' } {
  if (cantidad <= 0) return { label: 'Agotado', tone: 'danger' };
  if (cantidad <= STOCK_BAJO) return { label: 'Stock bajo', tone: 'warn' };
  return { label: 'Disponible', tone: 'ok' };
}

export const dataTableEs = {
  lengthMenu: '_MENU_',
  info: 'Mostrando _START_ a _END_ de _TOTAL_',
  infoEmpty: 'Sin registros',
  infoFiltered: '(filtrado de _MAX_)',
  zeroRecords: 'No se encontraron registros',
  search: '',
  searchPlaceholder: 'Buscar...',
  paginate: {
    next: 'Siguiente',
    previous: 'Anterior',
  },
};
