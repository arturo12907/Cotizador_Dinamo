/**
 * Cotizador Dinamo - Manejador de Excel
 * 
 * Este script contiene las funciones para procesar archivos Excel:
 * - Carga y parseo de archivos Excel o CSV
 * - Mapeo de columnas y validación de datos
 * - Conversión a formato compatible con la aplicación
 */

/**
 * Procesa un archivo Excel y llama al callback con los datos procesados
 * @param {File} file - Archivo Excel/CSV a procesar
 * @param {Function} callback - Función a llamar con los resultados
 */
function processExcelFile(file, callback) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            // Para archivos Excel (XLSX, XLS)
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array'});
                
                // Obtener la primera hoja
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                
                // Convertir a JSON
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, {header: 1});
                
                // Procesar los datos
                const processedData = processExcelData(jsonData);
                callback(processedData);
            }
            // Para archivos CSV
            else if (file.name.endsWith('.csv')) {
                const content = e.target.result;
                
                // Dividir el contenido en líneas
                const lines = content.split('\n');
                
                // Convertir a formato adecuado para procesamiento
                const jsonData = lines.map(line => line.split(',').map(cell => cell.trim()));
                
                // Procesar los datos
                const processedData = processExcelData(jsonData);
                callback(processedData);
            }
            else {
                console.error('Formato de archivo no soportado');
                callback([]);
            }
        } catch (error) {
            console.error('Error al procesar el archivo:', error);
            callback([]);
        }
    };
    
    reader.onerror = function() {
        console.error('Error al leer el archivo');
        callback([]);
    };
    
    // Verificar tipo de archivo
    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

/**
 * Procesa los datos extraídos del archivo Excel/CSV
 * @param {Array} data - Datos extraídos del archivo
 * @returns {Array} - Datos procesados listos para usar en la aplicación
 */
function processExcelData(data) {
    // Verificar si hay datos suficientes
    if (!data || data.length <= 1) {
        console.error('El archivo no contiene datos suficientes');
        return [];
    }
    
    // Obtener encabezados (primera fila)
    const headers = data[0].map(h => h ? h.toString().toLowerCase() : '');
    
    // Mapear índices de columnas importantes
    const descripcionIndex = findColumnIndex(headers, ['descripcion', 'descripción', 'detalle', 'item']);
    const cantidadIndex = findColumnIndex(headers, ['cantidad', 'cant', 'cant.']);
    const unidadIndex = findColumnIndex(headers, ['unidad', 'un', 'un.']);
    const valorIndex = findColumnIndex(headers, ['valor', 'valor unitario', 'vr unitario', 'vr unidad', 'precio']);
    
    // Verificar columnas mínimas requeridas
    if (descripcionIndex === -1 || cantidadIndex === -1) {
        console.error('No se encontraron las columnas requeridas');
        return [];
    }
    
    // Procesar filas de datos (a partir de la segunda fila)
    const processedItems = [];
    
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        // Saltear filas vacías
        if (!row || row.length === 0 || !row[descripcionIndex]) continue;
        
        // Extraer valores
        const item = {
            descripcion: row[descripcionIndex] ? row[descripcionIndex].toString() : '',
            cantidad: row[cantidadIndex] ? parseFloat(row[cantidadIndex]) || 0 : 0,
            unidad: unidadIndex !== -1 && row[unidadIndex] ? row[unidadIndex].toString() : '',
            valorUnitario: valorIndex !== -1 && row[valorIndex] ? parseFloat(row[valorIndex]) || 0 : 0
        };
        
        // Solo agregar ítems con descripción no vacía
        if (item.descripcion.trim() !== '') {
            processedItems.push(item);
        }
    }
    
    return processedItems;
}

/**
 * Encuentra el índice de una columna basado en posibles nombres
 * @param {Array} headers - Array de encabezados
 * @param {Array} possibleNames - Posibles nombres para la columna
 * @returns {number} - Índice de la columna encontrada o -1 si no se encuentra
 */
function findColumnIndex(headers, possibleNames) {
    for (const name of possibleNames) {
        const index = headers.findIndex(h => h.includes(name));
        if (index !== -1) return index;
    }
    return -1;
}

/**
 * Detecta el delimitador en un archivo CSV
 * @param {string} csvContent - Contenido del archivo CSV
 * @returns {string} - Delimitador detectado
 */
function detectDelimiter(csvContent) {
    const delimiters = [',', ';', '\t', '|'];
    const firstLine = csvContent.split('\n')[0];
    
    let maxCount = 0;
    let maxDelimiter = ','; // Delimitador por defecto
    
    for (const delimiter of delimiters) {
        const count = (firstLine.match(new RegExp(delimiter, 'g')) || []).length;
        if (count > maxCount) {
            maxCount = count;
            maxDelimiter = delimiter;
        }
    }
    
    return maxDelimiter;
}

/**
 * Normaliza valores numéricos que pueden venir en diferentes formatos
 * @param {string} value - Valor a normalizar
 * @returns {number} - Valor numérico normalizado
 */
function normalizeNumericValue(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    // Eliminar caracteres no numéricos excepto punto y coma
    const normalized = value.toString()
        .replace(/[^\d.,]/g, '')  // Eliminar todo excepto dígitos, puntos y comas
        .replace(',', '.'); // Reemplazar coma por punto para asegurar formato decimal

    return parseFloat(normalized) || 0;
}