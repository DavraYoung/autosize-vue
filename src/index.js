var autosize = require('autosize')


let GHOST_ELEMENT_ID = '__autosizeInputGhost'

let characterEntities = {
  ' ': 'nbsp',
  '<': 'lt',
  '>': 'gt'
}

function mapSpecialCharacterToCharacterEntity(specialCharacter) {
  return '&' + characterEntities[specialCharacter] + ';'
}

function escapeSpecialCharacters(string) {
  return string.replace(/\s|<|>/g, mapSpecialCharacterToCharacterEntity)
}

// Create `ghostElement`, with inline styles to hide it and ensure that the text is all
// on a single line.
function createGhostElement() {
  let ghostElement = document.createElement('div')
  ghostElement.id = GHOST_ELEMENT_ID
  ghostElement.style.cssText =
    'display:inline-block;height:0;overflow:hidden;position:absolute;top:0;visibility:hidden;white-space:nowrap;'
  document.body.appendChild(ghostElement)
  return ghostElement
}

const autoSizeInput = function (element, options) {
  // Assigns an appropriate width to the given `element` based on its contents.
  function setWidth() {
    let elementStyle = window.getComputedStyle(element)
    // prettier-ignore
    let elementCssText = 'box-sizing:' + elementStyle.boxSizing +
      ';border-left:' + elementStyle.borderLeftWidth + ' solid red' +
      ';border-right:' + elementStyle.borderRightWidth + ' solid red' +
      ';font-family:' + elementStyle.fontFamily +
      ';font-feature-settings:' + elementStyle.fontFeatureSettings +
      ';font-kerning:' + elementStyle.fontKerning +
      ';font-size:' + elementStyle.fontSize +
      ';font-stretch:' + elementStyle.fontStretch +
      ';font-style:' + elementStyle.fontStyle +
      ';font-letiant:' + elementStyle.fontVariant +
      ';font-letiant-caps:' + elementStyle.fontVariantCaps +
      ';font-letiant-ligatures:' + elementStyle.fontVariantLigatures +
      ';font-letiant-numeric:' + elementStyle.fontVariantNumeric +
      ';font-weight:' + elementStyle.fontWeight +
      ';letter-spacing:' + elementStyle.letterSpacing +
      ';margin-left:' + elementStyle.marginLeft +
      ';margin-right:' + elementStyle.marginRight +
      ';padding-left:' + elementStyle.paddingLeft +
      ';padding-right:' + elementStyle.paddingRight +
      ';text-indent:' + elementStyle.textIndent +
      ';text-transform:' + elementStyle.textTransform;

    let string = element.value || element.getAttribute('placeholder') || '';
    let ghostElement = document.getElementById(GHOST_ELEMENT_ID) || createGhostElement();
    ghostElement.style.cssText += elementCssText;
    ghostElement.innerHTML = escapeSpecialCharacters(string);
    let width = window.getComputedStyle(ghostElement).width;
    element.style.width = width;
    return width
  }

  element.addEventListener('input', setWidth)

  let width = setWidth();

  if (options && options.minWidth && !element.style.minWidth && width !== '0px') {
    element.style.minWidth = width
  }

  // Return a function for unbinding the event listener and removing the `ghostElement`.
  return function () {
    element.removeEventListener('input', setWidth)
    let ghostElement = document.getElementById(GHOST_ELEMENT_ID)
    if (ghostElement) {
      ghostElement.parentNode.removeChild(ghostElement)
    }
  }
}




exports.install = function(Vue) {
  Vue.directive('autosize', {
    bind: function(el, binding) {
      var tagName = el.tagName
      if (tagName == 'TEXTAREA') {
        autosize(el)
      } else if (tagName == 'INPUT' && el.type == 'text') {
        autoSizeInput(el)
      }
    },

    componentUpdated: function(el, binding, vnode) {
      var tagName = el.tagName
      if (tagName == 'TEXTAREA') {
        autosize.update(el)
      } else if (tagName == 'INPUT' && el.type == 'text') {
        autoSizeInput(el)
      }
    },

    unbind: function(el) {
      autosize.destroy(el)
    }
  })
}
