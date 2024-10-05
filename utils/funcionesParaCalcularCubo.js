export function transformarObjetos(arreglo) {
    // Objeto para mapear las operaciones
    const operaciones = {
      COUNT: 'COUNT',
      SUM: 'SUM'
      // Añade aquí más operaciones según sea necesario
    };
  
    // Objeto para mapear las columnas
    const columnas = {};
  
    arreglo.forEach(objeto => {
      const columna = objeto.Columna;
      const operation = objeto.operation;
      const distinct = objeto.distinct;
  
      // Verificar si la columna ya existe en el objeto
      if (!columnas[columna]) {
        columnas[columna] = {};
      }
  
      // Establecer la operación en el objeto de la columna
      columnas[columna].operation = operaciones[operation];
  
      // Establecer distinct si está presente
      if (distinct) {
        columnas[columna].distinct = true;
      }
    });
  
    return columnas;
  }
  export const getOperationType = (operation) => {
    switch (operation.toUpperCase()) {
      // case 'COUNT':
      //   return 'Count';
      case 'SUM':
        return 'Sum';
      // case 'AVG':
      //   return 'Average';
      // Puedes agregar más casos según sea necesario para otras operaciones
      default:
        return 'Sum'; // Por defecto, asumimos Sum
    }
  };
  export function runDynamicQuery3(query) {
    // Construir la etapa $match para los filtros
    const matchCondition = {};
    if (query.filters && query.filters.length > 0) {
      query.filters.forEach(filtro => {
        const fieldName = filtro.Filtro.split('-')[0];
        const value = filtro.ValorFiltro;
        matchCondition[fieldName] = value;
      });
    }
    const matchStage = { $match: matchCondition };
  
    // Construir la etapa $group para las filas, columnas y valores
    const groupFields = {};
    query.rows.forEach(row => groupFields[row] = `$${row}`);
    query.columns.forEach(column => groupFields[column] = `$${column}`);
  
    const groupValues = {};
    Object.entries(query.values).forEach(([key, value]) => {
      switch (value.operation) {
        case 'SUM':
          groupValues[key] = { $sum: `$${key}` };
          break;
        case 'COUNT':
          groupValues[key] = { $addToSet: `$${key}` }; // Utilizar $addToSet para contar valores únicos
          break;
        // Aquí puedes agregar más casos para otras operaciones como AVG, MAX, MIN, etc.
        default:
          throw new Error(`Operación no soportada: ${value.operation}`);
      }
    });
  
    const groupStage = {
      $group: {
        _id: groupFields,
        ...groupValues
      }
    };
  
    // Construir la etapa $project para la selección de campos
    const projectFields = {
      _id: 0,
      ...groupFields, // Agregar los campos de agrupación (_id) al proyecto
    };
  
    Object.keys(query.values).forEach(key => {
      projectFields[key] = 1;
      if (query.values[key].operation === 'COUNT') {
        // No cambiar los nombres de los campos COUNT
        projectFields[key] = { $size: `$${key}` }; // Utilizar $size para obtener el tamaño del conjunto
      }
    });
  
    // Agregar los campos de rows y columns al proyecto
    query.rows.forEach(row => projectFields[row] = '$_id.' + row);
    query.columns.forEach(column => projectFields[column] = '$_id.' + column);
  
    const projectStage = {
      $project: projectFields
    };
  
    // Construir el pipeline de agregación
    const pipeline = [matchStage, groupStage, projectStage];
  
    return pipeline;
  }
  export const getPivotDataSource = (configuracionOriginal,data) => {
    const rows = configuracionOriginal.rows.map(row => ({
      name: row,
      caption: row
    }));
  
    const columns = configuracionOriginal.columns.map(column => ({
      name: column,
      caption: column
    }));
    return {
      dataSource:data,
      rows: rows || [],
      columns: columns || [],
      values: Object.keys(configuracionOriginal.values).map(key => ({
        name: key,
        caption: key,
        type: getOperationType(configuracionOriginal.values[key].operation),
        axis: 'value'
      })),
      filters:  []
    };
  };
  export function generateUniqueKey(queryObject) {
    const query2 = {
        rows: ['Periodo'],
        columns: ['Sucursal'],
        values: { ValorVenta: { operation: 'COUNT' } }, // Diferente operation
        filters: { PKIDProveedor: '90005' }
      };
    const orderedObject = JSON.stringify(sortObject(query2));
    return orderedObject;
  }
  
  // Función para ordenar las claves y arrays dentro del objeto
  export function sortObject(obj) {
    if (Array.isArray(obj)) {
      return obj.map(sortObject); // Ordena los objetos dentro del array
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).sort().reduce((acc, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
    } else {
      return obj;
    }
  }