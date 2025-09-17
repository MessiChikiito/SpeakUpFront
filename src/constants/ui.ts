export const CATEGORY_COLOR = '#2563EB'; 

export interface SeverityInfo {
	label: string;
	color: string;
}

export function getSeverityInfo(g: number): SeverityInfo {
	if (g >= 5) return { label: 'Crítica', color: '#B91C1C' }; 
	if (g === 4) return { label: 'Alta', color: '#DC2626' };   
	if (g === 3) return { label: 'Media', color: '#F59E0B' };  
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


