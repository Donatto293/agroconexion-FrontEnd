export const getApiErrorMessage = (err) => {
  const data = err?.response?.data;

  if (!data) return err?.message || 'Error desconocido';
  if (typeof data === 'string') return data;

  if (data.detail) return data.detail;       // Convención DRF
  if (data.error) return data.error;         // Tu caso: { error: '...' }

  // Validaciones tipo { field: ['msg1', 'msg2'] } o { field: 'msg' }
  const firstVal = Object.values(data)[0];
  if (Array.isArray(firstVal)) return firstVal[0];
  if (typeof firstVal === 'string') return firstVal;

  try {
    return JSON.stringify(data);
  } catch {
    return 'Ocurrió un error inesperado';
  }
};
