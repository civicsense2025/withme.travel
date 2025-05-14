// codemods/replace-fields-usage.js
module.exports = function transformer(file, api) {
  let source = file.source;

  // Example: Replace FIELDS.GROUPS.ID with 'id'
  source = source.replace(/FIELDS\.\w+\.(\w+)/g, "'$1'");

  return source;
};
