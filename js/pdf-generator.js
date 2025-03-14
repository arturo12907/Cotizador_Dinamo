/**
 * Cotizador Dinamo - Generador de PDF
 * 
 * Este script contiene las funciones para generar el PDF profesional:
 * - Estructura y maquetación del documento
 * - Aplicación de estilos visuales
 * - Generación de páginas múltiples
 * - Inclusión de encabezados y pies de página
 */

/**
 * Genera un documento PDF basado en los datos proporcionados
 * @param {Object} data - Datos para generar el PDF
 */
function generatePDFDocument(data) {
    try {
        console.log("Iniciando generación de PDF con datos:", data);
        
        // Crear el contenido HTML para el PDF
        const pdfContent = document.getElementById('pdfContent');
        if (!pdfContent) {
            throw new Error("Elemento 'pdfContent' no encontrado en el DOM");
        }
        
        // Generar HTML para el PDF
        const htmlContent = createPDFContent(data);
        pdfContent.innerHTML = htmlContent;
        
        // Para depuración: mostrar el contenido que se enviará a html2pdf
        console.log("Contenido HTML para el PDF:", htmlContent);
        
        // Mostrar temporalmente para debug (opcional)
        pdfContent.style.display = "block";
        
        // Opciones para html2pdf
        const options = {
            margin: [15, 15, 15, 15], // [top, right, bottom, left] en mm
            filename: `Presupuesto_${data.numeroCotizacion}_${data.razonSocial.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                logging: true, // Activar logging
                letterRendering: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            },
            pagebreak: { mode: 'avoid-all', before: '.page-break' }
        };
        
        // Generar PDF
        html2pdf().from(pdfContent)
            .set(options)
            .save()
            .then(() => {
                console.log('PDF generado exitosamente');
                // Ocultar contenido después de generar
                pdfContent.style.display = "none";
            })
            .catch(err => {
                console.error('Error al generar PDF:', err);
                alert('Ocurrió un error al generar el PDF. Por favor, intente nuevamente.');
                // Ocultar contenido en caso de error
                pdfContent.style.display = "none";
            });
    } catch (error) {
        console.error('Error en la preparación del PDF:', error);
        alert('Ocurrió un error al preparar el PDF. Por favor, revise la consola para más detalles.');
    }
}

/**
 * Crea el contenido HTML completo para el PDF
 * @param {Object} data - Datos para el contenido
 * @returns {string} - HTML para el PDF
 */
function createPDFContent(data) {
    // Verificar características opcionales
    const includeScope = data.alcanceProyecto && data.alcanceProyecto.trim() !== '';
    const includeProfessionals = data.incluirProfesionales && data.profesionales && data.profesionales.length > 0;
    const includeImages = data.images && data.images.length > 0;
    
    console.log("Incluir sección de profesionales:", includeProfessionals);
    if (includeProfessionals) {
        console.log("Datos de profesionales:", data.profesionales);
    }
    
    // Construir el HTML
    return `
        <div class="pdf-container">
            ${createHeader(data)}
            ${createClientInfo(data)}
            ${createDescription(data)}
            ${includeScope ? createScope(data) : ''}
            ${createMaterialsList(data)}
            ${includeProfessionals ? createProfessionalsList(data) : '<!-- Profesionales no incluidos -->'}
            ${includeImages ? createImagesSection(data) : ''}
            ${createFooter(data)}
        </div>
        <style>
            ${getPDFStyles()}
        </style>
    `;
}

/**
 * Crea el encabezado del PDF
 * @param {Object} data - Datos del encabezado
 * @returns {string} - HTML del encabezado
 */
function createHeader(data) {
    const fechaFormateada = formatDate(data.fecha);
    
    return `
        <div class="pdf-header">
            <div class="header-content">
                <div class="logo-container">
                    ${data.logo ? `<img src="${data.logo}" alt="Logo Dinamo SPA" class="company-logo">` : '<div class="company-logo-placeholder"></div>'}
                    <div class="company-name">DINAMO SPA</div>
                </div>
                <div class="header-info">
                    <div class="company-details">Huérfanos 1055 Of. 503 Santiago | 76.813.274-7</div>
                    <div class="project-title">${data.nombreProyecto || 'Proyecto'}</div>
                    <div class="quotation-info">
                        <div class="quotation-number">PRESUPUESTO N° ${data.numeroCotizacion}</div>
                        <div class="quotation-date">${fechaFormateada}</div>
                    </div>
                </div>
            </div>
            <div class="header-divider"></div>
        </div>
    `;
}

/**
 * Crea la sección de información del cliente
 * @param {Object} data - Datos del cliente
 * @returns {string} - HTML de la sección
 */
function createClientInfo(data) {
    return `
        <div class="client-section">
            <div class="section-title">INFORMACIÓN DEL CLIENTE</div>
            <div class="client-info">
                <div class="client-data">
                    <div><strong>RUT:</strong> ${data.rutCliente}</div>
                    <div><strong>Razón Social:</strong> ${data.razonSocial}</div>
                    <div><strong>Dirección:</strong> ${data.direccion}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Crea la descripción del presupuesto
 * @param {Object} data - Datos del presupuesto
 * @returns {string} - HTML de la descripción
 */
function createDescription(data) {
    return `
        <div class="description-section">
            <p>De nuestra consideración:</p>
            <p>En atención a su pedido de la referencia, adjuntamos el presupuesto para ${data.nombreProyecto || 'el proyecto solicitado'}</p>
            <p>El presupuesto asciende a la suma que se indica a continuación:</p>
        </div>
    `;
}

/**
 * Crea la sección de alcance del proyecto
 * @param {Object} data - Datos del proyecto
 * @returns {string} - HTML de la sección de alcance
 */
function createScope(data) {
    return `
        <div class="scope-section">
            <div class="section-title">ALCANCE Y ESPECIFICACIONES TÉCNICAS</div>
            <div class="scope-content">
                ${formatText(data.alcanceProyecto)}
            </div>
        </div>
    `;
}

/**
 * Crea la tabla de materiales
 * @param {Object} data - Datos de materiales
 * @returns {string} - HTML de la tabla
 */
function createMaterialsList(data) {
    // Verificar si hay ítems
    if (!data.items || data.items.length === 0) {
        return `
            <div class="materials-section">
                <div class="section-title">LISTADO DE MATERIALES</div>
                <div class="empty-message">No hay materiales registrados</div>
            </div>
        `;
    }
    
    const itemsRows = data.items.map((item, index) => {
        const isEven = index % 2 === 0;
        const rowClass = isEven ? 'row-even' : 'row-odd';
        
        return `
            <tr class="${rowClass}">
                <td>${index + 1}</td>
                <td>${item.descripcion || ''}</td>
                <td class="text-center">${item.cantidad || ''}</td>
                <td class="text-center">${item.unidad || ''}</td>
                <td class="text-right">${item.valorUnitario > 0 ? '$' + formatNumber(item.valorUnitario) : ''}</td>
                <td class="text-right">$${formatNumber(item.totalNeto || 0)}</td>
            </tr>
        `;
    }).join('');
    
    return `
        <div class="materials-section">
            <div class="section-title">LISTADO DE MATERIALES</div>
            <table class="materials-table">
                <thead>
                    <tr>
                        <th class="narrow-col">#</th>
                        <th>DESCRIPCIÓN</th>
                        <th class="narrow-col">CANT</th>
                        <th class="narrow-col">UN</th>
                        <th class="medium-col">VALOR UNITARIO</th>
                        <th class="medium-col">TOTAL NETO</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4"></td>
                        <td class="text-right"><strong>NETO:</strong></td>
                        <td class="text-right">$${formatNumber(data.totales.neto || 0)}</td>
                    </tr>
                    <tr>
                        <td colspan="4"></td>
                        <td class="text-right"><strong>IVA (19%):</strong></td>
                        <td class="text-right">$${formatNumber(data.totales.iva || 0)}</td>
                    </tr>
                    <tr class="total-row">
                        <td colspan="4"></td>
                        <td class="text-right"><strong>TOTAL:</strong></td>
                        <td class="text-right"><strong>$${formatNumber(data.totales.total || 0)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

/**
 * Crea la tabla de profesionales
 * @param {Object} data - Datos de profesionales
 * @returns {string} - HTML de la tabla
 */
function createProfessionalsList(data) {
    // Validación extra para asegurar que realmente hay profesionales para mostrar
    if (!data.profesionales || data.profesionales.length === 0 || !data.incluirProfesionales) {
        console.log("No hay profesionales para mostrar");
        return '';
    }
    
    console.log("Creando tabla de profesionales con:", data.profesionales);
    
    const profRows = data.profesionales.map((prof, index) => {
        const isEven = index % 2 === 0;
        const rowClass = isEven ? 'row-even' : 'row-odd';
        
        // Asegurar valores numéricos válidos
        const costoUF = parseFloat(prof.costoUF) || 0;
        const horas = parseFloat(prof.horas) || 0;
        const totalUF = parseFloat(prof.totalUF) || 0;
        
        return `
            <tr class="${rowClass}">
                <td>${index + 1}</td>
                <td>${prof.nombre || ''}</td>
                <td class="text-right">${costoUF.toFixed(2)}</td>
                <td class="text-right">${horas}</td>
                <td class="text-right">${totalUF.toFixed(2)}</td>
            </tr>
        `;
    }).join('');
    
    // Asegurar valor numérico válido para el total
    const totalUF = parseFloat(data.totales.totalUF) || 0;
    
    return `
        <div class="professionals-section">
            <div class="section-title">LISTADO DE PROFESIONALES</div>
            <table class="professionals-table">
                <thead>
                    <tr>
                        <th class="narrow-col">#</th>
                        <th>PROFESIONAL</th>
                        <th class="medium-col">COSTO UF</th>
                        <th class="medium-col">HH (HORAS)</th>
                        <th class="medium-col">TOTAL (UF)</th>
                    </tr>
                </thead>
                <tbody>
                    ${profRows}
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3"></td>
                        <td class="text-right"><strong>TOTAL UF:</strong></td>
                        <td class="text-right"><strong>${totalUF.toFixed(2)}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

/**
 * Crea la sección de imágenes
 * @param {Object} data - Datos con imágenes
 * @returns {string} - HTML de la sección
 */
function createImagesSection(data) {
    // Validación de datos
    if (!data.images || data.images.length === 0) {
        return '';
    }
    
    // Organizar imágenes en filas de 2
    let imagesHTML = '';
    for (let i = 0; i < data.images.length; i += 2) {
        const image1 = data.images[i];
        const image2 = i + 1 < data.images.length ? data.images[i + 1] : null;
        
        // Verificar que la imagen tenga datos
        if (!image1 || !image1.data) continue;
        
        imagesHTML += `
            <div class="images-row">
                <div class="image-container">
                    <img src="${image1.data}" alt="${image1.title || 'Imagen ' + (i + 1)}">
                    <div class="image-title">${image1.title || 'Imagen ' + (i + 1)}</div>
                </div>
                ${image2 && image2.data ? `
                    <div class="image-container">
                        <img src="${image2.data}" alt="${image2.title || 'Imagen ' + (i + 2)}">
                        <div class="image-title">${image2.title || 'Imagen ' + (i + 2)}</div>
                    </div>
                ` : '<div class="image-container-empty"></div>'}
            </div>
        `;
    }
    
    if (!imagesHTML) {
        return '';
    }
    
    return `
        <div class="images-section page-break">
            <div class="section-title">ANEXO: FOTOGRAFÍAS DE REFERENCIA</div>
            <div class="images-gallery">
                ${imagesHTML}
            </div>
        </div>
    `;
}

/**
 * Crea el pie de página
 * @param {Object} data - Datos para el pie de página
 * @returns {string} - HTML del pie de página
 */
function createFooter(data) {
    const contactInfo = [];
    
    if (data.nombreContacto) contactInfo.push(data.nombreContacto);
    if (data.telefonoContacto) contactInfo.push(data.telefonoContacto);
    if (data.emailContacto) contactInfo.push(data.emailContacto);
    
    const contactText = contactInfo.length > 0 ? contactInfo.join(' | ') : '';
    
    return `
        <div class="pdf-footer">
            <div class="footer-divider"></div>
            ${contactText ? `<div class="contact-info">${contactText}</div>` : ''}
            <div class="company-footer">Dinamo SPA. | Huérfanos 1055 Of. 503 Santiago | 76.813.274-7</div>
        </div>
    `;
}

/**
 * Estilos CSS para el PDF
 */
function getPDFStyles() {
    return `
        /* Estilos generales */
        .pdf-container {
            font-family: 'Roboto', sans-serif;
            color: #333333;
            line-height: 1.3;
            font-size: 10pt;
            max-width: 100%;
            margin: 0 auto;
            padding: 0;
            background-color: white;
        }
        
        /* Encabezado */
        .pdf-header {
            margin-bottom: 20px;
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 5px;
        }
        
        .logo-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
        
        .company-logo {
            max-height: 60px;
            max-width: 150px;
            margin-bottom: 5px;
        }
        
        .company-logo-placeholder {
            height: 60px;
            width: 150px;
        }
        
        .company-name {
            font-size: 14pt;
            font-weight: 700;
            color: #003366;
        }
        
        .header-info {
            text-align: right;
        }
        
        .company-details {
            font-size: 9pt;
            color: #666666;
            margin-bottom: 5px;
        }
        
        .project-title {
            font-size: 14pt;
            font-weight: 500;
            color: #003366;
            margin: 5px 0;
        }
        
        .quotation-info {
            margin-top: 10px;
        }
        
        .quotation-number {
            font-size: 12pt;
            font-weight: 500;
            color: #003366;
        }
        
        .quotation-date {
            font-size: 10pt;
            color: #666666;
        }
        
        .header-divider {
            height: 1px;
            background-color: #FEC506;
            margin: 5px 0 15px 0;
        }
        
        /* Sección de cliente */
        .client-section {
            margin-bottom: 15px;
        }
        
        .section-title {
            font-size: 12pt;
            font-weight: 500;
            color: #003366;
            margin-bottom: 5px;
            border-bottom: 1px solid #FEC506;
            padding-bottom: 3px;
        }
        
        .client-info {
            border: 0.5pt solid #FEC506;
            border-radius: 5px;
            padding: 10px;
            margin-top: 5px;
        }
        
        .client-data {
            line-height: 1.5;
        }
        
        /* Sección de descripción */
        .description-section {
            margin-bottom: 15px;
        }
        
        /* Sección de alcance */
        .scope-section {
            margin-bottom: 20px;
        }
        
        .scope-content {
            text-align: justify;
            margin-top: 5px;
        }
        
        /* Mensaje vacío */
        .empty-message {
            padding: 10px;
            text-align: center;
            font-style: italic;
            color: #666;
            border: 1px dashed #ccc;
            margin: 10px 0;
        }
        
        /* Tablas */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            page-break-inside: auto;
        }
        
        thead {
            display: table-header-group;
        }
        
        tfoot {
            display: table-footer-group;
        }
        
        tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        
        th {
            background-color: #003366;
            color: white;
            font-weight: 500;
            font-size: 9pt;
            text-align: left;
            padding: 6px 4px;
        }
        
        td {
            padding: 4px;
            font-size: 9pt;
            border-bottom: 0.5pt solid #FEC506;
        }
        
        .row-even {
            background-color: white;
        }
        
        .row-odd {
            background-color: #F5F5F5;
        }
        
        .narrow-col {
            width: 40px;
        }
        
        .medium-col {
            width: 80px;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        tfoot tr {
            border-top: 1pt solid #FEC506;
        }
        
        .total-row {
            background-color: rgba(254, 197, 6, 0.15);
            font-weight: 500;
        }
        
        /* Sección de profesionales */
        .professionals-section {
            margin-top: 30px;
            margin-bottom: 20px;
        }
        
        /* Sección de imágenes */
        .images-section {
            margin-top: 20px;
        }
        
        .images-gallery {
            margin-top: 10px;
        }
        
        .images-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .image-container {
            width: 48%;
            border: 0.5pt solid #FEC506;
            border-radius: 5px;
            padding: 5px;
            box-sizing: border-box;
        }
        
        .image-container-empty {
            width: 48%;
        }
        
        .image-container img {
            width: 100%;
            height: auto;
            object-fit: contain;
            max-height: 150px;
        }
        
        .image-title {
            margin-top: 5px;
            text-align: center;
            font-size: 9pt;
            font-weight: 500;
            color: #003366;
        }
        
        /* Pie de página */
        .pdf-footer {
            margin-top: 30px;
            font-size: 8pt;
            color: #666666;
            text-align: center;
        }
        
        .footer-divider {
            height: 0.5px;
            background-color: #FEC506;
            margin-bottom: 5px;
        }
        
        .contact-info {
            margin-bottom: 3px;
        }
        
        .company-footer {
            font-weight: 500;
        }
        
        /* Utilidades */
        .page-break {
            page-break-before: always;
        }
        
        /* Make sure the PDF content is visible but hidden from normal view */
        #pdfContent {
            display: none;
            background-color: white;
            padding: 20px;
            max-width: 210mm; /* A4 width */
            margin: 0 auto;
        }
    `;
}

/**
 * Formatea un número para mostrar con separadores de miles
 * @param {number} num - Número a formatear
 * @returns {string} - Número formateado
 */
function formatNumber(num) {
    // Asegurar que num sea un número
    const numValue = parseFloat(num) || 0;
    return Math.round(numValue).toLocaleString('es-CL');
}

/**
 * Formatea una fecha en formato largo
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada (ej: JULIO 2024)
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            console.warn('Fecha inválida:', dateString);
            return '';
        }
        
        const options = { year: 'numeric', month: 'long' };
        return date.toLocaleDateString('es-CL', options).toUpperCase();
    } catch (error) {
        console.error("Error al formatear fecha:", error);
        return dateString; // Devolver la fecha original en caso de error
    }
}

/**
 * Formatea texto con saltos de línea para HTML
 * @param {string} text - Texto a formatear
 * @returns {string} - Texto formateado con párrafos HTML
 */
function formatText(text) {
    if (!text) return '';
    
    try {
        return text.split('\n')
            .filter(paragraph => paragraph.trim() !== '')
            .map(paragraph => `<p>${paragraph}</p>`)
            .join('');
    } catch (error) {
        console.error("Error al formatear texto:", error);
        return `<p>${text}</p>`; // Devolver el texto original en un párrafo
    }
}