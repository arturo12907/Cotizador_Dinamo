/**
 * SOLUCIÓN DE EMERGENCIA - Cotizador Dinamo
 * Este script resuelve los problemas con cálculo de profesionales y generación de PDF
 * INSTRUCCIONES: Incluir este script después de todos los demás scripts en el HTML
 */

// Función auto-ejecutable para evitar conflictos
(function() {
    // ======== PASO 1: Arreglar los cálculos de profesionales ========
    function fixCalculos() {
        console.log("EMERGENCY FIX: Aplicando solución de emergencia para cálculos");
        
        // Forzar cálculo inmediato para todas las filas de profesionales
        function calcularProfesionales() {
            const filas = document.querySelectorAll('#profesionalesTable tr');
            console.log(`Encontradas ${filas.length} filas en total`);
            
            if (filas.length <= 1) return; // Solo cabecera
            
            let totalUF = 0;
            
            // Comenzar desde 1 para saltar la cabecera
            for (let i = 1; i < filas.length; i++) {
                const fila = filas[i];
                const inputs = fila.querySelectorAll('input');
                
                if (inputs.length >= 3) {
                    const nombreInput = inputs[0];
                    const costoInput = inputs[1];
                    const horasInput = inputs[2];
                    
                    // Obtener valores como números
                    const nombre = nombreInput.value || '';
                    const costo = parseFloat(costoInput.value.replace(',', '.')) || 0;
                    const horas = parseFloat(horasInput.value.replace(',', '.')) || 0;
                    
                    // Calcular total
                    const total = costo * horas;
                    
                    // Actualizar celda de total (quinta celda)
                    const celdas = fila.querySelectorAll('td');
                    if (celdas.length >= 5) {
                        const totalCell = celdas[4];
                        totalCell.textContent = `${total.toFixed(2)} UF`;
                        console.log(`Profesional ${i}: ${nombre}, ${costo} UF × ${horas} horas = ${total.toFixed(2)} UF`);
                    }
                    
                    // Acumular total
                    totalUF += total;
                }
            }
            
            // Actualizar total UF
            const totalUFElement = document.getElementById('totalUF');
            if (totalUFElement) {
                totalUFElement.textContent = `${totalUF.toFixed(2)} UF`;
                console.log(`Total UF actualizado a: ${totalUF.toFixed(2)} UF`);
            }
            
            return {
                profesionales: Array.from(filas).slice(1).map((fila, index) => {
                    const inputs = fila.querySelectorAll('input');
                    if (inputs.length >= 3) {
                        const nombre = inputs[0].value || '';
                        const costo = parseFloat(inputs[1].value.replace(',', '.')) || 0;
                        const horas = parseFloat(inputs[2].value.replace(',', '.')) || 0;
                        return {
                            id: index + 1,
                            nombre: nombre,
                            costoUF: costo,
                            horas: horas,
                            totalUF: costo * horas
                        };
                    }
                    return null;
                }).filter(p => p !== null),
                totalUF: totalUF
            };
        }
        
        // Ejecutar cálculo inicial
        const datosIniciales = calcularProfesionales();
        
        // Configurar event listeners para mantener cálculos actualizados
        document.addEventListener('input', function(e) {
            if (e.target && (
                e.target.classList.contains('prof-costo') || 
                e.target.classList.contains('prof-horas') ||
                e.target.classList.contains('prof-nombre')
            )) {
                calcularProfesionales();
            }
        });
        
        // Añadir listener al botón de agregar profesional
        const addProfBtn = document.getElementById('addProfesional');
        if (addProfBtn) {
            addProfBtn.addEventListener('click', function() {
                setTimeout(calcularProfesionales, 100);
            });
        }
        
        // Devolver datos calculados
        return datosIniciales;
    }
    
    // ======== PASO 2: Crear función para generar PDF directamente ========
    function crearGeneradorPDF() {
        console.log("EMERGENCY FIX: Creando generador de PDF directo");
        
        function generarPDFDirecto() {
            console.log("Generando PDF directo");
            
            // Recopilar todos los datos
            const datos = {
                logo: document.getElementById('logoPreview')?.src,
                numeroCotizacion: document.getElementById('numeroCotizacion')?.value || 'S/N',
                fecha: document.getElementById('fecha')?.value || new Date().toISOString().substr(0, 10),
                rutCliente: document.getElementById('rutCliente')?.value || '',
                razonSocial: document.getElementById('razonSocial')?.value || '',
                direccion: document.getElementById('direccion')?.value || '',
                nombreProyecto: document.getElementById('nombreProyecto')?.value || '',
                nombreContacto: document.getElementById('nombreContacto')?.value || '',
                telefonoContacto: document.getElementById('telefonoContacto')?.value || '',
                emailContacto: document.getElementById('emailContacto')?.value || '',
                alcanceProyecto: document.getElementById('alcanceProyecto')?.value || '',
                incluirProfesionales: document.getElementById('includeProfesionales')?.checked || false,
                items: [],
                profesionales: [],
                images: [],
                totales: {
                    neto: 0,
                    iva: 0,
                    total: 0,
                    totalUF: 0
                }
            };
            
            // Recopilar items de materiales
            const itemsRows = document.querySelectorAll('#itemsTable tr');
            if (itemsRows.length > 1) {
                // Saltar la fila de cabecera
                for (let i = 0; i < itemsRows.length; i++) {
                    const fila = itemsRows[i];
                    const inputs = fila.querySelectorAll('input');
                    
                    if (inputs.length >= 4) {
                        const descripcion = inputs[0].value || '';
                        const cantidad = parseFloat(inputs[1].value) || 0;
                        const unidad = inputs[2].value || '';
                        const valorUnitario = parseFloat(inputs[3].value) || 0;
                        const totalNeto = cantidad * valorUnitario;
                        
                        datos.items.push({
                            descripcion: descripcion,
                            cantidad: cantidad,
                            unidad: unidad,
                            valorUnitario: valorUnitario,
                            totalNeto: totalNeto
                        });
                        
                        // Acumular al total
                        datos.totales.neto += totalNeto;
                    }
                }
            } else {
                // Alternativa: buscar los inputs directamente
                const descripcionInputs = document.querySelectorAll('.item-descripcion');
                const cantidadInputs = document.querySelectorAll('.item-cantidad');
                const unidadInputs = document.querySelectorAll('.item-unidad');
                const valorInputs = document.querySelectorAll('.item-valor');
                
                const minLength = Math.min(
                    descripcionInputs.length,
                    cantidadInputs.length,
                    unidadInputs.length,
                    valorInputs.length
                );
                
                for (let i = 0; i < minLength; i++) {
                    const descripcion = descripcionInputs[i].value || '';
                    const cantidad = parseFloat(cantidadInputs[i].value) || 0;
                    const unidad = unidadInputs[i].value || '';
                    const valorUnitario = parseFloat(valorInputs[i].value) || 0;
                    const totalNeto = cantidad * valorUnitario;
                    
                    datos.items.push({
                        descripcion: descripcion,
                        cantidad: cantidad,
                        unidad: unidad,
                        valorUnitario: valorUnitario,
                        totalNeto: totalNeto
                    });
                    
                    // Acumular al total
                    datos.totales.neto += totalNeto;
                }
            }
            
            // Calcular IVA y total
            datos.totales.iva = datos.totales.neto * 0.19;
            datos.totales.total = datos.totales.neto + datos.totales.iva;
            
            // Recopilar profesionales - IMPORTANTE, hacerlo manualmente
            if (datos.incluirProfesionales) {
                // Actualizar cálculos primero
                const resultadosCalculo = fixCalculos();
                datos.profesionales = resultadosCalculo.profesionales;
                datos.totales.totalUF = resultadosCalculo.totalUF;
                
                console.log("Profesionales para PDF:", datos.profesionales);
            }
            
            // Generar el PDF
            return crearPDF(datos);
        }
        
        // Función para crear el PDF
        function crearPDF(datos) {
            // Crear elemento contenedor para el PDF
            const pdfContainer = document.createElement('div');
            pdfContainer.className = 'pdf-container';
            pdfContainer.style.display = 'none';
            document.body.appendChild(pdfContainer);
            
            // Llenar el contenedor con HTML
            pdfContainer.innerHTML = `
                <div class="pdf-header">
                    <div class="header-content">
                        <div class="logo-container">
                            ${datos.logo ? `<img src="${datos.logo}" alt="Logo Dinamo SPA" class="company-logo">` : ''}
                            <div class="company-name">DINAMO SPA</div>
                        </div>
                        <div class="header-info">
                            <div class="company-details">Huérfanos 1055 Of. 503 Santiago | 76.813.274-7</div>
                            <div class="project-title">${datos.nombreProyecto || 'PROYECTO'}</div>
                            <div class="quotation-info">
                                <div class="quotation-number">PRESUPUESTO N° ${datos.numeroCotizacion}</div>
                                <div class="quotation-date">${formatDate(datos.fecha)}</div>
                            </div>
                        </div>
                    </div>
                    <div class="header-divider"></div>
                </div>
                
                <div class="client-section">
                    <div class="section-title">INFORMACIÓN DEL CLIENTE</div>
                    <div class="client-info">
                        <div class="client-data">
                            <div><strong>RUT:</strong> ${datos.rutCliente}</div>
                            <div><strong>Razón Social:</strong> ${datos.razonSocial}</div>
                            <div><strong>Dirección:</strong> ${datos.direccion}</div>
                        </div>
                    </div>
                </div>
                
                <div class="description-section">
                    <p>De nuestra consideración:</p>
                    <p>En atención a su pedido de la referencia, adjuntamos el presupuesto para ${datos.nombreProyecto || 'el proyecto solicitado'}</p>
                    <p>El presupuesto asciende a la suma que se indica a continuación:</p>
                </div>
                
                ${datos.alcanceProyecto ? `
                    <div class="scope-section">
                        <div class="section-title">ALCANCE Y ESPECIFICACIONES TÉCNICAS</div>
                        <div class="scope-content">
                            ${formatText(datos.alcanceProyecto)}
                        </div>
                    </div>
                ` : ''}
                
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
                            ${datos.items.map((item, index) => `
                                <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
                                    <td>${index + 1}</td>
                                    <td>${item.descripcion}</td>
                                    <td class="text-center">${item.cantidad}</td>
                                    <td class="text-center">${item.unidad}</td>
                                    <td class="text-right">${formatNumber(item.valorUnitario)}</td>
                                    <td class="text-right">${formatNumber(item.totalNeto)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4"></td>
                                <td class="text-right"><strong>NETO:</strong></td>
                                <td class="text-right">${formatNumber(datos.totales.neto)}</td>
                            </tr>
                            <tr>
                                <td colspan="4"></td>
                                <td class="text-right"><strong>IVA (19%):</strong></td>
                                <td class="text-right">${formatNumber(datos.totales.iva)}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="4"></td>
                                <td class="text-right"><strong>TOTAL:</strong></td>
                                <td class="text-right"><strong>${formatNumber(datos.totales.total)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                ${datos.incluirProfesionales && datos.profesionales && datos.profesionales.length > 0 ? `
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
                                ${datos.profesionales.map((prof, index) => `
                                    <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
                                        <td>${index + 1}</td>
                                        <td>${prof.nombre}</td>
                                        <td class="text-right">${prof.costoUF.toFixed(2)}</td>
                                        <td class="text-right">${prof.horas}</td>
                                        <td class="text-right">${prof.totalUF.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td colspan="3"></td>
                                    <td class="text-right"><strong>TOTAL UF:</strong></td>
                                    <td class="text-right"><strong>${datos.totales.totalUF.toFixed(2)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ` : ''}
                
                <div class="pdf-footer">
                    <div class="footer-divider"></div>
                    <div class="contact-info">
                        ${datos.nombreContacto ? datos.nombreContacto : ''}
                        ${datos.telefonoContacto ? (datos.nombreContacto ? ' | ' : '') + datos.telefonoContacto : ''}
                        ${datos.emailContacto ? ((datos.nombreContacto || datos.telefonoContacto) ? ' | ' : '') + datos.emailContacto : ''}
                    </div>
                    <div class="company-footer">Dinamo SPA. | Huérfanos 1055 Of. 503 Santiago | 76.813.274-7</div>
                </div>
            `;
            
            // Agregar estilos CSS
            const styleElement = document.createElement('style');
            styleElement.textContent = getPDFStyles();
            pdfContainer.appendChild(styleElement);
            
            // Configurar opciones para html2pdf
            const options = {
                margin: [15, 15, 15, 15],
                filename: `Presupuesto_${datos.numeroCotizacion}_${datos.razonSocial.replace(/\s+/g, '_')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    logging: false
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait'
                }
            };
            
            // Generar PDF
            html2pdf()
                .from(pdfContainer)
                .set(options)
                .save()
                .then(() => {
                    console.log('PDF generado exitosamente');
                    document.body.removeChild(pdfContainer);
                })
                .catch(err => {
                    console.error('Error al generar PDF:', err);
                    alert('Ocurrió un error al generar el PDF. Por favor, intente nuevamente.');
                    document.body.removeChild(pdfContainer);
                });
        }
        
        // Funciones auxiliares
        function formatDate(dateString) {
            if (!dateString) return '';
            
            try {
                const date = new Date(dateString);
                const options = { year: 'numeric', month: 'long' };
                return date.toLocaleDateString('es-CL', options).toUpperCase();
            } catch (error) {
                return dateString;
            }
        }
        
        function formatText(text) {
            if (!text) return '';
            
            return text.split('\n')
                .filter(paragraph => paragraph.trim() !== '')
                .map(paragraph => `<p>${paragraph}</p>`)
                .join('');
        }
        
        function formatNumber(num) {
            return `$${Math.round(parseFloat(num) || 0).toLocaleString('es-CL')}`;
        }
        
        function getPDFStyles() {
            return `
                /* Estilos generales */
                .pdf-container {
                    font-family: 'Roboto', Arial, sans-serif;
                    color: #333333;
                    line-height: 1.3;
                    font-size: 10pt;
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
                
                /* Tablas */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
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
            `;
        }
        
        return generarPDFDirecto;
    }
    
    // ======== PASO 3: Inicialización ========
    function iniciar() {
        console.log("EMERGENCY FIX: Inicializando...");
        
        // 1. Arreglar cálculos de profesionales
        fixCalculos();
        
        // 2. Crear función para generar PDF
        const generarPDFDirecto = crearGeneradorPDF();
        
        // 3. Reemplazar el botón de generar PDF
        const generatePdfBtn = document.getElementById('generatePdf');
        if (generatePdfBtn) {
            // Guardar función original por si acaso
            const fnOriginal = generatePdfBtn.onclick;
            
            // Reemplazar con nuestra función
            generatePdfBtn.onclick = function(event) {
                // Prevenir comportamiento original
                event.preventDefault();
                event.stopPropagation();
                
                // Ejecutar nuestra función
                generarPDFDirecto();
                
                // No continuar con la función original
                return false;
            };
            
            console.log("EMERGENCY FIX: Botón de PDF reemplazado con éxito");
        } else {
            console.log("EMERGENCY FIX: No se encontró el botón de generar PDF");
        }
        
        console.log("EMERGENCY FIX: Inicialización completa");
    }
    
    // Ejecutar cuando el DOM esté completamente cargado
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        // El DOMContentLoaded ya se disparó
        iniciar();
    }
})();