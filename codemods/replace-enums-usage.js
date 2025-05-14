// codemods/replace-enums-usage.js
module.exports = function transformer(file, api) {
  let source = file.source;

  // Example: Replace ENUMS.IDEA_TYPE.ACTIVITY with 'activity'
  source = source.replace(/ENUMS\.\w+\.(\w+)/g, "'$1'");

  return source;
};
