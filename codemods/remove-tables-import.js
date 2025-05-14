// file: codemods/remove-tables-import.js
module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Remove import { TABLES } from '@/utils/constants/database'
  root
    .find(j.ImportDeclaration)
    .filter(
      (path) =>
        path.node.source.value === '@/utils/constants/database' &&
        path.node.specifiers.some(
          (s) => s.type === 'ImportSpecifier' && s.imported.name === 'TABLES'
        )
    )
    .forEach((path) => {
      // Remove just the TABLES specifier, not the whole import if others exist
      path.node.specifiers = path.node.specifiers.filter(
        (s) => !(s.type === 'ImportSpecifier' && s.imported.name === 'TABLES')
      );
      // If no specifiers left, remove the import entirely
      if (path.node.specifiers.length === 0) {
        j(path).remove();
      }
    });

  return root.toSource();
};
