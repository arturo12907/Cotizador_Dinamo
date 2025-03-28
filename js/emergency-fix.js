/**
 * SOLUCIÓN DE EMERGENCIA - Cotizador Dinamo
 * Este script resuelve los problemas con cálculo de profesionales y generación de PDF
 * INSTRUCCIONES: Incluir este script después de todos los demás scripts en el HTML
 */

// Función auto-ejecutable para evitar conflictos
(function() {
    console.log("EMERGENCY FIX: Iniciando solución...");
    
    // ======== PASO 1: Arreglar los cálculos de profesionales ========
    function fixCalculos() {
        console.log("EMERGENCY FIX: Aplicando solución para cálculos de profesionales");
        
        // Función para calcular profesionales
        function calcularProfesionales() {
            const filas = document.querySelectorAll('#profesionalesTable tr');
            console.log(`Encontradas ${filas.length} filas en total`);
            
            if (filas.length <= 1) return { profesionales: [], totalUF: 0 }; // Solo cabecera o vacío
            
            let totalUF = 0;
            const profesionalesData = [];
            
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
                    
                    // Guardar datos del profesional para PDF
                    profesionalesData.push({
                        id: i,
                        nombre: nombre,
                        costoUF: costo,
                        horas: horas,
                        totalUF: total
                    });
                }
            }
            
            // Actualizar total UF
            const totalUFElement = document.getElementById('totalUF');
            if (totalUFElement) {
                totalUFElement.textContent = `${totalUF.toFixed(2)} UF`;
                console.log(`Total UF actualizado a: ${totalUF.toFixed(2)} UF`);
            }
            
            return {
                profesionales: profesionalesData,
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
                // Dar tiempo para que se cree el nuevo profesional
                setTimeout(calcularProfesionales, 100);
            });
        }
        
        // Forzar actualización de los profesionales ya existentes
        setTimeout(calcularProfesionales, 200);
        
        return datosIniciales;
    }
    
    // ======== PASO 2: Establecer datos de contacto fijos y quitar sección de logo ========
    function establecerDatosFijos() {
        console.log("EMERGENCY FIX: Estableciendo datos de contacto fijos");
        
        // Datos de contacto fijos
        const datosContacto = {
            nombreContacto: "Luis Cavieres San Martín",
            telefonoContacto: "+56 9 92033091",
            emailContacto: "lcavieres@esdinamo.cl"
        };
        
        // Llenar campos de contacto con valores fijos
        const nombreContactoInput = document.getElementById('nombreContacto');
        const telefonoContactoInput = document.getElementById('telefonoContacto');
        const emailContactoInput = document.getElementById('emailContacto');
        
        if (nombreContactoInput) {
            nombreContactoInput.value = datosContacto.nombreContacto;
            // Opcionalmente hacer el campo de solo lectura
            nombreContactoInput.readOnly = true;
        }
        
        if (telefonoContactoInput) {
            telefonoContactoInput.value = datosContacto.telefonoContacto;
            telefonoContactoInput.readOnly = true;
        }
        
        if (emailContactoInput) {
            emailContactoInput.value = datosContacto.emailContacto;
            emailContactoInput.readOnly = true;
        }
        
        // Ocultar completamente la sección de logo ya que está causando problemas
        try {
            const logoSection = document.querySelector('.logo-container')?.closest('.bg-white');
            if (logoSection) {
                logoSection.style.display = 'none';
                
                // Mostrar mensaje informativo
                const parentContainer = logoSection.parentElement;
                if (parentContainer) {
                    const infoMsg = document.createElement('p');
                    infoMsg.className = 'mt-1 text-sm text-blue-600 font-semibold';
                    infoMsg.textContent = 'El logo de Dinamo SPA se incluirá automáticamente en el PDF generado';
                    parentContainer.insertBefore(infoMsg, logoSection);
                }
                
                console.log("EMERGENCY FIX: Sección de logo ocultada para evitar problemas");
            }
        } catch (error) {
            console.error("EMERGENCY FIX: Error al ocultar sección de logo", error);
        }
    }
    
    // ======== PASO 3: Crear función para generar PDF con profesionales ========
    function generarPDFConProfesionales() {
        console.log("EMERGENCY FIX: Modificando la generación del PDF");
        
        // Actualizar datos de profesionales
        const datosProfesionales = fixCalculos();
        
        // Obtener función original
        const generatePDFOriginal = window.generatePDFDocument;
        
        if (typeof generatePDFOriginal !== 'function') {
            console.error("EMERGENCY FIX: No se encontró la función original generatePDFDocument");
            return;
        }
        
        // Reemplazar la función original con nuestra versión mejorada
        window.generatePDFDocument = function(data) {
            console.log("EMERGENCY FIX: Interceptando generación de PDF");
            
            // Usar datos de contacto del formulario (ya prefijados)
            data.nombreContacto = document.getElementById('nombreContacto')?.value || "Luis Cavieres San Martín";
            data.telefonoContacto = document.getElementById('telefonoContacto')?.value || "+56 9 92033091";
            data.emailContacto = document.getElementById('emailContacto')?.value || "lcavieres@esdinamo.cl";
            
            // Si se incluyen profesionales, actualizar los datos
            if (data.incluirProfesionales) {
                // Recalcular profesionales para asegurar datos actualizados
                const resultadosCalculo = fixCalculos();
                
                // Actualizar datos en el objeto
                data.profesionales = resultadosCalculo.profesionales;
                data.totales.totalUF = resultadosCalculo.totalUF;
                
                console.log("EMERGENCY FIX: Datos de profesionales actualizados:", data.profesionales);
            }
            
            // Continuar con la función original
            return generatePDFOriginal(data);
        };
        
        console.log("EMERGENCY FIX: Función de PDF mejorada instalada");
    }
    
    // ======== PASO 4: Agregar compatibilidad móvil ========
    function mejorarCompatibilidadMovil() {
        console.log("EMERGENCY FIX: Mejorando compatibilidad con dispositivos móviles");
        
        // Crear estilos para dispositivos móviles
        const estilosMovil = document.createElement('style');
        estilosMovil.setAttribute('type', 'text/css');
        estilosMovil.innerHTML = `
            /* Media queries para dispositivos móviles */
            @media (max-width: 768px) {
                /* Aumentar tamaño de texto base para mejor legibilidad */
                body {
                    font-size: 16px;
                }
                
                /* Mejorar usabilidad de botones */
                button, .btn, [type="button"], [type="submit"] {
                    padding: 0.5rem 1rem;
                    min-height: 44px;
                    min-width: 44px;
                    font-size: 1rem;
                }
                
                /* Hacer que las tablas sean scrollables horizontalmente */
                .overflow-x-auto, 
                .table-container {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    max-width: 100%;
                }
                
                /* Aumentar spacing para evitar botones pegados */
                td, th {
                    padding: 8px 12px;
                }
                
                /* Mejorar spacing en formularios */
                input, select, textarea {
                    padding: 8px 12px;
                    min-height: 44px;
                    font-size: 16px;
                }
                
                /* Aumentar área clickeable */
                input[type="checkbox"], input[type="radio"] {
                    min-width: 22px;
                    min-height: 22px;
                }
                
                /* Espacio vertical entre elementos */
                .mb-4 {
                    margin-bottom: 1.25rem;
                }
                
                /* Ajustar layout para pantallas pequeñas */
                .grid {
                    grid-template-columns: 1fr !important;
                }
                
                /* Mejorar espaciado vertical */
                .py-2 {
                    padding-top: 0.75rem;
                    padding-bottom: 0.75rem;
                }
                
                /* Mejorar visualización en contenedores */
                .card, .bg-white {
                    padding: 1rem;
                }
            }
        `;
        
        // Agregar estilos al documento
        document.head.appendChild(estilosMovil);
        
        // Agregar meta viewport si no existe
        if (!document.querySelector('meta[name="viewport"]')) {
            const metaViewport = document.createElement('meta');
            metaViewport.setAttribute('name', 'viewport');
            metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            document.head.appendChild(metaViewport);
            console.log("EMERGENCY FIX: Meta viewport añadido para mejorar vista móvil");
        }
        
        // Agregar clase para hacer tablas responsivas
        const tablas = document.querySelectorAll('table');
        tablas.forEach(tabla => {
            // Verificar si la tabla ya está en un contenedor scrollable
            const contenedor = tabla.parentElement;
            if (contenedor && !contenedor.classList.contains('overflow-x-auto') && !contenedor.classList.contains('table-container')) {
                // Crear un contenedor nuevo si es necesario
                const nuevoContenedor = document.createElement('div');
                nuevoContenedor.className = 'table-container overflow-x-auto';
                
                // Envolver la tabla en el nuevo contenedor
                contenedor.insertBefore(nuevoContenedor, tabla);
                nuevoContenedor.appendChild(tabla);
                
                console.log("EMERGENCY FIX: Tabla envuelta en contenedor scrollable");
            }
        });
    }
    
    // ======== PASO 5: Inicialización ========
    function iniciar() {
        try {
            // 1. Arreglar cálculos de profesionales
            fixCalculos();
            
            // 2. Establecer datos de contacto
            establecerDatosFijos();
            
            // 3. Mejorar la generación de PDF
            generarPDFConProfesionales();
            
            // 4. Mejorar compatibilidad móvil
            mejorarCompatibilidadMovil();
            
            console.log("EMERGENCY FIX: Inicialización completada con éxito");
        } catch (error) {
            console.error("EMERGENCY FIX: Error durante la inicialización", error);
        }
    }
    
    // Si el DOM ya está cargado, iniciar inmediatamente
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        // El DOMContentLoaded ya se disparó
        iniciar();
    }
})();
