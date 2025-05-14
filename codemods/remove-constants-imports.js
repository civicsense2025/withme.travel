/**
 * Codemod to:
 * - Remove imports of TABLES, FIELDS, ENUMS, CommentableContentType, ItineraryTemplateMetadata from @/utils/constants/database
 * - Replace TABLES.XYZ with 'xyz'
 * - Replace FIELDS.XYZ with 'xyz'
 */

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Remove named imports from @/utils/constants/database
  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value === '@/utils/constants/database')
    .forEach((path) => {
      path.node.specifiers = path.node.specifiers.filter((spec) => {
        const name = spec.imported ? spec.imported.name : '';
        return ![
          'TABLES',
          'FIELDS',
          'ENUMS',
          'CommentableContentType',
          'ItineraryTemplateMetadata',
        ].includes(name);
      });
      // Remove the import if no specifiers left
      if (path.node.specifiers.length === 0) {
        j(path).remove();
      }
    });

  // Replace TABLES.XYZ with 'xyz'
  root
    .find(j.MemberExpression, {
      object: { type: 'Identifier', name: 'TABLES' },
    })
    .replaceWith((path) => j.literal(path.node.property.name || path.node.property.value));

  // Replace FIELDS.XYZ with 'xyz'
  root
    .find(j.MemberExpression, {
      object: { type: 'Identifier', name: 'FIELDS' },
    })
    .replaceWith((path) => j.literal(path.node.property.name || path.node.property.value));

  // Remove any variable declarations like: const Tables = TABLES as unknown as ...
  root
    .find(j.VariableDeclarator)
    .filter(
      (path) =>
        path.node.init && path.node.init.type === 'Identifier' && path.node.init.name === 'TABLES'
    )
    .forEach((path) => {
      j(path.parent).remove();
    });

  // Remove any variable declarations like: const Fields = FIELDS as unknown as ...
  root
    .find(j.VariableDeclarator)
    .filter(
      (path) =>
        path.node.init && path.node.init.type === 'Identifier' && path.node.init.name === 'FIELDS'
    )
    .forEach((path) => {
      j(path.parent).remove();
    });

  return root.toSource({ quote: 'single' });
};
