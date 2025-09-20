export const CATEGORY_COLOR = '#2563EB'; 

export interface SeverityInfo {
	label: string;
	color: string;
}

export function getSeverityInfo(g: number): SeverityInfo {
	// Normalizamos a número por si llega como string desde la API
	const n = Number(g);
	// Escala esperada en la app: 1=Baja, 2=Media, 3=Alta, 4=Crítica
	// Antes se marcaba Crítica solo para >=5, lo que hacía que 4 se mostrara como "Alta".
	if (n >= 4) return { label: 'Crítica', color: '#B91C1C' };
	if (n === 3) return { label: 'Alta', color: '#DC2626' };
	if (n === 2) return { label: 'Media', color: '#F59E0B' };
	return { label: 'Baja', color: '#3B82F6' };
}

// Mapeo de ubicaciones (códigos almacenados -> etiquetas en español)
export const LOCATION_LABELS: Record<string,string> = {
	municipal: 'Oficina municipal',
	hospital: 'Hospital/Centro de salud',
	school: 'Institución educativa',
	police: 'Comisaría/Policía',
	transport: 'Transporte público',
	construction: 'Obra pública',
	park: 'Espacio público',
	online: 'Trámite en línea',
	others: 'Otro lugar'
};

export function getLocationLabel(code?: string | null): string {
	if (!code) return '';
	const key = String(code).trim();
	return LOCATION_LABELS[key] || key; 
}

export const LOCATION_OPTIONS = Object.entries(LOCATION_LABELS).map(([id,label])=>({ id, label }));


