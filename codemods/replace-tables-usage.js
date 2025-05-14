/**
 * jscodeshift codemod: Replace TABLES.XYZ with 'xyz' and remove TABLES import if unused.
 * Usage: npx jscodeshift -t codemods/replace-tables-usage.js app/
 */
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find all TABLES imports and get the import name (could be aliased)
  let tablesImportName = null;
  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value.includes('constants/database'))
    .forEach((path) => {
      path.node.specifiers.forEach((spec) => {
        if (spec.type === 'ImportSpecifier' && spec.imported.name === 'TABLES') {
          tablesImportName = spec.local.name;
        }
      });
    });

  if (!tablesImportName) return file.source; // No TABLES import, skip

  // Replace all TABLES.XYZ with 'xyz'
  root
    .find(j.MemberExpression, {
      object: { name: tablesImportName },
    })
    .forEach((path) => {
      if (path.node.property.type === 'Identifier') {
        const tableName = path.node.property.name;
        j(path).replaceWith(j.literal(tableName.toLowerCase()));
      }
    });

  // Remove TABLES import if unused
  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value.includes('constants/database'))
    .forEach((path) => {
      path.node.specifiers = path.node.specifiers.filter((spec) => {
        // Remove TABLES import
        return !(spec.type === 'ImportSpecifier' && spec.imported.name === 'TABLES');
      });
      // If no specifiers left, remove the whole import
      if (path.node.specifiers.length === 0) {
        j(path).remove();
      }
    });

  return root.toSource({ quote: 'single' });
};
