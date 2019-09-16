var postcss = require('postcss');
var objectAssign = require('object-assign');
var classRepeat = require('class-repeat');
var isPresent = require('is-present');
var hasClass = require('has-class-selector');
require('string.prototype.repeat');

var CSS_ESCAPED_TAB = '\\9';

function increaseSpecifityOfRule(rule, opts) {
  rule.selectors = rule.selectors.map(function(selector) {
    if (
      selector === 'html' ||
      selector === ':root' ||
      selector === ':host' ||
      selector === opts.stackableRoot
    ) {
      return selector + opts.stackableRoot.repeat(opts.repeat);
    }
    if (
      selector.startsWith('[data-spot-im-direction]') ||
      selector.startsWith('[data-spotim-app]')
    )
      return opts.stackableRoot.repeat(opts.repeat) + selector;

    return opts.stackableRoot.repeat(opts.repeat) + ' ' + selector;
  });
}

module.exports = postcss.plugin('postcss-increase-specificity', function(
  options
) {
  var defaults = {
    repeat: 2,
    overrideIds: false,
  };
  var opts = objectAssign({}, defaults, options);

  if (opts.id) {
    return function IDSpecificity(css) {
      css.walkRules(function(rule) {
        var isInsideKeyframes =
          rule.parent.type === 'atrule' && rule.parent.name === 'keyframes';

        if (!isInsideKeyframes) {
          increaseSpecifityOfRule(rule, opts);
        }
      });
    };
  } else {
    return function classRepeatPlugin(root) {
      root.walkRules(function(node) {
        if (isPresent(node.selectors)) {
          node.selectors = node.selectors.map(function(selector) {
            return hasClass(selector) ? classRepeat(selector, opts) : selector;
          });
        }
        return node;
      });
    };
  }
});
