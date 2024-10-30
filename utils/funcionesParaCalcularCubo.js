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

  function transformQuery(originalQuery) {
    // Creamos un nuevo array con las condiciones para $and
    // const transformedQuery = {
    //   $match: {
    //     $and: Object.entries(originalQuery).map(([key, value]) => ({
    //       [key]: value
    //     }))
    //   }
    // };
  // Creamos un nuevo objeto para las condiciones de $match
    const transformedQuery = {
        $match: {}
    };

    // Recorremos las claves del originalQuery
    for (const [key, value] of Object.entries(originalQuery)) {
        // Verificamos si la clave es 'Fecha' y el valor es un objeto con '$gte' o '$lte'
        if (key === 'Fecha' && typeof value === 'object' && (value['$gte'] || value['$lte'])) {
            // Convertimos a Date si hay condiciones de fecha
            transformedQuery.$match[key] = {
                '$gte': new Date(value['$gte']),
                '$lte': new Date(value['$lte'])
            };
        } else {
            // Mantenemos el valor original si no es 'Fecha'
            transformedQuery.$match[key] = value;
        }
    }
    return transformedQuery;
  }
  
  export function runDynamicQuery3(query) {
    // Construir la etapa $match para los filtros
    let matchCondition ={};
    console.log(query.filters)
    if (query.filters && query.filters.length > 0) {
       matchCondition = transformQuery(query.filters);
      console.log(matchCondition)
      // query.filters.forEach(filtro => {
      //   const fieldName = filtro.Filtro.split('-')[0];
      //   const value = filtro.ValorFiltro;
      //   matchCondition[fieldName] = value;
      // });
    }
    const matchStage = transformQuery(query.filters);
  
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
  export function runDynamicQuery4(query) {
    // Construir la etapa $match para los filtros
    let matchCondition = {};
    if (query.filters && query.filters.length > 0) {
        matchCondition = transformQuery(query.filters);
    }
    const matchStage = transformQuery(query.filters);

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
                groupValues[key] = { $addToSet: `$${key}` };
                break;
            case 'MIN':
                groupValues[key] = { $min: `$${key}` };
                break;
            case 'MAX':
                groupValues[key] = { $max: `$${key}` };
                break;
            case 'AVG':
                groupValues[key] = { $avg: `$${key}` };
                break;
            case 'PERCENTAGE':
                groupValues[key] = { $sum: `$${key}` }; // Temporal para calcular porcentaje después
                break;
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
        ...groupFields,
    };

    Object.keys(query.values).forEach(key => {
        const operation = query.values[key].operation;
        if (operation === 'COUNT') {
            projectFields[key] = { $size: `$${key}` };
        } else if (operation === 'PERCENTAGE') {
            // Calcula el porcentaje sobre el total de ValorVenta
            projectFields[key] = {
                $multiply: [
                    { $divide: [`$${key}`, { $sum: `$${key}` }] },
                    100
                ]
            };
        } else {
            projectFields[key] = 1;
        }
    });

    query.rows.forEach(row => projectFields[row] = '$_id.' + row);
    query.columns.forEach(column => projectFields[column] = '$_id.' + column);

    const projectStage = {
        $project: projectFields
    };

    // Construir el pipeline de agregación
    const pipeline = [matchStage, groupStage, projectStage];

    return pipeline;
}
export function runDynamicQuery5_actual(query) {
  // Construir la etapa $match para los filtros
  let matchCondition = {};
  if (query.filters && query.filters.length > 0) {
      matchCondition = transformQuery(query.filters);
  }
  const matchStage = transformQuery(query.filters);

  // Construir la etapa $group para las filas, columnas y valores
  const groupFields = {};
  query.rows.forEach(row => groupFields[row] = `$${row}`);
  query.columns.forEach(column => groupFields[column] = `$${column}`);

  const groupValues = {};
  let requiresTotalCalculation = false;

  Object.entries(query.values).forEach(([key, value]) => {
      if (value.operation === 'SUM') {
          groupValues[key] = { $sum: `$${key}` };
      } else if (value.operation === 'COUNT') {
          groupValues[key] = { $addToSet: `$${key}` };
      } else if (value.operation === 'MIN') {
          groupValues[key] = { $min: `$${key}` };
      } else if (value.operation === 'MAX') {
          groupValues[key] = { $max: `$${key}` };
      } else if (value.operation === 'AVG') {
          groupValues[key] = { $avg: `$${key}` };
      } else if (value.operation === 'PERCENTAGE') {
          requiresTotalCalculation = true;
          groupValues[key] = { $sum: `$${key}` }; // Temporal para el cálculo de porcentaje después
      } else {
          throw new Error(`Operación no soportada: ${value.operation}`);
      }
  });

  const groupStage = {
      $group: {
          _id: groupFields,
          ...groupValues
      }
  };

  // Construir la etapa de agrupación para calcular el total de ValorVenta si es necesario
  const percentageGroupStage = {
      $group: {
          _id: null,
          totalValorVenta: { $sum: `$${Object.keys(groupValues).find(k => query.values[k].operation === 'PERCENTAGE')}` },
          data: { $push: "$$ROOT" }
      }
  };

  // Descomponer el array `data` y agregar el cálculo de porcentaje
  const unwindStage = { $unwind: "$data" };

  // Proyectar los campos con el cálculo del porcentaje aplicado
  const projectFields = {
      _id: 0,
      ...groupFields,
  };

  Object.keys(query.values).forEach(key => {
      const operation = query.values[key].operation;
      if (operation === 'COUNT') {
          projectFields[key] = { $size: `$data.${key}` };
      } else if (operation === 'PERCENTAGE') {
          projectFields[key] = {
              $multiply: [
                  { $divide: [`$data.${key}`, "$totalValorVenta"] },
                  100
              ]
          };
      } else {
          projectFields[key] = `$data.${key}`;
      }
  });

  query.rows.forEach(row => projectFields[row] = `$data._id.${row}`);
  query.columns.forEach(column => projectFields[column] = `$data._id.${column}`);

  const projectStage = {
      $project: projectFields
  };

  // Construir el pipeline de agregación
  const pipeline = requiresTotalCalculation
      ? [matchStage, groupStage, percentageGroupStage, unwindStage, projectStage]
      : [matchStage, groupStage, projectStage];

  return pipeline;
}
export function runDynamicQuery6_actual(query) {
  // Construir la etapa $match para los filtros
  let matchCondition = {};
  if (query.filters && query.filters.length > 0) {
    matchCondition = transformQuery(query.filters);
  }
  const matchStage = transformQuery(query.filters);

  // Construir la etapa $group para las filas, columnas y valores
  const groupFields = {};
  query.rows.forEach(row => groupFields[row] = `$${row}`);
  query.columns.forEach(column => groupFields[column] = `$${column}`);

  const groupValues = {};
  let requiresPercentageCalculation = false;
  let percentageKey = null;

  // Revisar las operaciones en query.values
  Object.entries(query.values).forEach(([key, value]) => {
    if (value.operation === 'SUM') {
      groupValues[key] = { $sum: `$${key}` };
    } else if (value.operation === 'COUNT') {
      groupValues[key] = { $addToSet: `$${key}` };
    } else if (value.operation === 'MIN') {
      groupValues[key] = { $min: `$${key}` };
    } else if (value.operation === 'MAX') {
      groupValues[key] = { $max: `$${key}` };
    } else if (value.operation === 'AVG') {
      groupValues[key] = { $avg: `$${key}` };
    } else if (value.operation === 'PERCENTAGE') {
      requiresPercentageCalculation = true;
      percentageKey = key;
      groupValues[key] = { $sum: `$${key}` }; // Temporal para el cálculo de porcentaje después
    } else {
      throw new Error(`Operación no soportada: ${value.operation}`);
    }
  });

  const groupStage = {
    $group: {
      _id: groupFields,
      ...groupValues
    }
  };

  // Condicional para agregar el cálculo de porcentaje solo si es necesario
  const pipeline = [matchStage, groupStage];

  if (requiresPercentageCalculation && percentageKey) {
    // Si se necesita el cálculo de porcentaje, agregamos las etapas adicionales
    const percentageGroupStage = {
      $group: {
        _id: null,
        totalPercentageField: { $sum: `$${percentageKey}` },
        data: { $push: "$$ROOT" }
      }
    };

    const unwindStage = { $unwind: "$data" };

    // Construir la etapa de proyección para el cálculo de porcentaje
    const projectFields = {
      _id: 0,
      ...groupFields,
    };

    Object.keys(query.values).forEach(key => {
      const operation = query.values[key].operation;
      if (operation === 'COUNT') {
        projectFields[key] = { $size: `$data.${key}` };
      } else if (operation === 'PERCENTAGE' && key === percentageKey) {
        projectFields[key] = {
          $multiply: [
            { $divide: [`$data.${key}`, "$totalPercentageField"] },
            100
          ]
        };
      } else {
        projectFields[key] = `$data.${key}`;
      }
    });

    // Agregar las filas y columnas al proyecto
    query.rows.forEach(row => projectFields[row] = `$data._id.${row}`);
    query.columns.forEach(column => projectFields[column] = `$data._id.${column}`);

    const projectStage = { $project: projectFields };

    pipeline.push(percentageGroupStage, unwindStage, projectStage);
  } else {
    // Construir la etapa de proyección estándar si no hay cálculo de porcentaje
    const projectFields = {
      _id: 0,
      ...groupFields,
    };

    Object.keys(query.values).forEach(key => {
      const operation = query.values[key].operation;
      projectFields[key] = operation === 'COUNT'
        ? { $size: `$${key}` }
        : `$${key}`;
    });

    // Agregar las filas y columnas al proyecto
    query.rows.forEach(row => projectFields[row] = `$_id.${row}`);
    query.columns.forEach(column => projectFields[column] = `$_id.${column}`);

    const projectStage = { $project: projectFields };
    pipeline.push(projectStage);
  }

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