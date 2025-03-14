/**
 * Cotizador Dinamo - Aplicación principal
 * 
 * Este script maneja la lógica principal de la aplicación, incluyendo:
 * - Manejo de eventos de usuario
 * - Carga y validación de datos
 * - Administración del estado de la aplicación
 */

document.addEventListener('DOMContentLoaded', function() {
    // Establecer la fecha actual
    const today = new Date();
    const formattedDate = today.toISOString().substr(0, 10);
    document.getElementById('fecha').value = formattedDate;

    // Variables para logo
    let logoData = null;

    // Inicializar contadores y arreglos
    let itemCounter = 0;
    let profesionalCounter = 0;
    const items = [];
    const profesionales = [];
    const images = [];

    // Agregar el primer ítem por defecto
    addNewItem();

    // Inicializar Event Listeners
    initEventListeners();

    /**
     * Inicializa todos los event listeners de la aplicación
     */
    function initEventListeners() {
        // Manejador para el logo
        document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);

        // Manejadores para materiales
        document.getElementById('addItem').addEventListener('click', addNewItem);
        document.getElementById('importExcel').addEventListener('click', function() {
            document.getElementById('excelFileInput').click();
        });
        document.getElementById('excelFileInput').addEventListener('change', handleExcelImport);

        // Manejadores para profesionales
        document.getElementById('addProfesional').addEventListener('click', addNewProfesional);
        
        // Checkbox de incluir profesionales
        const includeProfesionalesCheckbox = document.getElementById('includeProfesionales');
        if (includeProfesionalesCheckbox) {
            includeProfesionalesCheckbox.addEventListener('change', function() {
                calculateProfesionalesTotals(); // Recalcular al cambiar el checkbox
            });
        }

        // Manejador para mostrar/ocultar sección de imágenes
        document.getElementById('toggleImages').addEventListener('click', function() {
            const imageSection = document.getElementById('imageSection');
            imageSection.classList.toggle('hidden');
        });

        // Manejador para subir imágenes
        document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

        // Manejador para generar PDF
        document.getElementById('generatePdf').addEventListener('click', generatePDF);
    }

    /**
     * Maneja la subida del logo de la empresa
     */
    function handleLogoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validar tamaño máximo (1MB)
        if (file.size > 1024 * 1024) {
            alert('El archivo es demasiado grande. El tamaño máximo es 1MB.');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            logoData = e.target.result;
            
            // Mostrar la vista previa
            const preview = document.getElementById('logoPreview');
            const placeholder = document.getElementById('logoPlaceholder');
            
            preview.src = logoData;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        };
        
        reader.readAsDataURL(file);
    }

    /**
     * Maneja la importación de archivos Excel
     */
    function handleExcelImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Procesar con la función del archivo excel-handler.js
        processExcelFile(file, function(processedData) {
            if (processedData && processedData.length > 0) {
                clearItems();
                
                // Agregar cada ítem procesado
                processedData.forEach(item => {
                    addNewItemWithValues(
                        item.descripcion || '',
                        item.cantidad || '',
                        item.unidad || '',
                        item.valorUnitario || ''
                    );
                });
                
                // Notificar al usuario
                alert(`Se importaron ${processedData.length} ítems correctamente.`);
            }
        });
        
        // Limpiar input de archivo para permitir cargar el mismo archivo nuevamente
        event.target.value = '';
    }

    /**
     * Agrega un nuevo ítem a la tabla de materiales
     */
    function addNewItem() {
        itemCounter++;
        
        const tr = document.createElement('tr');
        tr.dataset.id = itemCounter;
        
        tr.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">${itemCounter}</td>
            <td class="px-3 py-2">
                <input
                    type="text"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm item-descripcion"
                    placeholder="Descripción del ítem"
                />
            </td>
            <td class="px-3 py-2">
                <input
                    type="number"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm item-cantidad"
                    placeholder="Cant."
                    min="0"
                />
            </td>
            <td class="px-3 py-2">
                <input
                    type="text"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm item-unidad"
                    placeholder="Ej: UN"
                />
            </td>
            <td class="px-3 py-2">
                <input
                    type="number"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm item-valor"
                    placeholder="Valor unitario"
                    min="0"
                />
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 item-total">$0</td>
            <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button 
                    class="text-red-600 hover:text-red-800 remove-item"
                    data-id="${itemCounter}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </td>
        `;
        
        // Agregar el ítem a la tabla
        document.getElementById('itemsTable').appendChild(tr);
        
        // Agregar listeners para calcular totales
        const row = document.querySelector(`tr[data-id="${itemCounter}"]`);
        const cantidadInput = row.querySelector('.item-cantidad');
        const valorInput = row.querySelector('.item-valor');
        const removeButton = row.querySelector('.remove-item');
        
        cantidadInput.addEventListener('input', () => calculateItemTotal(itemCounter));
        valorInput.addEventListener('input', () => calculateItemTotal(itemCounter));
        removeButton.addEventListener('click', () => removeItem(itemCounter));
        
        // Crear objeto del ítem
        items.push({
            id: itemCounter,
            descripcion: '',
            cantidad: 0,
            unidad: '',
            valorUnitario: 0,
            totalNeto: 0
        });
    }

    /**
     * Agrega un nuevo ítem con valores predeterminados
     */
    function addNewItemWithValues(descripcion, cantidad, unidad, valorUnitario) {
        itemCounter++;
        
        const tr = document.createElement('tr');
        tr.dataset.id = itemCounter;
        
        tr.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">${itemCounter}</td>
            <td class="px-3 py-2">
                <input
                    type="text"
                    value="${descripcion}"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm item-descripcion"
                    placeholder="Descripción del ítem"
                />
            </td>
            <td class="px-3 py-2">
                <input
                    type="number"
                    value="${cantidad}"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm item-cantidad"
                    placeholder="Cant."
                    min="0"
                />
            </td>
            <td class="px-3 py-2">
                <input
                    type="text"
                    value="${unidad}"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm item-unidad"
                    placeholder="Ej: UN"
                />
            </td>
            <td class="px-3 py-2">
                <input
                    type="number"
                    value="${valorUnitario}"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm item-valor"
                    placeholder="Valor unitario"
                    min="0"
                />
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 item-total">$0</td>
            <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button 
                    class="text-red-600 hover:text-red-800 remove-item"
                    data-id="${itemCounter}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </td>
        `;
        
        // Agregar el ítem a la tabla
        document.getElementById('itemsTable').appendChild(tr);
        
        // Agregar listeners para calcular totales
        const row = document.querySelector(`tr[data-id="${itemCounter}"]`);
        const cantidadInput = row.querySelector('.item-cantidad');
        const valorInput = row.querySelector('.item-valor');
        const removeButton = row.querySelector('.remove-item');
        
        cantidadInput.addEventListener('input', () => calculateItemTotal(itemCounter));
        valorInput.addEventListener('input', () => calculateItemTotal(itemCounter));
        removeButton.addEventListener('click', () => removeItem(itemCounter));
        
        // Crear objeto del ítem con los valores proporcionados
        const total = parseFloat(cantidad) * parseFloat(valorUnitario) || 0;
        
        items.push({
            id: itemCounter,
            descripcion: descripcion,
            cantidad: parseFloat(cantidad) || 0,
            unidad: unidad,
            valorUnitario: parseFloat(valorUnitario) || 0,
            totalNeto: total
        });
        
        // Actualizar el total mostrado en la celda
        row.querySelector('.item-total').textContent = `$${formatNumber(total)}`;
        
        // Recalcular totales generales
        calculateTotals();
    }

    /**
     * Agrega un nuevo profesional a la tabla
     */
    function addNewProfesional() {
        profesionalCounter++;
        
        const tr = document.createElement('tr');
        tr.dataset.id = profesionalCounter;
        
        tr.innerHTML = `
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500">${profesionalCounter}</td>
            <td class="px-3 py-2">
                <input
                    type="text"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm prof-nombre"
                    placeholder="Nombre del profesional"
                />
            </td>
            <td class="px-3 py-2">
                <input
                    type="number"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm prof-costo"
                    placeholder="Costo UF"
                    min="0"
                    step="0.01"
                />
            </td>
            <td class="px-3 py-2">
                <input
                    type="number"
                    class="w-full p-1 border border-gray-300 rounded-md text-sm prof-horas"
                    placeholder="Horas"
                    min="0"
                />
            </td>
            <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-500 prof-total">0 UF</td>
            <td class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                <button 
                    class="text-red-600 hover:text-red-800 remove-prof"
                    data-id="${profesionalCounter}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </td>
        `;
        
        // Agregar el profesional a la tabla
        const profesionalesTable = document.getElementById('profesionalesTable');
        if (profesionalesTable) {
            profesionalesTable.appendChild(tr);
            
            // Agregar listeners para calcular totales
            const row = document.querySelector(`tr[data-id="${profesionalCounter}"]`);
            if (row) {
                const costoInput = row.querySelector('.prof-costo');
                const horasInput = row.querySelector('.prof-horas');
                const removeButton = row.querySelector('.remove-prof');
                
                if (costoInput) costoInput.addEventListener('input', () => calculateProfesionalTotal(profesionalCounter));
                if (horasInput) horasInput.addEventListener('input', () => calculateProfesionalTotal(profesionalCounter));
                if (removeButton) removeButton.addEventListener('click', () => removeProfesional(profesionalCounter));
            }
            
            // Crear objeto del profesional
            profesionales.push({
                id: profesionalCounter,
                nombre: '',
                costoUF: 0,
                horas: 0,
                totalUF: 0
            });
            
            // Inicializar el total
            calculateProfesionalTotal(profesionalCounter);
        }
    }

    /**
     * Calcula el total para un ítem específico
     */
    function calculateItemTotal(id) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (!row) return;
        
        const cantidadInput = row.querySelector('.item-cantidad');
        const valorInput = row.querySelector('.item-valor');
        const totalCell = row.querySelector('.item-total');
        
        if (!cantidadInput || !valorInput || !totalCell) return;
        
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const valor = parseFloat(valorInput.value) || 0;
        const total = cantidad * valor;
        
        totalCell.textContent = `$${formatNumber(total)}`;
        
        // Actualizar el objeto del ítem
        const itemIndex = items.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            items[itemIndex].cantidad = cantidad;
            items[itemIndex].valorUnitario = valor;
            items[itemIndex].totalNeto = total;
            
            const descripcionInput = row.querySelector('.item-descripcion');
            const unidadInput = row.querySelector('.item-unidad');
            
            if (descripcionInput) items[itemIndex].descripcion = descripcionInput.value;
            if (unidadInput) items[itemIndex].unidad = unidadInput.value;
        }
        
        // Recalcular totales
        calculateTotals();
    }

    /**
     * Calcula el total para un profesional específico
     */
    function calculateProfesionalTotal(id) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (!row) return; // Importante: verificar que la fila existe
        
        const costoInput = row.querySelector('.prof-costo');
        const horasInput = row.querySelector('.prof-horas');
        const totalCell = row.querySelector('.prof-total');
        
        if (!costoInput || !horasInput || !totalCell) return;
        
        // Obtener valores como números de punto flotante
        // Usando parseFloat explícitamente y reemplazando comas por puntos
        const costoValor = costoInput.value.replace(',', '.');
        const horasValor = horasInput.value.replace(',', '.');
        
        const costo = parseFloat(costoValor) || 0;
        const horas = parseFloat(horasValor) || 0;
        
        // Calcular el total con máxima precisión
        const total = costo * horas;
        
        // Mostrar el total con formato adecuado
        totalCell.textContent = `${total.toFixed(2)} UF`;
        
        // Actualizar el objeto del profesional
        const profIndex = profesionales.findIndex(prof => prof.id === id);
        if (profIndex !== -1) {
            profesionales[profIndex].costoUF = costo;
            profesionales[profIndex].horas = horas;
            profesionales[profIndex].totalUF = total;
            
            const nombreInput = row.querySelector('.prof-nombre');
            if (nombreInput) profesionales[profIndex].nombre = nombreInput.value;
        }
        
        // Depuración
        console.log(`Profesional ID ${id}: Costo=${costo}, Horas=${horas}, Total=${total}`);
        
        // Recalcular totales de profesionales
        calculateProfesionalesTotals();
    }

    /**
     * Elimina un ítem de la tabla de materiales
     */
    function removeItem(id) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (!row) return;
        
        const itemsTable = document.getElementById('itemsTable');
        if (itemsTable && itemsTable.children.length <= 1) {
            // No eliminar si es el único ítem
            return;
        }
        
        row.remove();
        
        // Eliminar del arreglo
        const itemIndex = items.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
            items.splice(itemIndex, 1);
        }
        
        // Recalcular totales
        calculateTotals();
        
        // Renumerar los ítems visibles
        const rows = document.querySelectorAll('#itemsTable tr');
        rows.forEach((row, index) => {
            const firstCell = row.querySelector('td:first-child');
            if (firstCell) firstCell.textContent = index + 1;
        });
    }

    /**
     * Elimina un profesional de la tabla
     */
    function removeProfesional(id) {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (!row) return;
        
        const profesionalesTable = document.getElementById('profesionalesTable');
        if (profesionalesTable && profesionalesTable.children.length <= 1) {
            return;
        }
        
        row.remove();
        
        // Eliminar del arreglo
        const profIndex = profesionales.findIndex(prof => prof.id === id);
        if (profIndex !== -1) {
            profesionales.splice(profIndex, 1);
        }
        
        // Recalcular totales
        calculateProfesionalesTotals();
        
        // Renumerar los profesionales visibles
        const rows = document.querySelectorAll('#profesionalesTable tr');
        rows.forEach((row, index) => {
            const firstCell = row.querySelector('td:first-child');
            if (firstCell) firstCell.textContent = index + 1;
        });
    }

    /**
     * Calcula los totales para la tabla de materiales
     */
    function calculateTotals() {
        const neto = items.reduce((sum, item) => sum + item.totalNeto, 0);
        const iva = neto * 0.19;
        const total = neto + iva;
        
        const totalNetoElement = document.getElementById('totalNeto');
        const totalIvaElement = document.getElementById('totalIva');
        const totalGeneralElement = document.getElementById('totalGeneral');
        
        if (totalNetoElement) totalNetoElement.textContent = `$${formatNumber(neto)}`;
        if (totalIvaElement) totalIvaElement.textContent = `$${formatNumber(iva)}`;
        if (totalGeneralElement) totalGeneralElement.textContent = `$${formatNumber(total)}`;
    }

    /**
     * Calcula los totales para la tabla de profesionales
     */
    function calculateProfesionalesTotals() {
        // Sumar con máxima precisión
        let totalUF = 0;
        for (const prof of profesionales) {
            totalUF += parseFloat(prof.totalUF) || 0;
        }
        
        // Mostrar el total con formato adecuado
        const totalUFElement = document.getElementById('totalUF');
        if (totalUFElement) {
            totalUFElement.textContent = `${totalUF.toFixed(2)} UF`;
        }
        
        // Depuración
        console.log(`Total UF calculado: ${totalUF.toFixed(2)}`);
        console.log('Profesionales:', JSON.stringify(profesionales));
    }

    /**
     * Limpia todos los ítems de la tabla de materiales
     */
    function clearItems() {
        const itemsTable = document.getElementById('itemsTable');
        if (itemsTable) {
            itemsTable.innerHTML = '';
        }
        
        items.length = 0;
        itemCounter = 0;
        calculateTotals();
    }

    /**
     * Maneja la subida de imágenes
     */
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validar tamaño máximo (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('El archivo es demasiado grande. El tamaño máximo es 10MB.');
            event.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageId = Date.now();
            const imageData = e.target.result;
            const imageTitle = file.name.replace(/\.[^/.]+$/, "");
            
            // Agregar imagen al arreglo
            images.push({
                id: imageId,
                data: imageData,
                title: imageTitle
            });
            
            // Agregar imagen a la galería
            addImageToGallery(imageId, imageData, imageTitle);
        };
        
        reader.readAsDataURL(file);
        
        // Limpiar input de archivo para permitir cargar la misma imagen nuevamente
        event.target.value = '';
    }

    /**
     * Agrega una imagen a la galería
     */
    function addImageToGallery(id, data, title) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'border rounded-lg p-3 bg-gray-50 image-container';
        imageContainer.dataset.id = id;
        
        imageContainer.innerHTML = `
            <div class="relative h-40 mb-2">
                <img 
                    src="${data}" 
                    alt="${title || "Imagen"}" 
                    class="w-full h-full object-cover rounded-md"
                />
                <button 
                    class="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 remove-image"
                    data-id="${id}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <input
                type="text"
                value="${title || ""}"
                class="w-full p-2 border border-gray-300 rounded-md text-sm image-title"
                placeholder="Título de la imagen"
                data-id="${id}"
            />
        `;
        
        const imageGallery = document.getElementById('imageGallery');
        if (imageGallery) {
            imageGallery.appendChild(imageContainer);
            
            // Agregar listeners
            const removeButton = imageContainer.querySelector('.remove-image');
            const titleInput = imageContainer.querySelector('.image-title');
            
            if (removeButton) {
                removeButton.addEventListener('click', () => removeImage(id));
            }
            
            if (titleInput) {
                titleInput.addEventListener('input', function() {
                    updateImageTitle(id, this.value);
                });
            }
        }
    }

    /**
     * Elimina una imagen de la galería
     */
    function removeImage(id) {
        const imageContainer = document.querySelector(`.image-container[data-id="${id}"]`);
        if (imageContainer) {
            imageContainer.remove();
        }
        
        // Eliminar del arreglo
        const imageIndex = images.findIndex(img => img.id === id);
        if (imageIndex !== -1) {
            images.splice(imageIndex, 1);
        }
    }

    /**
     * Actualiza el título de una imagen
     */
    function updateImageTitle(id, title) {
        const imageIndex = images.findIndex(img => img.id === id);
        if (imageIndex !== -1) {
            images[imageIndex].title = title;
        }
    }

    /**
     * Formatea un número para mostrar en la interfaz
     */
    function formatNumber(num) {
        return Math.round(num).toLocaleString('es-CL');
    }

    /**
     * Obtiene los datos actuales del formulario para la generación del PDF
     */
    function getFormData() {
        // Verificar si el checkbox de incluir profesionales está marcado
        const includeProfesionales = document.getElementById('includeProfesionales');
        const incluirProf = includeProfesionales ? includeProfesionales.checked : false;
        
        // Calcular totales para asegurar datos actualizados
        const neto = items.reduce((sum, item) => sum + item.totalNeto, 0);
        const iva = neto * 0.19;
        const total = neto + iva;
        const totalUF = profesionales.reduce((sum, prof) => sum + (parseFloat(prof.totalUF) || 0), 0);
        
        // Verificar datos de profesionales actualizados
        for (const prof of profesionales) {
            console.log(`Profesional ID ${prof.id}: ${prof.nombre}, Costo: ${prof.costoUF}, Horas: ${prof.horas}, Total: ${prof.totalUF}`);
        }
        
        return {
            logo: logoData,
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
            items: items,
            incluirProfesionales: incluirProf,
            profesionales: profesionales,
            images: images,
            totales: {
                neto: neto,
                iva: iva,
                total: total,
                totalUF: totalUF
            }
        };
    }

    /**
     * Genera el PDF con los datos actuales
     */
    function generatePDF() {
        try {
            console.log("Iniciando generación de PDF...");
            const formData = getFormData();
            console.log("Datos del formulario:", formData);
            
            // Verificar especialmente los datos de profesionales
            console.log("Profesionales incluidos:", formData.incluirProfesionales);
            console.log("Número de profesionales:", formData.profesionales.length);
            console.log("Total UF:", formData.totales.totalUF);
            
            // Generar el PDF
            generatePDFDocument(formData);
        } catch (error) {
            console.error("Error al generar PDF:", error);
            alert("Ha ocurrido un error al generar el PDF. Por favor, verifique la consola para más detalles.");
        }
    }
});